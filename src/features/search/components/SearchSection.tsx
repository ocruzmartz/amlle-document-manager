// filepath: src/features/search/components/SearchSection.tsx
import { type SearchResult } from "../api/searchService";
import { SearchResultItem } from "./SearchResultItem";
import { Separator } from "@/components/ui/separator";

interface SearchSectionProps {
  title: string;
  results: SearchResult[];
}

export const SearchSection = ({ title, results }: SearchSectionProps) => {
  // No renderizar nada si esta sección no tiene resultados
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* Título de la sección */}
      <h2 className="text-xl font-semibold tracking-tight mb-3">
        {title}
        <span className="ml-2 text-base font-normal text-muted-foreground">
          ({results.length})
        </span>
      </h2>
      <Separator className="mb-4" />
      
      {/* Lista de items */}
      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultItem key={result.id} result={result} />
        ))}
      </div>
    </section>
  );
};