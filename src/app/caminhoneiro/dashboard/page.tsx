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
  if (!session || session.role !== "caminhoneiro" && session.role !== "admin") redirect("/login");

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
    <div className="space-y-8">
      {/* Driver profile header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">
                Olá, {caminhoneiro?.nome_completo?.split(" ")[0]}!
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {caminhoneiro?.tipo_caminhao} · Capacidade: <strong className="text-white">{capacidade}t</strong>
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
          <Link href="/caminhoneiro/candidaturas">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Minhas candidaturas
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <FreteSearchFilters />

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            {fretes.length} frete{fretes.length !== 1 ? "s" : ""} disponíve{fretes.length !== 1 ? "is" : "l"}
          </h2>
        </div>

        {fretes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
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

              return (
                <div
                  key={frete.id}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all group ${
                    bloqueado
                      ? "border-red-100 opacity-70"
                      : "border-gray-100 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-base">{frete.titulo}</h3>
                          {frete.empresa?.verificado && (
                            <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Verificada
                            </span>
                          )}
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-medium text-blue-700">
                            {frete.origem_cidade}/{frete.origem_estado}
                          </span>
                          <span className="text-gray-300">→</span>
                          <span className="font-medium text-gray-700">
                            {frete.destino_cidade}/{frete.destino_estado}
                          </span>
                        </div>

                        {/* Details pills */}
                        <div className="flex flex-wrap gap-2">
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
                            <Users className="w-3 h-3" />
                            {frete._count.candidaturas} candidatura{frete._count.candidaturas !== 1 ? "s" : ""}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                            <Calendar className="w-3 h-3" />
                            Coleta: {new Date(frete.data_coleta).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {bloqueado && (
                          <div className="flex items-center gap-1.5 text-red-600 text-xs mt-3 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Sua capacidade ({capacidade}t) é inferior ao mínimo exigido ({pesoMinimo}t)
                          </div>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-blue-900">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xl font-extrabold">
                              {Number(frete.valor_por_tonelada).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 font-medium">por tonelada</div>
                        </div>
                        <Link href={`/caminhoneiro/fretes/${frete.id}`}>
                          <Button
                            size="sm"
                            disabled={bloqueado}
                            className={
                              bloqueado
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
