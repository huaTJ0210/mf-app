/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT: string
  readonly VITE_SYSTEM_ADMIN_REMOTE_URL?: string
  readonly VITE_BUSINESS_REMOTE_URL?: string
  readonly VITE_STANDALONE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
