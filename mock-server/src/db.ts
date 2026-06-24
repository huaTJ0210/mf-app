/**
 * 内存数据库 — Mock Server 的核心数据源
 * 包含：用户、角色、权限、菜单、订单
 */

export interface MockUser {
  id: number
  username: string
  password: string
  nickname: string
  avatar: string
  email: string
  phone: string
  status: 0 | 1
  roleIds: number[]
  createdAt: string
}

export interface MockRole {
  id: number
  name: string
  code: string
  description: string
  status: 0 | 1
  menuIds: number[]
}

export interface MockMenu {
  id: number
  parentId: number | null
  name: string
  path: string
  component: string
  redirect?: string
  sort: number
  type: 'directory' | 'menu' | 'button'
  permission?: string
  visible: 0 | 1
  status: 0 | 1
  meta: {
    title: string
    icon?: string
    hidden?: boolean
    keepAlive?: boolean
    affix?: boolean
  }
}

export interface MockOrder {
  id: number
  orderNo: string
  customer: string
  amount: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  createdAt: string
}

// ---- 用户表 ----
export const users: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '超级管理员',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    email: 'admin@example.com',
    phone: '13800000001',
    status: 1,
    roleIds: [1],
    createdAt: '2024-01-01 00:00:00',
  },
  {
    id: 2,
    username: 'editor',
    password: '123456',
    nickname: '编辑员',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    email: 'editor@example.com',
    phone: '13800000002',
    status: 1,
    roleIds: [2],
    createdAt: '2024-01-02 00:00:00',
  },
  {
    id: 3,
    username: 'viewer',
    password: '123456',
    nickname: '访客',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    email: 'viewer@example.com',
    phone: '13800000003',
    status: 1,
    roleIds: [3],
    createdAt: '2024-01-03 00:00:00',
  },
]

// ---- 角色表 ----
export const roles: MockRole[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '拥有系统全部权限',
    status: 1,
    menuIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 100],
  },
  {
    id: 2,
    name: '业务编辑员',
    code: 'editor',
    description: '仅可访问业务模块和首页',
    status: 1,
    menuIds: [5, 6, 7, 8, 100],
  },
  {
    id: 3,
    name: '访客',
    code: 'viewer',
    description: '仅可查看首页',
    status: 1,
    menuIds: [100],
  },
]

// ---- 菜单表（完整菜单目录，后端按角色过滤后返回） ----
export const menus: MockMenu[] = [
  // 首页（所有角色可见）
  {
    id: 100,
    parentId: null,
    name: 'Dashboard',
    path: '/dashboard',
    component: 'shell/Dashboard',
    sort: 0,
    type: 'menu',
    visible: 1,
    status: 1,
    meta: { title: '首页', icon: 'HomeFilled', affix: true },
  },
  // 系统管理目录
  {
    id: 1,
    parentId: null,
    name: 'System',
    path: '/system',
    component: 'Layout',
    redirect: '/system/user',
    sort: 1,
    type: 'directory',
    visible: 1,
    status: 1,
    meta: { title: '系统管理', icon: 'Setting' },
  },
  // 用户管理
  {
    id: 2,
    parentId: 1,
    name: 'SystemUser',
    path: 'user',
    component: 'system-admin/UserList',
    sort: 1,
    type: 'menu',
    permission: 'system:user:list',
    visible: 1,
    status: 1,
    meta: { title: '用户管理', icon: 'User', keepAlive: true },
  },
  // 角色管理
  {
    id: 3,
    parentId: 1,
    name: 'SystemRole',
    path: 'role',
    component: 'system-admin/RoleList',
    sort: 2,
    type: 'menu',
    permission: 'system:role:list',
    visible: 1,
    status: 1,
    meta: { title: '角色管理', icon: 'UserFilled', keepAlive: true },
  },
  // 菜单管理
  {
    id: 4,
    parentId: 1,
    name: 'SystemMenu',
    path: 'menu',
    component: 'system-admin/MenuList',
    sort: 3,
    type: 'menu',
    permission: 'system:menu:list',
    visible: 1,
    status: 1,
    meta: { title: '菜单管理', icon: 'Menu', keepAlive: true },
  },
  // 业务模块目录
  {
    id: 5,
    parentId: null,
    name: 'Business',
    path: '/business',
    component: 'Layout',
    redirect: '/business/dashboard',
    sort: 2,
    type: 'directory',
    visible: 1,
    status: 1,
    meta: { title: '业务模块', icon: 'DataLine' },
  },
  // 业务看板
  {
    id: 6,
    parentId: 5,
    name: 'BizDashboard',
    path: 'dashboard',
    component: 'business/Dashboard',
    sort: 1,
    type: 'menu',
    visible: 1,
    status: 1,
    meta: { title: '业务看板', icon: 'Odometer', keepAlive: true },
  },
  // 订单管理
  {
    id: 7,
    parentId: 5,
    name: 'BizOrder',
    path: 'order',
    component: 'business/Orders',
    sort: 2,
    type: 'menu',
    permission: 'business:order:list',
    visible: 1,
    status: 1,
    meta: { title: '订单管理', icon: 'List', keepAlive: true },
  },
  // 按钮权限点（不在路由中展示，仅用于权限控制）
  {
    id: 8,
    parentId: 2,
    name: 'SystemUserAdd',
    path: '',
    component: '',
    sort: 1,
    type: 'button',
    permission: 'system:user:add',
    visible: 0,
    status: 1,
    meta: { title: '新增用户' },
  },
  {
    id: 9,
    parentId: 2,
    name: 'SystemUserEdit',
    path: '',
    component: '',
    sort: 2,
    type: 'button',
    permission: 'system:user:edit',
    visible: 0,
    status: 1,
    meta: { title: '编辑用户' },
  },
  {
    id: 10,
    parentId: 2,
    name: 'SystemUserDelete',
    path: '',
    component: '',
    sort: 3,
    type: 'button',
    permission: 'system:user:delete',
    visible: 0,
    status: 1,
    meta: { title: '删除用户' },
  },
  {
    id: 11,
    parentId: 7,
    name: 'BizOrderAdd',
    path: '',
    component: '',
    sort: 1,
    type: 'button',
    permission: 'business:order:add',
    visible: 0,
    status: 1,
    meta: { title: '新增订单' },
  },
  {
    id: 12,
    parentId: 7,
    name: 'BizOrderEdit',
    path: '',
    component: '',
    sort: 2,
    type: 'button',
    permission: 'business:order:edit',
    visible: 0,
    status: 1,
    meta: { title: '编辑订单' },
  },
]

