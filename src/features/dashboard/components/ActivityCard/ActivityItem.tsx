import { Link } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type ActivityLog } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const actionToVerb: Record<ActivityLog["action"], string> = {
  CREATED: "creó",
  UPDATED: "modificó",
  DELETED: "eliminó",
  EXPORTED: "exportó",
  FINALIZED: "finalizó",
};

const ActivityItem = ({ log }: { log: ActivityLog }) => {
  const timeAgo = formatDistanceToNow(new Date(log.timestamp), {
    addSuffix: true,
    locale: es,
  });
  const fullDate = format(
    new Date(log.timestamp),
    "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
    { locale: es }
  );

  const userInitials = `${log.user.firstName.charAt(
    0
  )}${log.user.lastName.charAt(0)}`;

  return (
    <div className="flex items-center gap-4 hover:bg-muted/50 p-3 rounded-lg cursor-pointer">
      <Avatar className="h-9 w-9 border">
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">
              {log.user.firstName} {log.user.lastName}
            </span>{" "}
            {actionToVerb[log.action] || "realizó una acción"}{" "}
            {log.target && (
              <>
                {"el "}
                {log.target.type}{" "}
                <Link
                  to={log.target.url}
                  className="font-semibold text-primary hover:underline"
                >
                  "{log.target.name}"
                </Link>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground/80 cursor-help">
            {timeAgo}
          </p>
        </div>

        <div className="hidden sm:block">
          <Badge variant="secondary">{fullDate}</Badge>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
