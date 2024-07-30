import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import ErrorPage from "./views/error-page";
import DashboardLayout from "./views/dashboard/layout";
import Dashboard from "./views/dashboard/page";
import Account from "./views/dashboard/account/page";
import Setting from "./views/dashboard/settings/page";
import Integration from "./views/dashboard/integrations/page";
import Customer from "./views/dashboard/customers/page";
import SignIn from "./views/auth/sign-in/page";
import SignUp from "./views/auth/sign-up/page";
import RestPassword from "./views/auth/reset-password/page";
import App from "./App";
import Layout from "./views/layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <App />
      },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            id: "overview",
            element: <Dashboard />
          },
          {
            path: "account",
            id: "account",
            element: <Account />
          },
          {
            path: "customers",
            id: "customers",
            element: <Customer />
          },
          {
            path: "integrations",
            id: "integrations",
            element: <Integration />
          },
          {
            path: "settings",
            id: "settings",
            element: <Setting />
          }
        ]
      },
      {
        path: "auth",
        children: [
          {
            path: "sign-in",
            element: <SignIn />
          },
          {
            path: "sign-up",
            element: <SignUp />
          },
          {
            path: "reset-password",
            element: <RestPassword />
          },
        ]
      }
    ]
  },

]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
