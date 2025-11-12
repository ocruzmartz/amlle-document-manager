import { type RouteObject } from "react-router";
import { UserListPage } from "./pages/UserListPage";

export const userRoutes: RouteObject[] = [
  {
    path: "/users",
    element: <UserListPage />,
  },
];
