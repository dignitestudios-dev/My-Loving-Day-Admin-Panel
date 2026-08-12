"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Heart,
  CalendarClock,
  BookHeart,
  Library,
  Bell,
  BarChart3,
  ShieldAlert,
  Settings,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navGroups: [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
        // {
        //   title: "Inactive Users",
        //   url: "/dashboard/users/inactive",
        //   icon: UserX,
        // },
        {
          title: "Memories",
          url: "/dashboard/memories",
          icon: Heart,
        },
        {
          title: "Scheduled Deliveries",
          url: "/dashboard/scheduled-deliveries",
          icon: CalendarClock,
        },
        {
          title: "Memorial Preferences",
          url: "/dashboard/memorial-preferences",
          icon: BookHeart,
        },
        {
          title: "Resources",
          url: "/dashboard/resources",
          icon: Library,
        },
      ],
    },
    {
      label: "Engagement",
      items: [
        {
          title: "Notifications",
          url: "/dashboard/notifications",
          icon: Bell,
        },
        {
          title: "Reports & Analytics",
          url: "/dashboard/reports",
          icon: BarChart3,
        },
        {
          title: "Content Moderation",
          url: "/dashboard/moderation",
          icon: ShieldAlert,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: RootState) => state.auth.user);

  const userData = user
    ? {
      name: user.name,
      email: user.email,
      avatar: "",
    }
    : {
      name: "Guest",
      email: "",
      avatar: "",
    };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <Logo size={28} />
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-medium">My Loving Day</span>
                  <span className="truncate text-[10px] text-sidebar-foreground/70">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
