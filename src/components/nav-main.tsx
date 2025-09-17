// src/components/nav-main.tsx
"use client";

import { NavLink, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// 1. Importa los ITEMS específicos que necesita
import { mainNavItems } from "@/config/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// 2. El componente ya no necesita recibir props
export function NavMain() {
  const location = useLocation();

  return (
    <SidebarGroup>
      {/* 3. El título del grupo está definido directamente aquí */}
      <SidebarGroupLabel>Principal</SidebarGroupLabel>
      <SidebarMenu>
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end
                  className={cn(
                    buttonVariants({
                      variant: isActive ? "default" : "ghost",
                      size: "sm",
                    }),
                    isActive && "pointer-events-none",
                    "w-full justify-start gap-2 font-normal"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
