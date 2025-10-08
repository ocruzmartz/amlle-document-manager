// filepath: src/features/acts/components/ActasManager.tsx
import { useState } from "react"; // ✅ Importar useState
import { type Act } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ✅ Importar Input
import { Edit, PlusCircle, Search } from "lucide-react"; // ✅ Importar iconos
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActasListProps {
  acts: Act[];
  onCreateAct: () => void;
  onEditAct: (actId: string) => void;
}

export const ActList = ({
  acts,
  onCreateAct,
  onEditAct,
}: ActasListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Filtrar actas según la búsqueda
  const filteredActs = acts.filter((act) =>
    act.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Cabecera */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Gestión de Actas</h3>
          </div>
          <Button onClick={onCreateAct}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Nueva Acta
          </Button>
        </div>
        {/* ✅ Buscador de actas */}
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar actas..."
            className="pl-8 w-full shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Actas */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredActs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {acts.length > 0
                ? `No hay actas que coicidan con "${searchQuery}"`
                : "Aún no hay actas en este libro."}
            </p>
            <Button onClick={onCreateAct} variant="outline">
              <PlusCircle className="mr-1 h-4 w-4" />
              Añadir nueva acta
            </Button>
            </div>
          ) : (
          <div className="grid gap-4">
            {filteredActs.map((act) => (
              <div key={act.id} className="border rounded-lg p-4 ">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{act.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(
                        new Date(act.sessionDate),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {" "}
                      {act.agreements.length > 0
                        ? "Acuerdos registrados (" + act.agreements.length + ")"
                        : "Aún no hay acuerdos registrados..."}
                    </p>
                  </div>
                  <Button
                    onClick={() => onEditAct(act.id)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 ml-4 cursor-pointer"
                  >
                    <Edit className="mr-1 h-4 w-4" />
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
