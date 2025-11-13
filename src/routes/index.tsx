import DashboardLayout from "@/components/layout/DashboardLayout";
import { createBrowserRouter, type RouteObject } from "react-router";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { booksRoutes, booksWorkspaceRoutes } from "@/features/book/routes";
import { actRoutes } from "@/features/act/routes";
import { agreementRoutes } from "@/features/agreement/routes";
import { auditRoutes } from "@/features/audit/routes";
import { userRoutes } from "@/features/user/routes";
import { authRoutes } from "@/features/auth/routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleProtectedRoute } from "./RoleProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { searchRoutes } from "@/features/search/routes";

// Rutas protegidas - Solo usuarios autenticados
const protectedShellRoute: RouteObject = {
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        // Dashboard: Todos pueden ver
        ...dashboardRoutes,
        ...searchRoutes,

        // Todas las funcionalidades: Solo Admin
        {
          element: <RoleProtectedRoute allowedRoles={["admin", "regular"]} />,
          children: [
            ...booksRoutes,
            ...actRoutes,
            ...agreementRoutes,
            ...auditRoutes,
            ...userRoutes,
          ],
        },
      ],
    },
    // Workspace de libros: Solo Admin
    {
      element: <RoleProtectedRoute allowedRoles={["admin", "regular"]} />,
      children: booksWorkspaceRoutes,
    },
  ],
};

export const router = createBrowserRouter([
  protectedShellRoute,
  // Rutas públicas - desenvueltas directamente
  {
    element: <PublicRoute />,
    children: authRoutes,
  },
]);
