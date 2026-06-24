import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '../types'
import { buildRoutes, type ComponentResolver } from '../utils/permission'
import { useUserStore } from './user'

export const usePermissionStore = defineStore('permission', () => {
  // ---- state ----
  /** 动态生成的路由（已添加到 router） */
  const routes = ref<RouteRecordRaw[]>([])
  /** 侧边栏菜单树（用于渲染） */
  const sidebarMenus = ref<MenuItem[]>([])
  /** 是否已生成路由 */
  const hasRoutes = ref(false)

  // ---- 路由构建器（由宿主注入，因为 component-map 在宿主中） ----
  let _resolver: ComponentResolver | null = null

  function setResolver(resolver: ComponentResolver): void {
    _resolver = resolver
  }

  /**
   * 根据菜单数据生成动态路由
   * @param menus 后端返回的菜单树（已按角色过滤）
   * @param resolve 组件解析器（宿主提供）
   * @returns 生成的路由数组
   */
  function generateRoutes(
    menus: MenuItem[],
    resolve?: ComponentResolver
  ): RouteRecordRaw[] {
    const resolver = resolve || _resolver
    if (!resolver) {
      throw new Error('[generateRoutes] Component resolver not set. Call setResolver first.')
    }

    sidebarMenus.value = menus
    routes.value = buildRoutes(menus, resolver)
    hasRoutes.value = true
    return routes.value
  }

  /** 检查是否有权限 */
  function hasPermission(value: string | string[]): boolean {
    const userStore = useUserStore()
    if (typeof value === 'string') {
      return userStore.hasPermission(value)
    }
    return userStore.hasAnyPermission(value)
  }

  function reset(): void {
    routes.value = []
    sidebarMenus.value = []
    hasRoutes.value = false
  }

  return {
    routes,
    sidebarMenus,
    hasRoutes,
    setResolver,
    generateRoutes,
    hasPermission,
    reset,
  }
})
