import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "FreteHub - Marketplace de Fretes de Grande Porte",
  description:
    "Plataforma que conecta empresas com caminhoneiros para fretes de grande porte em todo o Brasil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
