import { useEffect } from "react";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { getSessionFn } from "~/lib/auth/session.functions";
import { getAnalyticsData } from "~/server/get-analytics";

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()
    if (!session) throw redirect({ to: '/auth/sign-in', search: { redirectTo: location.href } })
    return { session }
  },
  loader: () => {
    const data = getAnalyticsData({ data: 90 })
    return data
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
