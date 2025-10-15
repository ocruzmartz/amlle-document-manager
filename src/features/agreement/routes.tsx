import { type RouteObject } from "react-router";
import { AgreementListPage } from "./pages/AgreementListPage";

export const agreementRoutes: RouteObject[] = [
  {
    path: "/agreements",
    element: <AgreementListPage />,
  },
];