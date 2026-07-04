<template>
  <div class="flex-1 flex lg:overflow-hidden">

    <div class="hidden lg:flex shrink-0 w-72 flex-col overflow-y-auto border-r border-white/6 py-5 px-3 gap-3">
      <div v-for="screen in screens" :key="screen.id"
        class="group rounded-xl overflow-hidden border cursor-pointer transition-all relative"
        :class="selectedScreen === screen.name ? 'border-primary ring-1 ring-primary/30' : 'border-white/8 hover:border-white/22'"
        @click="emit('update:selectedScreen', selectedScreen === screen.name ? null : screen.name)">
        <img v-if="screen.url" :src="screen.url" :alt="screen.name" class="w-full block" />
        <div v-else class="w-full h-24 bg-secondary/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <button class="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity border-0 cursor-pointer backdrop-blur-sm"
          @click.stop="expandedScreen = screen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
        <div class="px-2.5 py-2 bg-white/3">
          <p class="text-[14px] font-medium m-0 truncate">{{ screen.name }}</p>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="expandedScreen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" @click.self="expandedScreen = null">
        <div class="relative flex flex-col items-center max-h-[90vh] mx-6">
          <div class="flex items-center justify-between w-full mb-3">
            <p class="text-white/70 text-base">{{ expandedScreen.name }}</p>
            <button class="flex items-center gap-1.5 text-white/70 hover:text-white bg-transparent border-0 cursor-pointer text-base transition-colors" @click="expandedScreen = null">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close
            </button>
          </div>
          <img :src="expandedScreen.url" :alt="expandedScreen.name" class="max-h-[80vh] max-w-full w-auto rounded-2xl shadow-2xl block object-contain" />
        </div>
      </div>
    </teleport>

    <div class="flex-1 overflow-y-auto px-7.5 py-7">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF2E83">
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z"/>
          </svg>
          <span class="text-lg font-bold">Recommended Events</span>
        </div>
        <span class="text-[13px] text-muted bg-white/5 px-2 py-0.5 rounded-full">{{ filteredEvents.length }}</span>
      </div>

      <p class="text-sm text-text-secondary mb-5 leading-[1.7]">
        These are the analytics events SignalLoop identified from your product screens. Select the ones you want to implement and share a ready-to-implement event list with your engineering team.
      </p>

      <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-1 rounded-full text-[13px] font-medium cursor-pointer transition-all border"
            :class="selectedScreen === null ? 'gradient-pink text-white border-transparent' : 'bg-white/4 text-text-secondary border-white/10 hover:border-white/25'"
            @click="emit('update:selectedScreen', null)">
            All · {{ analysisResult.events.length }}
          </button>
          <button v-for="screen in screens" :key="screen.id"
            class="px-3 py-1 rounded-full text-[13px] font-medium cursor-pointer transition-all border"
            :class="selectedScreen === screen.name ? 'gradient-pink text-white border-transparent' : 'bg-white/4 text-text-secondary border-white/10 hover:border-white/25'"
            @click="emit('update:selectedScreen', screen.name)">
            {{ screen.name }} · {{ eventsForScreen(screen.name).length }}
          </button>
        </div>
        <button class="flex items-center gap-2 text-[13px] text-muted bg-transparent border-0 cursor-pointer hover:text-text transition-colors shrink-0" @click="toggleSelectAll">
          <div class="w-4 h-4 rounded border flex items-center justify-center transition-colors" :class="allFilteredSelected ? 'bg-primary border-primary' : 'border-white/30'">
            <svg v-if="allFilteredSelected" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          {{ allFilteredSelected ? 'Deselect all' : 'Select all' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        <div v-for="event in filteredEvents" :key="event.name"
          class="p-6 rounded-2xl border cursor-pointer transition-all relative"
          :class="selectedEvents.includes(event.name) ? 'bg-primary/6 border-primary/40 ring-1 ring-primary/20' : 'bg-white/3 border-white/6 hover:border-white/14'"
          @click="toggleEvent(event.name)">
          <div class="absolute top-5 right-5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0"
            :class="selectedEvents.includes(event.name) ? 'bg-primary border-primary' : 'border-white/25'">
            <svg v-if="selectedEvents.includes(event.name)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="mb-3 pr-8">
            <div class="flex items-center gap-2 mb-2 min-w-0 overflow-hidden">
              <code class="text-[13px] font-mono text-primary bg-primary/8 px-2.5 py-0.5 rounded-lg whitespace-nowrap overflow-hidden text-ellipsis min-w-0 shrink">{{ event.name }}</code>
              <span class="text-[13px] px-2.5 py-0.5 rounded-full font-semibold shrink-0"
                :class="event.priority === 'high' ? 'bg-primary/15 text-primary' : event.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-secondary/15 text-secondary-light'">
                {{ event.priority }}
              </span>
            </div>
            <span v-if="!selectedScreen" class="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              {{ event.screen }}
            </span>
          </div>
          <p class="text-sm text-text-secondary m-0 mb-3 leading-relaxed">{{ event.description }}</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="prop in event.properties" :key="prop" class="text-[12px] px-2 py-0.5 rounded bg-white/5 text-muted border border-white/8">{{ prop }}</span>
          </div>
        </div>
      </div>

      <template v-if="selectedScreen === null">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <div v-if="analysisResult.gaps.length">
            <p class="text-base font-semibold mb-4">Tracking Gaps</p>
            <div v-for="gap in analysisResult.gaps" :key="gap" class="flex items-start gap-3.5 mb-4">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" class="shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span class="text-sm text-text-secondary leading-relaxed">{{ gap }}</span>
            </div>
          </div>
          <div v-if="analysisResult.insights.length">
            <p class="text-base font-semibold mb-4">Insights</p>
            <div v-for="insight in analysisResult.insights" :key="insight" class="flex items-start gap-3.5 mb-4">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="2" stroke-linecap="round" class="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span class="text-sm text-text-secondary leading-relaxed">{{ insight }}</span>
            </div>
          </div>
        </div>
      </template>

      <div class="mt-2 mb-8 pt-6 border-t border-white/8">
        <p class="text-[15px] text-text-secondary mb-4 leading-relaxed">
          {{ selectedEvents.length > 0
            ? `${selectedEvents.length} event${selectedEvents.length === 1 ? '' : 's'} selected. Download your ready-to-implement event list.`
            : 'Select events and share a ready-to-implement event list with your engineering team.' }}
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <button class="flex items-center gap-2 h-11 px-6 rounded-xl text-[15px] font-semibold text-white border-0 transition-all"
            :class="selectedEvents.length > 0 ? 'gradient-pink glow-pink-sm cursor-pointer hover:brightness-110' : 'bg-primary/20 text-primary/50 cursor-not-allowed'"
            :disabled="selectedEvents.length === 0" @click="emit('downloadJSON')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download as JSON
          </button>
          <button class="flex items-center gap-2 h-11 px-6 rounded-xl text-[15px] font-semibold border transition-all"
            :class="selectedEvents.length > 0 ? 'text-primary border-primary/40 bg-primary/8 cursor-pointer hover:bg-primary/14' : 'text-primary/40 border-primary/15 bg-transparent cursor-not-allowed'"
            :disabled="selectedEvents.length === 0" @click="emit('downloadCSV')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download as CSV
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 pb-6 flex-wrap">
        <button
          class="flex items-center gap-2 h-11 px-6 rounded-xl text-base font-semibold text-white gradient-pink glow-pink-md border-0 tracking-[0.01em] cursor-pointer hover:brightness-110 transition-all"
          @click="emit('continue')">
          Continue to Upload Events
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <button class="flex items-center gap-2 text-base text-muted bg-transparent border-0 cursor-pointer hover:text-text transition-colors"
          @click="emit('back')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to upload
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Screen, AnalysisResult, AnalysisEvent } from '../../types/project'

const props = defineProps<{
  screens: Screen[]
  analysisResult: AnalysisResult
  selectedEvents: string[]
  selectedScreen: string | null
  filteredEvents: AnalysisEvent[]
  allFilteredSelected: boolean
}>()

const emit = defineEmits<{
  'update:selectedEvents': [events: string[]]
  'update:selectedScreen': [screen: string | null]
  'downloadJSON': []
  'downloadCSV': []
  'continue': []
  'back': []
}>()

const expandedScreen = ref<Screen | null>(null)

function eventsForScreen(name: string): AnalysisEvent[] {
  return props.analysisResult.events.filter(e => e.screen === name)
}

function toggleEvent(name: string) {
  const idx = props.selectedEvents.indexOf(name)
  if (idx === -1) {
    emit('update:selectedEvents', [...props.selectedEvents, name])
  } else {
    const updated = [...props.selectedEvents]
    updated.splice(idx, 1)
    emit('update:selectedEvents', updated)
  }
}

function toggleSelectAll() {
  if (props.allFilteredSelected) {
    const filteredNames = new Set(props.filteredEvents.map(e => e.name))
    emit('update:selectedEvents', props.selectedEvents.filter(n => !filteredNames.has(n)))
  } else {
    const current = new Set(props.selectedEvents)
    props.filteredEvents.forEach(e => current.add(e.name))
    emit('update:selectedEvents', [...current])
  }
}
</script>
