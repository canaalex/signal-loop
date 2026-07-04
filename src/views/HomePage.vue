<template>
  <div class="min-h-svh w-full bg-background text-text flex flex-col">

    <div class="mx-auto w-full flex flex-col flex-1 max-w-7xl px-8 pt-5">

      <nav class="flex items-center justify-between shrink-0 h-14">

        <div class="flex items-center gap-3">
          <img src="/signallogo.png" alt="SignalLoop logo"
               class="w-11 h-11 object-contain mix-blend-screen" />
          <span class="text-[26px] font-semibold tracking-[-0.02em]">SignalLoop</span>
        </div>

        <a href="/projects" class="text-white flex items-center gap-2 h-10 px-5 rounded-xl text-[15px] font-semibold tracking-[0.01em] gradient-pink glow-pink-sm hover:brightness-110 transition-all">
          Launch Demo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </nav>

      <section class="flex-1 flex items-center mt-8 pb-8">
        <div class="w-full grid items-center gap-6" style="grid-template-columns: 0.70fr 1.1fr;">

          <div>

            <div class="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-[12px] font-medium tracking-[0.04em]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z"/>
              </svg>
              AI-POWERED BEHAVIORAL ANALYTICS
            </div>

            <h1 class="text-[48px] leading-[1.05] tracking-tighter mt-5 mb-0 font-bold">
              <span class="font-semibold block">Know what users do.</span>
              <span class="font-medium block text-text">And what you're</span>
              <span class="font-bold block text-primary">missing.</span>
            </h1>

            <p class="text-[17px] leading-[1.7] font-normal text-text-secondary mt-5 mb-0">
              SignalLoop analyzes product flows and tracking data to detect missing user actions, reduce noisy events, and generate insights teams can actually act on.
            </p>

            <div class="flex items-center mt-7 gap-5">

              <a href="/projects" class="text-white flex items-center gap-2 h-12 px-7 rounded-2xl text-[17px] font-semibold tracking-[0.01em] gradient-pink glow-pink-lg hover:brightness-110 transition-all">
                Launch Demo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>

              <button class="flex items-center gap-2.5 text-base font-medium tracking-[0.01em] text-text-secondary hover:text-text transition-colors bg-transparent border-0 cursor-pointer">
                <span class="rounded-full flex items-center justify-center w-11 h-11 shrink-0 border border-white/20 bg-white/5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </span>
                See how it works
              </button>

            </div>
          </div>

          <div class="flex items-center justify-center overflow-hidden h-[420px] rounded-3xl">
            <img src="/signalright1.png" alt="SignalLoop AI Analysis diagram"
                 class="w-full h-full object-contain mix-blend-lighten scale-[1.08] origin-center" />
          </div>

        </div>
      </section>

      <section class="mt-16 pb-16">

        <div class="text-center">
          <p class="text-primary uppercase text-sm tracking-[0.12em] font-medium m-0 mb-4">
            The Problem
          </p>
          <h2 class="text-[38px] leading-[1.1] font-semibold tracking-[-0.04em] m-0 text-text">
            Teams collect data. But <span class="text-primary">miss what matters.</span>
          </h2>
        </div>

        <div class="grid grid-cols-3 gap-6 mt-8">

          <div class="bg-surface rounded-2xl flex items-start p-6 gap-5 border border-white/5">
            <div class="rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 w-12 h-12 min-w-12">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text m-0 mb-2">Missing user actions</h3>
              <p class="text-sm leading-[1.8] text-text-secondary m-0">Critical behaviors aren't tracked, so important signals are invisible.</p>
            </div>
          </div>

          <div class="bg-surface rounded-2xl flex items-start p-6 gap-5 border border-white/5">
            <div class="rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 w-12 h-12 min-w-12">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v5c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 10v5c0 1.66 4.03 3 9 3s9-1.34 9-3v-5"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text m-0 mb-2">Too many noisy events</h3>
              <p class="text-sm leading-[1.8] text-text-secondary m-0">Duplicate, verbose, and low-value events clutter your data and inflate costs.</p>
            </div>
          </div>

          <div class="bg-surface rounded-2xl flex items-start p-6 gap-5 border border-white/5">
            <div class="rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 w-12 h-12 min-w-12">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text m-0 mb-2">No actionable insights</h3>
              <p class="text-sm leading-[1.8] text-text-secondary m-0">Without the right data, you can't make confident decisions or drive growth.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
</script>
