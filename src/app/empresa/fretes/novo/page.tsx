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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_BRASILEIROS, TIPOS_CARGA } from "@/lib/constants";

const freteSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório"),
  tipo_carga: z.string().min(1, "Tipo de carga obrigatório"),
  origem_cidade: z.string().min(1, "Cidade de origem obrigatória"),
  origem_estado: z.string().length(2, "Estado de origem obrigatório"),
  destino_cidade: z.string().min(1, "Cidade de destino obrigatória"),
  destino_estado: z.string().length(2, "Estado de destino obrigatório"),
  peso_total_ton: z.string().min(1, "Peso total obrigatório"),
  peso_minimo_ton: z.string().optional(),
  valor_por_tonelada: z.string().min(1, "Valor obrigatório"),
  data_coleta: z.string().min(1, "Data de coleta obrigatória"),
  prazo_entrega: z.string().min(1, "Prazo de entrega obrigatório"),
  observacoes: z.string().optional(),
});

type FreteForm = z.infer<typeof freteSchema>;

export default function NovoFretePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FreteForm>({ resolver: zodResolver(freteSchema) });

  const onSubmit = async (data: FreteForm) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        peso_total_ton: Number(data.peso_total_ton),
        peso_minimo_ton: data.peso_minimo_ton ? Number(data.peso_minimo_ton) : null,
        valor_por_tonelada: Number(data.valor_por_tonelada),
      };
      const res = await fetch("/api/fretes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao publicar frete");
        return;
      }

      toast.success("Frete publicado com sucesso!");
      router.push("/empresa/dashboard");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publicar Novo Frete</h1>
        <p className="text-gray-500 mt-1">Preencha os dados da carga para encontrar caminhoneiros</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Frete</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="titulo">Título do Frete</Label>
              <Input
                id="titulo"
                placeholder="Ex: Transporte de soja — SP para MT"
                {...register("titulo")}
                className="mt-1"
              />
              {errors.titulo && (
                <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
              )}
            </div>

            <div>
              <Label>Tipo de Carga</Label>
              <Select onValueChange={(v) => setValue("tipo_carga", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de carga" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CARGA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_carga && (
                <p className="text-red-500 text-sm mt-1">{errors.tipo_carga.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origem_cidade">Cidade de Origem</Label>
                <Input
                  id="origem_cidade"
                  placeholder="São Paulo"
                  {...register("origem_cidade")}
                  className="mt-1"
                />
                {errors.origem_cidade && (
                  <p className="text-red-500 text-sm mt-1">{errors.origem_cidade.message}</p>
                )}
              </div>
              <div>
                <Label>Estado de Origem</Label>
                <Select onValueChange={(v) => setValue("origem_estado", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BRASILEIROS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.origem_estado && (
                  <p className="text-red-500 text-sm mt-1">{errors.origem_estado.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destino_cidade">Cidade de Destino</Label>
                <Input
                  id="destino_cidade"
                  placeholder="Cuiabá"
                  {...register("destino_cidade")}
                  className="mt-1"
                />
                {errors.destino_cidade && (
                  <p className="text-red-500 text-sm mt-1">{errors.destino_cidade.message}</p>
                )}
              </div>
              <div>
                <Label>Estado de Destino</Label>
                <Select onValueChange={(v) => setValue("destino_estado", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BRASILEIROS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.destino_estado && (
                  <p className="text-red-500 text-sm mt-1">{errors.destino_estado.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="peso_total_ton">Peso Total (ton)</Label>
                <Input
                  id="peso_total_ton"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 28.5"
                  {...register("peso_total_ton")}
                  className="mt-1"
                />
                {errors.peso_total_ton && (
                  <p className="text-red-500 text-sm mt-1">{errors.peso_total_ton.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="peso_minimo_ton">
                  Peso Mín. (ton){" "}
                  <span className="text-gray-400 text-xs">(opcional)</span>
                </Label>
                <Input
                  id="peso_minimo_ton"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 15"
                  {...register("peso_minimo_ton")}
                  className="mt-1"
                />
                {errors.peso_minimo_ton && (
                  <p className="text-red-500 text-sm mt-1">{errors.peso_minimo_ton.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="valor_por_tonelada">Valor/Ton (R$)</Label>
                <Input
                  id="valor_por_tonelada"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  {...register("valor_por_tonelada")}
                  className="mt-1"
                />
                {errors.valor_por_tonelada && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.valor_por_tonelada.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_coleta">Data de Coleta</Label>
                <Input
                  id="data_coleta"
                  type="date"
                  {...register("data_coleta")}
                  className="mt-1"
                />
                {errors.data_coleta && (
                  <p className="text-red-500 text-sm mt-1">{errors.data_coleta.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="prazo_entrega">Prazo de Entrega</Label>
                <Input
                  id="prazo_entrega"
                  type="date"
                  {...register("prazo_entrega")}
                  className="mt-1"
                />
                {errors.prazo_entrega && (
                  <p className="text-red-500 text-sm mt-1">{errors.prazo_entrega.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre a carga, requisitos especiais, etc."
                {...register("observacoes")}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-900 hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? "Publicando..." : "Publicar Frete"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
