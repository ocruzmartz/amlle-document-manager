// filepath: src/features/search/components/AgreementSearchResultItem.tsx
import { Link } from "react-router";
import { type Agreement } from "@/types";
import { Handshake as AgreementIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const AgreementSearchResultItem = ({ item }: { item: Agreement }) => {
  const timeAgo = formatDistanceToNow(new Date(item.latestModificationDate || item.createdAt), { addSuffix: true, locale: es });
  const modifier = item.latestModifierName || item.createdByName;
  
  // Extraer un snippet del contenido
  const snippet = item.content.replace(/<[^>]+>/g, ' ').substring(0, 100) + "...";

  return (
    <Link 
      to={`/books/${item.volumeId}`} 
      state={{
        initialActId: item.minutesId,
        initialDetailView: { type: "agreement-editor", agreementId: item.id }
      }}
      className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <AgreementIcon className="h-5 w-5 text-primary" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary truncate">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            En: {item.minutesName} ({item.volumeName})
          </p>
          <p className="text-sm text-muted-foreground italic mt-1 truncate">
            "{snippet}"
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end text-xs text-muted-foreground pt-3 mt-3 border-t">
        <span>Mod. por {modifier} • {timeAgo}</span>
      </div>
    </Link>
  );
};