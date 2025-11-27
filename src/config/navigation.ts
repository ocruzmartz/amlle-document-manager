import { Home, Book, File, Logs, Users, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Libros",
    url: "/books",
    icon: Book,
  },
  {
    title: "Actas",
    url: "/acts",
    icon: File,
  },
  {
    title: "Acuerdos",
    url: "/agreements",
    icon: FileText,
  },
];

export const adminNavItems: NavItem[] = [
  {
    title: "Usuarios",
    url: "/users",
    icon: Users,
  },
  {
    title: "Gestión del Concejo",
    url: "/council",
    icon: Users,
  },
  {
    title: "Auditoría",
    url: "/audit",
    icon: Logs,
  },
];
