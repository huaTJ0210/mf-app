/** 路由白名单（不需要登录即可访问） */
export const WHITE_LIST = ['/login', '/404', '/403']

/** localStorage 键名 */
export const STORAGE_KEYS = {
  TOKEN: 'mf_admin_token',
  SIDEBAR_COLLAPSED: 'mf_admin_sidebar_collapsed',
  THEME: 'mf_admin_theme',
} as const

/** 超级管理员角色编码 */
export const SUPER_ADMIN_ROLE = 'admin'

/** 默认头像 */
export const DEFAULT_AVATAR = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
