<template>
  <div class="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">

    <div class="flex-1 overflow-y-auto px-7.5 py-8">
      <div class="inline-flex items-center gap-1.75 px-3 py-1.25 rounded-full border border-primary/30 bg-primary/8 text-primary text-[11px] font-semibold tracking-[0.06em] mb-4">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z"/>
        </svg>
        AI PRODUCT ANALYSIS
      </div>
      <h1 class="text-[28px] font-bold tracking-[-0.03em] m-0 mb-2 leading-[1.2]">Upload your product flow</h1>
      <p class="text-sm text-text-secondary m-0 mb-6 leading-[1.65]">
        Upload screenshots or flow diagrams.<br />We'll analyze your user journeys and recommend events to track.
      </p>

      <div class="flex flex-col items-center justify-center border border-dashed rounded-2xl px-7 py-12 mb-4.5 cursor-pointer transition-all select-none"
        :class="isDragging ? 'border-primary/70 bg-primary/5' : 'border-white/12 hover:border-primary/35 bg-white/150'"
        @click="fileInput?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop">
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" :stroke="isDragging ? '#FF2E83' : '#98A2B3'" stroke-width="1.5" stroke-linecap="round" class="mb-3.5 transition-colors">
          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
        </svg>
        <p class="text-base font-medium text-text m-0 mb-1">Drag and drop your images here</p>
        <p class="text-sm text-text-secondary m-0 mb-2">or <span class="text-primary cursor-pointer">click to browse</span></p>
        <p class="text-xs text-muted m-0">Supports: PNG, JPG, SVG &nbsp;|&nbsp; Max 20MB per file</p>
      </div>
      <input ref="fileInput" type="file" accept="image/*,.svg" multiple class="hidden" @change="onFileInput" />

      <div v-if="screens.length > 0" class="border border-white/7 rounded-2xl overflow-hidden mb-4">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-white/6">
          <span class="text-sm font-semibold">Screens uploaded ({{ screens.length }})</span>
          <button class="flex items-center gap-1.5 text-sm text-muted bg-transparent border-0 cursor-pointer hover:text-text transition-colors" @click="emit('clearAll')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
            Clear all
          </button>
        </div>
        <div v-for="(screen, i) in screens" :key="screen.id" class="flex items-center px-5 py-2.75 gap-3.5"
          :class="i < screens.length - 1 ? 'border-b border-white/4' : ''">
          <svg width="14" height="14" viewBox="0 0 10 16" fill="#98A2B3" class="shrink-0 opacity-35 cursor-grab">
            <circle cx="3" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/>
            <circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/>
            <circle cx="3" cy="14" r="1.5"/><circle cx="7" cy="14" r="1.5"/>
          </svg>
          <img v-if="screen.url" :src="screen.url" :alt="screen.name" class="rounded-lg shrink-0 w-13 h-10.5 object-cover border border-secondary/20" />
          <div v-else class="rounded-lg shrink-0 w-13 h-10.5 bg-secondary/12 border border-secondary/20" />
          <input v-if="screen.editing"
            :ref="el => (nameInputs[i] = el as HTMLInputElement)"
            v-model="screen.name"
            placeholder="Name this screen…"
            class="text-sm font-medium flex-1 min-w-0 bg-transparent border-b outline-none text-text px-0.5 placeholder:text-muted/50"
            :class="screen.name.trim() ? 'border-primary/60' : 'border-amber-400/60'"
            @blur="screen.editing = false"
            @keydown.enter="screen.editing = false"
            @keydown.escape="screen.editing = false" />
          <span v-else class="flex-1 min-w-0 truncate"
            :class="screen.name.trim() ? 'text-sm font-medium' : 'text-sm text-amber-400 italic'">
            {{ screen.name.trim() || 'Unnamed — click to add a name' }}
          </span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
            class="shrink-0 cursor-pointer opacity-55 hover:opacity-100 transition-opacity" @click="startEditing(i)">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
            class="shrink-0 cursor-pointer opacity-40 hover:opacity-100 hover:stroke-red-400 transition-all" @click="removeScreen(i)">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      </div>

      <p class="text-xs text-muted mt-3 mb-6 px-0.5">
        Tip: You can rename screens to help the AI understand your flow better.
      </p>
    </div>

    <div class="shrink-0 lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/6 px-5.5 py-7">
      <div class="w-full lg:w-105">

        <div v-if="pastAnalyses.length > 0" class="mb-6">
          <div class="flex items-center gap-2 mb-3.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span class="text-lg font-semibold">Past Analyses</span>
            <span class="text-sm text-muted bg-white/5 px-2 py-0.5 rounded-full">{{ pastAnalyses.length }}</span>
          </div>

          <div v-for="analysis in pastAnalyses" :key="analysis.analysis_id" class="mb-2 rounded-xl border border-white/8 overflow-hidden">
            <button @click="emit('update:expandedAnalysis', expandedAnalysis === analysis.analysis_id ? null : analysis.analysis_id)"
              class="flex items-center justify-between w-full px-4 py-3 text-left bg-white/3 hover:bg-white/5 transition-colors border-0 cursor-pointer">
              <div class="flex items-center gap-3 min-w-0">
                <div>
                  <p class="text-[15px] font-medium m-0">{{ formatDate(analysis.created_at) }}</p>
                  <p class="text-[13px] text-muted m-0">{{ analysis.screen_names.length }} screen{{ analysis.screen_names.length === 1 ? '' : 's' }} · {{ analysis.events.length }} events</p>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                class="shrink-0 transition-transform" :class="expandedAnalysis === analysis.analysis_id ? 'rotate-180' : ''">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <div v-if="expandedAnalysis === analysis.analysis_id" class="border-t border-white/6 px-4 py-4 max-h-80 overflow-y-auto">
              <div v-for="event in analysis.events" :key="event.name" class="mb-2.5 p-3 rounded-xl bg-white/3 border border-white/6">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <code class="text-[13px] font-mono text-primary bg-primary/8 px-2 py-0.5 rounded">{{ event.name }}</code>
                  <span class="text-[12px] px-2 py-0.5 rounded-full font-semibold"
                    :class="event.priority === 'high' ? 'bg-primary/15 text-primary' : event.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-secondary/15 text-secondary-light'">
                    {{ event.priority }}
                  </span>
                  <span class="text-[12px] text-muted ml-auto">{{ event.screen }}</span>
                </div>
                <p class="text-[13px] text-text-secondary m-0 leading-normal">{{ event.description }}</p>
              </div>
              <div v-if="analysis.gaps.length" class="mt-3">
                <p class="text-[13px] font-semibold text-muted mb-2">Gaps</p>
                <p v-for="gap in analysis.gaps" :key="gap" class="text-[13px] text-text-secondary m-0 mb-1.5 leading-normal">· {{ gap }}</p>
              </div>
            </div>
          </div>
        </div>

        <template v-if="!analyzed">
          <div class="mb-6.5">
            <div class="flex items-center gap-2.25 mb-5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#FF2E83">
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z"/>
              </svg>
              <span class="text-sm font-semibold">What SignalLoop will detect</span>
            </div>
            <div v-for="item in detectionItems" :key="item.title" class="flex items-start gap-3.25 mb-4.5">
              <div class="flex items-center justify-center rounded-lg shrink-0 w-9.5 h-9.5 bg-secondary/10 border border-secondary/18">
                <span v-html="item.icon" />
              </div>
              <div>
                <p class="text-sm font-semibold text-text m-0 mb-0.5">{{ item.title }}</p>
                <p class="text-xs text-muted m-0 leading-[1.55]">{{ item.desc }}</p>
              </div>
            </div>
          </div>
          <div class="h-px bg-white/6 mb-5.5" />
          <div class="flex items-start gap-2.5 mb-5.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round" class="mt-0.75 shrink-0">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <span class="text-xs text-muted">Estimated analysis time</span>
              <p class="text-lg font-bold text-primary m-0 mt-0.5 mb-0.5">~30 seconds</p>
            </div>
          </div>
        </template>

        <template v-else-if="analysisResult">
          <div class="mb-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF2E83">
                  <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z"/>
                </svg>
                <span class="text-xl font-semibold">Recommended Events</span>
              </div>
              <span class="text-[15px] text-muted bg-white/5 px-2.5 py-1 rounded-full">{{ analysisResult.events.length }}</span>
            </div>
            <div v-for="event in analysisResult.events" :key="event.name" class="mb-3 p-3.5 rounded-xl bg-white/3 border border-white/6">
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <code class="text-[15px] font-mono text-primary bg-primary/8 px-2 py-0.5 rounded">{{ event.name }}</code>
                <span class="text-[13px] px-2 py-0.5 rounded-full font-semibold"
                  :class="event.priority === 'high' ? 'bg-primary/15 text-primary' : event.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-secondary/15 text-secondary-light'">
                  {{ event.priority }}
                </span>
                <span class="text-[13px] text-muted ml-auto">{{ event.screen }}</span>
              </div>
              <p class="text-[15px] text-text-secondary m-0 mb-2 leading-normal">{{ event.description }}</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="prop in event.properties" :key="prop" class="text-[13px] px-1.5 py-0.5 rounded bg-white/5 text-muted border border-white/8">{{ prop }}</span>
              </div>
            </div>
          </div>
        </template>

        <p v-if="hasUnnamedScreens && screens.length > 0" class="text-amber-400 text-sm text-center mb-3 m-0">
          Name all screens before analyzing.
        </p>
        <button class="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-base font-semibold text-white gradient-pink glow-pink-md border-0 tracking-[0.01em] transition-all"
          :class="screens.length === 0 || analyzing || hasUnnamedScreens ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'"
          :disabled="screens.length === 0 || analyzing || hasUnnamedScreens"
          @click="emit('analyze')">
          <template v-if="analyzing">
            <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Analyzing…
          </template>
          <template v-else>
            {{ analyzed ? 'Re-analyze' : 'Analyze Product Flow' }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </template>
        </button>

        <p v-if="analysisError" class="text-base text-red-400 mt-3 text-center">{{ analysisError }}</p>

        <div class="flex items-center justify-center gap-1.5 mt-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span class="text-base text-muted">Your data is private and stored securely.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Screen, AnalysisResult, PastAnalysis } from '../../types/project'

const props = defineProps<{
  screens: Screen[]
  pastAnalyses: PastAnalysis[]
  analyzed: boolean
  analyzing: boolean
  analysisResult: AnalysisResult | null
  analysisError: string | null
  hasUnnamedScreens: boolean
  expandedAnalysis: string | null
}>()

const emit = defineEmits<{
  'update:screens': [screens: Screen[]]
  'update:expandedAnalysis': [id: string | null]
  'analyze': []
  'clearAll': []
  'removeScreen': [index: number]
  'startEditing': [index: number]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const nameInputs = ref<(HTMLInputElement | null)[]>([])

let localNextId = 1_000_000

const detectionItems = [
  { title: 'Missing events', desc: "User actions you're not tracking but should be", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>` },
  { title: 'Funnel bottlenecks', desc: 'Points where users drop off or get stuck', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>` },
  { title: 'Conversion opportunities', desc: 'Moments that drive activation, engagement and revenue', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { title: 'Event properties', desc: 'Key properties to capture for every event', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>` },
]

function formatDate(ts: string | { value: string }): string {
  const str = typeof ts === 'object' ? ts.value : ts
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function handleFiles(files: FileList | File[]) {
  const newScreens = [...props.screens]
  for (const file of Array.from(files)) {
    newScreens.push({ id: localNextId++, name: '', url: URL.createObjectURL(file), editing: true })
  }
  emit('update:screens', newScreens)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files)
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) handleFiles(input.files)
  input.value = ''
}

async function startEditing(i: number) {
  props.screens[i].editing = true
  emit('startEditing', i)
  await nextTick()
  nameInputs.value[i]?.select()
}

function removeScreen(i: number) {
  URL.revokeObjectURL(props.screens[i].url)
  emit('removeScreen', i)
}
</script>
