import "./globals.css";
// import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";
import { sfPro, inter } from "./fonts";
import { APP_DOMAIN_URL } from "@/lib/constants";

export const metadata = {
  title: "Route Editor",
  description:
    "Editor app is an application for editing and managing track route",
  metadataBase: APP_DOMAIN_URL,
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cx(sfPro.variable, inter.variable)}>
      {children}
      </body>
    </html>
  );
}
