import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getProjects } from "@/lib/actions"
import { ProjectConfigManager } from "@/components/project-config-manager"

export default async function SettingsConfigPage() {
  const projects = await getProjects()

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
            <h1 className="text-2xl font-bold tracking-tight">Status & Categories</h1>
          </div>
          
          <ProjectConfigManager projects={projects} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
