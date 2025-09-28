// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Can remove if using the @import in globals.css
import "./globals.css";
import Header from "@/components/Header"; // Import the header
import { Toaster } from "@/components/ui/sonner"// For notifications

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Interview Assistant",
  description: "An AI-powered interview assistant. @Saurabh Anand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container w-10/12 sm:w-8/12 mx-auto p-4 ">
            {children}
          </main>
          <footer className="text-center p-4 text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} AI Interview Assistant. All rights reserved. @Saurabh Anand
          </footer>
          <Toaster />
        </div>
      </body>
    </html>
  );
}