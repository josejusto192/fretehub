export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FreteSearchFilters } from "@/components/caminhoneiro/FreteSearchFilters";

interface SearchParams {
  origem_estado?: string;
  destino_estado?: string;
  tipo_carga?: string;
}

export default async function CaminhoneiroDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session || session.role !== "caminhoneiro") redirect("/login");

  const params = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("fretes")
    .select("*, empresa:empresas(razao_social, verificado), candidaturas(count)")
    .eq("status", "aberto")
    .order("created_at", { ascending: false });

  if (params.origem_estado) query = query.eq("origem_estado", params.origem_estado);
  if (params.destino_estado) query = query.eq("destino_estado", params.destino_estado);
  if (params.tipo_carga) query = query.ilike("tipo_carga", `%${params.tipo_carga}%`);

  const [{ data: rawFretes }, { data: caminhoneiro }] = await Promise.all([
    query,
    admin
      .from("caminhoneiros")
      .select("nome_completo, tipo_caminhao, capacidade_toneladas, verificado")
      .eq("id", session.userId)
      .single(),
  ]);

  const fretes = (rawFretes ?? []).map((f) => ({
    ...f,
    _count: { candidaturas: f.candidaturas?.[0]?.count ?? 0 },
    candidaturas: undefined,
  }));

  const capacidade = Number(caminhoneiro?.capacidade_toneladas || 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {caminhoneiro?.nome_completo?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">
            {caminhoneiro?.tipo_caminhao} · Capacidade: {capacidade}t
            {caminhoneiro?.verificado ? (
              <span className="ml-2 text-green-600 font-medium">✅ Verificado</span>
            ) : (
              <span className="ml-2 text-yellow-600 font-medium">⏳ Verificação pendente</span>
            )}
          </p>
        </div>
        <Link href="/caminhoneiro/candidaturas">
          <Button variant="outline">Minhas candidaturas</Button>
        </Link>
      </div>

      <FreteSearchFilters />

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {fretes.length} frete{fretes.length !== 1 ? "s" : ""} disponíve
          {fretes.length !== 1 ? "is" : "l"}
        </h2>

        {fretes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <p className="text-lg">Nenhum frete disponível com esses filtros</p>
              <p className="text-sm mt-1">Tente remover alguns filtros para ver mais resultados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {fretes.map((frete) => {
              const pesoMinimo = frete.peso_minimo_ton ? Number(frete.peso_minimo_ton) : null;
              const bloqueado = pesoMinimo !== null && capacidade < pesoMinimo;

              return (
                <Card
                  key={frete.id}
                  className={`hover:shadow-md transition-shadow ${
                    bloqueado ? "opacity-60 border-red-200" : ""
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{frete.titulo}</h3>
                          {frete.empresa.verificado && (
                            <span className="text-xs text-green-600">✅ Empresa verificada</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          🚛 {frete.origem_cidade}/{frete.origem_estado} →{" "}
                          {frete.destino_cidade}/{frete.destino_estado}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          📦 {frete.tipo_carga} · {Number(frete.peso_total_ton)}t total
                          {pesoMinimo && (
                            <span className="ml-1 text-orange-600">· Mínimo: {pesoMinimo}t</span>
                          )}
                        </p>
                        <p className="text-gray-500 text-sm">
                          💰 R$ {Number(frete.valor_por_tonelada).toFixed(2)}/ton · 👥{" "}
                          {frete._count.candidaturas} candidatura
                          {frete._count.candidaturas !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Coleta: {new Date(frete.data_coleta).toLocaleDateString("pt-BR")} ·
                          Entrega: {new Date(frete.prazo_entrega).toLocaleDateString("pt-BR")}
                        </p>
                        {bloqueado && (
                          <p className="text-red-500 text-xs mt-2 font-medium">
                            ⚠️ Sua capacidade ({capacidade}t) é inferior ao peso mínimo exigido (
                            {pesoMinimo}t)
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-900">
                            R$ {Number(frete.valor_por_tonelada).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">por tonelada</div>
                        </div>
                        <Link href={`/caminhoneiro/fretes/${frete.id}`}>
                          <Button
                            size="sm"
                            className="bg-blue-900 hover:bg-blue-800"
                            disabled={bloqueado}
                          >
                            {bloqueado ? "Capacidade insuficiente" : "Ver detalhes"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
