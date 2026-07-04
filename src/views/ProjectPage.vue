<template>
  <div class="min-h-svh lg:h-svh flex flex-col bg-background text-text lg:overflow-hidden">

    <div v-if="sidebarOpen" class="fixed inset-0 z-20 lg:hidden bg-black/60" @click="sidebarOpen = false" />

    <header class="shrink-0 flex items-center h-17 px-6 bg-[#0F1320] border-b border-white/6 relative z-10 gap-3">
      <a href="/" class="flex items-center gap-2.5 shrink-0 no-underline text-text hover:opacity-80 transition-opacity">
        <img src="/signallogo.png" alt="SignalLoop" class="w-9 h-9 object-contain mix-blend-screen" />
        <span class="text-[22px] font-semibold tracking-[-0.02em]">SignalLoop</span>
      </a>

      <div class="flex items-center gap-1.5 text-sm mr-auto overflow-hidden">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <button @click="$router.push('/projects')"
          class="text-muted hover:text-text transition-colors bg-transparent border-0 cursor-pointer text-sm px-0 py-0 shrink-0">
          Projects
        </button>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span class="text-text font-medium truncate">{{ projectName || '…' }}</span>
      </div>

      <!-- Hamburger (mobile) -->
      <button class="lg:hidden mr-1 bg-transparent border-0 cursor-pointer text-text-secondary p-1" @click="sidebarOpen = !sidebarOpen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <button class="bg-transparent border-0 cursor-pointer text-muted p-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      </button>
      <div class="flex items-center justify-center rounded-full text-white shrink-0 w-9 h-9 text-[15px] font-bold gradient-pink">SR</div>
    </header>

    <div class="flex-1 flex min-w-0 lg:overflow-hidden">

      <aside class="fixed top-0 left-0 h-svh flex flex-col z-30 lg:relative lg:translate-x-0 lg:h-full shrink-0 bg-surface border-r border-white/6 transition-all duration-200"
        :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0', sidebarCollapsed ? 'lg:w-[52px] w-64' : 'w-64']">
        <nav class="flex-1 overflow-y-auto py-3" :class="sidebarCollapsed ? 'px-1.5' : 'px-2.5'">
          <div class="hidden lg:flex mb-1" :class="sidebarCollapsed ? 'justify-center' : 'justify-end px-1'">
            <button class="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 bg-transparent border-0 cursor-pointer transition-colors"
              @click="sidebarCollapsed = !sidebarCollapsed">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
          <div v-if="!sidebarCollapsed && projectName" class="px-3.25 pt-1 pb-3 mb-1 border-b border-white/6">
            <p class="text-xs text-muted m-0 mb-0.5 uppercase tracking-widest">Project</p>
            <p class="text-sm font-semibold text-text m-0 truncate">{{ projectName }}</p>
          </div>
          <button v-for="(step, i) in steps" :key="i"
            class="flex items-center w-full text-left rounded-[10px] text-[14px] border-0 cursor-pointer mb-0.75 transition-all"
            :class="[
              !stepAccessible(i) ? 'opacity-35 cursor-default' : '',
              isActiveStep(i) ? 'bg-primary/12 text-primary font-medium' : 'bg-transparent text-text-secondary font-normal hover:bg-white/5 hover:text-text',
              sidebarCollapsed ? 'justify-center px-0 py-2.5 gap-0' : 'gap-3 px-3.25 py-2.5'
            ]"
            @click="stepAccessible(i) && (navigateToStep(i), sidebarOpen = false)">
            <span class="shrink-0 w-4.5 h-4.5 flex items-center" v-html="stepIcons[i]" />
            <template v-if="!sidebarCollapsed">
              <span class="flex-1">{{ step }}</span>
              <svg v-if="stepDone(i)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </template>
          </button>
        </nav>
        <div v-if="!sidebarCollapsed" class="shrink-0 p-3 border-t border-white/6">
          <button @click="$router.push('/projects')"
            class="flex items-center gap-2.5 px-3 py-2.5 w-full text-sm font-medium text-text-secondary bg-white/5 border border-white/10 cursor-pointer rounded-xl text-left hover:bg-white/8 hover:text-text transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            All Projects
          </button>
        </div>
        <div v-else class="shrink-0 p-2 border-t border-white/6 flex justify-center">
          <button @click="$router.push('/projects')"
            class="p-2 rounded-xl text-text-secondary hover:text-text bg-white/5 border border-white/10 hover:bg-white/8 cursor-pointer transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 lg:overflow-hidden">

        <div v-if="showNavHint" class="shrink-0 flex items-center justify-between gap-3 px-6 py-2 bg-secondary/8 border-b border-secondary/15">
          <div class="flex items-center gap-2 text-xs text-secondary/80">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Click any step in the progress bar or the left sidebar to jump between sections.
          </div>
          <button @click="dismissNavHint" class="shrink-0 p-1 text-secondary/60 hover:text-secondary bg-transparent border-0 cursor-pointer transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="shrink-0 flex items-center overflow-x-auto scrollbar-none px-7.5 py-4 border-b border-white/6">
          <template v-for="(step, i) in steps" :key="i">
            <div class="flex items-center shrink-0 gap-2.25 px-2 transition-opacity"
              :class="stepAccessible(i) ? 'cursor-pointer opacity-100' : 'cursor-default opacity-40'"
              @click="stepAccessible(i) && navigateToStep(i)">
              <div class="flex items-center justify-center rounded-full shrink-0 w-8 h-8 text-base transition-all"
                :class="isActiveStep(i) ? 'gradient-pink text-white font-bold' : stepDone(i) ? 'bg-white/12 border border-white/20 text-text font-medium' : 'border border-white/18 text-muted font-medium'">
                <svg v-if="stepDone(i) && !isActiveStep(i)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="whitespace-nowrap text-base transition-colors"
                :class="isActiveStep(i) ? 'font-semibold text-primary' : stepDone(i) ? 'text-text' : 'text-muted'">{{ step }}</span>
            </div>
            <div v-if="i < steps.length - 1" class="flex-1 min-w-3.5 max-w-10 h-px transition-colors"
              :class="stepDone(i) ? 'bg-white/25' : 'bg-white/10'" />
          </template>
        </div>

        <UploadFlowStep
          v-if="currentStep === 0"
          :screens="screens"
          :pastAnalyses="pastAnalyses"
          :analyzed="analyzed"
          :analyzing="analyzing"
          :analysisResult="analysisResult"
          :analysisError="analysisError"
          :hasUnnamedScreens="hasUnnamedScreens"
          :expandedAnalysis="expandedAnalysis"
          @update:screens="screens = $event"
          @update:expandedAnalysis="expandedAnalysis = $event"
          @analyze="analyzeFlow"
          @clearAll="clearAll"
          @removeScreen="removeScreen"
        />

        <RecommendedEventsStep
          v-else-if="currentStep === 1 && analysisResult"
          :screens="screens"
          :analysisResult="analysisResult"
          :selectedEvents="selectedEvents"
          :selectedScreen="selectedScreen"
          :filteredEvents="filteredEvents"
          :allFilteredSelected="allFilteredSelected"
          @update:selectedEvents="selectedEvents = $event"
          @update:selectedScreen="selectedScreen = $event"
          @downloadJSON="downloadJSON"
          @downloadCSV="downloadCSV"
          @continue="currentStep = 2"
          @back="currentStep = 0; selectedScreen = null"
        />

        <UploadEventsStep
          v-else-if="currentStep === 2"
          :analysisResult="analysisResult"
          :ga4Events="ga4Events"
          :ga4FileName="ga4FileName"
          :matchResults="matchResults"
          :matching="matching"
          :matchError="matchError"
          :gpuStats="gpuStats"
          :coveredCount="coveredCount"
          :possibleCount="possibleCount"
          :missingCount="missingCount"
          :coveragePct="coveragePct"
          :missingMatches="missingMatches"
          :selectedMissingEvents="selectedMissingEvents"
          @update:selectedMissingEvents="selectedMissingEvents = $event"
          @fileUploaded="onFileUploaded"
          @runMatch="runMatch"
          @downloadMissing="downloadMissing"
          @goToRecommendations="goToRecommendations"
          @back="currentStep = 1"
          @resetUpload="onResetUpload"
        />

        <RecommendationsStep
          v-else-if="currentStep === 3"
          :recommendationsResult="recommendationsResult"
          :generatingRecs="generatingRecs"
          :recsError="recsError"
          :matchResults="matchResults"
          :coveragePct="coveragePct"
          :coverageArc="coverageArc"
          :coveredCount="coveredCount"
          @retry="generateRecommendations"
          @back="currentStep = 2"
        />

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import UploadFlowStep from '../components/project/UploadFlowStep.vue'
import RecommendedEventsStep from '../components/project/RecommendedEventsStep.vue'
import UploadEventsStep from '../components/project/UploadEventsStep.vue'
import RecommendationsStep from '../components/project/RecommendationsStep.vue'
import type { Screen, AnalysisResult, PastAnalysis, MatchResult, GpuStats, RecommendationsResult } from '../types/project'

