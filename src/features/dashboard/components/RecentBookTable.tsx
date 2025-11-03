import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { type RecentTome } from "@/types/book";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RecentBooksTableProps {
  books: RecentTome[];
}

export const RecentBooksTable = ({ books }: RecentBooksTableProps) => {
  return (
    // ✅ 1. Usamos un Card minimalista
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Libros Recientes</CardTitle>
          <CardDescription>
            Últimos tomos modificados y su estado actual.
          </CardDescription>
        </div>
        <Button asChild variant="link" className="text-muted-foreground">
          <Link to="/books">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      {/* ✅ 2. CardContent con p-0 para que la tabla se ajuste */}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Nombre del Tomo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right pr-5">
                Última Modificación
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Mostrar solo los primeros 5 libros para un look limpio */}
            {books.slice(0, 5).map((book) => (
              <TableRow key={book.id}>
                <TableCell className="pl-5">
                  <Link
                    to={book.url}
                    className="font-medium text-primary hover:underline"
                  >
                    {book.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Del libro: {book.bookName}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      book.status === "FINALIZADO"
                        ? "default"
                        : book.status === "ARCHIVADO"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {book.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs pr-5">
                  {formatDistanceToNow(new Date(book.lastModified), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
