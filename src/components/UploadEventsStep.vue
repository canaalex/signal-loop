<template>
  <div class="flex-1 overflow-y-auto px-7.5 py-10">
    <div class="max-w-3xl">

      <div class="inline-flex items-center gap-1.75 px-3 py-1.25 rounded-full border border-primary/30 bg-primary/8 text-primary text-[11px] font-semibold tracking-[0.06em] mb-4">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z"/>
        </svg>
        COVERAGE ANALYSIS
      </div>

      <h1 class="text-[28px] font-bold tracking-[-0.03em] m-0 mb-2 leading-[1.2]">Check your event coverage</h1>
      <p class="text-sm text-text-secondary m-0 mb-7 leading-[1.65]">
        Export your existing events from any analytics platform — GA4, Mixpanel, Amplitude, or others — and upload them here. SignalLoop will match them against the recommendations and show what's missing.
      </p>

      <div class="mb-6">
        <p class="text-lg font-semibold mb-3">Upload your analytics events</p>
        <div class="flex flex-col items-center justify-center border border-dashed rounded-2xl px-7 py-10 cursor-pointer transition-all"
          :class="ga4Events.length > 0 ? 'border-green-500/40 bg-green-500/5' : 'border-white/12 hover:border-primary/35'"
          @click="eventsFileInput?.click()">
          <template v-if="ga4Events.length > 0">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" class="mb-3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p class="text-lg font-medium text-green-400 m-0 mb-1">{{ ga4FileName || 'GA4 export' }}</p>
            <p class="text-sm text-muted m-0">{{ ga4Events.length }} events found · click to replace</p>
          </template>
          <template v-else>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="1.5" stroke-linecap="round" class="mb-3">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
            <p class="text-base font-medium text-text m-0 mb-1">Drop your analytics export here</p>
            <p class="text-sm text-muted m-0">CSV, Excel, or JSON · from GA4, Mixpanel, Amplitude, or any platform</p>
          <a href="/sample-ga4-events.csv" download class="text-sm text-primary/70 hover:text-primary transition-colors mt-2" @click.stop>
            Download sample file to try
          </a>
          </template>
        </div>
        <input ref="eventsFileInput" type="file" accept=".csv,.json,.xlsx,.xls" class="hidden" @change="onEventsFile" />
      </div>

      <div v-if="gpuStats" class="flex flex-wrap items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-[#76b900]/8 border border-[#76b900]/25">
        <div class="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#76b900" stroke-width="2" stroke-linecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span class="text-[#76b900] text-sm font-semibold">{{ gpuStats.engine }}</span>
        </div>
        <span class="text-white/40 text-xs">|</span>
        <span class="text-muted text-sm">{{ gpuStats.row_count.toLocaleString() }} rows</span>
        <span class="text-white/40 text-xs">|</span>
        <span class="text-muted text-sm">Processed in <span class="text-text font-medium">{{ gpuStats.gpu_ms }}ms</span></span>
        <template v-if="gpuStats.cpu_ms_estimate">
          <span class="text-white/40 text-xs">|</span>
          <span class="text-[#76b900] text-sm font-semibold">
            {{ Math.round(gpuStats.cpu_ms_estimate / gpuStats.gpu_ms) }}× faster than CPU
          </span>
        </template>
      </div>

      <div v-if="ga4Events.length > 0 && matchResults.length === 0" class="mb-6 p-4 rounded-xl bg-white/3 border border-white/8">
        <p class="text-sm font-semibold text-muted mb-2">Events found in your GA4 export</p>
        <div class="flex flex-wrap gap-2">
          <code v-for="e in ga4Events.slice(0, 20)" :key="e" class="text-[13px] font-mono text-text-secondary bg-white/5 px-2 py-0.5 rounded">{{ e }}</code>
          <span v-if="ga4Events.length > 20" class="text-[13px] text-muted">+{{ ga4Events.length - 20 }} more</span>
        </div>
      </div>

      <div v-if="ga4Events.length > 0 && matchResults.length === 0" class="mb-8">
        <button
          class="flex items-center gap-2 h-11 px-6 rounded-xl text-base font-semibold text-white gradient-pink glow-pink-md border-0 tracking-[0.01em] transition-all"
          :class="matching ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'"
          :disabled="matching"
          @click="emit('runMatch')">
          <template v-if="matching">
            <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Analysing coverage…
          </template>
          <template v-else>
            Compare with recommendations
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </template>
        </button>
        <div v-if="matchError" class="flex items-center gap-3 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" class="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="text-red-400 text-sm m-0 flex-1">{{ matchError }}</p>
          <button class="text-sm text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer shrink-0 transition-colors" @click="emit('runMatch')">Retry</button>
        </div>
      </div>

      <div v-if="matchResults.length > 0" class="mb-8">

        <div class="flex items-center gap-5 mb-6 p-5 rounded-2xl bg-white/3 border border-white/8">
          <div class="text-center">
            <p class="text-[36px] font-bold text-primary m-0 leading-none">{{ coveredCount }}</p>
            <p class="text-sm text-muted m-0 mt-1">covered</p>
          </div>
          <div class="text-center">
            <p class="text-[36px] font-bold text-yellow-400 m-0 leading-none">{{ possibleCount }}</p>
            <p class="text-sm text-muted m-0 mt-1">possible</p>
          </div>
          <div class="text-center">
            <p class="text-[36px] font-bold text-red-400 m-0 leading-none">{{ missingCount }}</p>
            <p class="text-sm text-muted m-0 mt-1">missing</p>
          </div>
          <div class="flex-1 ml-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-muted">Coverage</span>
              <span class="text-sm font-bold text-primary">{{ coveragePct }}%</span>
            </div>
            <div class="h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div class="h-full gradient-pink rounded-full transition-all duration-700" :style="{ width: `${coveragePct}%` }" />
            </div>
          </div>
        </div>

        <div class="border border-white/8 rounded-2xl overflow-hidden mb-5">
          <div v-for="(match, i) in matchResults" :key="match.recommended"
            class="flex items-start gap-4 px-5 py-4"
            :class="i < matchResults.length - 1 ? 'border-b border-white/5' : ''">
            <div class="shrink-0 mt-0.5">
              <svg v-if="match.confidence === 'high'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <svg v-else-if="match.confidence === 'medium'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <code class="text-[14px] font-mono text-primary bg-primary/8 px-2 py-0.5 rounded">{{ match.recommended }}</code>
                <template v-if="match.ga4_event">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                  <code class="text-[14px] font-mono text-text-secondary bg-white/5 px-2 py-0.5 rounded">{{ match.ga4_event }}</code>
                </template>
              </div>
              <p class="text-[13px] text-muted m-0">{{ match.reason }}</p>
            </div>
          </div>
        </div>

        <div v-if="missingCount > 0" class="mb-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-base font-semibold m-0">Missing events</p>
            <button class="flex items-center gap-2 text-sm text-muted bg-transparent border-0 cursor-pointer hover:text-text transition-colors"
              @click="toggleAllMissing">
              <div class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                :class="allMissingSelected ? 'bg-primary border-primary' : 'border-white/30'">
                <svg v-if="allMissingSelected" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              {{ allMissingSelected ? 'Deselect all' : 'Select all' }}
            </button>
          </div>
          <div class="border border-white/8 rounded-2xl overflow-hidden mb-4">
            <div v-for="(match, i) in missingMatches" :key="match.recommended"
              class="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-white/3 transition-colors"
              :class="i < missingMatches.length - 1 ? 'border-b border-white/5' : ''"
              @click="toggleMissingEvent(match.recommended)">
              <div class="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
                :class="selectedMissingEvents.includes(match.recommended) ? 'bg-primary border-primary' : 'border-white/25'">
                <svg v-if="selectedMissingEvents.includes(match.recommended)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" class="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <code class="text-[14px] font-mono text-primary bg-primary/8 px-2 py-0.5 rounded flex-1">{{ match.recommended }}</code>
              <span class="text-[13px] text-muted truncate max-w-50">{{ match.reason }}</span>
            </div>
          </div>
          <button
            class="flex items-center gap-2 h-11 px-6 rounded-xl text-[15px] font-semibold border-0 transition-all"
            :class="selectedMissingEvents.length > 0 ? 'text-white gradient-pink cursor-pointer hover:brightness-110' : 'bg-primary/20 text-primary/50 cursor-not-allowed'"
            :disabled="selectedMissingEvents.length === 0"
            @click="emit('downloadMissing')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download {{ selectedMissingEvents.length > 0 ? selectedMissingEvents.length : '' }} missing event{{ selectedMissingEvents.length === 1 ? '' : 's' }}
          </button>
        </div>

        <button class="text-sm text-muted bg-transparent border-0 cursor-pointer hover:text-text transition-colors p-0"
          @click="resetUpload">
          Upload a different file
        </button>
      </div>

      <div class="flex items-center gap-3 flex-wrap pb-8">
        <button v-if="matchResults.length > 0"
          class="flex items-center gap-2 h-11 px-6 rounded-xl text-base font-semibold text-white gradient-pink glow-pink-md border-0 tracking-[0.01em] cursor-pointer hover:brightness-110 transition-all"
          @click="emit('goToRecommendations')">
          Get Recommendations
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <button class="flex items-center gap-2 text-base text-muted bg-transparent border-0 cursor-pointer hover:text-text transition-colors"
          @click="emit('back')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to events
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import type { AnalysisResult, MatchResult, GpuStats } from '../types/project'

