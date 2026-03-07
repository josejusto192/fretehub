export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { FreteSearchFilters } from "@/components/caminhoneiro/FreteSearchFilters";
import {
  Truck,
  MapPin,
  Package,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  Search,
  Route,
} from "lucide-react";

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
  if (!session || (session.role !== "caminhoneiro" && session.role !== "admin"))
    redirect("/login");

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
  const fretesDisponiveis = fretes.filter((f) => {
    const pesoMin = f.peso_minimo_ton ? Number(f.peso_minimo_ton) : null;
    return pesoMin === null || capacidade >= pesoMin;
  }).length;

  return (
    <div className="space-y-7">
      {/* Driver profile header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">
                Olá, {caminhoneiro?.nome_completo?.split(" ")[0]}!
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {caminhoneiro?.tipo_caminhao} ·{" "}
                <strong className="text-white">{capacidade}t</strong> de capacidade
              </p>
              <div className="mt-2">
                {caminhoneiro?.verificado ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-300 bg-green-900/40 border border-green-500/30 rounded-full px-2.5 py-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Motorista verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-900/40 border border-amber-500/30 rounded-full px-2.5 py-1">
                    <Clock className="w-3 h-3" />
                    Verificação pendente
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end shrink-0">
            <Link href="/caminhoneiro/candidaturas">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Candidaturas
              </Button>
            </Link>
            <p className="text-blue-300 text-xs text-right">
              <strong className="text-white">{fretesDisponiveis}</strong> fretes compatíveis
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FreteSearchFilters />

      {/* Results heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          {fretes.length} frete{fretes.length !== 1 ? "s" : ""} disponíve
          {fretes.length !== 1 ? "is" : "l"}
        </h2>
      </div>

      {/* Freight list */}
      {fretes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Nenhum frete disponível</h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Tente remover alguns filtros para ver mais resultados
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {fretes.map((frete) => {
            const pesoMinimo = frete.peso_minimo_ton ? Number(frete.peso_minimo_ton) : null;
            const bloqueado = pesoMinimo !== null && capacidade < pesoMinimo;
            const valorTotal =
              Number(frete.valor_por_tonelada) * Number(frete.peso_total_ton);

            return (
              <div
                key={frete.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all group ${
                  bloqueado
                    ? "border-red-100 opacity-60"
                    : "border-gray-100 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base truncate">
                          {frete.titulo}
                        </h3>
                        {frete.empresa?.verificado && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Verificada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{frete.empresa?.razao_social}</p>
                    </div>

                    {/* Price badge */}
                    <div className="shrink-0 text-right bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                      <div className="flex items-center gap-0.5 text-blue-900 justify-end">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="text-lg font-extrabold">
                          {Number(frete.valor_por_tonelada).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">por ton</div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-semibold text-blue-700 text-sm">
                      {frete.origem_cidade}/{frete.origem_estado}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-700 text-sm">
                      {frete.destino_cidade}/{frete.destino_estado}
                    </span>
                    {frete.distancia_km && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-bold text-gray-500 shrink-0">
                        <Route className="w-3.5 h-3.5" />
                        ~{Number(frete.distancia_km).toLocaleString("pt-BR")} km
                      </span>
                    )}
                  </div>

                  {/* Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                      <Package className="w-3 h-3" />
                      {frete.tipo_carga}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                      <Truck className="w-3 h-3" />
                      {Number(frete.peso_total_ton)}t total
                      {pesoMinimo && (
                        <span className="text-amber-600 ml-1">· mín. {pesoMinimo}t</span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                      <Calendar className="w-3 h-3" />
                      Coleta: {new Date(frete.data_coleta).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                      <Users className="w-3 h-3" />
                      {frete._count.candidaturas} candidatura
                      {frete._count.candidaturas !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between gap-3">
                    {bloqueado ? (
                      <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Sua capacidade ({capacidade}t) &lt; mínimo exigido ({pesoMinimo}t)
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Valor total estimado:{" "}
                        <strong className="text-green-700 font-bold">
                          R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    )}

                    <Link href={`/caminhoneiro/fretes/${frete.id}`}>
                      <Button
                        size="sm"
                        disabled={bloqueado}
                        className={
                          bloqueado
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-900 hover:bg-blue-800 shadow-sm font-semibold"
                        }
                      >
                        {bloqueado ? "Bloqueado" : "Ver detalhes"}
                        {!bloqueado && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
