import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

// const SIDEBAR_WIDTH = '16rem'
// const SIDEBAR_WIDTH_MOBILE = '18rem'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="mt-13">
        <h2 className="text-lg font-medium text-center">会话列表</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-4">
          <Button variant="outline" className="w-full">
            发起新对话
          </Button>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
