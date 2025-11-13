import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { searchService, type ApiSearchResponse } from "../api/searchService";
import { Loader2, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { BookSearchResultItem } from "../components/BookSearchResultItem";
import { TomeSearchResultItem } from "../components/TomeSearchResultItem";
import { ActSearchResultItem } from "../components/ActSearchResultItem";
import { AgreementSearchResultItem } from "../components/AgreementSearchResultItem";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [results, setResults] = useState<ApiSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!keyword) {
        setResults(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setResults(null);
      try {
        const searchResults = await searchService.searchUnified({ keyword });
        setResults(searchResults);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error desconocido en la búsqueda"
        );
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [keyword]);

  const totalResults = results
    ? results.books.length +
      results.volumes.length +
      results.minutes.length +
      results.agreements.length
    : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 p-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight">
          Resultados de Búsqueda
        </h1>
        <p className="text-muted-foreground mt-1">
          {isLoading
            ? "Buscando... "
            : `Mostrando ${totalResults} resultados para: `}
          <span className="font-semibold text-primary">{keyword}</span>
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && totalResults === 0 && (
          <div className="flex flex-col h-64 items-center justify-center text-center">
            <SearchIcon className="h-16 w-16 text-muted-foreground/30" />
            <h2 className="mt-4 text-xl font-semibold">
              No se encontraron resultados para{" "}
              <span className="text-primary">{keyword}</span>
            </h2>
            <p className="mt-1 text-muted-foreground">
              Intenta con un término de búsqueda diferente.
            </p>
          </div>
        )}
        {!isLoading && results && totalResults > 0 && (
          <div className="max-w-3xl mx-auto">
            {results.books.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-3">
                  Libros ({results.books.length})
                </h2>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {results.books.map((item) => (
                    <BookSearchResultItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {results.volumes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-3">
                  Tomos ({results.volumes.length})
                </h2>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {results.volumes.map((item) => (
                    <TomeSearchResultItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {results.minutes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-3">
                  Actas ({results.minutes.length})
                </h2>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {results.minutes.map((item) => (
                    <ActSearchResultItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {results.agreements.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-3">
                  Acuerdos ({results.agreements.length})
                </h2>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {results.agreements.map((item) => (
                    <AgreementSearchResultItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
