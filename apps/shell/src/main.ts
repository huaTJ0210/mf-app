import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { setupRouterGuard } from './router/guard'
import { registerComponentMap } from './router/component-map'

import {
  createRequest,
  setApiClient,
  installPermissionDirective,
} from '@mf/shared'

const app = createApp(App)

// ---- Pinia ----
const pinia = createPinia()
app.use(pinia)

// ---- 初始化 axios 实例（供 @mf/shared 的 API 模块使用）----
const apiClient = createRequest(import.meta.env.VITE_API_BASE_URL)
setApiClient(apiClient)

// ---- Element Plus ----
app.use(ElementPlus)
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// ---- 注册 v-permission 指令 ----
installPermissionDirective(app)

// ---- 注册组件映射（将菜单 component 字符串映射到实际组件）----
registerComponentMap()

// ---- 路由 ----
app.use(router)

// ---- 路由守卫 ----
setupRouterGuard(router)

app.mount('#app')
