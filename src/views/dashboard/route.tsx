import { type RouteObject } from "react-router-dom";

import Layout from "@/components/dashboard/_layout";
import Dashboard from "./index";
import Customer from "./records";

export const routes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      {
        path: "",
        index: true,
        id: "overview",
        element: <Dashboard />
      },
      {
        path: "records",
        element: <Customer />
      },
    ],
  },
]
