import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { UserRole } from "@/types";

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

  // 2. Aplicamos la regla de "elevación": si es 'regular', trátalo como 'admin'
  const effectiveRole = userRole === "regular" ? "admin" : userRole;

  // 3. Verificamos los permisos usando el rol "efectivo"
  if (!allowedRoles.includes(effectiveRole)) {
    // ✅ FIN DE LA MODIFICACIÓN
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acceso Denegado</h1>
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta página (Rol: {user.rol})
        </p>
      </div>
    );
  }

  return <Outlet />;
};
