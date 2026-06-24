import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { getToken, removeToken } from './auth'
import type { ApiResponse } from '../types'

/**
 * 创建 axios 实例（带请求/响应拦截器）
 * 跨应用共享：宿主和子应用独立模式各创建一个实例，通过 setApiClient 共享
 */
export function createRequest(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  // 请求拦截器：注入 token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器：解包 ApiResponse，处理 401
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const res = response.data
      if (res.code !== 0) {
        console.error(`[API Error] ${res.code}: ${res.message}`)
        return Promise.reject(new Error(res.message || 'Request failed'))
      }
      return res.data as any
    },
    (error) => {
      const status = error.response?.status
      if (status === 401) {
        removeToken()
        // 避免在登录页重复跳转
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// ---- 服务定位器模式：跨应用共享 axios 实例 ----
let _apiClient: AxiosInstance | null = null

export function setApiClient(client: AxiosInstance): void {
  _apiClient = client
}

export function getApiClient(): AxiosInstance {
  if (!_apiClient) {
    throw new Error('[getApiClient] API client not initialized. Call setApiClient first.')
  }
  return _apiClient
}
