import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppSidebar } from '~/components/app-sidebar'
import { SiteHeader } from '~/components/site-header'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { getSessionFn } from '~/lib/auth/session.functions'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { session } = Route.useRouteContext()
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={session.user}/>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
