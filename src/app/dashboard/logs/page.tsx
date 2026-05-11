import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ActivityLogs } from "@/components/activity-log"
import { getActivityLogs } from "@/lib/actions"

export default async function LogsPage() {
  const logs = await getActivityLogs()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">System Activity Logs</h1>
          </div>
          
          <ActivityLogs initialLogs={logs} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
