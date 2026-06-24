/**
 * system-admin 子应用入口
 *
 * 两种运行模式：
 * 1. 独立模式（VITE_STANDALONE=true）：完整的 Vue 应用，自带路由和布局
 * 2. 远程模块模式：仅暴露组件供宿主通过 Module Federation 加载
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import {
  createRequest,
  setApiClient,
  installPermissionDirective,
  useUserStore,
  SUPER_ADMIN_ROLE,
} from '@mf/shared'

const isStandalone = import.meta.env.VITE_STANDALONE === 'true'

if (isStandalone) {
  // ---- 独立运行模式 ----
  const app = createApp(
    (await import('./App.vue')).default
  )

  const pinia = createPinia()
  app.use(pinia)

  // 初始化 axios
  const apiClient = createRequest(import.meta.env.VITE_API_BASE_URL)
  setApiClient(apiClient)

  // Element Plus
  app.use(ElementPlus)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 权限指令
  installPermissionDirective(app)

  // 植入 mock 用户数据（独立模式下模拟超管权限）
  const userStore = useUserStore()
  userStore.setMockUser({
    id: 1,
    username: 'standalone-admin',
    nickname: '独立开发模式',
    roles: [SUPER_ADMIN_ROLE],
    permissions: ['*'],
  })

  // 路由
  const router = (await import('./router')).default
  app.use(router)

  app.mount('#app')
} else {
  // ---- 远程模块模式 ----
  // 仅注册 Element Plus 图标和指令，不挂载应用
  // 组件由宿主通过 MF 加载
  console.log('[system-admin] 远程模块模式，组件由宿主加载')
}
