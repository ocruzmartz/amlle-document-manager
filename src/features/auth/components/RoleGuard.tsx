// filepath: src/features/auth/components/RoleGuard.tsx
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) => {
  const { user } = useAuth();

  // ✅ INICIO DE LA MODIFICACIÓN
  const userRole = user?.rol;
  const effectiveRole = userRole === "regular" ? "admin" : userRole;

  if (!user || !effectiveRole || !allowedRoles.includes(effectiveRole)) {
  // ✅ FIN DE LA MODIFICACIÓN
    return <>{fallback}</>;
  }

  return <>{children}</>;
};