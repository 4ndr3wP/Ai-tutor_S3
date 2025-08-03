import React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  onItemClick, // Add onItemClick handler as a prop
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: React.ReactNode
    onClick?: string // Optional action flag for custom behavior
  }[]
  onItemClick?: (item: any) => void // Handle click behavior
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {

  const handleItemClick = (item: any) => {
    if (onItemClick) {
      onItemClick(item); // Trigger the passed function when an item is clicked
    }
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a 
                  href={item.url} 
                  onClick={(e) => {
                    e.preventDefault() // Prevent default anchor behavior
                    handleItemClick(item) // Handle custom click action
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
