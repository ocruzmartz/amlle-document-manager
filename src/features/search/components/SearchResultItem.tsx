// filepath: src/features/search/components/SearchResultItem.tsx
import { Link } from "react-router";
import { type SearchResult } from "../api/searchService";
import {
  Book,
  File,
  Handshake,
  FileText,
  User,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Mapeo de tipos a iconos
const iconMap: Record<string, LucideIcon> = {
  Book: Book,
  Tome: FileText,
  Act: File,
  Agreement: Handshake,
  Participant: User,
};

export const SearchResultItem = ({ result }: { result: SearchResult }) => {
  const Icon = iconMap[result.type] || HelpCircle;
  const timeAgo = formatDistanceToNow(new Date(result.timestamp), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Link
      to={result.url}
      state={result.state}
      className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary truncate">{result.title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {result.description}
          </p>
        </div>
        <span className="text-xs text-muted-foreground text-right shrink-0">
          {timeAgo}
        </span>
      </div>
    </Link>
  );
};