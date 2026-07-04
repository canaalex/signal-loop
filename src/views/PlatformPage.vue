<template>
  <div class="min-h-svh flex flex-col bg-background text-text">

    <nav class="border-b border-white/10 px-8">
      <div class="max-w-6xl mx-auto h-16 flex items-center justify-between">
        <RouterLink to="/" class="font-bold text-2xl text-text no-underline">signalloop</RouterLink>
        <div class="flex items-center gap-6">
          <RouterLink to="/" class="text-text-secondary hover:text-text text-base transition-colors">Home</RouterLink>
          <RouterLink to="/platform" class="text-text text-base font-medium transition-colors">Platform</RouterLink>
          <a href="#" class="text-text-secondary hover:text-text text-base transition-colors">About</a>
          <a href="#" class="bg-primary hover:bg-primary-dark text-white text-base font-medium px-5 py-2 rounded-lg transition-colors">Get Started</a>
        </div>
      </div>
    </nav>

    <header class="text-center py-20 px-8 max-w-2xl mx-auto">
      <h1 class="text-5xl font-semibold tracking-tight text-text mb-4 leading-tight">The Platform</h1>
      <p class="text-xl text-text-secondary leading-relaxed">A description of what the signalloop platform is and what it can do for users.</p>
    </header>

    <section class="py-20 px-8 w-full box-border">
      <div class="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
        <div>
          <h2 class="text-3xl font-semibold text-text mb-4">Section title</h2>
          <p class="text-text-secondary leading-relaxed mb-6">Explain a key aspect of the platform here. What problem does it solve? What makes it different?</p>
          <ul class="flex flex-col gap-3">
            <li v-for="item in overviewOne" :key="item" class="flex items-center gap-3 text-base text-text-secondary">
              <span class="text-primary font-bold">✓</span>{{ item }}
            </li>
          </ul>
        </div>
        <div class="w-full aspect-video bg-surface border border-dashed border-primary/40 rounded-xl flex items-center justify-center text-muted text-base">
          Visual / Screenshot
        </div>
      </div>
    </section>

    <!-- Overview section 2 (flipped) -->
    <section class="py-20 px-8 bg-surface w-full box-border">
      <div class="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
        <div class="w-full aspect-video bg-background border border-dashed border-primary/40 rounded-xl flex items-center justify-center text-muted text-base">
          Visual / Screenshot
        </div>
        <div>
          <h2 class="text-3xl font-semibold text-text mb-4">Another section title</h2>
          <p class="text-text-secondary leading-relaxed mb-6">Describe another major capability or feature of the platform in detail.</p>
          <ul class="flex flex-col gap-3">
            <li v-for="item in overviewTwo" :key="item" class="flex items-center gap-3 text-base text-text-secondary">
              <span class="text-primary font-bold">✓</span>{{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="py-20 px-8 max-w-6xl mx-auto w-full box-border">
      <h2 class="text-3xl font-semibold text-center text-text mb-12">Platform capabilities</h2>
      <div class="grid grid-cols-4 gap-5">
        <div
          v-for="cap in capabilities"
          :key="cap.title"
          class="border border-white/10 rounded-xl p-6 bg-surface"
        >
          <span class="text-2xl block mb-3">{{ cap.icon }}</span>
          <h3 class="text-lg font-medium text-text mb-1.5">{{ cap.title }}</h3>
          <p class="text-base text-text-secondary leading-relaxed">{{ cap.description }}</p>
        </div>
      </div>
    </section>

    <section class="py-20 px-8 bg-surface text-center w-full box-border">
      <h2 class="text-3xl font-semibold text-text mb-2">Integrations</h2>
      <p class="text-text-secondary mb-10">Works with the tools you already use.</p>
      <div class="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
        <div
          v-for="name in integrations"
          :key="name"
          class="px-5 py-2 border border-white/10 rounded-full text-base text-text bg-background"
        >{{ name }}</div>
      </div>
    </section>

    <section class="text-center py-20 px-8 max-w-xl mx-auto">
      <h2 class="text-3xl font-semibold text-text mb-3">Start using the platform today</h2>
      <p class="text-text-secondary mb-8">Short supporting line to encourage sign-up or contact.</p>
      <div class="flex gap-3 justify-center flex-wrap">
        <a href="#" class="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors">Get Started</a>
        <a href="#" class="border border-white/20 hover:border-primary text-text font-medium px-6 py-3 rounded-lg transition-colors">Book a demo</a>
      </div>
    </section>

    <footer class="border-t border-white/10 px-8 py-6 flex justify-between items-center text-base text-muted mt-auto">
      <span>© 2026 signalloop. All rights reserved.</span>
      <div class="flex gap-5">
        <a href="#" class="hover:text-text transition-colors">Privacy</a>
        <a href="#" class="hover:text-text transition-colors">Terms</a>
        <a href="#" class="hover:text-text transition-colors">Contact</a>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
const overviewOne = [
  'Benefit or capability one',
  'Benefit or capability two',
  'Benefit or capability three',
  'Benefit or capability four',
]

const overviewTwo = [
  'Benefit or capability one',
  'Benefit or capability two',
  'Benefit or capability three',
]

const capabilities = [
  { icon: '⚡', title: 'Capability One', description: 'Short description of this platform capability.' },
  { icon: '🔒', title: 'Capability Two', description: 'Short description of this platform capability.' },
  { icon: '📊', title: 'Capability Three', description: 'Short description of this platform capability.' },
  { icon: '🔄', title: 'Capability Four', description: 'Short description of this platform capability.' },
  { icon: '🌐', title: 'Capability Five', description: 'Short description of this platform capability.' },
  { icon: '🎯', title: 'Capability Six', description: 'Short description of this platform capability.' },
  { icon: '📁', title: 'Capability Seven', description: 'Short description of this platform capability.' },
  { icon: '🛠️', title: 'Capability Eight', description: 'Short description of this platform capability.' },
]

const integrations = [
  'Integration A', 'Integration B', 'Integration C',
  'Integration D', 'Integration E', 'Integration F',
  'Integration G', 'Integration H',
]
</script>
