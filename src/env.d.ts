/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ML_SERVICE_URL: string
  // Upstash Redis
  readonly VITE_UPSTASH_REDIS_REST_URL: string
  readonly VITE_UPSTASH_REDIS_REST_TOKEN: string
  // add other env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