// ---- 订单表 ----
export const orders: MockOrder[] = [
  { id: 1, orderNo: 'ORD202401001', customer: '张三', amount: 1299.0, status: 'completed', createdAt: '2024-01-15 10:30:00' },
  { id: 2, orderNo: 'ORD202401002', customer: '李四', amount: 899.5, status: 'shipped', createdAt: '2024-01-16 14:20:00' },
  { id: 3, orderNo: 'ORD202401003', customer: '王五', amount: 2599.0, status: 'paid', createdAt: '2024-01-17 09:15:00' },
  { id: 4, orderNo: 'ORD202401004', customer: '赵六', amount: 459.0, status: 'pending', createdAt: '2024-01-18 16:45:00' },
  { id: 5, orderNo: 'ORD202401005', customer: '孙七', amount: 3299.0, status: 'completed', createdAt: '2024-01-19 11:00:00' },
  { id: 6, orderNo: 'ORD202401006', customer: '周八', amount: 789.0, status: 'cancelled', createdAt: '2024-01-20 13:30:00' },
  { id: 7, orderNo: 'ORD202401007', customer: '吴九', amount: 1599.0, status: 'shipped', createdAt: '2024-01-21 08:50:00' },
  { id: 8, orderNo: 'ORD202401008', customer: '郑十', amount: 2099.0, status: 'paid', createdAt: '2024-01-22 17:10:00' },
]

// ---- 已签发的 token 集合 ----
export const tokens: Map<string, number> = new Map()

// ---- 工具函数 ----

/** 根据角色 ID 获取角色 */
export function getRoleById(roleId: number): MockRole | undefined {
  return roles.find((r) => r.id === roleId)
}

/** 根据用户 ID 获取用户 */
export function getUserById(userId: number): MockUser | undefined {
  return users.find((u) => u.id === userId)
}

/** 获取用户的所有角色编码 */
export function getUserRoleCodes(userId: number): string[] {
  const user = getUserById(userId)
  if (!user) return []
  return user.roleIds.map((rid) => getRoleById(rid)?.code).filter(Boolean) as string[]
}

/** 根据用户角色获取过滤后的菜单树 */
export function getUserMenus(userId: number): MockMenu[] {
  const user = getUserById(userId)
  if (!user) return []

  // 收集用户所有角色拥有的菜单 ID
  const menuIdSet = new Set<number>()
  for (const roleId of user.roleIds) {
    const role = getRoleById(roleId)
    if (role) {
      role.menuIds.forEach((mid) => menuIdSet.add(mid))
    }
  }

  // 过滤菜单：只保留用户有权限的菜单，且状态为启用
  const filteredMenus = menus.filter(
    (m) => menuIdSet.has(m.id) && m.status === 1
  )

  // 转为树形结构
  return buildMenuTree(filteredMenus, null)
}

/** 获取用户的所有权限编码（按钮级） */
export function getUserPermissions(userId: number): string[] {
  const user = getUserById(userId)
  if (!user) return []

  const menuIdSet = new Set<number>()
  for (const roleId of user.roleIds) {
    const role = getRoleById(roleId)
    if (role) {
      role.menuIds.forEach((mid) => menuIdSet.add(mid))
    }
  }

  // 收集所有按钮类型的权限编码
  const perms: string[] = []
  for (const menu of menus) {
    if (menu.type === 'button' && menuIdSet.has(menu.id) && menu.permission) {
      perms.push(menu.permission)
    }
  }
  // 也收集菜单类型的权限编码
  for (const menu of menus) {
    if (menu.type === 'menu' && menuIdSet.has(menu.id) && menu.permission) {
      perms.push(menu.permission)
    }
  }

  return perms
}

/** 递归构建菜单树 */
function buildMenuTree(list: MockMenu[], parentId: number | null): MockMenu[] {
  const tree: MockMenu[] = []
  const sorted = [...list].sort((a, b) => a.sort - b.sort)

  for (const item of sorted) {
    if (item.parentId === parentId) {
      const children = buildMenuTree(list, item.id)
      const node: MockMenu = { ...item }
      if (children.length > 0) {
        node.children = children
      }
      tree.push(node)
    }
  }

  return tree
}
