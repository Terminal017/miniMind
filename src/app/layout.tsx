import type { Metadata } from 'next'
import './globals.css'
import HeaderCom from '@/components/header'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'MiniMind AI',
  description: '个人知识管理与分析的AI大脑',
  icons: {
    icon: '/favicon_base.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-cn">
      <body className="min-h-screen bg-background text-foreground">
        <HeaderCom />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
