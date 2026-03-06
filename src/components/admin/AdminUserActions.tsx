"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  userId: string;
  currentStatus: string;
  currentVerificado: boolean;
  role: string;
}

export function AdminUserActions({ userId, currentStatus, currentVerificado, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateUser = async (updates: { status?: string; verificado?: boolean }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Erro ao atualizar usuário");
        return;
      }

      toast.success("Usuário atualizado com sucesso!");
      router.refresh();
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {currentStatus === "pendente" && (
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-xs h-7"
          onClick={() => updateUser({ status: "ativo" })}
          disabled={loading}
        >
          Ativar
        </Button>
      )}
      {currentStatus === "ativo" && (
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7"
          onClick={() => updateUser({ status: "bloqueado" })}
          disabled={loading}
        >
          Bloquear
        </Button>
      )}
      {currentStatus === "bloqueado" && (
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
          onClick={() => updateUser({ status: "ativo" })}
          disabled={loading}
        >
          Desbloquear
        </Button>
      )}
      {role !== "admin" && !currentVerificado && (
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-7"
          onClick={() => updateUser({ verificado: true })}
          disabled={loading}
        >
          Verificar
        </Button>
      )}
    </div>
  );
}
