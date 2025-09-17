import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router"; // <-- 1. Importa useNavigate
import { createBook } from "../lib/bookService"; // <-- 2. Importa la función de creación
import { booksData } from "../lib/dummyData";
import { columns } from "../components/BooksColumns";
import { BooksDataTable } from "../components/BooksDataTable";

export const BooksListPage = () => {
  const navigate = useNavigate(); // <-- 3. Inicializa el hook

  const handleCreateBook = () => {
    // 4. Llama al servicio para crear un libro con datos mínimos
    const newBook = createBook({
      name: `Nuevo Libro - ${new Date().toLocaleDateString()}`,
      creationDate: new Date(),
    });
    // 5. Navega directamente al workspace del nuevo libro
    navigate(`/books/${newBook.id}`);
  };

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Libros
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí puedes ver, buscar y administrar todos los libros del sistema.
          </p>
        </div>
        <div>
          {/* 6. El botón ahora llama a la nueva función handler */}
          <Button onClick={handleCreateBook}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Libro
          </Button>
        </div>
      </div>

      <BooksDataTable columns={columns} data={booksData} />
    </div>
  );
};

export default BooksListPage;
