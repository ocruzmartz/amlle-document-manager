// 1. Lo que recibe la función login
export interface LoginCredentials {
    username: string;
    password: string; 
}

// 2. Lo que devuelve la API y se almacena en el estado del usuario
export interface UserLogin {
    id: string;
    email: string;
    username: string;
    mustChangePassword: boolean;
    role: 'user' | 'superadmin';
    lastPasswordChangeAt: string // fecha ISO
    token?: string // Lo dejamos opcional ya que no se almacena en el objeto user de React
}

// 3. El estado que se guarda en el contexto
export interface AuthState {
    user: UserLogin | null;
    isAuthenticated: boolean;
}

// 4. La interfaz completa del contexto (incluye el estado y las funciones)
export interface AuthContextProps extends AuthState {
    // ⬇️ CORRECCIÓN: Acepta LoginCredentials y retorna Promise<void>
    login: (credentials: LoginCredentials) => Promise<void>; 
    
    // Logout también debe retornar una promesa ya que llama a apiLogout
    logout: () => Promise<void>;
    
    updateUser: (updatedUser: Partial<UserLogin>) => void;
}