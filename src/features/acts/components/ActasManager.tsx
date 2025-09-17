import { type Act } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActasManagerProps {
  acts: Act[];
  onCreateAct: () => void;
  onEditAct: (actId: string) => void;
}

export const ActasManager = ({
  acts,
  onCreateAct,
  onEditAct,
}: ActasManagerProps) => {
  return (
    <div className="h-full flex flex-col "> {/* ✅ Agregar h-full y flex flex-col */}
      {/* Cabecera de la sección - Fija */}
      <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b p-4"> {/* ✅ Agregar flex-shrink-0 */}
        <div>
          <h3 className="text-2xl font-bold">Gestión de Actas</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Añade, edita o visualiza las actas de este libro.
          </p>
        </div>
        <Button onClick={onCreateAct} className="flex-shrink-0"> {/* ✅ Evitar que se encoja */}
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Nueva Acta
        </Button>
      </div>

      {/* Lista de Actas Existentes - Scrolleable */}
      <div className="flex-1 overflow-y-auto p-4"> {/* ✅ Mantener flex-1 y overflow-y-auto */}
        {acts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Aún no hay actas adjuntas a este libro.
            </p>
            <Button onClick={onCreateAct} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Nueva Acta
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {acts.map((act) => (
              <div
                key={act.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow" // ✅ Agregar hover effect
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1"> {/* ✅ Permitir que el texto se truncate si es necesario */}
                    <h3 className="font-semibold truncate">{act.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(
                        new Date(act.sessionDate),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={() => onEditAct(act.id)}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer shadow-none flex-shrink-0 ml-4" // ✅ Agregar flex-shrink-0 y ml-4
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
