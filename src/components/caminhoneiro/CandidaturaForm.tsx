"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const candidaturaSchema = z.object({
  toneladas_ofertadas: z.string().min(1, "Informe a quantidade em toneladas"),
  mensagem: z.string().optional(),
});

type CandidaturaForm = z.infer<typeof candidaturaSchema>;

interface Props {
  freteId: string;
  capacidadeMaxima: number;
}

export function CandidaturaForm({ freteId, capacidadeMaxima }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidaturaForm>({ resolver: zodResolver(candidaturaSchema) });

  const onSubmit = async (data: CandidaturaForm) => {
    const toneladas = Number(data.toneladas_ofertadas);
    if (toneladas > capacidadeMaxima) {
      toast.error(`Você não pode ofertar mais que sua capacidade máxima (${capacidadeMaxima}t)`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/fretes/${freteId}/candidaturas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toneladas_ofertadas: toneladas, mensagem: data.mensagem }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao enviar candidatura");
        return;
      }

      toast.success("Candidatura enviada com sucesso! Aguarde a resposta da empresa.");
      router.refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="toneladas_ofertadas">
          Toneladas que pode transportar{" "}
          <span className="text-gray-400 text-xs">(máx. {capacidadeMaxima}t)</span>
        </Label>
        <Input
          id="toneladas_ofertadas"
          type="number"
          step="0.1"
          max={capacidadeMaxima}
          placeholder={`Até ${capacidadeMaxima}t`}
          {...register("toneladas_ofertadas")}
          className="mt-1"
        />
        {errors.toneladas_ofertadas && (
          <p className="text-red-500 text-sm mt-1">{errors.toneladas_ofertadas.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="mensagem">
          Mensagem para a empresa{" "}
          <span className="text-gray-400 text-xs">(opcional)</span>
        </Label>
        <Textarea
          id="mensagem"
          placeholder="Apresente-se ou deixe informações relevantes..."
          {...register("mensagem")}
          className="mt-1"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-900 hover:bg-blue-800"
        disabled={loading}
      >
        {loading ? "Enviando candidatura..." : "Enviar Candidatura"}
      </Button>
    </form>
  );
}
