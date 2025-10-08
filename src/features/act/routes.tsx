import { type RouteObject } from "react-router";
import { ActListPage } from "./pages/ActListPage";

export const actRoutes: RouteObject[] = [
  {
    path: "/acts",
    element: <ActListPage />,
  },
];
