// workers/parser.worker.ts
import { expose } from 'comlink'
import type { ModelWorkerAPI } from '@/types/index'

console.log(`Web Worker初始化: ${Date.now().toLocaleString()}`)

const api: ModelWorkerAPI = {
  content: 'hello',
  output: (text: string) => {
    return `Worker output: ${text}`
  },
}

expose(api)
