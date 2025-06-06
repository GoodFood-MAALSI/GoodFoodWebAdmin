"use client";

import { usePathname } from "next/navigation";
import "@/app/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideNavbarRoutes = ["/", "/create-company", "/auth"];
  const showNavbar = !hideNavbarRoutes.includes(pathname);

  return (
    <html lang="fr" className="h-full">
      <body className="antialiased h-full flex flex-col">
        <Header showNavbar={showNavbar} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
