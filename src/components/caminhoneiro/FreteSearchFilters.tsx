"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_BRASILEIROS, TIPOS_CARGA } from "@/lib/constants";

export function FreteSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origemEstado, setOrigemEstado] = useState(searchParams.get("origem_estado") || "");
  const [destinoEstado, setDestinoEstado] = useState(searchParams.get("destino_estado") || "");
  const [tipoCarga, setTipoCarga] = useState(searchParams.get("tipo_carga") || "");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (origemEstado) params.set("origem_estado", origemEstado);
    if (destinoEstado) params.set("destino_estado", destinoEstado);
    if (tipoCarga) params.set("tipo_carga", tipoCarga);
    router.push(`/caminhoneiro/dashboard?${params.toString()}`);
  };

  const handleClear = () => {
    setOrigemEstado("");
    setDestinoEstado("");
    setTipoCarga("");
    router.push("/caminhoneiro/dashboard");
  };

  const hasFilters = origemEstado || destinoEstado || tipoCarga;

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-medium text-gray-700 mb-3">Filtrar fretes</h3>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[160px]">
          <label className="text-xs text-gray-500 mb-1 block">Estado de origem</label>
          <Select value={origemEstado} onValueChange={setOrigemEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BRASILEIROS.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[160px]">
          <label className="text-xs text-gray-500 mb-1 block">Estado de destino</label>
          <Select value={destinoEstado} onValueChange={setDestinoEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BRASILEIROS.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[180px]">
          <label className="text-xs text-gray-500 mb-1 block">Tipo de carga</label>
          <Select value={tipoCarga} onValueChange={setTipoCarga}>
            <SelectTrigger>
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_CARGA.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="bg-blue-900 hover:bg-blue-800">
            Buscar
          </Button>
          {hasFilters && (
            <Button variant="outline" onClick={handleClear}>
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
