// filepath: src/features/agreements/components/AgreementsManager.tsx
import { useState } from "react"; // ✅ Importar useState
import { type Act } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ✅ Importar Input
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // ✅ Importar Collapsible
import {
  PlusCircle,
  ChevronsUpDown,
  Search,
  ArrowDown,
  ArrowUp,
} from "lucide-react"; // ✅ Importar iconos
import { numberToWords, capitalize } from "@/lib/textUtils";
import { cn } from "@/lib/utils";

interface AgreementListProps {
  act: Act;
  onAddAgreement: () => void;
  onEditAgreement: (agreementId: string) => void;
  onReorderAgreement: (agreementId: string, direction: "up" | "down") => void;
  activeAgreementId: string | null;
  isReadOnly?: boolean;
}

export const AgreementList = ({
  act,
  onAddAgreement,
  onEditAgreement,
  onReorderAgreement,
  activeAgreementId,
  isReadOnly = false,
}: AgreementListProps) => {
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Estado para el buscador

  // ✅ Filtrar acuerdos según la búsqueda
  const filteredAgreements =
    act.agreements?.filter((agreement) =>
      (agreement.content || "")
        .toLowerCase()
        .replace(/<[^>]*>/g, "") // Limpiar HTML para buscar solo en el texto
        .includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Header */}
      <div className="shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Acuerdos del Acta</h3>
          </div>
          <Button onClick={onAddAgreement} size="sm" disabled={isReadOnly}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Acuerdo
          </Button>
        </div>
        {/* ✅ Buscador de acuerdos */}
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar en acuerdos..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Lista de Acuerdos ahora es colapsable */}
      <Collapsible defaultOpen className="flex-1 flex flex-col min-h-0">
        <CollapsibleTrigger className="p-2 text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1 hover:bg-muted">
          <ChevronsUpDown className="h-3 w-3" />
          <span>{filteredAgreements.length} acuerdo(s) encontrado(s)</span>
        </CollapsibleTrigger>

        <CollapsibleContent className="flex-1 overflow-y-auto p-4">
          {/* ✅ Caso 1: No hay acuerdos creados */}
          {(act.agreements?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No hay acuerdos creados
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Comienza agregando tu primer acuerdo para esta acta.
              </p>
            </div>
          ) : /* ✅ Caso 2: Hay acuerdos pero no coinciden con la búsqueda */
          filteredAgreements.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No se encontraron acuerdos
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                No hay acuerdos que coincidan con "{searchQuery}".
              </p>
            </div>
          ) : (
            /* ✅ Caso 3: Hay acuerdos que mostrar */
            filteredAgreements.length > 0 && (
              <div className="grid gap-4">
                {filteredAgreements.map((agreement, index) => {
                  const isActive = agreement.id === activeAgreementId;

                  return (
                    <div
                      key={agreement.id}
                      className={cn(
                        "border rounded-lg p-3 bg-white transition-colors",
                        isActive
                          ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300" // Estilo si está activo
                          : "hover:bg-gray-50" // Estilo normal
                      )}
                    >
                      <div className="flex items-center justify-between">
                        {/* ✅ Mostrar número dinámicamente */}
                        <h4 className="font-semibold truncate">
                          Acuerdo número {capitalize(numberToWords(index + 1))}
                        </h4>

                        {/* ✅ Grupo de botones */}
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {/* ✅ Botones de reordenación */}
                          <div className="flex flex-col">
                            <Button
                              onClick={() =>
                                onReorderAgreement(agreement.id, "up")
                              }
                              disabled={index === 0 || isReadOnly}
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() =>
                                onReorderAgreement(agreement.id, "down")
                              }
                              disabled={index === filteredAgreements.length - 1 || isReadOnly}
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            onClick={() => onEditAgreement(agreement.id)}
                            variant="outline"
                            size="sm"
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