const props = defineProps<{
  analysisResult: AnalysisResult | null
  ga4Events: string[]
  ga4FileName: string
  matchResults: MatchResult[]
  matching: boolean
  matchError: string | null
  gpuStats: GpuStats | null
  coveredCount: number
  possibleCount: number
  missingCount: number
  coveragePct: number
  missingMatches: MatchResult[]
  selectedMissingEvents: string[]
}>()

const emit = defineEmits<{
  'update:selectedMissingEvents': [events: string[]]
  'fileUploaded': [payload: { events: string[]; fileName: string; gpuStats: GpuStats | null }]
  'runMatch': []
  'downloadMissing': []
  'goToRecommendations': []
  'back': []
  'resetUpload': []
}>()

const eventsFileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)

const allMissingSelected = computed(() =>
  props.missingMatches.length > 0 && props.missingMatches.every(m => props.selectedMissingEvents.includes(m.recommended))
)

function toggleMissingEvent(name: string) {
  const idx = props.selectedMissingEvents.indexOf(name)
  if (idx === -1) {
    emit('update:selectedMissingEvents', [...props.selectedMissingEvents, name])
  } else {
    const updated = [...props.selectedMissingEvents]
    updated.splice(idx, 1)
    emit('update:selectedMissingEvents', updated)
  }
}

