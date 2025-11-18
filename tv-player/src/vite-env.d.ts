/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_HEARTBEAT_INTERVAL?: string
  readonly VITE_CONTENT_ROTATION_INTERVAL?: string
  readonly VITE_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
