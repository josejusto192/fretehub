"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-blue-900 hover:bg-blue-800 font-semibold shadow-sm gap-1.5"
    >
      <Printer className="w-4 h-4" />
      Imprimir / Salvar PDF
    </Button>
  );
}
