import DashboardLayout from "@/components/layout/DashboardLayout";
import { createBrowserRouter, type RouteObject } from "react-router";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { booksRoutes } from "@/features/books/routes";

const shellRoute: RouteObject = {
  element: <DashboardLayout />,

  //TODO: Hacer más tarde
  children: [...dashboardRoutes,
    ...booksRoutes
  ],
};

export const router = createBrowserRouter([shellRoute]);
