import { type RouteObject } from "react-router";
import { BooksListPage } from "./pages/BooksListPage";
import { BookWorkspacePage } from "./pages/BookWorkspacePage";
export const booksRoutes: RouteObject[] = [
  {
    path: "/books",
    element: <BooksListPage />,
  },
  // La ruta de creación '/books/new' ya no es necesaria.
  // La ruta de detalle ahora es nuestro workspace.
  {
    path: "/books/:bookId",
    element: <BookWorkspacePage />,
  },
];
