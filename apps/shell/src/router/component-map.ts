import type { ComponentResolver } from '@mf/shared'
import { usePermissionStore } from '@mf/shared'

// 使用 import.meta.glob 懒加载本地视图组件
const localModules = import.meta.glob('../views/**/*.vue')

/**
 * 远程模块静态映射表
 *
 * 每个 key 必须使用静态 import() 声明，
 * 这样 @originjs/vite-plugin-federation 才能在构建时识别并转换为
 * Module Federation 远程加载逻辑。
 *
 * 不能使用动态拼接的 import(`${var}/${var}`) ——
 * 插件无法静态分析，会导致浏览器报
 * "Failed to resolve module specifier" 错误。
 */
const remoteModules: Record<string, () => Promise<any>> = {
  // system-admin 子应用暴露的组件
  'system-admin/UserList': () => import('system-admin/UserList'),
  'system-admin/RoleList': () => import('system-admin/RoleList'),
  'system-admin/MenuList': () => import('system-admin/MenuList'),
  // business 子应用暴露的组件
  'business/Dashboard': () => import('business/Dashboard'),
  'business/Orders': () => import('business/Orders'),
}

/**
 * 组件映射表
 *
 * 菜单数据中 `component` 字段的格式：
 * - 'Layout'                    → 布局组件
 * - 'shell/Dashboard'           → 宿主本地视图（views/dashboard/index.vue）
 * - 'system-admin/UserList'     → system-admin 子应用远程组件
 * - 'business/Orders'          → business 子应用远程组件
 *
 * 解析规则：
 * 1. 'Layout' → 返回 Layout 组件
 * 2. 'shell/xxx' → 从本地 views 目录解析
 * 3. '子应用名/组件名' → 通过 Module Federation 远程导入
 */
export const componentMap: ComponentResolver = (key: string) => {
  // 1. Layout 布局组件
  if (key === 'Layout') {
    // 动态路由中的 Layout 仅作为目录占位，避免重复渲染整套主布局
    return () => import('@/layout/components/RouteContainer.vue')
  }

  // 2. 宿主本地组件：shell/ComponentName → views/component-name/index.vue
  if (key.startsWith('shell/')) {
    const name = key.slice('shell/'.length)
    // 尝试多种路径匹配
    const candidates = [
      `../views/${kebabCase(name)}/index.vue`,
      `../views/${kebabCase(name)}.vue`,
    ]
    for (const path of candidates) {
      if (localModules[path]) {
        return localModules[path] as () => Promise<any>
      }
    }
    console.warn(`[componentMap] 本地组件未找到: ${key}`)
    return undefined
  }

  // 3. 远程子应用组件：appName/ComponentName
  //    必须使用静态 import()，federation 插件才能在构建时正确转换远程模块
  const loader = remoteModules[key]
  if (loader) {
    return async () => {
      try {
        return await loader()
      } catch (err) {
        console.error(`[componentMap] 远程组件加载失败: ${key}`, err)
        throw err
      }
    }
  }

  console.warn(`[componentMap] 无法解析组件: ${key}`)
  return undefined
}

/** PascalCase → kebab-case */
function kebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/^-/, '')
    .toLowerCase()
}

/**
 * 注册组件解析器到 permission store
 * 在 main.ts 中调用，使 buildRoutes 能正确解析组件
 */
export function registerComponentMap(): void {
  const permissionStore = usePermissionStore()
  permissionStore.setResolver(componentMap)
}
