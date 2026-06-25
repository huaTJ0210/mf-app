import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi, getUserInfoApi, logoutApi } from '../api/auth'
import { getToken, setToken, removeToken } from '../utils/auth'
import { SUPER_ADMIN_ROLE, DEFAULT_AVATAR } from '../constants'
import type { User, MenuItem, LoginParams, UserInfoResponse } from '../types'

export const useUserStore = defineStore('user', () => {
  // ---- state ----
  const token = ref<string>(getToken() || '')
  const userId = ref<number>(0)
  const username = ref<string>('')
  const nickname = ref<string>('')
  const avatar = ref<string>(DEFAULT_AVATAR)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const menus = ref<MenuItem[]>([])

  // ---- getters ----
  function isSuperAdmin(): boolean {
    return roles.value.includes(SUPER_ADMIN_ROLE)
  }

  function hasPermission(code: string): boolean {
    if (isSuperAdmin()) return true
    return permissions.value.includes(code)
  }

  function hasAnyPermission(codes: string[]): boolean {
    if (isSuperAdmin()) return true
    return codes.some((c) => permissions.value.includes(c))
  }

  function hasRole(code: string): boolean {
    return roles.value.includes(code)
  }

  // ---- actions ----
  async function login(params: LoginParams): Promise<void> {
    const res = await loginApi(params)
    token.value = res.token
    setToken(res.token)
  }

  async function getUserInfo(): Promise<UserInfoResponse> {
    const res = await getUserInfoApi()
    userId.value = res.user.id
    username.value = res.user.username
    nickname.value = res.user.nickname
    avatar.value = res.user.avatar || DEFAULT_AVATAR
    roles.value = res.roles
    permissions.value = res.permissions
    menus.value = res.menus
    return res
  }

  async function logout(): Promise<void> {
    try {
      await logoutApi()
    } catch {
      // 忽略登出 API 失败
    }
    reset()
  }

  function reset(): void {
    token.value = ''
    userId.value = 0
    username.value = ''
    nickname.value = ''
    avatar.value = DEFAULT_AVATAR
    roles.value = []
    permissions.value = []
    menus.value = []
    removeToken()
  }

  /** 子应用独立运行时植入 mock 用户数据 */
  function setMockUser(
    mockUser: Partial<User> & { roles?: string[]; permissions?: string[] }
  ): void {
    userId.value = mockUser.id ?? 1
    username.value = mockUser.username ?? 'standalone'
    nickname.value = mockUser.nickname ?? '独立开发模式'
    avatar.value = mockUser.avatar || DEFAULT_AVATAR
    roles.value = mockUser.roles ?? [SUPER_ADMIN_ROLE]
    permissions.value = mockUser.permissions ?? ['*']
  }

  return {
    token,
    userId,
    username,
    nickname,
    avatar,
    roles,
    permissions,
    menus,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasRole,
    login,
    getUserInfo,
    logout,
    reset,
    setMockUser,
  }
})
