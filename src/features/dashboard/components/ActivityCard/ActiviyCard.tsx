import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"; // ✅ CardFooter eliminado
import ActivityItem from "./ActivityItem";
import { type ActivityLog } from "@/types";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react"; // ✅ Icono importado

interface ActivityCardProps {
  logs: ActivityLog[];
}

export function ActivityCard({ logs }: ActivityCardProps) {
  // Solo mostramos las 4 actividades más recientes
  const recentLogs = logs.slice(0, 4);

  return (
    <Card className="shadow-none">
      {/* ✅ 1. Cabecera IDÉNTICA a la de Libros Recientes */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones en el sistema.
          </CardDescription>
        </div>
        <Button asChild variant="link" className="text-muted-foreground">
          <Link to="/audit">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      
      {/* ✅ 2. Contenido de la timeline */}
      <CardContent>
        {recentLogs.length > 0 ? (
          <div className="relative flex flex-col gap-4">
            {recentLogs.map((log, index) => (
              <ActivityItem
                key={log.id}
                log={log}
                isLastItem={index === recentLogs.length - 1}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay actividad reciente para mostrar.
          </p>
        )}
      </CardContent>
      
      {/* ✅ 3. CardFooter ELIMINADO */}
    </Card>
  );
}