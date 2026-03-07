"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  freteId: string;
  tipo: string;
  label: string;
}

export function AvancarEtapaButton({ freteId, tipo, label }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const confirmar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fretes/${freteId}/etapas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Erro ao confirmar etapa");
        return;
      }

      toast.success("Etapa confirmada!");
      router.refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={confirmar}
      disabled={loading}
      className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-sm"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
      {label}
    </Button>
  );
}
