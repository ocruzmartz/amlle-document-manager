import { type RouteObject } from "react-router";
import AuditPage from "./pages/auditPage";

export const auditRoutes: RouteObject[] = [
  {
    path: "/audit",
    element: <AuditPage />,
  }
];
