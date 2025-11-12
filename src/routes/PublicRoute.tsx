import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/features/auth/context/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

export const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};