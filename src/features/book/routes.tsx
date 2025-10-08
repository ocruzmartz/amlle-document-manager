import { type RouteObject } from "react-router";
import { BookListPage } from "./pages/BookListPage";
import { BookWorkspacePage } from "./pages/BookWorkspacePage";

export const booksRoutes: RouteObject[] = [
  {
    path: "/books",
    element: <BookListPage />,
  },
];

export const booksWorkspaceRoutes: RouteObject[] = [
  {
    path: "/books/:bookId",
    element: <BookWorkspacePage />,
  },
];
