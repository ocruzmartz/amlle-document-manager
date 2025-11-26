import { Link } from "react-router";
import { type ActivityLog, type LogAction } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  PenSquare,
  PlusCircle,
  CheckCircle2,
  Trash2,
  FileDown,
  HelpCircle,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const actionIconMap: Record<string, LucideIcon> = {
  CREATED: PlusCircle,
  UPDATED: PenSquare,
  FINALIZED: CheckCircle2,
  DELETED: Trash2,
  EXPORTED: FileDown,
};

const actionTextMap: Record<string, string> = {
  CREATED: "creó",
  UPDATED: "modificó",
  FINALIZED: "finalizó",
  DELETED: "eliminó",
  EXPORTED: "exportó",
};

interface ActivityItemProps {
  log: ActivityLog;
  isLastItem: boolean;
}

const ActivityItem = ({ log, isLastItem }: ActivityItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(log.timestamp), {
    addSuffix: true,
    locale: es,
  });

  const Icon = actionIconMap[log.action as LogAction] || HelpCircle;
  const actionText =
    actionTextMap[log.action as LogAction] || log.action.toLowerCase();

  return (
    <div className={cn("relative flex gap-4 pb-4", isLastItem && "pb-0")}>
      {!isLastItem && (
        <div className="absolute left-2 top-1 h-full w-px bg-border -translate-x-1/2" />
      )}

      <div className="relative z-10">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-background p-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 min-w-0 -mt-0.5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{log.user.nombre}</span>{" "}
          {actionText}{" "}
          <Link
            to={log.target.url}
            state={log.target.state}
            className="font-medium text-primary hover:underline"
          >
            "{log.target.name}"
          </Link>
        </p>
        <p className="text-xs text-muted-foreground/80">{timeAgo}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
