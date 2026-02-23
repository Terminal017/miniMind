import { Button } from '@/components/ui/button'
import { CircleArrowUp } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useState } from 'react'

export default function InputCom() {
  //问题状态（textarea受控输入）
  const [question, setQuestion] = useState('')
  const isStreaming = useChatStore((state) => state.isStreaming)
  const addMessage = useChatStore((state) => state.addMessage)

  //提交问题处理函数
  function handleQuestionSubmit(question_msg: string) {
    if (isStreaming) {
      return
    }
    addMessage({
      role: 'user',
      content: question_msg,
      createAt: new Date(),
    })
    setQuestion('')
  }

  return (
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
          onKeyDown={(e) => {
            // Enter 提交 (不按 Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (question.trim()) {
                handleQuestionSubmit(question)
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
          onClick={() => handleQuestionSubmit(question)}
        >
          <CircleArrowUp className="w-6! h-6! text-muted-foreground hover:text-primary" />
        </Button>
      </div>
    </div>
  )
}
