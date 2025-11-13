// filepath: src/features/search/components/ActSearchResultItem.tsx
import { Link } from "react-router";
import { type Act } from "@/types";
import { Badge } from "@/components/ui/badge";
import { File as ActIcon, Handshake, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const ActSearchResultItem = ({ item }: { item: Act }) => {
  const timeAgo = formatDistanceToNow(
    new Date(item.latestModificationDate || item.createdAt),
    { addSuffix: true, locale: es }
  );
  const modifier = item.latestModifierName || item.createdByName;
  const meetingDate = item.meetingDate
    ? format(parseISO(item.meetingDate), "PPP", { locale: es })
    : "Sin fecha";

  return (
    <Link
      to={`/books/${item.volumeId}`}
      state={{ initialActId: item.id }}
      className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <ActIcon className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              En: {item.volumeName} ({item.bookName}) • Mod. por {modifier} •{" "}
              {timeAgo}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {(item.status ?? "Desconocido").toLowerCase()}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 mt-3 border-t">
        <div className="flex items-center gap-1.5" title="Fecha de Sesión">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{meetingDate}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Acuerdos">
          <Handshake className="h-3.5 w-3.5" />
          <span>{item.agreementCount} Acuerdo(s)</span>
        </div>
      </div>
    </Link>
  );
};
