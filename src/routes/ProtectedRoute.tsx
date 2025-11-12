import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/features/auth/context/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};