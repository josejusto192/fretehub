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
  variant?: "default" | "success";
  observacoes?: string;
}

export function ConfirmarEtapaButton({ freteId, tipo, label, variant = "default", observacoes }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const confirmar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fretes/${freteId}/etapas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, observacoes }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Erro ao confirmar etapa");
        return;
      }

      toast.success("Etapa confirmada com sucesso!");
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
      className={
        variant === "success"
          ? "w-full bg-green-600 hover:bg-green-500 text-white font-bold shadow-sm"
          : "w-full bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-sm"
      }
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {label}
    </Button>
  );
}
