import { type RouteObject } from "react-router";
import { SearchPage } from "./pages/SearchPage";

export const searchRoutes: RouteObject[] = [
  {
    path: "/search",
    element: <SearchPage />,
  },
];
