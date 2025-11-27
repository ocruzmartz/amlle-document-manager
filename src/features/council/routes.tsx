import { type RouteObject } from "react-router";
import { CouncilPage } from "./pages/CouncilPage";

export const councilRoutes: RouteObject[] = [
  {
    path: "/council",
    element: <CouncilPage />,
  },
];