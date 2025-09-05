import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthSessionProvider from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConstructPro - Construction Project Management",
  description: "Modern construction project management and collaboration platform built by Vovelet-Tech. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["construction", "project management", "collaboration", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React"],
  authors: [{ name: "Vovelet-Tech" }],
  openGraph: {
    title: "ConstructPro - Construction Project Management",
    description: "Construction project management and collaboration platform",
    url: "https://vovelet-tech.com",
    siteName: "ConstructPro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConstructPro - Construction Project Management",
    description: "Construction project management and collaboration platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthSessionProvider>
          {children}
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
