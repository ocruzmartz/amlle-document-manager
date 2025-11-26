import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
  checkUserForActivation,
  setPasswordForUser,
  login,
  getUserById,
} from "../api/auth";
import {
  loginFormSchema,
  activateFormSchema,
  setPasswordFormSchema,
  type LoginFormData,
  type ActivateFormData,
  type SetPasswordFormData,
} from "../schemas/authSchema";
import { jwtDecode } from "jwt-decode";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface JWTPayload {
  sub: string;
  active: boolean;
  iat: number;
  exp: number;
}

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const token = await login(data);

      if (!token || typeof token !== "string") {
        throw new Error("Token inválido recibido del servidor");
      }

      const decodedToken = jwtDecode<JWTPayload>(token);
      const userId = decodedToken.sub;

      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario del token");
      }

      await authLogin(token, userId);
      const user = await getUserById(userId);
      toast.success(`Bienvenido de nuevo, ${user.nombre}`);

      const from = (location.state as LocationState)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("📦 Error response:", error.response?.data);
      console.error("📊 Error status:", error.response?.status);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al iniciar sesión. Verifica tus credenciales.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Escribe tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Contraseña</FormLabel>
              <FormControl>
                <Input
                  placeholder="Escribe tu contraseña"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Iniciar Sesión
        </Button>
      </form>
    </Form>
  );
};

const ActivateFormContent = ({
  onLoading,
  onUserChecked,
  userIdToActivate,
  flowStep,
  onActivationSuccess,
}: {
  onLoading: (status: boolean) => void;
  onUserChecked: (userId: string) => void;
  userIdToActivate: string;
  flowStep: "check" | "set_password";
  onActivationSuccess: () => void;
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const checkForm = useForm<ActivateFormData>({
    resolver: zodResolver(activateFormSchema),
    defaultValues: { nombre: "" },
  });

  const passwordForm = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onCheckUser = async (data: ActivateFormData) => {
    setIsLoading(true);
    onLoading(true);
    try {
      const response = await checkUserForActivation(data);

      if (!response || !response.id) {
        throw new Error("Respuesta inválida del servidor");
      }

      onUserChecked(response.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al verificar el usuario"
      );
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  const onSetPassword = async (data: SetPasswordFormData) => {
    if (!userIdToActivate) {
      toast.error("Error: No se encontró el ID del usuario");
      return;
    }

    setIsLoading(true);
    onLoading(true);
    try {
      await setPasswordForUser(userIdToActivate, data.password);

      toast.success("Contraseña establecida correctamente.", {
        description: "Por favor, inicia sesión con tu nueva contraseña.",
      });
      onActivationSuccess();

      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al establecer la contraseña"
      );
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  if (flowStep === "set_password") {
    return (
      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onSetPassword)}
          className="space-y-4"
        >
          <p className="text-sm font-medium text-center">
            Activando cuenta para{" "}
            <span className="font-semibold text-destructive">
              {checkForm.getValues("nombre")}
            </span>
          </p>
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Nueva Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Confirmar Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-xs text-muted-foreground mb-4">
            Antes de continuar, por favor establece una nueva contraseña para tu
            cuenta.
          </p>
          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activar Cuenta
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...checkForm}>
      <form
        onSubmit={checkForm.handleSubmit(onCheckUser)}
        className="space-y-4"
      >
        <FormField
          control={checkForm.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Escribe tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Ingresa tu nombre de usuario para configurar tu cuenta.
        </p>
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verificar Usuario
        </Button>
      </form>
    </Form>
  );
};

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "activate">("login");
  const [activationStep, setActivationStep] = useState<
    "check" | "set_password"
  >("check");
  const [userIdForSetPassword, setUserIdForSetPassword] = useState("");

  useEffect(() => {
    setActivationStep("check");
    setUserIdForSetPassword("");
    setActiveTab("login");
  }, []);

  const handleUserCheckedInActivate = (userId: string) => {
    setUserIdForSetPassword(userId);
    setActivationStep("set_password");
    setActiveTab("activate");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "login" | "activate");
    if (value === "login") {
      setActivationStep("check");
      setUserIdForSetPassword("");
    }
  };

  const handleActivationSuccess = () => {
    setActiveTab("login");
    setActivationStep("check");
    setUserIdForSetPassword("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-[#ff3586] p-8">
        <img
          src="https://lalibertadeste.gob.sv/images/logo/escudo-alcaldia_white.png"
          alt="Escudo de la Alcaldía La Libertad Este"
          className="max-h-[60%] max-w-[60%] object-contain drop-shadow-md"
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm rounded-lg border bg-card text-card-foreground shadow-xl">
          <div className="flex flex-col space-y-1.5 p-6 pb-4 text-center">
            <h2 className="font-semibold tracking-tight text-2xl">
              Sistema de Gestión
            </h2>
            <p className="text-muted-foreground text-sm">
              Accede a tu cuenta o activa una nueva.
            </p>
          </div>

          <div className="p-6 pt-0">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 ">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="activate">Activar Cuenta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="pt-2">
                <LoginForm />
              </TabsContent>

              <TabsContent value="activate" className="pt-2">
                <ActivateFormContent
                  onLoading={() => {}}
                  onUserChecked={handleUserCheckedInActivate}
                  userIdToActivate={userIdForSetPassword}
                  flowStep={activationStep}
                  onActivationSuccess={handleActivationSuccess}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
