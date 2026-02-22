import { useGLModelLoading } from '@/store/ai-store'
import { LoadGLModelProgress } from './progress'
import { useModelLoading } from '@/hooks/use-modelProgress'
import { useState, useEffect, useRef } from 'react'
import { useWorkerManager } from '@/store/ai-store'
import * as Comlink from 'comlink'
import { toast } from 'sonner'

export default function ChatCom() {
  //初始化模型下载Worker
  const modelWorker = useWorkerManager((state) => state.modelWorker)
  const initmodelWorker = useWorkerManager((state) => state.initModelWorker)

  //生成式模型下载管理
  const setModelLoading = useGLModelLoading((state) => state.setLoadProgress)
  const resetProcess = useGLModelLoading((state) => state.resetProgress)
  const { getLoadingModel } = useModelLoading({
    setProgress: setModelLoading,
    resetProgress: resetProcess,
    ProgressComponent: LoadGLModelProgress,
  })

  useEffect(() => {
    try {
      //初始化Worker
      if (!modelWorker) {
        initmodelWorker()
      }
      const loadModel = async () => {
        await modelWorker?.api.loadGLModel(Comlink.proxy(getLoadingModel))
      }
      loadModel()
    } catch {
      toast.error('错误：初始化模型失败', {
        className: 'text-base',
        position: 'bottom-right',
      })
    }
  }, [modelWorker, getLoadingModel])

  return (
    <>
      <div></div>
    </>
  )
}
