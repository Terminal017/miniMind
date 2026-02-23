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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CircleArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChatCom() {
  const { sessionId } = useParams()
  console.log('当前会话ID:', Number(sessionId))

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
      if (sessionExists !== true) {
        return
      }
      //初始化Worker
      if (!modelWorker) {
        initmodelWorker()
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
  }, [modelWorker, sessionExists])

  //问题状态（textarea受控输入）
  const [question, setQuestion] = useState('')

  return (
    <>
      <div className="w-full flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto"></div>
        <div className="w-3/5 mx-auto mb-8">
          <div
            className="flex flex-row items-center border shadow-sm
          rounded-md p-1"
          >
            <textarea
              className="w-full resize-none overflow-hidden
               px-3 py-2 focus:outline-none"
              rows={1}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                const t = e.currentTarget as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = `${t.scrollHeight}px`
              }}
              // onKeyDown={(e) => {
              //   // Enter 提交 (不按 Shift)
              //   if (e.key === 'Enter' && !e.shiftKey) {
              //     e.preventDefault()
              //     if (question.trim()) {
              //       sendQuestion(question)
              //       e.currentTarget.style.height = 'auto'
              //     }
              //   }
              // }}
              required
            ></textarea>
            <Button variant="ghost" size="icon" className="self-end mr-1">
              <CircleArrowUp className="w-6! h-6! text-muted-foreground hover:text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
