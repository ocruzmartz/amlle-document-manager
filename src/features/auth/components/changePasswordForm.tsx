import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAuth } from "@/hooks/AuthContext"
import { useNavigate } from "react-router-dom"
import { apiChangePassword } from "@/features/auth/lib/authService" 

export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { updateUser, user } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!user?.token) {
        setError("Error de autenticación. Por favor, inicia sesión de nuevo.")
        // Opcional: navigate("/login")
        return
    }

    setLoading(true)
    setError("")

    try {
      // USAMOS EL SERVICIO CENTRALIZADO
      await apiChangePassword(
        { currentPassword, newPassword },
        user.token // Pasar el token para la autorización
      )

      // Lógica de éxito: Actualiza el estado local del contexto
      updateUser({
        mustChangePassword: false,
        // Usa la fecha de la API si la devuelve, si no, usa la local
        lastPasswordChangeAt: new Date().toISOString(), 
      })

      // Redirige a la ruta principal
      navigate("/") 
    } catch (err: any) {
      // ⬇️ Captura el error propagado por apiChangePassword
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen bg-background",
        className
      )}
      {...props}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-sm p-6 rounded-2xl shadow-md border bg-card"
      >
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold">Cambiar contraseña</h1>
          <p className="text-sm text-muted-foreground text-center">
            Por seguridad, debes actualizar tu contraseña.
          </p>
        </div>

        {/* El resto del formulario HTML permanece igual */}
        <div className="grid gap-3">
          <Label htmlFor="current">Contraseña actual</Label>
          <Input
            id="current"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="new">Nueva contraseña</Label>
          <Input
            id="new"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8} // Recomendación de seguridad
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirm">Confirmar contraseña</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8} // Recomendación de seguridad
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || newPassword.length < 8} // Deshabilitar si está cargando o la nueva es muy corta
        >
          {loading ? "Actualizando..." : "Guardar nueva contraseña"}
        </Button>
      </form>
    </div>
  )
}