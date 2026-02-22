//欢迎页面，提供模型下载功能

import { Button } from '@/components/ui/button'
import { createSession } from '@/services/sessionService'
import { useRouter } from 'next/navigation'

export default function WelcomeCom() {
  const router = useRouter()
  //创建新会话并跳转
  async function handleNewChat() {
    const session = await createSession()
    router.push(`/chat/${session.id}`)
  }
  return (
    <>
      <div className="w-full h-2/5 flex flex-col justify-center items-center gap-6">
        <h1 className="text-3xl font-medium tracking-wide">
          欢迎使用 MiniMind
        </h1>
        <p className="text-lg">在启用相关服务前，需要先下载模型到浏览器本地</p>
        <p className="text-lg">发起新对话时，会先自动下载未下载的模型</p>
        <Button
          variant="secondary"
          className="mt-4 px-6"
          onClick={handleNewChat}
        >
          发起新对话
        </Button>
      </div>
    </>
  )
}
