<template>
  <div class="min-h-svh bg-background text-text">

    <header class="flex items-center h-17 px-6 bg-[#0F1320] border-b border-white/6">
      <a href="/" class="flex items-center gap-2.5 mr-auto no-underline text-text hover:opacity-80 transition-opacity">
        <img src="/signallogo.png" alt="SignalLoop" class="w-9 h-9 object-contain mix-blend-screen" />
        <span class="text-[22px] font-semibold tracking-[-0.02em]">SignalLoop</span>
      </a>
      <div class="flex items-center justify-center rounded-full text-white shrink-0 w-9 h-9 text-[15px] font-bold gradient-pink">SR</div>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-10">

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-[36px] font-bold tracking-[-0.02em] m-0 mb-1">My Projects</h1>
          <p class="text-text-secondary text-lg m-0">Each project is a set of product screens you analyze together.</p>
        </div>
        <button @click="openModal"
          class="flex items-center gap-2 h-11 px-5 rounded-xl text-base font-semibold text-white gradient-pink glow-pink-sm border-0 cursor-pointer hover:brightness-110 transition-all shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-24">
        <svg class="animate-spin text-muted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      </div>

      <div v-else-if="loadError" class="flex flex-col items-center justify-center py-24 text-center">
        <p class="text-red-400 text-base">{{ loadError }}</p>
        <button @click="loadProjects" class="mt-4 text-sm text-muted hover:text-text transition-colors bg-transparent border-0 cursor-pointer">
          Try again
        </button>
      </div>

      <div v-else-if="!projects.length" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/8 mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5E6AD2" stroke-width="1.5" stroke-linecap="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold m-0 mb-2">No projects yet</h2>
        <p class="text-text-secondary text-base m-0 mb-6 max-w-sm">
          Create your first project to start analyzing product flows and tracking events.
        </p>
        <button @click="openModal"
          class="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white gradient-pink border-0 cursor-pointer hover:brightness-110 transition-all">
          Create your first project
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="project in projects" :key="project.project_id"
          @click="$router.push(`/projects/${project.project_id}`)"
          class="relative flex flex-col items-start text-left p-6 rounded-2xl bg-surface border border-white/8 hover:border-primary/40 transition-all cursor-pointer group">
          <button
            @click.stop="confirmDelete(project)"
            class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 bg-transparent border-0 cursor-pointer transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/12 border border-primary/20 mb-4 group-hover:bg-primary/18 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2E83" stroke-width="2" stroke-linecap="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          </div>
          <h3 class="text-[19px] font-semibold m-0 mb-1.5 group-hover:text-primary transition-colors">{{ project.name }}</h3>
          <p class="text-muted text-sm m-0 mb-4">
            {{ project.analysis_count }} {{ project.analysis_count === 1 ? 'analysis' : 'analyses' }}
          </p>
          <div class="flex items-center gap-1.5 mt-auto">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p class="text-muted text-xs m-0">{{ formatDate(project.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click.self="showModal = false">
        <div class="bg-[#111522] border border-white/12 rounded-2xl p-7 w-full max-w-md mx-4 shadow-2xl">
          <h2 class="text-xl font-bold m-0 mb-1.5">Create New Project</h2>
          <p class="text-muted text-sm m-0 mb-5">Give your project a name that describes the flow you're analyzing.</p>
          <input
            ref="nameInput"
            v-model="newProjectName"
            placeholder="e.g. Checkout Flow, Onboarding, Dashboard"
            class="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-base text-text outline-none focus:border-primary/60 transition-colors mb-5 placeholder:text-muted"
            @keydown.enter="createProject"
            @keydown.escape="showModal = false"
          />
          <p v-if="createError" class="text-red-400 text-sm mb-4">{{ createError }}</p>
          <div class="flex items-center gap-3">
            <button @click="showModal = false"
              class="flex-1 h-11 rounded-xl text-base font-medium text-muted bg-white/5 border border-white/10 cursor-pointer hover:text-text transition-colors">
              Cancel
            </button>
            <button @click="createProject"
              :disabled="creating || !newProjectName.trim()"
              :class="creating || !newProjectName.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'"
              class="flex-1 h-11 rounded-xl text-base font-semibold text-white gradient-pink border-0 transition-all">
              {{ creating ? 'Creating…' : 'Create Project' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click.self="deleteTarget = null">
        <div class="bg-[#111522] border border-white/12 rounded-2xl p-7 w-full max-w-md mx-4 shadow-2xl">
          <h2 class="text-xl font-bold m-0 mb-1.5">Delete project?</h2>
          <p class="text-muted text-sm m-0 mb-6">
            <span class="text-white font-medium">{{ deleteTarget.name }}</span> and all its analyses will be permanently deleted.
          </p>
          <p v-if="deleteError" class="text-red-400 text-sm mb-4">{{ deleteError }}</p>
          <div class="flex items-center gap-3">
            <button @click="deleteTarget = null"
              class="flex-1 h-11 rounded-xl text-base font-medium text-muted bg-white/5 border border-white/10 cursor-pointer hover:text-text transition-colors">
              Cancel
            </button>
            <button @click="deleteProject"
              :disabled="deleting"
              :class="deleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'"
              class="flex-1 h-11 rounded-xl text-base font-semibold text-white bg-red-500/80 border-0 transition-all">
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Project {
  project_id: string
  name: string
  created_at: string | { value: string }
  analysis_count: number
}

const router = useRouter()
const projects = ref<Project[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const showModal = ref(false)
const newProjectName = ref('')
const creating = ref(false)
const createError = ref<string | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const deleteTarget = ref<Project | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

function formatDate(ts: string | { value: string }): string {
  const str = typeof ts === 'object' ? ts.value : ts
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function loadProjects() {
  loading.value = true
  loadError.value = null
  try {
    const res = await fetch('/api/projects')
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to load projects')
    projects.value = data
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Failed to load projects'
  } finally {
    loading.value = false
  }
}

async function openModal() {
  showModal.value = true
  await nextTick()
  nameInput.value?.focus()
}

watch(showModal, val => {
  if (!val) {
    newProjectName.value = ''
    createError.value = null
  }
})

async function createProject() {
  if (!newProjectName.value.trim() || creating.value) return
  creating.value = true
  createError.value = null
  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName.value.trim() }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create project')
    router.push(`/projects/${data.project_id}`)
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Failed to create project'
  } finally {
    creating.value = false
  }
}

function confirmDelete(project: Project) {
  deleteTarget.value = project
  deleteError.value = null
}

async function deleteProject() {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = true
  deleteError.value = null
  try {
    const res = await fetch(`/api/projects/${deleteTarget.value.project_id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete project')
    projects.value = projects.value.filter(p => p.project_id !== deleteTarget.value!.project_id)
    deleteTarget.value = null
  } catch (err) {
    deleteError.value = err instanceof Error ? err.message : 'Failed to delete project'
  } finally {
    deleting.value = false
  }
}

onMounted(loadProjects)
</script>
