import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import ActivityItem from "./ActivityItem";
import { type ActivityLog } from "@/types";

interface ActivityCardProps {
  logs: ActivityLog[];
  title?: string;
  description?: string;
}

export function ActivityCard({
  logs,
  title = "Actividad Reciente",
  description = "Las últimas acciones realizadas en el sistema.",
}: ActivityCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-1">
            {logs.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay actividad reciente para mostrar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
