import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '../types'

/**
 * 组件解析器类型：将菜单 component 字符串映射为懒加载组件
 * 宿主应用提供具体实现（因为远程 MF import 只能从宿主侧解析）
 */
export type ComponentResolver = (key: string) => (() => Promise<any>) | undefined

/**
 * 将菜单树递归转换为 vue-router 路由配置
 * 过滤掉 type === 'button' 的项（按钮是权限点，不是路由）
 */
export function buildRoutes(
  menus: MenuItem[],
  resolve: ComponentResolver
): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  for (const menu of menus) {
    // 按钮类型不生成路由
    if (menu.type === 'button') continue
    // 隐藏或禁用的菜单不生成路由
    if (menu.status === 0) continue

    const component = menu.component ? resolve(menu.component) : undefined

    const route: RouteRecordRaw = {
      path: menu.path,
      name: menu.name,
      component,
      redirect: menu.redirect,
      meta: {
        title: menu.meta.title,
        icon: menu.meta.icon,
        hidden: menu.meta.hidden,
        keepAlive: menu.meta.keepAlive,
        affix: menu.meta.affix,
        activeMenu: menu.meta.activeMenu,
        noTagsView: menu.meta.noTagsView,
        permission: menu.permission,
        menuId: menu.id,
      },
      children: [],
    }

    if (menu.children && menu.children.length > 0) {
      const childRoutes = buildRoutes(menu.children, resolve)
      if (childRoutes.length > 0) {
        ;(route.children as RouteRecordRaw[]).push(...childRoutes)
      }
    }

    // 如果没有子路由且没有 component，跳过（纯分组的空目录）
    if (!component && (!route.children || route.children.length === 0)) continue

    routes.push(route)
  }

  return routes
}

/**
 * 将扁平菜单列表转换为树形结构
 */
export function listToTree<T extends { id: number; parentId: number | null; children?: T[] }>(
  list: T[]
): T[] {
  const map = new Map<number, T>()
  const tree: T[] = []

  // 先建立索引
  for (const item of list) {
    map.set(item.id, { ...item, children: [] })
  }

  // 再构建树
  for (const item of list) {
    const node = map.get(item.id)!
    if (item.parentId === null || item.parentId === 0) {
      tree.push(node)
    } else {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children!.push(node)
      } else {
        tree.push(node)
      }
    }
  }

  // 排序并清理空 children
  function sortTree(nodes: T[]) {
    nodes.sort((a, b) => 0) // sort 由具体调用方处理
    for (const node of nodes) {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        sortTree(node.children)
      }
    }
  }
  sortTree(tree)

  return tree
}
