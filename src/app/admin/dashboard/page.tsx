export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  Package,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  Building2,
  Truck,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const admin = createAdminClient();

  const [
    { count: totalUsuarios },
    { count: empresasPendentes },
    { count: caminhoneirosPendentes },
    { count: totalFretes },
    { count: fretesAbertos },
    { count: totalCandidaturas },
    { data: usuariosRecentes },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "empresa")
      .eq("status", "pendente"),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "caminhoneiro")
      .eq("status", "pendente"),
    admin.from("fretes").select("*", { count: "exact", head: true }),
    admin.from("fretes").select("*", { count: "exact", head: true }).eq("status", "aberto"),
    admin.from("candidaturas").select("*", { count: "exact", head: true }),
    admin
      .from("users")
      .select("id, email, role, status, created_at, empresa:empresas(razao_social), caminhoneiro:caminhoneiros(nome_completo)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const statCards = [
    {
      title: "Total de Usuários",
      value: totalUsuarios ?? 0,
      icon: Users,
      gradient: "from-blue-900 to-blue-700",
      iconColor: "text-blue-300",
      textColor: "text-blue-200",
    },
    {
      title: "Empresas Pendentes",
      value: empresasPendentes ?? 0,
      icon: Building2,
      gradient: empresasPendentes ? "from-amber-600 to-amber-400" : "from-gray-600 to-gray-500",
      iconColor: empresasPendentes ? "text-amber-100" : "text-gray-300",
      textColor: empresasPendentes ? "text-amber-100" : "text-gray-300",
      alert: !!empresasPendentes,
    },
    {
      title: "Caminhoneiros Pendentes",
      value: caminhoneirosPendentes ?? 0,
      icon: Truck,
      gradient: caminhoneirosPendentes ? "from-orange-600 to-orange-400" : "from-gray-600 to-gray-500",
      iconColor: caminhoneirosPendentes ? "text-orange-100" : "text-gray-300",
      textColor: caminhoneirosPendentes ? "text-orange-100" : "text-gray-300",
      alert: !!caminhoneirosPendentes,
    },
    {
      title: "Total de Fretes",
      value: totalFretes ?? 0,
      icon: Package,
      gradient: "from-purple-700 to-purple-500",
      iconColor: "text-purple-300",
      textColor: "text-purple-200",
    },
    {
      title: "Fretes Abertos",
      value: fretesAbertos ?? 0,
      icon: CheckCircle2,
      gradient: "from-green-700 to-green-500",
      iconColor: "text-green-300",
      textColor: "text-green-200",
    },
    {
      title: "Total Candidaturas",
      value: totalCandidaturas ?? 0,
      icon: ClipboardList,
      gradient: "from-teal-700 to-teal-500",
      iconColor: "text-teal-300",
      textColor: "text-teal-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Painel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral da plataforma FreteHub</p>
        </div>
        <Link href="/admin/usuarios">
          <Button className="bg-blue-900 hover:bg-blue-800 shadow-sm font-semibold">
            <Users className="w-4 h-4 mr-2" />
            Gerenciar usuários
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-lg`}
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              {card.alert && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              )}
              <Icon className={`w-8 h-8 ${card.iconColor} mb-3`} />
              <div className="text-4xl font-extrabold">{card.value}</div>
              <div className={`${card.textColor} text-sm font-medium mt-1`}>{card.title}</div>
            </div>
          );
        })}
      </div>

      {/* Recent users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-gray-900 text-lg">Usuários Recentes</h2>
          </div>
          <Link href="/admin/usuarios">
            <Button variant="outline" size="sm">
              Ver todos
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nome / Empresa
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cadastrado em
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {((usuariosRecentes ?? []) as any[]).map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-gray-900">
                    {u.empresa?.razao_social || u.caminhoneiro?.nome_completo || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === "empresa"
                          ? "bg-blue-100 text-blue-700"
                          : u.role === "caminhoneiro"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {u.role === "empresa" ? (
                        <Building2 className="w-3 h-3 mr-1" />
                      ) : u.role === "caminhoneiro" ? (
                        <Truck className="w-3 h-3 mr-1" />
                      ) : null}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.status === "ativo"
                          ? "bg-green-100 text-green-700"
                          : u.status === "pendente"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.status === "ativo" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : u.status === "pendente" ? (
                        <Clock className="w-3 h-3 mr-1" />
                      ) : null}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
