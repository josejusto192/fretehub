"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, MapPin, Shield, Star, Phone, CheckCircle2 } from "lucide-react";
import { TIPOS_CAMINHAO, ESTADOS_BRASILEIROS } from "@/lib/constants";

interface Caminhoneiro {
  nome_completo: string;
  cpf: string;
  numero_cnh: string;
  categoria_cnh: string;
  numero_antt: string;
  tipo_caminhao: string;
  capacidade_toneladas: number;
  verificado: boolean;
  telefone?: string;
  cidade?: string;
  estado?: string;
  experiencia_anos?: number;
  descricao?: string;
  possui_rastreador?: boolean;
  possui_seguro?: boolean;
  areas_atendimento?: string[];
}

interface User {
  email: string;
  status: string;
  caminhoneiro: Caminhoneiro;
}

type ProfileForm = {
  nome_completo: string;
  telefone: string;
  cidade: string;
  estado: string;
  tipo_caminhao: string;
  capacidade_toneladas: number;
  experiencia_anos: string;
  descricao: string;
  possui_rastreador: boolean;
  possui_seguro: boolean;
  areas_atendimento: string;
};

export default function CaminhoneiroPerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, watch } = useForm<ProfileForm>();

  const possuiRastreador = watch("possui_rastreador");
  const possuiSeguro = watch("possui_seguro");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch("/api/perfil");
      const json = await res.json();
      setUser(json.user);
      const c = json.user?.caminhoneiro;
      if (c) {
        reset({
          nome_completo: c.nome_completo || "",
          telefone: c.telefone || "",
          cidade: c.cidade || "",
          estado: c.estado || "",
          tipo_caminhao: c.tipo_caminhao || "",
          capacidade_toneladas: Number(c.capacidade_toneladas),
          experiencia_anos: c.experiencia_anos?.toString() || "",
          descricao: c.descricao || "",
          possui_rastreador: c.possui_rastreador || false,
          possui_seguro: c.possui_seguro || false,
          areas_atendimento: (c.areas_atendimento || []).join(", "),
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const areas = data.areas_atendimento
        ? data.areas_atendimento
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const payload = {
        nome_completo: data.nome_completo,
        telefone: data.telefone,
        cidade: data.cidade,
        estado: data.estado,
        tipo_caminhao: data.tipo_caminhao,
        capacidade_toneladas: Number(data.capacidade_toneladas),
        experiencia_anos: data.experiencia_anos ? Number(data.experiencia_anos) : null,
        descricao: data.descricao,
        possui_rastreador: data.possui_rastreador,
        possui_seguro: data.possui_seguro,
        areas_atendimento: areas,
      };

      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Erro ao salvar perfil");
        return;
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  const c = user?.caminhoneiro;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">Gerencie suas informações de caminhoneiro</p>
      </div>

      {/* Read-only info card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações da Conta</span>
            {user && (
              <div className="flex gap-2">
                <Badge variant={user.status === "ativo" ? "default" : "secondary"}>
                  {user.status === "ativo" ? "Ativo" : user.status}
                </Badge>
                {c?.verificado && (
                  <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verificado
                  </Badge>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <p><strong>E-mail:</strong> {user?.email}</p>
            <p><strong>CPF:</strong> {c?.cpf}</p>
            <p>
              <strong>CNH:</strong> {c?.numero_cnh} — Categoria {c?.categoria_cnh}
            </p>
            <p><strong>ANTT/RNTRC:</strong> {c?.numero_antt}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4 text-yellow-500" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <Input id="nome_completo" {...register("nome_completo")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="telefone">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Telefone / WhatsApp
                  </span>
                </Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-0000"
                  {...register("telefone")}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Cidade Base
                  </span>
                </Label>
                <Input
                  id="cidade"
                  placeholder="São Paulo"
                  {...register("cidade")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Estado Base</Label>
                <Controller
                  control={control}
                  name="estado"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Apresentação / Bio</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva sua experiência, diferenciais, regiões atendidas..."
                {...register("descricao")}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4 text-blue-600" />
              Veículo e Capacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Caminhão</Label>
                <Controller
                  control={control}
                  name="tipo_caminhao"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CAMINHAO.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="capacidade_toneladas">Capacidade (toneladas)</Label>
                <Input
                  id="capacidade_toneladas"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 28.5"
                  {...register("capacidade_toneladas")}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experiencia_anos">Anos de Experiência</Label>
                <Input
                  id="experiencia_anos"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="Ex: 10"
                  {...register("experiencia_anos")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="areas_atendimento">
                  Áreas de Atendimento{" "}
                  <span className="text-gray-400 text-xs">(separadas por vírgula)</span>
                </Label>
                <Input
                  id="areas_atendimento"
                  placeholder="Ex: SP, MG, RJ, GO"
                  {...register("areas_atendimento")}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-green-600" />
              Segurança e Diferenciais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("possui_rastreador")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Possui rastreador</span>
                  <p className="text-xs text-gray-500">Veículo equipado com sistema de rastreamento GPS</p>
                </div>
                {possuiRastreador && (
                  <Badge className="ml-auto bg-blue-100 text-blue-700 border-0 text-xs">Ativo</Badge>
                )}
              </label>
              <Separator />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("possui_seguro")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Possui seguro de carga</span>
                  <p className="text-xs text-gray-500">RCTR-C ou seguro de responsabilidade civil</p>
                </div>
                {possuiSeguro && (
                  <Badge className="ml-auto bg-green-100 text-green-700 border-0 text-xs">Ativo</Badge>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-blue-900 hover:bg-blue-800"
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </div>
  );
}
