import { type RouteObject } from "react-router-dom";

import SignIn from "./sign-in";
import SignUp from "./sign-up";
import RestPassword from "./reset-password";
import AuthLayout from "@/components/auth/_layout";

export const routes: RouteObject[] = [
  {
    path: "auth",
    element: <AuthLayout />,
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
]
