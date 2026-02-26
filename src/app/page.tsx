import { redirect } from 'next/navigation'

export default function Home() {
  // 直接重定向到 /chat
  redirect('/chat')
}