const route = useRoute()
const projectId = route.params.id as string

let nextId = 0

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const showNavHint = ref(!localStorage.getItem('sl-nav-hint'))
const screens = ref<Screen[]>([])
const currentStep = ref(0)

watch(currentStep, val => {
  if (val >= 1) sidebarCollapsed.value = true
})

function dismissNavHint() {
  showNavHint.value = false
  localStorage.setItem('sl-nav-hint', '1')
}

const selectedScreen = ref<string | null>(null)
const analyzing = ref(false)
const analyzed = ref(false)
const hasUnnamedScreens = computed(() => screens.value.some(s => !s.name.trim()))
const currentAnalysisId = ref('')
const analysisError = ref<string | null>(null)
const analysisResult = ref<AnalysisResult | null>(null)
const selectedEvents = ref<string[]>([])

const projectName = ref('')
const pastAnalyses = ref<PastAnalysis[]>([])
const expandedAnalysis = ref<string | null>(null)

const recommendationsResult = ref<RecommendationsResult | null>(null)
const generatingRecs = ref(false)
const recsError = ref<string | null>(null)

const ga4FileName = ref<string>('')
const ga4Events = ref<string[]>([])
const matchResults = ref<MatchResult[]>([])
const matching = ref(false)
const matchError = ref<string | null>(null)
const gpuStats = ref<GpuStats | null>(null)

