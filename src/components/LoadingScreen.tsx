import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
    </div>
  );
};