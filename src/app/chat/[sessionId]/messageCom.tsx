import { useChatStore } from '@/store/chat-store'
import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm' //用于适配表格等markdown样式

export default function MessageCom({ sessionId }: { sessionId: number }) {
  const messageList = useChatStore((state) => state.messageList)
  const setCurrentSession = useChatStore((state) => state.setCurrentSession)
  const isStreaming = useChatStore((state) => state.isStreaming)

  useEffect(() => {
    setCurrentSession(sessionId)
  }, [])

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {messageList.map((msg, index) => (
          <div key={index}>
            <h1>{msg.role}</h1>
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
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
