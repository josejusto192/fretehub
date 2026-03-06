export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
        <Link href="/admin/usuarios">
          <Button className="bg-blue-900 hover:bg-blue-800">Gerenciar usuários</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalUsuarios ?? 0}</div>
          </CardContent>
        </Card>

        <Card className={empresasPendentes ? "border-yellow-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Empresas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{empresasPendentes ?? 0}</div>
          </CardContent>
        </Card>

        <Card className={caminhoneirosPendentes ? "border-yellow-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Caminhoneiros Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{caminhoneirosPendentes ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total de Fretes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalFretes ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Fretes Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{fretesAbertos ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Candidaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalCandidaturas ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuários Recentes</CardTitle>
            <Link href="/admin/usuarios">
              <Button variant="outline" size="sm">Ver todos</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-3 px-2">Nome/Empresa</th>
                  <th className="text-left py-3 px-2">E-mail</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Cadastrado em</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {((usuariosRecentes ?? []) as any[]).map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">
                      {u.empresa?.razao_social || u.caminhoneiro?.nome_completo || "—"}
                    </td>
                    <td className="py-3 px-2 text-gray-600">{u.email}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "empresa"
                            ? "bg-blue-100 text-blue-700"
                            : u.role === "caminhoneiro"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status === "ativo"
                            ? "bg-green-100 text-green-700"
                            : u.status === "pendente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
