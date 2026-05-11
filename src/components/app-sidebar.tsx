"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, FileTextIcon, Settings2Icon, DatabaseIcon, FileChartColumnIcon, HistoryIcon, ShieldCheckIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const data = {
  user: {
    name: "Admin User",
    email: "admin@testcasecrm.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
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
      title: "Users",
      url: "/dashboard/settings/users",
      icon: <UsersIcon />,
    },
    {
      title: "Settings",
      url: "/dashboard/settings/config",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-primary/20 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 py-6">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_rgba(171,0,255,0.6)] ring-1 ring-white/20">
            <ShieldCheckIcon className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase leading-none text-primary">TC CRM</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Secure Archive</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card/30 backdrop-blur-md">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-primary/20 bg-card/50 backdrop-blur-xl">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
