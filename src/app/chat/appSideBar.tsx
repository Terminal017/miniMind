'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { createSession } from '@/services/sessionService'
import { useRouter, useParams } from 'next/navigation'
import { SquarePen } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getSessions, deleteSession } from '@/services/sessionService'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const { sessionId } = useParams()
  const id = Number(sessionId)

  const router = useRouter()
  //创建新会话并跳转
  async function handleNewChat() {
    const session = await createSession()
    router.push(`/chat/${session.id}`)
  }

  const sessions = useLiveQuery(() => getSessions() ?? [], []) ?? []

  return (
    <Sidebar>
      <SidebarHeader className="mt-13">
        <h2 className="text-lg font-medium text-center">会话列表</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-4">
          <Button variant="ghost" className="w-full" onClick={handleNewChat}>
            <SquarePen />
            <span>发起新对话</span>
          </Button>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            {sessions.map((session) => (
              //Sidebar上有group，所以这里用group/item
              <SidebarMenuItem key={session.id} className="relative group/item">
                <SidebarMenuButton
                  onClick={() => router.push(`/chat/${session.id}`)}
                  className={cn(
                    'pl-2',
                    id === session.id ? 'bg-blue-100 hover:bg-blue-100' : '',
                  )}
                >
                  <span className="truncate">{session.title}</span>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 
                    opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation() //防止跳转
                        deleteSession(session.id)
                        // 如果删除的是当前会话,跳转到/chat
                        if (session.id === id) {
                          router.push('/chat')
                        }
                      }}
                    >
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
