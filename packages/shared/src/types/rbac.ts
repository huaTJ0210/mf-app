/** 用户状态：0=禁用 1=启用 */
export type Status = 0 | 1

/** 菜单类型 */
export type MenuType = 'directory' | 'menu' | 'button'

/** 权限类型 */
export type PermissionType = 'menu' | 'button' | 'api'

/** 用户实体 */
export interface User {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  status: Status
  roleIds: number[]
  createdAt?: string
}

/** 角色实体 */
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: Status
  permissionIds: number[]
  menuIds: number[]
}

/** 权限实体 */
export interface Permission {
  id: number
  name: string
  code: string
  type: PermissionType
  parentId: number | null
}

/** 菜单元数据 */
export interface MenuMeta {
  title: string
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
  affix?: boolean
  activeMenu?: string
  noTagsView?: boolean
  breadcrumb?: boolean
  link?: string
}

/** 菜单项（树形结构） */
export interface MenuItem {
  id: number
  parentId: number | null
  /** 路由名称（全局唯一） */
  name: string
  /** 路由路径 */
  path: string
  /** 组件映射键: 'Layout' | 'shell/Dashboard' | 'system-admin/UserList' */
  component: string
  redirect?: string
  sort: number
  type: MenuType
  /** 权限码，如 'system:user:list' */
  permission?: string
  visible: Status
  status: Status
  meta: MenuMeta
  children?: MenuItem[]
}

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应 */
export interface LoginResponse {
  token: string
  tokenType?: string
  expiresIn?: number
}

/** 用户信息响应（RBAC 核心） */
export interface UserInfoResponse {
  user: User
  /** 角色编码列表，如 ['admin'] */
  roles: string[]
  /** 按钮级权限编码列表，如 ['system:user:add'] */
  permissions: string[]
  /** 菜单树（后端已按角色过滤） */
  menus: MenuItem[]
}

/** 标签页视图 */
export interface TagView {
  name: string
  path: string
  title: string
  affix?: boolean
  keepAlive?: boolean
}
