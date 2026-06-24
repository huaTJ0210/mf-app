import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '../stores/user'
import { SUPER_ADMIN_ROLE } from '../constants'

type PermissionValue = string | string[] | { value: string[]; mode?: 'any' | 'all' }

function checkPermission(value: PermissionValue): boolean {
  const userStore = useUserStore()

  // 超级管理员直接通过
  if (userStore.roles.includes(SUPER_ADMIN_ROLE)) return true

  const permissions = userStore.permissions

  if (typeof value === 'string') {
    return permissions.includes(value)
  }

  if (Array.isArray(value)) {
    return value.some((v) => permissions.includes(v))
  }

  if (value && typeof value === 'object') {
    const { value: codes, mode = 'any' } = value
    if (mode === 'all') {
      return codes.every((v) => permissions.includes(v))
    }
    return codes.some((v) => permissions.includes(v))
  }

  return false
}

export const vPermission: Directive<HTMLElement, PermissionValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    if (!binding.value) return
    if (!checkPermission(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  },
}

/** 在 Vue 应用中注册 v-permission 指令 */
export function installPermissionDirective(app: App): void {
  app.directive('permission', vPermission)
}
