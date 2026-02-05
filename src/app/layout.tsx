import type { Metadata } from 'next'
import './globals.css'
import HeaderCom from '@/components/header'

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
      <body className="">
        <HeaderCom />
        {children}
      </body>
    </html>
  )
}
