import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import ActivityItem from "./ActivityItem";
import { type ActivityLog } from "@/types";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ActivityCardProps {
  logs: ActivityLog[];
  title?: string;
  description?: string;
}

export function ActivityCard({ logs }: ActivityCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema.
          </CardDescription>
        </div>
        <Link to="/activities">
          <Button variant="link">
            <ExternalLink className="size-4" /> Ver más
          </Button>
        </Link>
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
