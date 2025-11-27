import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PropietariosList } from "../components/PropietariosList";
import { SubstitutosList } from "../components/SubstitutosList";
import { ParticipantForm } from "../components/ParticipantForm";

export const CouncilPage = () => {
  const [activeTab, setActiveTab] = useState("propietarios");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estado compartido para edición
  const [entityToEdit, setEntityToEdit] = useState<{ id: string; name: string } | null>(null);

  const handleCreateClick = () => {
    setEntityToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (entity: { id: string; name: string }) => {
    setEntityToEdit(entity);
    setIsFormOpen(true);
  };

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 p-6 pb-0 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión del Concejo</h1>
          <p className="text-muted-foreground mt-1">
            Administra la lista maestra de propietarios y sus suplentes asignados.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          {/* Header de Tabs y Botón en la misma línea */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-0">
            <TabsList className="h-10 bg-muted/50 p-1">
              <TabsTrigger value="propietarios" className="px-4">
                Propietarios
              </TabsTrigger>
              <TabsTrigger value="substitutos" className="px-4">
                Suplentes
              </TabsTrigger>
            </TabsList>

            <div className="pb-2 sm:pb-0">
              <Button onClick={handleCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {activeTab === "propietarios"
                  ? "Nuevo Propietario"
                  : "Nuevo Suplente"}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <TabsContent value="propietarios" className="m-0">
              <PropietariosList 
                refreshTrigger={refreshTrigger} 
                onEdit={handleEditClick} 
              />
            </TabsContent>
            <TabsContent value="substitutos" className="m-0">
              <SubstitutosList 
                refreshTrigger={refreshTrigger} 
                onEdit={handleEditClick} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ParticipantForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        entityToEdit={entityToEdit}
        entityType={activeTab === "propietarios" ? "PROPIETARIO" : "SUBSTITUTO"}
        onSave={handleSaveSuccess}
      />
    </div>
  );
};