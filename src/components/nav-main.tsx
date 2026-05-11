"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isParentActive =
              item.url !== "#" && (item.url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.url))
            const hasActiveChild = item.items?.some((sub) =>
              pathname === sub.url
            )

            return (
              <React.Fragment key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isParentActive || hasActiveChild}
                    className={`transition-all duration-300 ${
                      isParentActive || hasActiveChild 
                        ? "bg-primary/10 text-primary border-l-2 border-primary pl-3" 
                        : "hover:bg-primary/5 hover:text-primary/70"
                    }`}
                  >
                    <a href={item.url}>
                      <span className={isParentActive || hasActiveChild ? "text-primary drop-shadow-[0_0_8px_rgba(171,0,255,0.5)]" : ""}>
                        {item.icon}
                      </span>
                      <span className="font-bold tracking-tight">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {item.items && (
                  <div className="ml-6 flex flex-col gap-0.5 border-l border-primary/10 pl-2">
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url
                      return (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton 
                            asChild 
                            size="sm" 
                            isActive={isSubActive}
                            className={`transition-all ${
                              isSubActive 
                                ? "text-primary font-bold bg-primary/5" 
                                : "text-muted-foreground hover:text-primary/70"
                            }`}
                          >
                            <a href={subItem.url}>
                              <span className={isSubActive ? "drop-shadow-[0_0_5px_rgba(171,0,255,0.3)]" : ""}>
                                {subItem.title}
                              </span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
