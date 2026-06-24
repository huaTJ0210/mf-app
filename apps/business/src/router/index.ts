import { createRouter, createWebHistory } from 'vue-router'

/**
 * 独立模式路由
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'BizDashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { title: '业务看板' },
    },
    {
      path: '/order',
      name: 'BizOrders',
      component: () => import('../views/Orders.vue'),
      meta: { title: '订单管理' },
    },
  ],
})

export default router
