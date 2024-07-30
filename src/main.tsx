import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import NotFound from "./views/errors/not-found";

import Dashboard from "./views/dashboard";

import Account from "./views/system/account";
import Setting from "./views/system/settings";
import Integration from "./views/system/integrations";

import Customer from "./views/dashboard/records/page";
import SignIn from "./views/auth/sign-in";
import SignUp from "./views/auth/sign-up";
import RestPassword from "./views/auth/reset-password";

import DashboardLayout from "./components/dashboard/_layout";
import AuthLayout from "./components/auth/layout";
import SystemLayout from "./components/system/_layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/dashboard",
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
        ]
      },
    ],
  },
  {
    path: "system",
    element: <SystemLayout />,
    errorElement: <NotFound />,
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
  {
    path: "auth",
    element: <AuthLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
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
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
