import * as React from "react"
import {
  AudioWaveform,
  Command,
  MessageCircleQuestion,
} from "lucide-react"

import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import DeakinLogo from "/logo.png"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HelpModal } from "./HelpModal"

const data = {
  teams: [
    {
      name: "Deakin AI Tutor",
      logo: DeakinLogo,
      isImage: true,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navSecondary: [
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
      onClick: "help", // Custom flag
    },
  ],
  favorites: [],
  workspaces: [
    {
      name: "Help Desk",
      emoji: "🎨",
      url: "#",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isHelpModalOpen, setHelpModalOpen] = React.useState(false)

  const handleNavSecondaryClick = (item: any) => {
    if (item.onClick === "help") {
      setHelpModalOpen(true)
    }
  }

  return (
    <>
      <Sidebar className="border-r-0" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavSecondary
            items={data.navSecondary}
            className="mt-auto"
            onItemClick={handleNavSecondaryClick}
          />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  )
}
