// filepath: src/features/search/components/TomeSearchResultItem.tsx
import { Link } from "react-router";
import { type Tome, type BookStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { FileText as TomeIcon, FileText, Handshake } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { numberToRoman } from "@/lib/textUtils";

const statusMap: Record<BookStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  BORRADOR: { label: "Borrador", variant: "outline" },
  FINALIZADO: { label: "Finalizado", variant: "default" },
  ARCHIVADO: { label: "Archivado", variant: "secondary" },
};

export const TomeSearchResultItem = ({ item }: { item: Tome }) => {
  const timeAgo = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true, locale: es });
  const status = statusMap[item.status] || statusMap.BORRADOR;
  const modifier = item.modificationName?.[item.modificationName.length - 1] || item.createdByName;
  const tomeName = item.name || `Tomo ${numberToRoman(item.number)}`;
  const minutesCount = item.minutesIds?.length || 0;

  return (
    <Link to={`/books/${item.id}`} state={{ initialActId: null }} className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <TomeIcon className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary truncate">{tomeName}</h3>
            <p className="text-sm text-muted-foreground">
              En: {item.bookName} • Mod. por {modifier} • {timeAgo}
            </p>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 mt-3 border-t">
        <div className="flex items-center gap-1.5" title="Actas">
          <FileText className="h-3.5 w-3.5" />
          <span>{minutesCount} Acta(s)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Acuerdos">
          <Handshake className="h-3.5 w-3.5" />
          <span>{item.agreementCount} Acuerdo(s)</span>
        </div>
      </div>
    </Link>
  );
};