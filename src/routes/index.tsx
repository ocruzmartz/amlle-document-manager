import DashboardLayout from "@/components/layout/DashboardLayout";
import { createBrowserRouter, type RouteObject } from "react-router";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { booksRoutes, booksWorkspaceRoutes } from "@/features/book/routes";
import { actRoutes } from "@/features/act/routes";
import { agreementRoutes } from "@/features/agreement/routes";
import { auditRoutes } from "@/features/audit/routes";
import { userRoutes } from "@/features/user/routes";

const shellRoute: RouteObject = {
  element: <DashboardLayout />,
  children: [
    ...dashboardRoutes,
    ...booksRoutes,
    ...actRoutes,
    ...agreementRoutes,
    ...auditRoutes,
    ...userRoutes,
  ],
};

export const router = createBrowserRouter([
  shellRoute,
  ...booksWorkspaceRoutes,
]);
