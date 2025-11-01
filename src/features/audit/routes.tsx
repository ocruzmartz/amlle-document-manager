import { type RouteObject } from "react-router";
import { AuditLogListPage } from "./pages/AuditLogListPage";

export const auditRoutes: RouteObject[] = [
  {
    path: "/audit",
    element: <AuditLogListPage />,
  },
];
