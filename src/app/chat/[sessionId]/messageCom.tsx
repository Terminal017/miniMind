import { useChatStore } from '@/store/chat-store'
import { useEffect } from 'react'

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
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
    </>
  )
}
