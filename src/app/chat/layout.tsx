import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './appSideBar'

export default function ChatPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider className="min-h-[calc(100vh-56px)]">
      <AppSidebar />
      {/*主区域内容，即SideBar右侧区域*/}
      <section className="flex-1 overflow-hidden">
        <SidebarTrigger />
        {children}
      </section>
    </SidebarProvider>
  )
}
