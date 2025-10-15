import DashboardLayout from "@/components/layout/DashboardLayout";
import { createBrowserRouter, type RouteObject } from "react-router";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { booksRoutes } from "@/features/books/routes";
import { loginRoutes } from "@/features/auth/routes";
import { auditRoutes } from "@/features/audit/routes";

const shellRoute: RouteObject = {
  element: <DashboardLayout />,

  //TODO: Hacer más tarde
  children: [...dashboardRoutes,
    ...booksRoutes, ...auditRoutes
  ],
};

const publicRoutes: RouteObject[] = [
  ...loginRoutes,
];

export const router = createBrowserRouter([...publicRoutes, shellRoute]);


/*const shellRoute: RouteObject = {
  // Usar ProtectedRoutes para envolver las rutas privadas.
  element: <ProtectedRoutes />, 

  children: [
    // ⬇️ El DashboardLayout se convierte en el hijo de ProtectedRoutes
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