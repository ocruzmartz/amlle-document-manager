// filepath: src/components/search-form.tsx
import { useState } from "react"; // ✅ 1. Importar useState
import { useNavigate } from "react-router"; // ✅ 2. Importar useNavigate
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const navigate = useNavigate(); // ✅ 3. Hook de navegación
  const [keyword, setKeyword] = useState(""); // ✅ 4. Estado para el input

  // ✅ 5. Manejador para el submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      // Navegar a la página de búsqueda con el query param
      navigate(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
      // Opcional: limpiar el input después de buscar
      // setKeyword("");
    }
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      {" "}
      {/* ✅ 6. Ligar el submit */}
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Buscar
        </Label>
        <SidebarInput
          id="search"
          placeholder="Buscar libros, actas o acuerdos..."
          className="h-8 pl-7"
          value={keyword} // ✅ 7. Controlar el input
          onChange={(e) => setKeyword(e.target.value)} // ✅ 8. Actualizar el estado
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  );
}
