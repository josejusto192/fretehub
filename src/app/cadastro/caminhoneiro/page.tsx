"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_BRASILEIROS, TIPOS_CAMINHAO, CATEGORIAS_CNH } from "@/lib/constants";

const caminhoneiroSchema = z.object({
  nome_completo: z.string().min(2, "Nome completo obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  numero_cnh: z.string().min(1, "Número da CNH obrigatório"),
  categoria_cnh: z.string().min(1, "Categoria da CNH obrigatória"),
  numero_antt: z.string().min(1, "Número ANTT obrigatório"),
  tipo_caminhao: z.string().min(1, "Tipo de caminhão obrigatório"),
  capacidade_toneladas: z.string().min(1, "Capacidade obrigatória"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "Selecione um estado"),
});

type CaminhoneiroForm = z.infer<typeof caminhoneiroSchema>;

export default function CadastroCaminhoneiroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CaminhoneiroForm>({ resolver: zodResolver(caminhoneiroSchema) });

  const onSubmit = async (data: CaminhoneiroForm) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ""),
        capacidade_toneladas: Number(data.capacidade_toneladas),
      };
      const res = await fetch("/api/auth/cadastro/caminhoneiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao cadastrar");
        return;
      }

      toast.success("Conta criada com sucesso! Verifique seu e-mail.");
      router.push("/caminhoneiro/dashboard");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🚛</span>
            <span className="text-2xl font-bold text-blue-900">FreteHub</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🚛 Cadastro de Caminhoneiro
            </CardTitle>
            <CardDescription>
              Crie sua conta para encontrar fretes em todo o Brasil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <Input
                  id="nome_completo"
                  placeholder="João da Silva"
                  {...register("nome_completo")}
                  className="mt-1"
                />
                {errors.nome_completo && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome_completo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  {...register("cpf")}
                  className="mt-1"
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@email.com"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="numero_cnh">Número da CNH</Label>
                  <Input
                    id="numero_cnh"
                    placeholder="00000000000"
                    {...register("numero_cnh")}
                    className="mt-1"
                  />
                  {errors.numero_cnh && (
                    <p className="text-red-500 text-sm mt-1">{errors.numero_cnh.message}</p>
                  )}
                </div>
                <div>
                  <Label>Categoria CNH</Label>
                  <Select onValueChange={(v) => setValue("categoria_cnh", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_CNH.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria_cnh && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoria_cnh.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="numero_antt">Número ANTT / RNTRC</Label>
                <Input
                  id="numero_antt"
                  placeholder="00000000"
                  {...register("numero_antt")}
                  className="mt-1"
                />
                {errors.numero_antt && (
                  <p className="text-red-500 text-sm mt-1">{errors.numero_antt.message}</p>
                )}
              </div>

              <div>
                <Label>Tipo de Caminhão</Label>
                <Select onValueChange={(v) => setValue("tipo_caminhao", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CAMINHAO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo_caminhao && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipo_caminhao.message}</p>
                )}
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
                {errors.capacidade_toneladas && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.capacidade_toneladas.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cidade">Cidade Base</Label>
                  <Input
                    id="cidade"
                    placeholder="São Paulo"
                    {...register("cidade")}
                    className="mt-1"
                  />
                  {errors.cidade && (
                    <p className="text-red-500 text-sm mt-1">{errors.cidade.message}</p>
                  )}
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select onValueChange={(v) => setValue("estado", v)}>
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
                  {errors.estado && (
                    <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-white"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta de caminhoneiro"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Já tem conta?{" "}
              <Link href="/login" className="text-blue-700 hover:underline font-medium">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
