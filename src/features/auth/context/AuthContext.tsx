import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@/types";
import { getUserById } from "../api/auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userId: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUser(null);
    toast.info("Sesión cerrada correctamente");
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUserId = localStorage.getItem("userId");

        if (!storedToken || !storedUserId) {
          setIsLoading(false);
          return;
        }

        if (isTokenExpired(storedToken)) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setIsLoading(false);
          return;
        }

        const userData = await getUserById(storedUserId);

        setToken(storedToken);
        setUser(userData);
      } catch (error: any) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setToken(null);
        setUser(null);

        const errorMsg = error.response?.data?.message || "Sesión expirada";
        console.warn(`⚠️ ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!token) return;

    const checkExpiration = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
      }
    }, 30000);

    return () => clearInterval(checkExpiration);
  }, [token, logout]);

  const login = async (newToken: string, userId: string) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setToken(null);
      setUser(null);

      await new Promise((resolve) => setTimeout(resolve, 0));

      localStorage.setItem("token", newToken);
      localStorage.setItem("userId", userId);
      setToken(newToken);

      const userData = await getUserById(userId);
      setUser(userData);
    } catch (error: any) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setToken(null);
      setUser(null);

      throw error;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
