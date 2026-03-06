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
import { ESTADOS_BRASILEIROS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const empresaSchema = z.object({
  razao_social: z.string().min(2, "Razão social obrigatória"),
  cnpj: z
    .string()
    .min(14, "CNPJ deve ter 14 dígitos")
    .max(18)
    .transform((v) => v.replace(/\D/g, "")),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "Selecione um estado"),
});

type EmpresaForm = z.infer<typeof empresaSchema>;

export default function CadastroEmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmpresaForm>({ resolver: zodResolver(empresaSchema) });

  const onSubmit = async (data: EmpresaForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/cadastro/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao cadastrar");
        return;
      }

      toast.success("Conta criada com sucesso! Verifique seu e-mail.");
      router.push("/empresa/dashboard");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
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
              🏢 Cadastro de Empresa
            </CardTitle>
            <CardDescription>
              Crie sua conta para publicar fretes e encontrar caminhoneiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    placeholder="Transportes XYZ Ltda"
                    {...register("razao_social")}
                    className="mt-1"
                  />
                  {errors.razao_social && (
                    <p className="text-red-500 text-sm mt-1">{errors.razao_social.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0001-00"
                    {...register("cnpj")}
                    className="mt-1"
                  />
                  {errors.cnpj && (
                    <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com"
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

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    {...register("telefone")}
                    className="mt-1"
                  />
                  {errors.telefone && (
                    <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
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
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta de empresa"}
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
