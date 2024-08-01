import { type RouteObject } from "react-router-dom";

import Layout from "@/components/system/_layout";

import Account from "./account";
import Integration from "./integrations";
import Setting from "./settings";

export const routes: RouteObject[] = [
  {
    path: "system",
    element: <Layout />,
    children: [
      {
        index: true,
        path: "",
        element: <Account />
      },
      {
        path: "account",
        element: <Account />
      },
      {
        path: "integrations",
        element: <Integration />
      },
      {
        path: "settings",
        element: <Setting />
      }
    ]
  },
]
