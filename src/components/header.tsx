import { Box } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function HeaderCom() {
  const navlist = [
    { href: '/chat', label: '研究' },
    { href: '/knowledge', label: '知识库' },
    { href: '/settings', label: '设置' },
  ]
  return (
    <>
      <header
        className="fixed top-0 left-0 w-full h-14 z-50 bg-white 
      border-border border-b border-solid"
      >
        <nav className="h-full max-w-4/5 flex flex-row justify-between items-center px-8 mx-auto">
          <div className="ml-10 flex items-center">
            <Link href="/chat" className="flex flex-row gap-3">
              <Box size={30} />
              <span className="text-xl font-semibold">MiniMind</span>
            </Link>
          </div>
          <div className="mr-10 flex flex-row items-center gap-2 font-medium">
            {navlist.map((nav, index) => {
              return (
                <Link
                  href={nav.href}
                  key={index}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'lg' }),
                    'text-[17px]',
                  )}
                >
                  {nav.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>
    </>
  )
}
