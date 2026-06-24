import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS } from '../constants'

export type DeviceType = 'desktop' | 'mobile'
export type ThemeType = 'light' | 'dark'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(
    localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true'
  )
  const device = ref<DeviceType>('desktop')
  const theme = ref<ThemeType>(
    (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeType) || 'light'
  )
  const size = ref<'large' | 'default' | 'small'>('default')

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(sidebarCollapsed.value))
  }

  function setSidebar(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed))
  }

  function setDevice(d: DeviceType): void {
    device.value = d
  }

  function setTheme(t: ThemeType): void {
    theme.value = t
    localStorage.setItem(STORAGE_KEYS.THEME, t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }

  function setSize(s: 'large' | 'default' | 'small'): void {
    size.value = s
  }

  return {
    sidebarCollapsed,
    device,
    theme,
    size,
    toggleSidebar,
    setSidebar,
    setDevice,
    setTheme,
    setSize,
  }
})
