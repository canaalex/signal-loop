import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { GoogleGenAI } from '@google/genai'
import { Storage } from '@google-cloud/storage'
import { BigQuery } from '@google-cloud/bigquery'
import { randomUUID } from 'node:crypto'

const BUCKET = 'signalloop-screenshots'
const DATASET = 'signalloop'
const GCP_PROJECT = 'project-46dec5ec-cfcb-464b-95c'

// In-memory fallback so reads succeed immediately after writes (BigQuery streaming has ~10s delay)
const memProjects = new Map<string, any>()
const memAnalyses = new Map<string, any[]>()
// keyed by analysis_id
const memCoverage = new Map<string, { ga4_file_name: string; ga4_events: string; match_results: string }>()
const memRecs = new Map<string, { result: string }>()

async function ensureSchema(bq: BigQuery) {
  try {
    await bq.createDataset(DATASET, { location: 'ASIA' }).catch(() => {})
    const dataset = bq.dataset(DATASET)
    await dataset.createTable('projects', {
      schema: [
        { name: 'project_id', type: 'STRING' },
        { name: 'name', type: 'STRING' },
        { name: 'created_at', type: 'TIMESTAMP' },
      ],
    }).catch(() => {})
    await dataset.createTable('analyses', {
      schema: [
        { name: 'analysis_id', type: 'STRING' },
        { name: 'project_id', type: 'STRING' },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'screen_names', type: 'STRING' },
        { name: 'events', type: 'STRING' },
        { name: 'gaps', type: 'STRING' },
        { name: 'insights', type: 'STRING' },
        { name: 'screenshot_uris', type: 'STRING' },
      ],
    }).catch(() => {})
    await dataset.createTable('coverage_results', {
      schema: [
        { name: 'analysis_id', type: 'STRING' },
        { name: 'project_id', type: 'STRING' },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'ga4_file_name', type: 'STRING' },
        { name: 'ga4_events', type: 'STRING' },
        { name: 'match_results', type: 'STRING' },
      ],
    }).catch(async () => {
      // Table already exists — patch ga4_file_name if missing
      try {
        const table = dataset.table('coverage_results')
        const [meta] = await table.getMetadata()
        const fields: any[] = meta.schema?.fields ?? []
        if (!fields.some((f: any) => f.name === 'ga4_file_name')) {
          await table.setMetadata({ schema: { fields: [...fields, { name: 'ga4_file_name', type: 'STRING', mode: 'NULLABLE' }] } })
          console.log('[SignalLoop] patched ga4_file_name into coverage_results')
        }
      } catch (patchErr: any) {
        console.error('[SignalLoop] coverage_results schema patch failed:', patchErr?.message)
      }
    })
    await dataset.createTable('rec_results', {
      schema: [
        { name: 'analysis_id', type: 'STRING' },
        { name: 'project_id', type: 'STRING' },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'result', type: 'STRING' },
      ],
    }).catch(() => {})
    console.log('[SignalLoop] BigQuery schema ready')
  } catch (err) {
    console.error('[SignalLoop] BigQuery setup error:', err)
  }
}

function readBody(req: any): Promise<string> {
  return new Promise(resolve => {
    let body = ''
    req.on('data', (chunk: any) => { body += chunk })
    req.on('end', () => resolve(body))
  })
}

