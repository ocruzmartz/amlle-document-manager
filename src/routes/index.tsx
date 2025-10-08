import DashboardLayout from "@/components/layout/DashboardLayout";
import { createBrowserRouter, type RouteObject } from "react-router";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { booksRoutes, booksWorkspaceRoutes } from "@/features/book/routes";
import { actRoutes } from "@/features/act/routes";
import { agreementRoutes } from "@/features/agreement/routes";

const shellRoute: RouteObject = {
  element: <DashboardLayout />,
  children: [
    ...dashboardRoutes,
    ...booksRoutes,
    ...actRoutes,
    ...agreementRoutes,
  ],
};

export const router = createBrowserRouter([
  shellRoute,
  ...booksWorkspaceRoutes,
]);
