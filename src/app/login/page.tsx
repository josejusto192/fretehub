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
import { Truck, ArrowRight, Building2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao fazer login");
        return;
      }

      const { user } = json;

      if (user.role === "empresa") {
        router.push("/empresa/dashboard");
      } else if (user.role === "caminhoneiro") {
        router.push("/caminhoneiro/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Frete<span className="text-amber-400">Hub</span>
            </span>
          </Link>
          <p className="text-blue-300 text-sm mt-2">Plataforma de logística de grande porte</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-gray-900">Entrar na plataforma</h1>
            <p className="text-gray-500 text-sm mt-1">Acesse sua conta de empresa ou caminhoneiro</p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className="mt-1.5 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Senha
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-900 hover:bg-blue-800 font-bold text-sm shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  "Entrando..."
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">Não tem conta?</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Sign up options */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/cadastro/empresa">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                  <Building2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Empresa</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Publicar fretes</p>
                  </div>
                </div>
              </Link>
              <Link href="/cadastro/caminhoneiro">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer group">
                  <Truck className="w-4 h-4 text-gray-400 group-hover:text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Caminhoneiro</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Encontrar fretes</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-400 text-xs mt-6">
          © {new Date().getFullYear()} FreteHub · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
