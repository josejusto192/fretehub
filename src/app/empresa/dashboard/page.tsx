export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function EmpresaDashboard() {
  const session = await getSession();
  if (!session || session.role !== "empresa") redirect("/login");

  const admin = createAdminClient();

  const [{ data: rawFretes }, { data: empresa }] = await Promise.all([
    admin
      .from("fretes")
      .select("*, candidaturas(id, status)")
      .eq("empresa_id", session.userId)
      .order("created_at", { ascending: false }),
    admin.from("empresas").select("razao_social, verificado").eq("id", session.userId).single(),
  ]);

  const fretes = (rawFretes ?? []).map((f) => ({
    ...f,
    _count: { candidaturas: f.candidaturas.length },
    candidaturas: f.candidaturas.filter((c: { status: string }) => c.status === "pendente"),
  }));

  const totalAbertos = fretes.filter((f) => f.status === "aberto").length;
  const totalEmAndamento = fretes.filter((f) => f.status === "em_andamento").length;
  const totalCandidaturasPendentes = fretes.reduce((acc, f) => acc + f.candidaturas.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard — {empresa?.razao_social}
          </h1>
          <p className="text-gray-500 mt-1">
            {empresa?.verificado ? (
              <span className="text-green-600 font-medium">✅ Empresa verificada</span>
            ) : (
              <span className="text-yellow-600 font-medium">⏳ Verificação pendente</span>
            )}
          </p>
        </div>
        <Link href="/empresa/fretes/novo">
          <Button className="bg-blue-900 hover:bg-blue-800">+ Publicar novo frete</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Fretes Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalAbertos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{totalEmAndamento}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Candidaturas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{totalCandidaturasPendentes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Fretes</CardTitle>
        </CardHeader>
        <CardContent>
          {fretes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Nenhum frete publicado ainda</p>
              <Link href="/empresa/fretes/novo" className="mt-4 inline-block">
                <Button className="bg-blue-900 hover:bg-blue-800">Publicar primeiro frete</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-3 px-2">Título</th>
                    <th className="text-left py-3 px-2">Rota</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Candidaturas</th>
                    <th className="text-left py-3 px-2">Coleta</th>
                    <th className="text-left py-3 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fretes.map((frete) => (
                    <tr key={frete.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{frete.titulo}</td>
                      <td className="py-3 px-2 text-gray-600">
                        {frete.origem_cidade}/{frete.origem_estado} →{" "}
                        {frete.destino_cidade}/{frete.destino_estado}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={frete.status} />
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium">{frete._count.candidaturas}</span>
                        {frete.candidaturas.length > 0 && (
                          <span className="ml-1 text-yellow-600 text-xs font-medium">
                            ({frete.candidaturas.length} pendente
                            {frete.candidaturas.length > 1 ? "s" : ""})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {new Date(frete.data_coleta).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-2">
                        <Link href={`/empresa/fretes/${frete.id}/candidaturas`}>
                          <Button variant="outline" size="sm">
                            Ver candidaturas
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
