// src/features/agreements/components/AgreementsManager.tsx

import { type Act } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { numberToWords, capitalize } from "@/lib/textUtils";

interface AgreementsManagerProps {
  act: Act;
  onAddAgreement: () => void;
  onEditAgreement: (agreementId: string) => void;
  onBackToAct: () => void;
}

export const AgreementsManager = ({
  act,
  onAddAgreement,
  onEditAgreement,
  onBackToAct,
}: AgreementsManagerProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToAct}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Acta
            </Button>
            <h3 className="text-2xl font-bold">Acuerdos del "{act.name}"</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Gestiona los acuerdos para esta sesión.
            </p>
          </div>
          <Button onClick={onAddAgreement}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Acuerdo
          </Button>
        </div>
      </div>

      {/* Lista de Acuerdos */}
      <div className="flex-1 overflow-y-auto p-4">
        {act.agreements?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay acuerdos en esta acta.</p>
            <Button onClick={onAddAgreement} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear el primer acuerdo
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {act.agreements.map((agreement, index) => (
              <div
                key={agreement.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold truncate">
                      Acuerdo número {capitalize(numberToWords(index + 1))}
                    </h4>
                    <div
                      className="text-sm text-gray-500 mt-2 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html:
                          agreement.content
                            .replace(/<[^>]*>/g, " ")
                            .substring(0, 150) + "...",
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => onEditAgreement(agreement.id)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 ml-4"
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
