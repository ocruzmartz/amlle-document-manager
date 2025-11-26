import { Link } from "react-router";
import { type Book, type BookStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Book as BookIcon, FileText, Handshake } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const statusMap: Record<
  BookStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  BORRADOR: { label: "Borrador", variant: "outline" },
  FINALIZADO: { label: "Finalizado", variant: "default" },
  ARCHIVADO: { label: "Archivado", variant: "secondary" },
};

export const BookSearchResultItem = ({ item }: { item: Book }) => {
  const timeAgo = formatDistanceToNow(new Date(item.updatedAt), {
    addSuffix: true,
    locale: es,
  });
  const status = statusMap[item.status] || statusMap.BORRADOR;
  const modifier =
    item.modificationName?.[item.modificationName.length - 1] ||
    item.createdByName;

  return (
    <Link
      to={`/books`}
      className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <BookIcon className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              Modificado por {modifier} • {timeAgo}
            </p>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 mt-3 border-t">
        <div className="flex items-center gap-1.5" title="Tomos">
          <FileText className="h-3.5 w-3.5" />
          <span>{item.volumeCount} Tomo(s)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Actas">
          <FileText className="h-3.5 w-3.5" />
          <span>{item.minutesCount} Acta(s)</span>
        </div>
        <div className="flex items-center gap-1.5" title="Acuerdos">
          <Handshake className="h-3.5 w-3.5" />
          <span>{item.agreementCount} Acuerdo(s)</span>
        </div>
      </div>
    </Link>
  );
};
