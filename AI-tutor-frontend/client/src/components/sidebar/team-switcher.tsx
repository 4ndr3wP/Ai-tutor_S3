import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: string | React.ElementType // <-- update type to support string (image) or icon
    plan: string
  }[]
}) {
  const activeTeam = teams.find((team) => team.name === "Deakin AI Tutor")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {activeTeam && (
          <SidebarMenuButton className="w-fit px-1.5">
            <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              {typeof activeTeam.logo === "string" ? (
                <img
                  src={activeTeam.logo}
                  alt={activeTeam.name}
                  className="size-4"
                />
              ) : (
                <activeTeam.logo className="size-4" />
              )}
            </div>
            <span className="truncate font-semibold">{activeTeam.name}</span>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
