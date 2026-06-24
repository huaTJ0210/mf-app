/**
 * 远程模块类型声明
 * Module Federation 远程导入的组件需要声明模块类型
 */

// system-admin 子应用暴露的组件
declare module 'system-admin/UserList' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare module 'system-admin/RoleList' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare module 'system-admin/MenuList' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

// business 子应用暴露的组件
declare module 'business/Dashboard' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare module 'business/Orders' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}
