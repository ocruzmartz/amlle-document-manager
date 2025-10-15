export interface LoginCredentials {
    username: string;
    password: string; 
}

export interface UserLogin {
    id: string;
    email: string;
    username: string;
    mustChangePassword: boolean;
    role: 'user' | 'superadmin';
    lastPasswordChangeAt: string // fecha ISO
    token?: string 
}

export interface AuthState {
    user: UserLogin | null;
    isAuthenticated: boolean;
}

export interface AuthContextProps extends AuthState {
    // Acepta LoginCredentials y retorna Promise<void>
    login: (credentials: LoginCredentials) => Promise<void>; 
    
    // Logout también debe retornar una promesa ya que llama a apiLogout
    logout: () => Promise<void>;
    
    updateUser: (updatedUser: Partial<UserLogin>) => void;
}