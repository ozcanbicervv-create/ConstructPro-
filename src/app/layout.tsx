import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast-system";
import "./globals.css";
import "../styles/accessibility.css";
import "../styles/rtl.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ConstructPro - Modern Construction Management",
  description: "Professional construction project management platform with modern design and enterprise features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} a11y-typography`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans antialiased bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <ToastProvider>
          <div id="root">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
