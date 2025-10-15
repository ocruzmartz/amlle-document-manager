import type { RouteObject } from "react-router";
import LoginPage from "./pages/loginPage";
import ChangePasswordPage  from "./pages/changePasswordPage";
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/AuthContext";
import ForgotPasswordPage from "./pages/forgotPasswordPage";

export function ProtectedRoutes() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" />

  if (user?.mustChangePassword) return <Navigate to="/change-password" />

  return <Outlet />
}

export const loginRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/change-password",
    element: <ChangePasswordPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  }
];

