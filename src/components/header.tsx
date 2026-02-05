import { Box } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function HeaderCom() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full h-14 z-50">
        <nav className="h-full flex flex-row justify-between items-center px-8">
          <div className="ml-36 flex items-center">
            <Link href="/chat" className="flex flex-row gap-3">
              <Box size={30} />
              <span className="text-xl font-semibold">MiniMind</span>
            </Link>
          </div>
          <div className="mr-48 flex flex-row items-center gap-2 font-medium">
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'lg' }),
                'text-[17px]',
              )}
            >
              研究
            </Link>
            <Link
              href="/knowledge"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'lg' }),
                'text-[17px]',
              )}
            >
              知识库
            </Link>
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'lg' }),
                'text-[17px]',
              )}
            >
              设置
            </Link>
          </div>
        </nav>
      </header>
    </>
  )
}
