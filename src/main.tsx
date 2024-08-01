import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { routes as AppRoutes } from "./views/index";
import { routes as AuthRoutes } from './views/auth/route'
import { routes as DashboardRoutes } from './views/dashboard/route'
import { routes as SystemRoutes } from './views/system/route'
import NotFound from "./views/errors/not-found";
import ErrorPage from "./views/errors/error-page";

const router = createBrowserRouter([
  ...AppRoutes,
  ...DashboardRoutes,
  ...SystemRoutes,
  ...AuthRoutes,
  // global not found and error
  {
    path: "*",
    element: <NotFound />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