const coveredCount = computed(() => matchResults.value.filter(m => m.confidence === 'high').length)
const possibleCount = computed(() => matchResults.value.filter(m => m.confidence === 'medium').length)
const missingCount = computed(() => matchResults.value.filter(m => m.confidence === 'none').length)
const coveragePct = computed(() => {
  if (!matchResults.value.length) return 0
  return Math.round((coveredCount.value / matchResults.value.length) * 100)
})
const coverageArc = computed(() => {
  const pct = Math.min(coveragePct.value, 100)
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 70 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#f87171'
  return { dash, gap: circ - dash, circ, color }
})
const missingMatches = computed(() => matchResults.value.filter(m => m.confidence === 'none'))
const selectedMissingEvents = ref<string[]>([])

const filteredEvents = computed(() => {
  if (!analysisResult.value) return []
  if (selectedScreen.value === null) return analysisResult.value.events
  return analysisResult.value.events.filter(e => e.screen === selectedScreen.value)
})

const allFilteredSelected = computed(() =>
  filteredEvents.value.length > 0 &&
  filteredEvents.value.every(e => selectedEvents.value.includes(e.name))
)

function removeScreen(i: number) {
  screens.value.splice(i, 1)
}

function clearAll() {
  screens.value.forEach(s => URL.revokeObjectURL(s.url))
  screens.value = []
  analyzed.value = false
  analysisResult.value = null
  analysisError.value = null
}

