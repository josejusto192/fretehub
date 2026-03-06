"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Caminhoneiro {
  nome_completo: string;
  cpf: string;
  numero_cnh: string;
  categoria_cnh: string;
  numero_antt: string;
  tipo_caminhao: string;
  capacidade_toneladas: number;
  verificado: boolean;
}

interface User {
  email: string;
  status: string;
  caminhoneiro: Caminhoneiro;
}

export default function CaminhoneiroPerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<{
    nome_completo: string;
    tipo_caminhao: string;
    capacidade_toneladas: number;
  }>();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch("/api/perfil");
      const json = await res.json();
      setUser(json.user);
      if (json.user?.caminhoneiro) {
        reset({
          nome_completo: json.user.caminhoneiro.nome_completo,
          tipo_caminhao: json.user.caminhoneiro.tipo_caminhao,
          capacidade_toneladas: Number(json.user.caminhoneiro.capacidade_toneladas),
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: {
    nome_completo: string;
    tipo_caminhao: string;
    capacidade_toneladas: number;
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
        <p className="text-gray-500 mt-1">Gerencie suas informações de caminhoneiro</p>
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
                {user.caminhoneiro?.verificado && (
                  <Badge className="bg-green-100 text-green-700 border-0">✅ Verificado</Badge>
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
              <strong>CPF:</strong> {user?.caminhoneiro?.cpf}
            </p>
            <p>
              <strong>CNH:</strong> {user?.caminhoneiro?.numero_cnh} —{" "}
              Categoria {user?.caminhoneiro?.categoria_cnh}
            </p>
            <p>
              <strong>ANTT/RNTRC:</strong> {user?.caminhoneiro?.numero_antt}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input id="nome_completo" {...register("nome_completo")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tipo_caminhao">Tipo de Caminhão</Label>
              <Input id="tipo_caminhao" {...register("tipo_caminhao")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="capacidade_toneladas">Capacidade (toneladas)</Label>
              <Input
                id="capacidade_toneladas"
                type="number"
                step="0.1"
                {...register("capacidade_toneladas")}
                className="mt-1"
              />
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
