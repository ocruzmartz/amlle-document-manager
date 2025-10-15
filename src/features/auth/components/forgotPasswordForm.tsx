import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { apiForgotPassword } from "@/features/auth/lib/authService" 

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      // Usamos la función de servicio
      await apiForgotPassword(email)

      // Mensaje de éxito (usando el texto estándar de seguridad)
      setMessage("Si tu correo existe, recibirás un enlace para restablecer la contraseña.")
    } catch (err: any) {
      // Captura el error propagado desde el servicio
      setError(err.message)
      // Nota de seguridad: Si quieres evitar dar pistas sobre correos existentes,
      // puedes mostrar un mensaje genérico aquí también:
      // setMessage("Si tu correo existe, recibirás un enlace para restablecer la contraseña.")
    } finally {
      setLoading(false)
      // Opcional: Limpiar el campo de email después de un intento
      // setEmail("") 
    }
  }

  return (
    <div className={cn("flex items-center justify-center min-h-screen", className)} {...props}>
      <form className="flex flex-col gap-6 w-full max-w-sm p-6 rounded-2xl shadow-md border bg-card" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold text-center">Olvidé mi contraseña</h1>

        <div className="grid gap-3">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
        </Button>
      </form>
    </div>
  )
}