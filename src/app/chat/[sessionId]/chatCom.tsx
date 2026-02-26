'use client'

import { useGLModelLoading } from '@/store/ai-store'
import { LoadGLModelProgress } from '../progress'
import { useModelLoading } from '@/hooks/use-modelProgress'
import { useState, useEffect, useRef } from 'react'
import { useWorkerManager } from '@/store/ai-store'
import { useRouter, useParams } from 'next/navigation'
import * as Comlink from 'comlink'
import { toast } from 'sonner'
import { checkSession } from '@/services/sessionService'
import MessageCom from './messageCom'
import dynamic from 'next/dynamic'

//动态导入，解决Select组件在服务端渲染时的兼容性问题
const InputCom = dynamic(() => import('./inputCom'), {
  ssr: false,
})
// import InputCom from './inputCom'

export default function ChatCom() {
  const { sessionId } = useParams()

  const [sessionExists, setSessionExists] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const validateSession = async () => {
      const exists = await checkSession(Number(sessionId))

      if (!exists) {
        toast.error('会话不存在', {
          className: 'text-base',
          position: 'bottom-right',
        })
        router.push('/chat') // 重定向到默认页面
        return
      }

      setSessionExists(true)
    }

    validateSession()
  }, [sessionId, router])

  //初始化模型下载与向量化Worker
  const modelWorker = useWorkerManager((state) => state.modelWorker)
  const docWorker = useWorkerManager((state) => state.docWorker)
  const initmodelWorker = useWorkerManager((state) => state.initModelWorker)
  const initdocWorker = useWorkerManager((state) => state.initDocWorker)

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
      if (sessionExists !== true) {
        return
      }
      // 初始化Worker
      if (!modelWorker) {
        initmodelWorker()
        return
      }
      if (!docWorker) {
        initdocWorker()
        return
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
  }, [modelWorker, docWorker, sessionExists])

  return (
    <>
      <div className="w-full flex flex-col overflow-hidden flex-1 max-h-[calc(100vh-92px)]">
        <MessageCom sessionId={Number(sessionId)} />
        <InputCom />
      </div>
    </>
  )
}
