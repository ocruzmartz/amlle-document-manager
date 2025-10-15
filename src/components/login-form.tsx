import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/AuthContext"; 

interface InputState {
  username: string;
  password: string;
}

interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}
interface HandleInputEvent extends React.ChangeEvent<HTMLInputElement> {}

export const LoginForm = ({ className, ...props }: { className?: string }) => {
  
  // ⬇️ 1. DECLARACIÓN DE HOOKS Y ESTADO EN EL CUERPO DEL COMPONENTE 
  const [input, setInput] = useState<InputState>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⬇️ 2. LLAMADA A HOOKS DE TERCEROS EN EL CUERPO DEL COMPONENTE 
  const { login } = useAuth(); // Hook de Contexto
  const navigate = useNavigate(); // Hook de Navegación

  const handleSubmitEvent = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    if (input.username !== "" && input.password !== "") {
      setLoading(true);
      try {
        // La función 'login' se llama aquí, usando 'input' (que es LoginCredentials),
        await login(input); 
        
        // Si el login es exitoso y no necesita cambio de contraseña, navega a la raíz.
        navigate("/"); 

      } catch (err: any) {
        console.error("Error al iniciar sesión:", err.message);
        setError(err.message || "Error desconocido al iniciar sesión");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Por favor, completa todos los campos.");
    }
  };

  const handleInput = (e: HandleInputEvent): void => {
    const { name, value } = e.target;
    setInput((prev): InputState => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}
    onSubmit={handleSubmitEvent}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="username">Email</Label>
          <Input id="username" 
            name="username" 
            type="text" 
            placeholder="userexam" 
            required 
            onChange={handleInput}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              contact support
            </Link>
          </div>
          <Input id="password" 
            name="password" 
            type="password" 
            required 
            onChange={handleInput}
            />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
      </div>
    </form>
  )
}