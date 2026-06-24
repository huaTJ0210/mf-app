import type { Router } from 'vue-router'
import { useUserStore, usePermissionStore, WHITE_LIST } from '@mf/shared'

/**
 * 设置全局路由守卫
 *
 * RBAC 动态路由流程：
 * 1. 检查 token → 无 token 且不在白名单 → 跳转 /login
 * 2. 有 token 但无用户信息 → 调用 getUserInfo → generateRoutes → addRoute
 * 3. 有 token 且已有路由 → 直接放行
 * 4. 路由不存在 → 跳转 /404
 */
export function setupRouterGuard(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    // 设置页面标题
    const title = to.meta?.title as string | undefined
    document.title = title ? `${title} - MF Admin` : 'MF Admin'

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const hasToken = !!userStore.token

    // ---- 无 token ----
    if (!hasToken) {
      if (WHITE_LIST.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
      return
    }

    // ---- 有 token，访问登录页 → 跳转首页 ----
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }

    // ---- 有 token，已生成路由 → 直接放行 ----
    if (permissionStore.hasRoutes) {
      next()
      return
    }

    // ---- 有 token，未生成路由 → 获取用户信息 + 生成动态路由 ----
    try {
      // 获取用户信息（含角色、权限、菜单树）
      const userInfo = await userStore.getUserInfo()

      // 根据菜单数据生成动态路由
      const dynamicRoutes = permissionStore.generateRoutes(userInfo.menus)

      // 将动态路由添加到 Layout 路由的 children 下
      const layoutRoute = router.getRoutes().find((r) => r.name === 'Root')
      if (layoutRoute) {
        for (const route of dynamicRoutes) {
          // 顶级路由直接添加为 Layout 的子路由
          if (route.children && route.children.length > 0) {
            // 目录类型：作为 Layout 的子路由，其 children 为实际页面
            router.addRoute('Root', route)
          } else {
            // 菜单类型：直接添加
            router.addRoute('Root', route)
          }
        }
      }

      // 确保 fallback 路由在最后
      // 由于已静态添加了 fallback，这里不需要重复添加

      // 重新导航，确保动态路由已生效
      // 使用原始 URL 重新触发匹配，避免刷新时沿用 fallback 的匹配结果
      // 使用 replace 避免历史记录污染
      next({
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true,
      })
    } catch (err) {
      console.error('[路由守卫] 获取用户信息失败:', err)
      // 出错时重置并跳转登录
      userStore.reset()
      permissionStore.reset()
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  })
}
