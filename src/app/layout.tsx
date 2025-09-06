import type { Metadata } from "next";
import { Providers } from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConstructPro - Construction Project Management",
  description: "Modern construction project management and collaboration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
