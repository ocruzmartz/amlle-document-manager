import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "@/routes/index.tsx";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import { AuthProvider } from "./features/auth/context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </AuthProvider>
  </StrictMode>
);
