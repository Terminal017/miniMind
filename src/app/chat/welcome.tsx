import { Button } from '@/components/ui/button'

export default function WelcomeCom() {
  return (
    <>
      <div className="w-full h-2/5 flex flex-col justify-center items-center gap-6">
        <h1 className="text-3xl font-medium tracking-wide">
          欢迎使用 MiniMind
        </h1>
        <p className="text-lg">在启用相关服务前，需要先下载模型到浏览器本地</p>
        <Button variant="secondary" className="mt-4 px-6">
          下载模型
        </Button>
      </div>
    </>
  )
}
