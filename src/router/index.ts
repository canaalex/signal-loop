import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import PlatformPage from '../views/PlatformPage.vue'
import ProjectsPage from '../views/ProjectsPage.vue'
import ProjectPage from '../views/ProjectPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/platform', component: PlatformPage },
    { path: '/projects', component: ProjectsPage },
    { path: '/projects/:id', component: ProjectPage },
  ],
})

export default router
