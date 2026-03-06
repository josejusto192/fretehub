"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import dynamic from "next/dynamic";
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
import { TIPOS_CARGA } from "@/lib/constants";
import CitySearchInput from "@/components/shared/CitySearchInput";
import { calcularDistancia } from "@/components/shared/RouteMap";

// Dynamic import to avoid SSR issues with Leaflet
const RouteMap = dynamic(() => import("@/components/shared/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
      Carregando mapa...
    </div>
  ),
});

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

interface CityCoord {
  lat: number;
  lng: number;
  label: string;
}

export default function NovoFretePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [origemCoord, setOrigemCoord] = useState<CityCoord | null>(null);
  const [destinoCoord, setDestinoCoord] = useState<CityCoord | null>(null);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [origemDisplay, setOrigemDisplay] = useState("");
  const [destinoDisplay, setDestinoDisplay] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FreteForm>({ resolver: zodResolver(freteSchema) });

  // Recalculate distance whenever both coords are set
  useEffect(() => {
    if (origemCoord && destinoCoord) {
      const dist = calcularDistancia(
        origemCoord.lat, origemCoord.lng,
        destinoCoord.lat, destinoCoord.lng
      );
      setDistanciaKm(dist);
    } else {
      setDistanciaKm(null);
    }
  }, [origemCoord, destinoCoord]);

  const onSubmit = async (data: FreteForm) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        peso_total_ton: Number(data.peso_total_ton),
        peso_minimo_ton: data.peso_minimo_ton ? Number(data.peso_minimo_ton) : null,
        valor_por_tonelada: Number(data.valor_por_tonelada),
        distancia_km: distanciaKm ?? null,
        origem_lat: origemCoord?.lat ?? null,
        origem_lng: origemCoord?.lng ?? null,
        destino_lat: destinoCoord?.lat ?? null,
        destino_lng: destinoCoord?.lng ?? null,
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publicar Novo Frete</h1>
        <p className="text-gray-500 mt-1">Preencha os dados da carga para encontrar caminhoneiros</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Frete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
          </CardContent>
        </Card>

        {/* Origin / Destination */}
        <Card>
          <CardHeader>
            <CardTitle>Rota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <CitySearchInput
                  label="Cidade de Origem"
                  placeholder="Ex: São Paulo"
                  value={origemDisplay}
                  onSelect={(city) => {
                    setValue("origem_cidade", city.cidade);
                    setValue("origem_estado", city.estado);
                    setOrigemDisplay(city.displayName);
                    setOrigemCoord({ lat: city.lat, lng: city.lng, label: city.displayName });
                  }}
                  error={errors.origem_cidade?.message || errors.origem_estado?.message}
                />
                {/* Hidden inputs for form validation */}
                <input type="hidden" {...register("origem_cidade")} />
                <input type="hidden" {...register("origem_estado")} />
                {origemCoord && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {origemCoord.label}
                  </p>
                )}
              </div>

              <div>
                <CitySearchInput
                  label="Cidade de Destino"
                  placeholder="Ex: Cuiabá"
                  value={destinoDisplay}
                  onSelect={(city) => {
                    setValue("destino_cidade", city.cidade);
                    setValue("destino_estado", city.estado);
                    setDestinoDisplay(city.displayName);
                    setDestinoCoord({ lat: city.lat, lng: city.lng, label: city.displayName });
                  }}
                  error={errors.destino_cidade?.message || errors.destino_estado?.message}
                />
                <input type="hidden" {...register("destino_cidade")} />
                <input type="hidden" {...register("destino_estado")} />
                {destinoCoord && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {destinoCoord.label}
                  </p>
                )}
              </div>
            </div>

            {/* Map preview */}
            {origemCoord && destinoCoord && distanciaKm !== null && (
              <RouteMap
                origin={origemCoord}
                destination={destinoCoord}
                distanciaKm={distanciaKm}
              />
            )}

            {(!origemCoord || !destinoCoord) && (
              <div className="h-24 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                Selecione origem e destino para ver o mapa e a distância
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cargo & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Carga e Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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

            {/* Value summary */}
            {distanciaKm && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 grid grid-cols-2 gap-2">
                <span>Distância estimada: <strong>~{distanciaKm.toLocaleString("pt-BR")} km</strong></span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Datas</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Observations */}
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a carga, requisitos especiais, etc."
              {...register("observacoes")}
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
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
    </div>
  );
}
