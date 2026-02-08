// 大语言模型 (LLM) 加载、推理、Prompt 拼接、流式输出

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
