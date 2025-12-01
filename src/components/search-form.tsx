
import { useState } from "react";
import { useNavigate } from "react-router"; 
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(""); 

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      navigate(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      {" "}
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Buscar
        </Label>
        <SidebarInput
          id="search"
          placeholder="Buscar libros, actas o acuerdos..."
          className="h-8 pl-7"
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)} 
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  );
}