function toggleAllMissing() {
  if (allMissingSelected.value) {
    emit('update:selectedMissingEvents', [])
  } else {
    emit('update:selectedMissingEvents', props.missingMatches.map(m => m.recommended))
  }
}

function resetUpload() {
  uploadedFile.value = null
  emit('resetUpload')
}

function parseGA4File(file: File): Promise<string[]> {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
  const isJson = file.name.endsWith('.json')

  if (isExcel) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const events = new Set<string>()
        try {
          const wb = XLSX.read(reader.result, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
          const sample = rows[0] ?? {}
          const key = Object.keys(sample).find(k => /event.?name/i.test(k)) ?? Object.keys(sample)[0]
          rows.forEach(row => {
            const name = row[key]
            if (name && name !== '(not set)') events.add(String(name).trim())
          })
        } catch {}
        resolve([...events].filter(Boolean))
      }
      reader.readAsArrayBuffer(file)
    })
  }

  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const text = reader.result as string
      const events = new Set<string>()
      if (isJson) {
        try {
          const data = JSON.parse(text)
          const items = Array.isArray(data) ? data : data.events ?? data.rows ?? []
          items.forEach((item: any) => {
            const name = typeof item === 'string' ? item : item.event_name ?? item.name ?? item.eventName
            if (name) events.add(name)
          })
        } catch {}
      } else {
        const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'))
        let eventColIdx = -1
        lines.forEach((line, i) => {
          const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
          if (eventColIdx === -1) {
            const idx = cols.findIndex(c => /event.?name/i.test(c))
            if (idx !== -1) { eventColIdx = idx; return }
          }
          if (i > 0 && eventColIdx !== -1) {
            const name = cols[eventColIdx]
            if (name && name !== '(not set)') events.add(name)
          }
        })
      }
      resolve([...events].filter(Boolean))
    }
    reader.readAsText(file)
  })
}

async function onEventsFile(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.[0]) return
  const file = input.files[0]
  uploadedFile.value = file
  input.value = ''

  // Try GPU service first
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/gpu/process', { method: 'POST', body: form })
    if (res.ok) {
      const data = await res.json()
      if (!data.error && Array.isArray(data.events)) {
        emit('fileUploaded', {
          events: data.events,
          fileName: file.name,
          gpuStats: {
            engine: data.engine,
            gpu: data.gpu,
            row_count: data.row_count,
            gpu_ms: data.gpu_ms,
            cpu_ms_estimate: data.cpu_ms_estimate,
            frequency: data.frequency ?? {},
          },
        })
        return
      }
    }
  } catch {}

  // Fallback: SheetJS in-browser parsing
  const events = await parseGA4File(file)
  emit('fileUploaded', { events, fileName: file.name, gpuStats: null })
}
</script>
