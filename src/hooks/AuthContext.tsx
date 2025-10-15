import type { AuthContextProps, UserLogin, LoginCredentials } from "@/types/authContext";
import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { isPasswordExpired } from "@/features/auth/lib/authUtils";
import { apiLogin, apiLogout } from "@/features/auth/lib/authService"; 

const AuthContext = createContext<AuthContextProps | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // Inicializamos el estado leyendo de localStorage (Persistencia)
    const [user, setUser] = useState<UserLogin | null>(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem("token"); // Si existe un token, se considera autenticado
    });
    
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });
    
    // Implementación de la función login 
    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            // 1. Llama a la lógica de la API (apiLogin espera LoginCredentials)
            const userData = await apiLogin(credentials);

            // 2. Lógica de expiración
            const mustChange = userData.mustChangePassword || isPasswordExpired(userData.lastPasswordChangeAt);
            
            const userStateData: UserLogin = { ...userData, mustChangePassword: mustChange };

            // 3. Guardar en localStorage
            localStorage.setItem("token", userData.token || "");
            localStorage.setItem("user", JSON.stringify(userStateData));
            
            // 4. Actualiza el estado de React
            setUser(userStateData);
            setIsAuthenticated(true);
            setToken(userData.token || null);
            
        } catch (error) {
            console.error("Error en el login:", error);
            // ➡️ Propagar el error para que el LoginForm lo capture y lo muestre
            throw error; 
        }
    }

    const logout = async (): Promise<void> => {
        try {
            await apiLogout(); 
        } catch (error) {
            console.error("Error al cerrar sesión en el backend, limpiando estado local:", error);
        } finally {
            // Limpiar localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Resetea el estado de React
            setUser(null);
            setIsAuthenticated(false);
            setToken(null);
        }
    }

    const updateUser = (updatedUser: Partial<UserLogin>) => {
        if (!user) return
        
        const newUser: UserLogin = { ...user, ...updatedUser };

        // Actualizar también en localStorage
        localStorage.setItem("user", JSON.stringify(newUser));

        setUser(newUser)
    }

    const contextValue: AuthContextProps = {
        user,
        isAuthenticated,
        login,
        logout,
        updateUser
    };
    
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};