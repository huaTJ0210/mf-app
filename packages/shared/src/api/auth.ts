import { getApiClient } from '../utils/request'
import type { LoginParams, LoginResponse, UserInfoResponse } from '../types'

/** 登录 */
export function loginApi(data: LoginParams): Promise<LoginResponse> {
  return getApiClient().post('/auth/login', data)
}

/** 获取用户信息（含角色、权限、菜单） */
export function getUserInfoApi(): Promise<UserInfoResponse> {
  return getApiClient().get('/user/info')
}

/** 登出 */
export function logoutApi(): Promise<void> {
  return getApiClient().post('/auth/logout')
}
