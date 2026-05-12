import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getProjectsWithCounts, getProjectSummaryStats } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderIcon, LayoutListIcon } from "lucide-react"
import Link from "next/link"
import { CreateProjectButton } from "@/components/create-project-button"
import { ProjectSummaryTabs } from "@/components/project-summary-tabs"

export default async function ProjectsPage() {
  const projects = await getProjectsWithCounts()
  const projectStats = await getProjectSummaryStats()

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
        <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
              <p className="text-sm text-muted-foreground">Manage and view your project test cases.</p>
            </div>
            <CreateProjectButton />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projects.map((project: any) => (
              <Link key={project.id} href={`/dashboard?projectId=${project.id}`}>
                <Card className="hover:bg-primary/5 border-primary/20 bg-card/40 backdrop-blur-md transition-all hover:shadow-[0_0_20px_rgba(255,0,255,0.1)] group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold text-primary/80 group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <FolderIcon className="h-4 w-4 text-primary/50 group-hover:text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-primary">{project._count.testCases}</div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      Total Test Cases
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <LayoutListIcon className="size-5" />
              <h2 className="text-xl font-bold tracking-tight">Project Summaries</h2>
            </div>
            <ProjectSummaryTabs projectStats={projectStats} />
          </div>

          {projects.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-primary/20 rounded-xl bg-card/20">
              <FolderIcon className="h-12 w-12 text-primary/30 mb-4" />
              <h2 className="text-xl font-semibold">No projects found</h2>
              <p className="text-muted-foreground">Create your first project to get started.</p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
