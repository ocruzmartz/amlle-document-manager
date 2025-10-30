import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { DataTable } from "@/components/ui/DataTable";
import { createBook, getBooks } from "../api/book";
import { columns } from "../components/BookColumns";

export const BookListPage = () => {
  const navigate = useNavigate();
  const books = getBooks();
  const handleCreateBook = () => {
    const newBook = createBook({
      name: `Nuevo Libro - ${new Date().toLocaleDateString()}`,
      creationDate: new Date(),
    });
    navigate(`/books/${newBook.id}`);
  };

  // ✅ Actualizado al nuevo formato de array
  const statusFilters = [
    {
      columnId: "status",
      title: "Estado",
      options: [
        { label: "Borrador", value: "BORRADOR" },
        { label: "Finalizado", value: "FINALIZADO" },
        { label: "Archivado", value: "ARCHIVADO" },
      ],
    },
  ];

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Libros
          </h1>
          <p className="text-muted-foreground mt-1">
            Libros de Actas y Acuerdos Municipales.
          </p>
        </div>
        <div>
          <Button onClick={handleCreateBook}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Libro
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={books}
        filterColumnId="name"
        filterPlaceholder="Filtrar por nombre de libro..."
        facetedFilters={statusFilters}
      />
    </div>
  );
};