import DashboardLayout from "@/components/layout/DashboardLayout";
import { createBrowserRouter, type RouteObject } from "react-router";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { loginRoutes } from "@/features/auth/routes";
import { auditRoutes } from "@/features/audit/routes";
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
    ...auditRoutes
  ],
};

const publicRoutes: RouteObject[] = [
  ...loginRoutes,
];

export const router = createBrowserRouter([
  shellRoute,
  ...booksWorkspaceRoutes,
  ...publicRoutes, 
]);

/*const shellRoute: RouteObject = {
  // Usar ProtectedRoutes para envolver las rutas privadas.
  element: <ProtectedRoutes />, 

  children: [
    // El DashboardLayout se convierte en el hijo de ProtectedRoutes
    {
        path: "/", // La ruta principal después del login
        element: <DashboardLayout />, 
        children: [
            ...dashboardRoutes,
            ...booksRoutes, 
            ...auditRoutes
        ],
    },
  ],
};*/

