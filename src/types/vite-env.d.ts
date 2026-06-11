/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_SITE_ID?: string
  readonly VITE_DEFAULT_PUBLIC_KEY?: string
  readonly VITE_DEFAULT_SECRET_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
