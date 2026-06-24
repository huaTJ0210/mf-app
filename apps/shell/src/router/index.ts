import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes, layoutRoute, fallbackRoute } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...staticRoutes,
    layoutRoute,
    fallbackRoute,
  ],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export default router
