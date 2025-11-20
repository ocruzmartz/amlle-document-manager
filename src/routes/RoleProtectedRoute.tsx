import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/types";
import { Lock } from "lucide-react";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute = ({
  allowedRoles,
}: RoleProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = user.rol;

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center text-center pb-32 min-h-screen bg-background">
        <Lock className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-3 text-foreground">
          Acceso Denegado
        </h2>
        <p className="text-base text-muted-foreground max-w-md">
          No tienes permisos para ver esta página.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
