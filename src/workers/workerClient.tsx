'use client'

import { useEffect } from 'react'
import { useWorkerManager } from '@/store/ai-store'

export default function AILoadingComponent() {
  const modelWorker = useWorkerManager((state) => state.modelWorker)
  const initModelWorker = useWorkerManager((state) => state.initModelWorker)

  //组件挂载时初始化 Model Worker
  useEffect(() => {
    try {
      initModelWorker()
    } catch (error) {
      console.error('组件初始化 Model Worker 失败:', error)
    }
  }, [initModelWorker])

  async function testWorker() {
    if (modelWorker) {
      const result = await modelWorker.api.content
      console.log('Worker content:', result)
      await modelWorker.api.output('hello').then((res) => {
        console.log('Worker output:', res)
      })
    }
  }
  return <button onClick={testWorker}>Test AI Worker</button>
}
