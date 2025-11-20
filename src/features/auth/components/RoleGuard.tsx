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

  const userRole = user?.rol;

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
