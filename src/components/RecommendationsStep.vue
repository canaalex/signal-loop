<template>
  <div class="flex-1 flex lg:overflow-hidden">

    <div class="flex-1 overflow-y-auto px-7.5 py-10 min-w-0">

      <div class="inline-flex items-center gap-1.75 px-3 py-1.25 rounded-full border border-primary/30 bg-primary/8 text-primary text-[11px] font-semibold tracking-[0.06em] mb-4">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12"/></svg>
        RECOMMENDATIONS
      </div>
      <h1 class="text-[26px] font-bold tracking-[-0.03em] m-0 mb-2 leading-[1.2]">Behavioral insights &amp; next steps</h1>
      <p class="text-text-secondary text-base m-0 mb-8">Based on your product screenshots and analytics coverage.</p>

      <div v-if="generatingRecs" class="flex flex-col items-center justify-center py-20 gap-4">
        <svg class="animate-spin text-primary" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <p class="text-muted text-base m-0">Analyzing behavior patterns…</p>
      </div>

      <div v-else-if="recsError" class="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" class="shrink-0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-red-400 text-sm m-0 flex-1">{{ recsError }}</p>
        <button class="text-sm text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer shrink-0" @click="emit('retry')">Retry</button>
      </div>

      <template v-else-if="recommendationsResult">

        <section class="mb-8">
          <h2 class="text-sm font-semibold tracking-[0.08em] text-muted uppercase mb-4">Behavior patterns</h2>
          <div class="flex items-center gap-1.5 mb-4 overflow-x-auto scrollbar-none pb-1">
            <template v-for="(_, i) in recommendationsResult.behavior_patterns" :key="i">
              <div class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                :style="`background: hsl(${(i * 50 + 320) % 360}, 80%, 60%, 0.15); color: hsl(${(i * 50 + 320) % 360}, 80%, 70%); border: 1px solid hsl(${(i * 50 + 320) % 360}, 80%, 60%, 0.25)`">
                {{ i + 1 }}
              </div>
              <div v-if="i < recommendationsResult.behavior_patterns.length - 1" class="shrink-0 w-5 h-px bg-white/15"/>
            </template>
          </div>
          <div class="flex flex-col gap-3">
            <div v-for="(pattern, i) in recommendationsResult.behavior_patterns" :key="i"
              class="flex items-start gap-4 p-5 rounded-xl bg-white/3 border border-white/8">
              <div class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-1"
                :style="`background: hsl(${(i * 50 + 320) % 360}, 80%, 60%, 0.15); color: hsl(${(i * 50 + 320) % 360}, 80%, 70%); border: 1px solid hsl(${(i * 50 + 320) % 360}, 80%, 60%, 0.25)`">
                {{ i + 1 }}
              </div>
              <div>
                <p class="text-lg font-semibold text-text m-0 mb-1">{{ pattern.title }}</p>
                <p class="text-base text-text-secondary m-0 leading-relaxed">{{ pattern.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-sm font-semibold tracking-[0.08em] text-muted uppercase mb-4">Recommendations</h2>
          <div class="flex flex-col gap-3">
            <div v-for="rec in recommendationsResult.recommendations" :key="rec.title"
              class="flex items-start gap-4 p-5 rounded-xl bg-surface border border-white/8">
              <div class="w-2.5 h-2.5 rounded-full mt-2 shrink-0"
                :class="rec.impact === 'high' ? 'bg-primary' : rec.impact === 'medium' ? 'bg-amber-400' : 'bg-white/30'"/>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1.5 flex-wrap">
                  <p class="text-base font-semibold m-0">{{ rec.title }}</p>
                  <span class="text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full"
                    :class="rec.impact === 'high' ? 'bg-primary/15 text-primary' : rec.impact === 'medium' ? 'bg-amber-400/15 text-amber-400' : 'bg-white/8 text-muted'">
                    {{ rec.impact }} impact
                  </span>
                </div>
                <p class="text-lg text-text-secondary m-0 leading-relaxed">{{ rec.description }}</p>
              </div>
            </div>
          </div>
        </section>

      </template>

      <div class="flex items-center gap-3 pb-8">
        <button
          class="flex items-center gap-2.25 h-12 px-7 rounded-xl text-lg font-semibold text-white gradient-pink glow-pink-sm border-0 tracking-[0.01em] cursor-pointer hover:brightness-110 transition-all"
          @click="router.push('/projects')">
          Finish Project
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </button>
        <button class="flex items-center gap-2 text-base text-muted bg-transparent border-0 cursor-pointer hover:text-text transition-colors"
          @click="emit('back')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to gap analysis
        </button>
      </div>

    </div>

    <!-- RIGHT: what's working + friction -->
    <div class="hidden lg:flex flex-1 min-w-0 flex-col overflow-y-auto border-l border-white/6 py-8 px-7 gap-8">

      <div v-if="generatingRecs" class="flex flex-col items-center justify-center flex-1 gap-3">
        <svg class="animate-spin text-primary/40" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      </div>

      <template v-else-if="recommendationsResult">

        <div class="flex items-center gap-6 p-5 rounded-2xl bg-white/3 border border-white/8">
          <svg width="120" height="120" viewBox="0 0 120 120" class="shrink-0 -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
            <circle cx="60" cy="60" r="54" fill="none"
              :stroke="coverageArc.color" stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="`${coverageArc.dash} ${coverageArc.gap}`"
              style="transition: stroke-dasharray 0.8s ease"/>
          </svg>
          <div>
            <p class="text-[42px] font-bold tracking-tight m-0 leading-none" :style="`color: ${coverageArc.color}`">{{ coveragePct }}%</p>
            <p class="text-base font-semibold text-text m-0 mt-1">Tracking coverage</p>
            <p class="text-sm text-muted m-0 mt-0.5">{{ coveredCount }} of {{ matchResults.length }} events tracked</p>
          </div>
        </div>

        <!-- What's working -->
        <section>
          <div class="flex items-center gap-3 mb-3">
            <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
              <polyline points="2,18 8,13 14,10 20,7 28,4 34,2" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="34" cy="2" r="2.5" fill="#34d399"/>
            </svg>
            <h2 class="text-sm font-semibold tracking-widest text-emerald-400 uppercase m-0">What's working</h2>
          </div>
          <div class="flex flex-col gap-3">
            <div v-for="item in recommendationsResult.working_well" :key="item.title"
              class="p-4 rounded-xl bg-emerald-500/6 border border-emerald-500/15">
              <p class="text-base font-semibold text-emerald-400 m-0 mb-1">{{ item.title }}</p>
              <p class="text-base text-text-secondary m-0 leading-relaxed">{{ item.description }}</p>
            </div>
          </div>
        </section>

        <section>
          <div class="flex items-center gap-3 mb-3">
            <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
              <polyline points="2,4 8,6 12,5 16,11 20,9 24,16 30,14 34,20" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="34" cy="20" r="2.5" fill="#f87171"/>
            </svg>
            <h2 class="text-sm font-semibold tracking-widest text-red-400 uppercase m-0">Friction points</h2>
          </div>
          <div class="flex flex-col gap-3">
            <div v-for="item in recommendationsResult.friction_points" :key="item.title"
              class="p-4 rounded-xl bg-red-500/6 border border-red-500/15">
              <p class="text-base font-semibold text-red-400 m-0 mb-1">{{ item.title }}</p>
              <p class="text-base text-text-secondary m-0 leading-relaxed">{{ item.description }}</p>
              <span v-if="item.screen" class="inline-block mt-2 text-xs font-mono text-muted bg-white/5 px-2 py-0.5 rounded">{{ item.screen }}</span>
            </div>
          </div>
        </section>

      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { RecommendationsResult, MatchResult } from '../types/project'

defineProps<{
  recommendationsResult: RecommendationsResult | null
  generatingRecs: boolean
  recsError: string | null
  matchResults: MatchResult[]
  coveragePct: number
  coverageArc: { dash: number; gap: number; circ: number; color: string }
  coveredCount: number
}>()

const emit = defineEmits<{
  'retry': []
  'back': []
}>()

const router = useRouter()
</script>
