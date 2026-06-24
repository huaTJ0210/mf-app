import { createRouter, createWebHistory } from 'vue-router'

/**
 * 独立模式路由
 * 子应用独立开发时使用，仅包含本子应用的页面
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/user',
    },
    {
      path: '/user',
      name: 'UserList',
      component: () => import('../views/UserList.vue'),
      meta: { title: '用户管理' },
    },
    {
      path: '/role',
      name: 'RoleList',
      component: () => import('../views/RoleList.vue'),
      meta: { title: '角色管理' },
    },
    {
      path: '/menu',
      name: 'MenuList',
      component: () => import('../views/MenuList.vue'),
      meta: { title: '菜单管理' },
    },
  ],
})

export default router
