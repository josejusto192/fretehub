export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

export default async function MeusCandidaturasPage() {
  const session = await getSession();
  if (!session || session.role !== "caminhoneiro" && session.role !== "admin") redirect("/login");

  const admin = createAdminClient();
  const { data: candidaturas } = await admin
    .from("candidaturas")
    .select("*, frete:fretes(*, empresa:empresas(razao_social))")
    .eq("caminhoneiro_id", session.userId)
    .order("created_at", { ascending: false });

  const list = candidaturas ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link href="/caminhoneiro/dashboard" className="text-blue-700 text-sm hover:underline">
          ← Voltar à busca
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Minhas Candidaturas</h1>
        <p className="text-gray-500 mt-1">
          {list.length} candidatura{list.length !== 1 ? "s" : ""} no total
        </p>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <p className="text-lg">Você ainda não se candidatou a nenhum frete</p>
            <Link href="/caminhoneiro/dashboard" className="mt-4 inline-block">
              <Button className="bg-blue-900 hover:bg-blue-800">Buscar fretes</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {list.map((candidatura) => (
            <Card key={candidatura.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{candidatura.frete.titulo}</h3>
                      <StatusBadge status={candidatura.status} />
                    </div>
                    <p className="text-gray-600 text-sm">
                      🏢 {candidatura.frete.empresa.razao_social}
                    </p>
                    <p className="text-gray-500 text-sm">
                      🚛 {candidatura.frete.origem_cidade}/{candidatura.frete.origem_estado} →{" "}
                      {candidatura.frete.destino_cidade}/{candidatura.frete.destino_estado}
                    </p>
                    <p className="text-gray-500 text-sm">
                      📦 {candidatura.frete.tipo_carga} · Ofertei:{" "}
                      <strong>{Number(candidatura.toneladas_ofertadas)}t</strong>
                    </p>
                    {candidatura.mensagem && (
                      <p className="text-gray-400 text-sm italic mt-1">
                        &quot;{candidatura.mensagem}&quot;
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Candidatura enviada em{" "}
                      {new Date(candidatura.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right text-sm">
                      <div className="font-bold text-green-700">
                        R$ {Number(candidatura.frete.valor_por_tonelada).toFixed(2)}/ton
                      </div>
                      <div className="text-gray-400 text-xs">
                        Coleta:{" "}
                        {new Date(candidatura.frete.data_coleta).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <Link href={`/caminhoneiro/fretes/${candidatura.frete_id}`}>
                      <Button variant="outline" size="sm">
                        Ver frete
                      </Button>
                    </Link>
                  </div>
                </div>

                {candidatura.status === "aceita" && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 text-sm font-medium">
                      🎉 Parabéns! Sua candidatura foi aceita. Entre em contato com a empresa para
                      combinar os próximos passos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
