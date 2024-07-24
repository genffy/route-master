import "./globals.css";
import '@radix-ui/themes/styles.css';
import { APP_DOMAIN_URL } from "@/lib/constants";
import { Theme } from '@radix-ui/themes';

export const metadata = {
  title: "Route Editor",
  description:
    "Editor app is an application for editing and managing track route",
  metadataBase: APP_DOMAIN_URL,
  // themeColor: "",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Theme>
          {children}
        </Theme>
      </body>
    </html>
  );
}
