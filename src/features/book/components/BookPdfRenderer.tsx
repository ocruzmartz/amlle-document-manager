import React, { useState, useEffect } from "react";
import { type CouncilMember, type Tome } from "@/types";

interface BookPdfRendererProps {
  tome: Tome;
  allSigners: CouncilMember[];
  currentPageIndex?: number;
}

const PDFPreview = React.lazy(async () => {
  try {
    const { PDFViewer } = await import("@react-pdf/renderer");
    const { BookPdfDocument } = await import("./BookPdfDocument");

    return {
      default: ({
        tome,
        allSigners,
      }: {
        tome: Tome;
        allSigners: CouncilMember[];
      }) => (
        <PDFViewer
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          showToolbar={true}
        >
          <BookPdfDocument tome={tome} allSigners={allSigners} />
        </PDFViewer>
      ),
    };
  } catch (error) {
    console.error("Error loading PDF components:", error);

    return {
      default: ({ tome }: { tome: Tome }) => (
        <div className="flex items-center justify-center h-full bg-gray-50 border rounded-lg">
          <div className="text-center p-8">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold">
                Error en la vista previa PDF
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              No se pudo cargar el visor de PDF. Aquí tienes la información del
              libro:
            </p>
            <div className="text-left bg-white p-4 rounded border">
              <h4 className="font-bold mb-2">{tome.name}</h4>
              <p className="text-sm text-gray-600 mb-2">
                Tomo: {tome.tomeNumber}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Creado: {new Date(tome.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Actas: {tome.acts?.length || 0}
              </p>
              {tome.acts && tome.acts.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-semibold text-sm mb-2">
                    Lista de Actas:
                  </h5>
                  <ul className="text-xs space-y-1">
                    {tome.acts.map((act, index) => (
                      <li key={act.id} className="text-gray-600">
                        {index + 1}. {act.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    };
  }
});

export const BookPdfRenderer = ({ tome, allSigners }: BookPdfRendererProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Cargando vista previa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pdf-preview-container">
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Preparando vista previa PDF...
              </p>
            </div>
          </div>
        }
      >
        <PDFPreview tome={tome} allSigners={allSigners} />
      </React.Suspense>
    </div>
  );
};
