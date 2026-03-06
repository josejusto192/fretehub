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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin, Globe, Users, Phone, CheckCircle2 } from "lucide-react";
import { ESTADOS_BRASILEIROS } from "@/lib/constants";

interface Empresa {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  telefone: string;
  verificado: boolean;
  endereco: { cidade: string; estado: string };
  site?: string;
  descricao?: string;
  numero_funcionarios?: number;
}

interface User {
  email: string;
  status: string;
  empresa: Empresa;
}

type ProfileForm = {
  razao_social: string;
  nome_fantasia: string;
  telefone: string;
  site: string;
  descricao: string;
  numero_funcionarios: string;
  cidade: string;
  estado: string;
};

const FAIXAS_FUNCIONARIOS = [
  { value: "1", label: "1 — Autônomo / MEI" },
  { value: "5", label: "2 a 10 funcionários" },
  { value: "25", label: "11 a 50 funcionários" },
  { value: "100", label: "51 a 200 funcionários" },
  { value: "500", label: "201 a 1.000 funcionários" },
  { value: "1001", label: "Mais de 1.000 funcionários" },
];

export default function EmpresaPerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control } = useForm<ProfileForm>();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch("/api/perfil");
      const json = await res.json();
      setUser(json.user);
      const e = json.user?.empresa;
      if (e) {
        reset({
          razao_social: e.razao_social || "",
          nome_fantasia: e.nome_fantasia || "",
          telefone: e.telefone || "",
          site: e.site || "",
          descricao: e.descricao || "",
          numero_funcionarios: e.numero_funcionarios?.toString() || "",
          cidade: e.endereco?.cidade || "",
          estado: e.endereco?.estado || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const payload = {
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        telefone: data.telefone,
        site: data.site,
        descricao: data.descricao,
        numero_funcionarios: data.numero_funcionarios ? Number(data.numero_funcionarios) : null,
        cidade: data.cidade,
        estado: data.estado,
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

  const e = user?.empresa;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>
        <p className="text-gray-500 mt-1">Gerencie as informações da sua empresa</p>
      </div>

      {/* Read-only info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações da Conta</span>
            {user && (
              <div className="flex gap-2">
                <Badge variant={user.status === "ativo" ? "default" : "secondary"}>
                  {user.status === "ativo" ? "Ativo" : user.status}
                </Badge>
                {e?.verificado && (
                  <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verificada
                  </Badge>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <p><strong>E-mail:</strong> {user?.email}</p>
            <p><strong>CNPJ:</strong> {e?.cnpj}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Company identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-900" />
              Identidade da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input id="razao_social" {...register("razao_social")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="nome_fantasia">
                  Nome Fantasia{" "}
                  <span className="text-gray-400 text-xs">(opcional)</span>
                </Label>
                <Input
                  id="nome_fantasia"
                  placeholder="Como é conhecido no mercado"
                  {...register("nome_fantasia")}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Sobre a Empresa</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva a empresa, ramos de atuação, diferenciais, tipos de carga frequentes..."
                {...register("descricao")}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-blue-600" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 3333-4444"
                  {...register("telefone")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="site">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Site{" "}
                    <span className="text-gray-400 text-xs">(opcional)</span>
                  </span>
                </Label>
                <Input
                  id="site"
                  type="url"
                  placeholder="https://www.suaempresa.com.br"
                  {...register("site")}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-red-500" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="São Paulo"
                  {...register("cidade")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Controller
                  control={control}
                  name="estado"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASILEIROS.map((est) => (
                          <SelectItem key={est.value} value={est.value}>
                            {est.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-purple-600" />
              Porte da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Número de Funcionários</Label>
            <Controller
              control={control}
              name="numero_funcionarios"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a faixa" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAIXAS_FUNCIONARIOS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
