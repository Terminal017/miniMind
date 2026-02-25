'use client'

import { useChatStore } from '@/store/chat-store'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm' //用于适配表格等markdown样式
import { Bot } from 'lucide-react'

export default function MessageCom({ sessionId }: { sessionId: number }) {
  const messageList = useChatStore((state) => state.messageList)
  const setCurrentSession = useChatStore((state) => state.setCurrentSession)
  const isStreaming = useChatStore((state) => state.isStreaming)

  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentSession(sessionId)
  }, [])

  // 监听 messageList 的变化并滚动到底部
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messageList])

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto px-20">
        {messageList.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <div key={index} className="my-10 flex w-full justify-end">
                <div
                  className="bg-secondary max-w-3/4 rounded-md px-4
              py-2 max-md:mr-0"
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            )
          } else if (msg.role === 'model') {
            return (
              <div key={index} className="w-full flex flex-row pr-4">
                <div className="h-8 w-8 shrink-0">
                  <Bot />
                </div>
                {/*配置列表样式适配 */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      //设置代码块样式
                      code({ className, children }) {
                        const match = /language-(\w+)/.exec(className || '')
                        if (match) {
                          // 代码块
                          return (
                            <pre className="p-3 rounded-lg bg-secondary dark:bg-gray-800 overflow-x-auto">
                              <code>{children}</code>
                            </pre>
                          )
                        }
                        // 行内代码
                        return (
                          <code className="px-1 py-0.5 rounded bg-secondary dark:bg-gray-700 text-sm">
                            {children}
                          </code>
                        )
                      },
                      p: ({ children }) => (
                        <p className="wrap-break-word">{children}</p>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            )
          }
        })}
        {/* 滚动视角的锚点 */}
        <div ref={messageEndRef} />
      </div>
    </>
  )
}