function eventsToDownload() {
  const pool = selectedEvents.value.length > 0
    ? analysisResult.value!.events.filter(e => selectedEvents.value.includes(e.name))
    : analysisResult.value!.events
  return selectedScreen.value
    ? pool.filter(e => e.screen === selectedScreen.value)
    : pool
}

function downloadJSON() {
  const toDownload = eventsToDownload()
  const payload = {
    generated_by: 'SignalLoop',
    project: projectName.value,
    screen: selectedScreen.value ?? 'all',
    total: toDownload.length,
    events: toDownload,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const screen = selectedScreen.value ? `-${selectedScreen.value.replace(/\s+/g, '-').toLowerCase()}` : ''
  a.href = url; a.download = `signalloop-events${screen}.json`; a.click()
  URL.revokeObjectURL(url)
}

function downloadCSV() {
  const toDownload = eventsToDownload()
  const rows = [['name', 'screen', 'priority', 'description', 'properties'], ...toDownload.map(e => [e.name, e.screen, e.priority, e.description, e.properties.join(', ')])]
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const screen = selectedScreen.value ? `-${selectedScreen.value.replace(/\s+/g, '-').toLowerCase()}` : ''
  a.href = url; a.download = `signalloop-events${screen}.csv`; a.click()
  URL.revokeObjectURL(url)
}

function downloadMissing() {
  if (!analysisResult.value || selectedMissingEvents.value.length === 0) return
  const selected = new Set(selectedMissingEvents.value)
  const missing = analysisResult.value.events.filter(e => selected.has(e.name))
  const payload = { generated_by: 'SignalLoop', project: projectName.value, label: 'missing_from_ga4', total: missing.length, events: missing }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'signalloop-missing-events.json'; a.click()
  URL.revokeObjectURL(url)
}

function onFileUploaded(payload: { events: string[]; fileName: string; gpuStats: GpuStats | null }) {
  ga4Events.value = payload.events
  ga4FileName.value = payload.fileName
  gpuStats.value = payload.gpuStats
  matchResults.value = []
  matchError.value = null
}

function onResetUpload() {
  matchResults.value = []
  ga4FileName.value = ''
  ga4Events.value = []
  gpuStats.value = null
  selectedMissingEvents.value = []
}

async function runMatch() {
  if (!analysisResult.value || matching.value) return
  matching.value = true
  matchError.value = null
  try {
    const recommended = analysisResult.value.events.map(e => e.name)
    const res = await fetch(`/api/projects/${projectId}/match-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommended, ga4Events: ga4Events.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Matching failed')
    matchResults.value = data.matches
    selectedMissingEvents.value = []
    currentStep.value = 2
    // Persist to BigQuery (fire-and-forget)
    fetch(`/api/projects/${projectId}/save-coverage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: currentAnalysisId.value, ga4Events: ga4Events.value, ga4FileName: ga4FileName.value, matchResults: data.matches }),
    }).catch(err => console.warn('[SignalLoop] save-coverage failed:', err))
  } catch (err) {
    matchError.value = err instanceof Error ? err.message : 'Matching failed'
  } finally {
    matching.value = false
  }
}

async function generateRecommendations() {
  if (generatingRecs.value) return
  generatingRecs.value = true
  recsError.value = null
  recommendationsResult.value = null
  try {
    const images = await Promise.all(
      screens.value.map(async screen => {
        const res = await fetch(screen.url)
        const blob = await res.blob()
        const data = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve((reader.result as string).split(',')[1])
          reader.readAsDataURL(blob)
        })
        return { mimeType: blob.type || 'image/png', data }
      })
    )
    const screenNames = screens.value.map((s, i) => `Screen ${i + 1}: ${s.name}`)
    const res = await fetch(`/api/projects/${projectId}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images,
        screenNames,
        events: analysisResult.value?.events ?? [],
        matchResults: matchResults.value,
        gaps: analysisResult.value?.gaps ?? [],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Recommendations failed')
    recommendationsResult.value = data
    fetch(`/api/projects/${projectId}/save-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: currentAnalysisId.value, result: data }),
    }).catch(() => {})
  } catch (err) {
    recsError.value = err instanceof Error ? err.message : 'Recommendations failed'
  } finally {
    generatingRecs.value = false
  }
}

