'use client'

import { Button } from '@/components/ui/button'
import { CircleArrowUp } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { use, useEffect, useState } from 'react'
import { useWorkerManager } from '@/store/ai-store'
import { toast } from 'sonner'
import * as Comlink from 'comlink'
import { useParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAllLibraries } from '@/services/libraryService'
import * as Comnlink from 'comlink'

export default function InputCom() {
  const { sessionId } = useParams()

  //问题状态（textarea受控输入）
  const [question, setQuestion] = useState('')
  const isStreaming = useChatStore((state) => state.isStreaming)
  const addMessage = useChatStore((state) => state.addMessage)
  const initStreaming = useChatStore((state) => state.initStreaming)
  const appendChunk = useChatStore((state) => state.appendChunk)
  const finishStreaming = useChatStore((state) => state.finishStreaming)

  //获取worker实例
  const modelWorker = useWorkerManager((state) => state.modelWorker)
  const docWorker = useWorkerManager((state) => state.docWorker)

  //提交问题处理函数
  async function handleQuestionSubmit(question_msg: string, libraryId: string) {
    //检查状态
    if (isStreaming) {
      return
    }
    if (!modelWorker || !docWorker) {
      toast.info('worker初始化错误，请重试')
      return
    }

    let chunks: string[] = []
    if (libraryId !== 'none') {
      chunks = await docWorker.api.searchSimilarChunks(
        question_msg,
        Number(libraryId),
        2,
        Comnlink.proxy(() => {}),
      )
    }

    //提交用户输入
    addMessage({
      role: 'user',
      content: question_msg,
      createAt: new Date(),
    })
    setQuestion('')

    const prompt =
      chunks.length > 0
        ? `<|im_start|>system
          你是一个基于文档回答问题的助手。
          规则：
          1. 仅根据提供的【参考资料】回答。
          2. 如果问题与资料内容无关，请直接说“资料中未提及”。
          3. 保持回答简洁、严谨。<|im_end|>
          <|im_start|>user
          【参考资料】：
          1. ${chunks[0]}
          2. ${chunks[1]}

          【用户的问题】：
          ${question_msg}<|im_end|>
          <|im_start|>assistant
          `
        : `<|im_start|>system
        你是一个有用、诚实且严谨的 AI 助手。请直接回答用户的问题。<|im_end|>
        <|im_start|>user
        ${question_msg}<|im_end|>
        <|im_start|>assistant
        `

    //闭包传递sessionId
    initStreaming(Number(sessionId))
    await modelWorker.api.generateStreaming(
      prompt,
      Comlink.proxy((token: string) => {
        // 【高频触发区】Zustand 接收字符，仅更新内存
        appendChunk(token, Number(sessionId))
      }),
    )
    finishStreaming(Number(sessionId))
  }

  //获取知识库信息
  const libraryList = useLiveQuery(() => getAllLibraries() ?? [], []) ?? []
  const messageList = useChatStore((state) => state.messageList)
  // 更新知识库状态
  const currentLibraryId = useChatStore((state) => state.currentLibraryId)
  const setLibrary = useChatStore((state) => state.setCurrentLibrary)

  return (
    <div className="w-3/5 mx-auto mb-8 mt-4">
      <Select
        value={currentLibraryId}
        onValueChange={setLibrary}
        disabled={messageList.length > 0}
      >
        <SelectTrigger className="w-48 mb-2">
          <SelectValue placeholder="选择知识库" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectLabel>知识库</SelectLabel>
            <SelectItem value="none">无知识库</SelectItem>
            {libraryList.map((lib) => (
              <SelectItem key={lib.id} value={lib.id.toString()}>
                {lib.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex flex-row items-center border shadow-sm rounded-md p-1">
        <textarea
          className="w-full resize-none overflow-hidden px-3 py-2 focus:outline-none"
          rows={1}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value)
            const t = e.currentTarget as HTMLTextAreaElement
            t.style.height = 'auto'
            t.style.height = `${t.scrollHeight}px`
          }}
          onKeyDown={(e) => {
            // Enter 提交 (不按 Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (question.trim()) {
                handleQuestionSubmit(question, currentLibraryId)
                e.currentTarget.style.height = 'auto'
              }
            }
          }}
          required
        ></textarea>
        <Button
          variant="ghost"
          size="icon"
          className="self-end mr-1"
          disabled={!question.trim() && !isStreaming}
          onClick={() => handleQuestionSubmit(question, currentLibraryId)}
        >
          <CircleArrowUp className="w-6! h-6! text-muted-foreground hover:text-primary" />
        </Button>
      </div>
    </div>
  )
}
