"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Empresa {
  razao_social: string;
  cnpj: string;
  telefone: string;
  verificado: boolean;
  endereco: { cidade: string; estado: string };
}

interface User {
  email: string;
  status: string;
  empresa: Empresa;
}

export default function EmpresaPerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<{
    razao_social: string;
    telefone: string;
    cidade: string;
    estado: string;
  }>();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch("/api/perfil");
      const json = await res.json();
      setUser(json.user);
      if (json.user?.empresa) {
        reset({
          razao_social: json.user.empresa.razao_social,
          telefone: json.user.empresa.telefone,
          cidade: json.user.empresa.endereco?.cidade || "",
          estado: json.user.empresa.endereco?.estado || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: {
    razao_social: string;
    telefone: string;
    cidade: string;
    estado: string;
  }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">Gerencie as informações da sua empresa</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações da Conta</span>
            {user && (
              <div className="flex gap-2">
                <Badge variant={user.status === "ativo" ? "default" : "secondary"}>
                  {user.status === "ativo" ? "Ativo" : user.status}
                </Badge>
                {user.empresa?.verificado && (
                  <Badge className="bg-green-100 text-green-700 border-0">✅ Verificada</Badge>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>E-mail:</strong> {user?.email}
            </p>
            <p>
              <strong>CNPJ:</strong> {user?.empresa?.cnpj}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input id="razao_social" {...register("razao_social")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register("telefone")} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...register("cidade")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" {...register("estado")} maxLength={2} className="mt-1" />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-blue-900 hover:bg-blue-800"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