function sendJson(res: any, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function isCapacityError(err: any) {
  const msg = err?.message ?? ''
  return msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('overloaded')
}

async function geminiGenerate(ai: GoogleGenAI, contents: any[]): Promise<any> {
  for (const model of ['gemini-2.5-flash', 'gemini-1.5-flash']) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[SignalLoop] Gemini request — model: ${model}, attempt: ${attempt + 1}`)
        return await ai.models.generateContent({ model, contents })
      } catch (err: any) {
        if (isCapacityError(err)) {
          if (attempt === 0) { await sleep(1500); continue }
          console.log(`[SignalLoop] ${model} unavailable, trying fallback…`)
          break
        }
        throw err
      }
    }
  }
  throw new Error('Gemini is busy right now — please try again in a moment.')
}

function parseAnalysisRow(a: any) {
  return {
    ...a,
    screen_names: JSON.parse(a.screen_names),
    events: JSON.parse(a.events),
    gaps: JSON.parse(a.gaps),
    insights: JSON.parse(a.insights),
    screenshot_uris: JSON.parse(a.screenshot_uris),
  }
}

const GEMINI_PROMPT = (count: number, screenNames: string[]) =>
  `You are an expert product analytics consultant. Analyze these ${count} product UI screenshots and recommend the analytics events that should be tracked.

Screens provided:
${screenNames.join('\n')}

Return ONLY valid JSON (no markdown, no explanation) in exactly this format:
{
  "events": [
    {
      "name": "snake_case_event_name",
      "screen": "exact screen name from the list above",
      "description": "what this event tracks and why it matters",
      "priority": "high",
      "properties": ["property_one", "property_two"]
    }
  ],
  "gaps": ["gap description"],
  "insights": ["insight description"]
}

Rules:
- priority must be "high", "medium", or "low"
- event names must be snake_case
- include 3-6 properties per event
- identify at least 2 gaps and 2 insights
- be specific to what you see in the screenshots`

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      proxy: {
        '/gpu': { target: 'http://localhost:8001', rewrite: (path) => path.replace(/^\/gpu/, '') },
      },
    },
    plugins: [
      vue(),
      tailwindcss(),
      {
        name: 'signalloop-api',
        configureServer(server) {
          const bq = new BigQuery({ projectId: GCP_PROJECT, location: 'ASIA' })
          const storage = new Storage()
          const bucket = storage.bucket(BUCKET)

          ensureSchema(bq)

          server.middlewares.use('/api', (req: any, res: any, next: any) => {
            const url = req.url || '/'
            const method = req.method || 'GET'

            // GET /api/projects
            if (method === 'GET' && url === '/projects') {
              bq.query(`
                SELECT p.project_id, p.name, p.created_at,
                  IFNULL((SELECT COUNT(*) FROM \`${GCP_PROJECT}.${DATASET}.analyses\` a WHERE a.project_id = p.project_id), 0) AS analysis_count
                FROM \`${GCP_PROJECT}.${DATASET}.projects\` p
                ORDER BY p.created_at DESC
              `)
                .then(([rows]) => {
                  if (rows.length) return sendJson(res, 200, rows)
                  // Fall back to memory if BigQuery hasn't caught up yet
                  const mem = [...memProjects.values()].sort((a, b) => b.created_at.localeCompare(a.created_at))
                  sendJson(res, 200, mem)
                })
                .catch(() => {
                  const mem = [...memProjects.values()].sort((a, b) => b.created_at.localeCompare(a.created_at))
                  sendJson(res, 200, mem)
                })
              return
            }

            // POST /api/projects
            if (method === 'POST' && url === '/projects') {
              readBody(req).then(async body => {
                const { name } = JSON.parse(body)
                if (!name?.trim()) throw new Error('name is required')
                const projectId = randomUUID()
                const createdAt = new Date().toISOString()
                const project = { project_id: projectId, name: name.trim(), created_at: createdAt, analysis_count: 0 }
                memProjects.set(projectId, project)
                memAnalyses.set(projectId, [])
                await bq.dataset(DATASET).table('projects').insert([{
                  project_id: projectId,
                  name: name.trim(),
                  created_at: createdAt,
                }])
                sendJson(res, 201, project)
              }).catch(err => sendJson(res, 500, { error: err.message }))
              return
            }

            // GET /api/projects/:id
            const projectMatch = url.match(/^\/projects\/([^/]+)$/)
            if (method === 'GET' && projectMatch) {
              const projectId = projectMatch[1];
              (async () => {
                try {
                  const [[projects], [analyses], [coverageRows], [recRows]] = await Promise.all([
                    bq.query({
                      query: `SELECT project_id, name, created_at FROM \`${GCP_PROJECT}.${DATASET}.projects\` WHERE project_id = @id LIMIT 1`,
                      params: { id: projectId },
                    }),
                    bq.query({
                      query: `SELECT analysis_id, created_at, screen_names, events, gaps, insights, screenshot_uris FROM \`${GCP_PROJECT}.${DATASET}.analyses\` WHERE project_id = @id ORDER BY created_at DESC`,
                      params: { id: projectId },
                    }),
                    bq.query({
                      query: `SELECT analysis_id, ga4_file_name, ga4_events, match_results FROM \`${GCP_PROJECT}.${DATASET}.coverage_results\` WHERE project_id = @id ORDER BY created_at DESC`,
                      params: { id: projectId },
                    }).catch(() => [[]] as any),
                    bq.query({
                      query: `SELECT analysis_id, result FROM \`${GCP_PROJECT}.${DATASET}.rec_results\` WHERE project_id = @id ORDER BY created_at DESC`,
                      params: { id: projectId },
                    }).catch(() => [[]] as any),
                  ])
                  if (projects.length) {
                    console.log(`[SignalLoop] project ${projectId}: ${analyses.length} analyses, ${coverageRows.length} coverage rows, ${recRows.length} rec rows`)
                    // Index extras by analysis_id (most recent wins due to ORDER BY DESC)
                    const coverageByAnalysis: Record<string, any> = {}
                    for (const r of coverageRows) if (!coverageByAnalysis[r.analysis_id]) coverageByAnalysis[r.analysis_id] = r
                    const recsByAnalysis: Record<string, any> = {}
                    for (const r of recRows) if (!recsByAnalysis[r.analysis_id]) recsByAnalysis[r.analysis_id] = r

                    const enriched = analyses.map(parseAnalysisRow).map((a: any) => ({
                      ...a,
                      coverage: coverageByAnalysis[a.analysis_id]
                        ? { ga4_file_name: coverageByAnalysis[a.analysis_id].ga4_file_name ?? '', ga4_events: JSON.parse(coverageByAnalysis[a.analysis_id].ga4_events), match_results: JSON.parse(coverageByAnalysis[a.analysis_id].match_results) }
                        : null,
                      recommendations: recsByAnalysis[a.analysis_id]
                        ? JSON.parse(recsByAnalysis[a.analysis_id].result)
                        : null,
                    }))
                    return sendJson(res, 200, { ...projects[0], analyses: enriched })
                  }
                } catch {}
                // Fall back to memory
                const cached = memProjects.get(projectId)
                if (cached) {
                  const analyses = (memAnalyses.get(projectId) || []).map((a: any) => ({
                    ...a,
                    coverage: memCoverage.has(a.analysis_id)
                      ? { ga4_file_name: (memCoverage.get(a.analysis_id) as any).ga4_file_name ?? '', ga4_events: JSON.parse(memCoverage.get(a.analysis_id)!.ga4_events), match_results: JSON.parse(memCoverage.get(a.analysis_id)!.match_results) }
                      : null,
                    recommendations: memRecs.has(a.analysis_id)
                      ? JSON.parse(memRecs.get(a.analysis_id)!.result)
                      : null,
                  }))
                  return sendJson(res, 200, { ...cached, analyses })
                }
                sendJson(res, 404, { error: 'Project not found' })
              })()
              return
            }

            // POST /api/projects/:id/analyze
            const analyzeMatch = url.match(/^\/projects\/([^/]+)\/analyze$/)
            if (method === 'POST' && analyzeMatch) {
              const projectId = analyzeMatch[1]
              readBody(req).then(async body => {
                const { images, screenNames } = JSON.parse(body)
                const analysisId = randomUUID()
                const createdAt = new Date().toISOString()

                // Upload screenshots to Cloud Storage
                const screenshotUris = await Promise.all(
                  images.map(async (img: { mimeType: string; data: string }, i: number) => {
                    const ext = img.mimeType.split('/')[1] ?? 'png'
                    const filename = `projects/${projectId}/${analysisId}/screen-${i}.${ext}`
                    await bucket.file(filename).save(Buffer.from(img.data, 'base64'), { contentType: img.mimeType })
                    return `gs://${BUCKET}/${filename}`
                  })
                )

                // Gemini analysis
                const apiKey = env.VITE_GEMINI_API_KEY
                if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set')
                const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1' } })
                const result = await geminiGenerate(ai, [{
                  role: 'user',
                  parts: [
                    { text: GEMINI_PROMPT(images.length, screenNames) },
                    ...images.map((img: { mimeType: string; data: string }) => ({
                      inlineData: { mimeType: img.mimeType, data: img.data },
                    })),
                  ],
                }])
                const text = (result.text ?? '').trim()
                const jsonStr = text.startsWith('{') ? text : text.match(/\{[\s\S]*\}/)?.[0]
                if (!jsonStr) throw new Error('Could not parse Gemini response')
                const analysis = JSON.parse(jsonStr)

                // Save to BigQuery
                await bq.dataset(DATASET).table('analyses').insert([{
                  analysis_id: analysisId,
                  project_id: projectId,
                  created_at: createdAt,
                  screen_names: JSON.stringify(screenNames),
                  events: JSON.stringify(analysis.events),
                  gaps: JSON.stringify(analysis.gaps),
                  insights: JSON.stringify(analysis.insights),
                  screenshot_uris: JSON.stringify(screenshotUris),
                }])

                // Update memory cache
                const newAnalysis = { analysis_id: analysisId, created_at: createdAt, screen_names: screenNames, events: analysis.events, gaps: analysis.gaps, insights: analysis.insights, screenshot_uris: screenshotUris }
                const analyses = memAnalyses.get(projectId) || []
                analyses.unshift(newAnalysis)
                memAnalyses.set(projectId, analyses)
                const project = memProjects.get(projectId)
                if (project) project.analysis_count = (project.analysis_count || 0) + 1

                sendJson(res, 200, { analysis_id: analysisId, created_at: createdAt, ...analysis })
              }).catch(err => sendJson(res, 500, { error: err.message }))
              return
            }

            // POST /api/projects/:id/match-events
            const matchEventsMatch = url.match(/^\/projects\/([^/]+)\/match-events$/)
            if (method === 'POST' && matchEventsMatch) {
              readBody(req).then(async body => {
                const { recommended, ga4Events } = JSON.parse(body)
                const apiKey = env.VITE_GEMINI_API_KEY
                if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set')
                const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1' } })
                const prompt = `You are an analytics event matching expert. Match recommended event names against existing GA4 event names using semantic understanding — even when naming conventions differ (e.g. "checkout_started" matches "begin_checkout").

Recommended events (what should be tracked):
${(recommended as string[]).map(e => `- ${e}`).join('\n')}

Existing GA4 events (what is currently tracked):
${(ga4Events as string[]).map(e => `- ${e}`).join('\n')}

For each recommended event, find the best matching GA4 event based on semantic meaning.

Return ONLY valid JSON in this exact format:
{
  "matches": [
    {
      "recommended": "checkout_started",
      "ga4_event": "begin_checkout",
      "confidence": "high",
      "reason": "Same action, different naming convention"
    }
  ]
}

Confidence levels:
- "high": clear semantic match, same user action
- "medium": possible match, similar concept but uncertain
- "none": no match found — set ga4_event to null and reason to "Not tracked in GA4"`
                const result = await geminiGenerate(ai, [{ role: 'user', parts: [{ text: prompt }] }])
                const text = (result.text ?? '').trim()
                const jsonStr = text.startsWith('{') ? text : text.match(/\{[\s\S]*\}/)?.[0]
                if (!jsonStr) throw new Error('Could not parse Gemini response')
                sendJson(res, 200, JSON.parse(jsonStr))
              }).catch(err => sendJson(res, 500, { error: err?.message ?? 'Matching failed' }))
              return
            }

            // POST /api/projects/:id/recommendations
            const recommendationsMatch = url.match(/^\/projects\/([^/]+)\/recommendations$/)
            if (method === 'POST' && recommendationsMatch) {
              readBody(req).then(async body => {
                const { images, screenNames, matchResults } = JSON.parse(body)
                const apiKey = env.VITE_GEMINI_API_KEY
                if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set')
                const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1' } })

                const coveredCount = (matchResults as any[]).filter(m => m.confidence === 'high').length
                const missingEvents = (matchResults as any[]).filter(m => m.confidence === 'none').map(m => m.recommended)
                const coveragePct = matchResults.length ? Math.round((coveredCount / matchResults.length) * 100) : 0

                const prompt = `You are a senior product designer and UX strategist. Analyze these product screenshots and give the product manager actionable, product-focused recommendations to improve the user experience, conversion, and engagement.

Screens: ${(screenNames as string[]).join(', ')}
Analytics context (secondary): ${coveragePct}% of recommended events are tracked in GA4. Missing events: ${missingEvents.join(', ') || 'none'}.

Your job is to look at the PRODUCT itself — the UI, the flows, the hierarchy, the copy, the interactions — and tell the PM what to improve. Think like a product designer doing a UX audit, not like an analytics engineer.

Return ONLY valid JSON:
{
  "behavior_patterns": [
    { "title": "2-4 word label", "description": "What users are likely doing on these screens and why, based on what you see in the UI" }
  ],
  "working_well": [
    { "title": "Short title", "description": "A specific UI or UX element that is well designed and why it works for users" }
  ],
  "friction_points": [
    { "title": "Short title", "description": "A specific UI problem, confusing flow, or drop-off risk visible in the screenshots", "screen": "screen name or null" }
  ],
  "recommendations": [
    { "title": "Action title", "description": "Concrete product change the PM should make — focus on UI, copy, flow, or interaction design. Only the last 1-2 recommendations may relate to analytics gaps.", "impact": "high" }
  ]
}

Rules:
- behavior_patterns: 3-5 items; title must be 2-4 words
- working_well: 2-4 items about actual UI/UX strengths visible in the screenshots
- friction_points: 3-5 items about real UX problems visible in the screens
- recommendations: 4-6 items; the first 3-4 must be pure product/UX improvements (layout, copy, navigation, conversion, onboarding, empty states, etc.); only the last 1-2 may mention missing analytics tracking
- impact must be "high", "medium", or "low"; sort by impact descending
- Be specific — name the actual screen element, button, section, or flow you are referring to`

                const parts: any[] = [{ text: prompt }]
                if (Array.isArray(images) && images.length > 0) {
                  images.forEach((img: { mimeType: string; data: string }) => {
                    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } })
                  })
                }
                const result = await geminiGenerate(ai, [{ role: 'user', parts }])
                const text = (result.text ?? '').trim()
                const jsonStr = text.startsWith('{') ? text : text.match(/\{[\s\S]*\}/)?.[0]
                if (!jsonStr) throw new Error('Could not parse Gemini response')
                sendJson(res, 200, JSON.parse(jsonStr))
              }).catch(err => sendJson(res, 500, { error: err?.message ?? 'Recommendations failed' }))
              return
            }

            // POST /api/projects/:id/save-coverage
            const saveCoverageMatch = url.match(/^\/projects\/([^/]+)\/save-coverage$/)
            if (method === 'POST' && saveCoverageMatch) {
              readBody(req).then(async body => {
                const { analysisId, ga4Events, ga4FileName, matchResults } = JSON.parse(body)
                const createdAt = new Date().toISOString()
                memCoverage.set(analysisId, { ga4_file_name: ga4FileName ?? '', ga4_events: JSON.stringify(ga4Events), match_results: JSON.stringify(matchResults) })
                await bq.dataset(DATASET).table('coverage_results').insert([{
                  analysis_id: analysisId,
                  project_id: saveCoverageMatch[1],
                  created_at: createdAt,
                  ga4_events: JSON.stringify(ga4Events),
                  match_results: JSON.stringify(matchResults),
                }]).catch(err => {
                  const detail = err?.errors ? JSON.stringify(err.errors) : (err?.message || String(err))
                  console.error('[SignalLoop] coverage_results insert failed:', detail)
                })
                sendJson(res, 200, { ok: true })
              }).catch(err => sendJson(res, 500, { error: err.message }))
              return
            }

            // POST /api/projects/:id/save-recommendations
            const saveRecsMatch = url.match(/^\/projects\/([^/]+)\/save-recommendations$/)
            if (method === 'POST' && saveRecsMatch) {
              readBody(req).then(async body => {
                const { analysisId, result } = JSON.parse(body)
                const createdAt = new Date().toISOString()
                memRecs.set(analysisId, { result: JSON.stringify(result) })
                await bq.dataset(DATASET).table('rec_results').insert([{
                  analysis_id: analysisId,
                  project_id: saveRecsMatch[1],
                  created_at: createdAt,
                  result: JSON.stringify(result),
                }]).catch(err => console.error('[SignalLoop] rec_results insert failed:', err?.message))
                sendJson(res, 200, { ok: true })
              }).catch(err => sendJson(res, 500, { error: err.message }))
              return
            }

            // GET /api/gcs-image?path=projects/...
            if (method === 'GET' && url.startsWith('/gcs-image')) {
              const qs = url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''
              const filePath = new URLSearchParams(qs).get('path')
              if (!filePath) { sendJson(res, 400, { error: 'path required' }); return }
              const ext = filePath.split('.').pop()?.toLowerCase() ?? 'png'
              const mimeMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', webp: 'image/webp' }
              res.setHeader('Content-Type', mimeMap[ext] ?? 'image/png')
              res.setHeader('Cache-Control', 'private, max-age=3600')
              bucket.file(filePath).createReadStream()
                .on('error', (err: Error) => {
                  console.error('[GCS proxy error]', filePath, err.message)
                  if (!res.headersSent) sendJson(res, 404, { error: 'not found' })
                })
                .pipe(res)
              return
            }

            next()
          })
        },
      },
    ],
  }
})
