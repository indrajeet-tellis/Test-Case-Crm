"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, FolderIcon, UsersIcon, Settings2Icon, ShieldCheckIcon, HistoryIcon } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const user = session?.user as any

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: <FolderIcon />,
    },
    {
      title: "Logs",
      url: "/dashboard/logs",
      icon: <HistoryIcon />,
    },
    {
      title: "Settings",
      url: "/dashboard/settings/config",
      icon: <Settings2Icon />,
    },
  ]

  // Add admin-only items
  if (user?.role === "ADMIN") {
    navMain.push(
      {
        title: "Users",
        url: "/dashboard/settings/users",
        icon: <UsersIcon />,
      }
    )
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-primary/20 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 py-6">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary/20 p-1 shadow-[0_0_20px_rgba(255,0,255,0.4)] ring-1 ring-white/20">
            <img src="/logo.png" alt="Salonnz Logo" className="size-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase leading-none text-primary">SALONNZ</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">TEST CRM</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card/30 backdrop-blur-md">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-primary/20 bg-card/50 backdrop-blur-xl">
        <NavUser 
          user={{
            name: user?.name || "User",
            email: user?.email || "",
            avatar: "",
          }} 
        />
      </SidebarFooter>
    </Sidebar>
  )
}