function stepAccessible(i: number) {
  if (i === 0) return true
  if (i === 1) return analyzed.value
  if (i === 2) return matchResults.value.length > 0 || recommendationsResult.value !== null
  if (i === 3) return recommendationsResult.value !== null
  return false
}

function stepDone(i: number) {
  if (i === 0) return analyzed.value
  if (i === 1) return matchResults.value.length > 0 || recommendationsResult.value !== null
  if (i === 2) return recommendationsResult.value !== null
  return false
}

function isActiveStep(i: number) {
  return currentStep.value === i
}

function navigateToStep(i: number) {
  currentStep.value = i
}

function goToRecommendations() {
  currentStep.value = 3
  generateRecommendations()
}

onMounted(async () => {
  try {
    const res = await fetch(`/api/projects/${projectId}`)
    const data = await res.json()
    if (res.ok) {
      projectName.value = data.name
      pastAnalyses.value = data.analyses || []
      // Auto-load the most recent analysis into the events view
      if (pastAnalyses.value.length > 0) {
        const latest = pastAnalyses.value[0]
        analysisResult.value = { events: latest.events, gaps: latest.gaps, insights: latest.insights }
        analyzed.value = true
        currentAnalysisId.value = latest.analysis_id
        screens.value = latest.screen_names.map((name, i) => {
          const gcsUri = latest.screenshot_uris[i] ?? ''
          const path = gcsUri.replace('gs://signalloop-screenshots/', '')
          return {
            id: nextId++,
            name: name.replace(/^Screen \d+: /, ''),
            url: path ? `/api/gcs-image?path=${encodeURIComponent(path)}` : '',
            editing: false,
          }
        })
        // Restore coverage if saved
        if ((latest as any).coverage) {
          ga4Events.value = (latest as any).coverage.ga4_events
          ga4FileName.value = (latest as any).coverage.ga4_file_name ?? ''
          matchResults.value = (latest as any).coverage.match_results
          currentStep.value = 2
        } else {
          currentStep.value = 1
        }
        // Restore recommendations if saved
        if ((latest as any).recommendations) {
          recommendationsResult.value = (latest as any).recommendations
          currentStep.value = 3
        }
      }
    }
  } catch {}
})

async function analyzeFlow() {
  if (screens.value.length === 0 || analyzing.value) return
  analyzing.value = true
  analyzed.value = false
  analysisError.value = null
  analysisResult.value = null

  try {
    const images = await Promise.all(
      screens.value.map(async screen => {
        const res = await fetch(screen.url)
        const blob = await res.blob()
        const data = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve((reader.result as string).split(',')[1])
          reader.readAsDataURL(blob)
        })
        return { mimeType: blob.type || 'image/png', data }
      })
    )
    const screenNames = screens.value.map((s, i) => `Screen ${i + 1}: ${s.name}`)

    const res = await fetch(`/api/projects/${projectId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images, screenNames }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Analysis failed')

    analysisResult.value = json as AnalysisResult
    analyzed.value = true
    currentAnalysisId.value = json.analysis_id
    currentStep.value = 1

    // Prepend to past analyses list
    pastAnalyses.value.unshift({
      analysis_id: json.analysis_id,
      created_at: json.created_at,
      screen_names: screenNames,
      events: json.events,
      gaps: json.gaps,
      insights: json.insights,
      screenshot_uris: [],
    })
  } catch (err) {
    analysisError.value = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
  } finally {
    analyzing.value = false
  }
}

const steps = ['Upload Flow', 'Recommended Events', 'Upload Events', 'Recommendations']

const stepIcons = [
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a3 3 0 003 3h6a3 3 0 003-3V9"/></svg>`,
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
]
</script>
