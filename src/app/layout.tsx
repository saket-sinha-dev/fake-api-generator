import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import "./signin.css";
import "./profile.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FakeAPI - Mock API Generator",
  description: "Create fake APIs instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
