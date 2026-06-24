import { STORAGE_KEYS } from '../constants'

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

export function removeToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
}
