namespace NodeJS {
  interface ProcessEnv {
    readonly WEB_TOKEN: string
    readonly GOOGLE_AI_STUDIO_KEY: string
    readonly REDIS_URL: string
    readonly PORT: string
  }
}

interface HistoryItem {
  role: string
  parts: [
    {
      text: string
    }
  ]
}
