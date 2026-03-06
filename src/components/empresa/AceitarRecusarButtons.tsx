"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  freteId: string;
  candidaturaId: string;
}

export function AceitarRecusarButtons({ freteId, candidaturaId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"aceitar" | "recusar" | null>(null);

  const handleAction = async (status: "aceita" | "recusada") => {
    setLoading(status === "aceita" ? "aceitar" : "recusar");
    try {
      const res = await fetch(
        `/api/fretes/${freteId}/candidaturas/${candidaturaId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao atualizar candidatura");
        return;
      }

      // TODO: Stripe - quando aceitar, redirecionar para confirmação de pagamento
      toast.success(status === "aceita" ? "Candidatura aceita!" : "Candidatura recusada");
      router.refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAction("recusada")}
        disabled={loading !== null}
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        {loading === "recusar" ? "..." : "Recusar"}
      </Button>
      <Button
        size="sm"
        onClick={() => handleAction("aceita")}
        disabled={loading !== null}
        className="bg-green-600 hover:bg-green-700"
      >
        {loading === "aceitar" ? "..." : "Aceitar"}
      </Button>
    </div>
  );
}
