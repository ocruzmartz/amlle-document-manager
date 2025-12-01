import { type CouncilMember, type Tome } from "@/types";
import { BookPdfRenderer } from "./BookPdfRenderer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface BookPdfPreviewProps {
  tome: Tome;
  allSigners: CouncilMember[];
  targetActId?: string | null;
  initialPageNumber?: number;
}

export const BookPdfPreview = ({
  tome,
  allSigners,
  targetActId,
  initialPageNumber = 1,
}: BookPdfPreviewProps) => {
  return (
    <section className="flex flex-col h-full bg-muted/40 min-w-[700px]">
      <div className="flex-1 overflow-hidden relative">
        <ErrorBoundary
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-50 text-red-500">
              Error al generar la vista previa.
            </div>
          }
        >
          <BookPdfRenderer
            tome={tome}
            allSigners={allSigners}
            targetActId={targetActId}
            initialPageNumber={initialPageNumber}
          />
        </ErrorBoundary>
      </div>
    </section>
  );
};
