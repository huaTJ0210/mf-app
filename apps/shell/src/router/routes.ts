import type { RouteRecordRaw } from 'vue-router'

/**
 * 静态路由（不需要动态权限控制的路由）
 */
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true, noTagsView: true },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '403', hidden: true, noTagsView: true },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true, noTagsView: true },
  },
]

/**
 * 布局路由占位（动态路由将作为其 children 添加）
 * 后端返回的顶级菜单会挂载到此路由下
 */
export const layoutRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  component: () => import('@/layout/index.vue'),
  redirect: '/dashboard',
  children: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: { title: '首页', icon: 'HomeFilled', affix: true },
    },
    {
      path: '/redirect/:path(.*)',
      name: 'Redirect',
      component: () => import('@/views/redirect/index.vue'),
      meta: { hidden: true, noTagsView: true },
    },
  ],
}

/** 兜底路由 */
export const fallbackRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'Fallback',
  component: () => import('@/views/error/404.vue'),
  meta: { hidden: true },
}
