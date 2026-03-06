export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { CandidaturaForm } from "@/components/caminhoneiro/CandidaturaForm";
import { FreteRouteMap } from "@/components/shared/FreteRouteMap";
import {
  MapPin,
  Package,
  Weight,
  DollarSign,
  Calendar,
  CalendarCheck,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Building2,
  ClipboardList,
} from "lucide-react";

export default async function FreteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "caminhoneiro" && session.role !== "admin"))
    redirect("/login");

  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: frete }, { data: caminhoneiro }, { data: candidaturaExistente }] =
    await Promise.all([
      admin
        .from("fretes")
        .select(
          "*, empresa:empresas(razao_social, telefone, verificado), candidaturas(count)"
        )
        .eq("id", id)
        .single(),
      admin
        .from("caminhoneiros")
        .select("capacidade_toneladas, nome_completo")
        .eq("id", session.userId)
        .single(),
      admin
        .from("candidaturas")
        .select("id, status")
        .eq("frete_id", id)
        .eq("caminhoneiro_id", session.userId)
        .single(),
    ]);

  if (!frete) notFound();

  const capacidade = Number(caminhoneiro?.capacidade_toneladas || 0);
  const pesoMinimo = frete.peso_minimo_ton ? Number(frete.peso_minimo_ton) : null;
  const bloqueado = pesoMinimo !== null && capacidade < pesoMinimo;
  const valorTotal = Number(frete.valor_por_tonelada) * Number(frete.peso_total_ton);
  const totalCandidaturas = frete.candidaturas?.[0]?.count ?? 0;

  const temMapa =
    frete.origem_lat != null &&
    frete.origem_lng != null &&
    frete.destino_lat != null &&
    frete.destino_lng != null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link
        href="/caminhoneiro/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar à busca
      </Link>

      {/* Title card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">{frete.titulo}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Building2 className="w-3.5 h-3.5" />
              <span>{frete.empresa.razao_social}</span>
              {frete.empresa.verificado && (
                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 text-xs font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Verificada
                </span>
              )}
            </div>
          </div>
          <Badge
            className={
              frete.status === "aberto"
                ? "bg-green-100 text-green-700 border-green-200 font-semibold"
                : "bg-gray-100 text-gray-600 border-gray-200 font-semibold"
            }
          >
            {frete.status === "aberto" ? "Aberto" : frete.status}
          </Badge>
        </div>

        {/* Route highlight */}
        <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-100">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-blue-800 text-sm">
            {frete.origem_cidade} / {frete.origem_estado}
          </span>
          <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="font-semibold text-gray-700 text-sm">
            {frete.destino_cidade} / {frete.destino_estado}
          </span>
          {frete.distancia_km && (
            <span className="ml-auto text-xs font-bold text-blue-600 shrink-0">
              ~{Number(frete.distancia_km).toLocaleString("pt-BR")} km
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      {temMapa && (
        <FreteRouteMap
          origemLat={Number(frete.origem_lat)}
          origemLng={Number(frete.origem_lng)}
          origemLabel={`${frete.origem_cidade}, ${frete.origem_estado}`}
          destinoLat={Number(frete.destino_lat)}
          destinoLng={Number(frete.destino_lng)}
          destinoLabel={`${frete.destino_cidade}, ${frete.destino_estado}`}
          distanciaKm={frete.distancia_km ? Number(frete.distancia_km) : undefined}
        />
      )}

      {/* Details grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-500">
          Detalhes da Carga
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Package className="w-3.5 h-3.5" />
              Tipo de Carga
            </div>
            <p className="font-semibold text-gray-900 text-sm">{frete.tipo_carga}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Weight className="w-3.5 h-3.5" />
              Peso Total
            </div>
            <p className="font-semibold text-gray-900 text-sm">{Number(frete.peso_total_ton)}t</p>
          </div>

          {pesoMinimo && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Peso Mínimo Exigido
              </div>
              <p className="font-semibold text-amber-700 text-sm">{pesoMinimo}t</p>
            </div>
          )}

          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="flex items-center gap-1.5 text-xs text-green-600 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Valor por Tonelada
            </div>
            <p className="font-semibold text-green-700 text-sm">
              R$ {Number(frete.valor_por_tonelada).toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Data de Coleta
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {new Date(frete.data_coleta).toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <CalendarCheck className="w-3.5 h-3.5" />
              Prazo de Entrega
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {new Date(frete.prazo_entrega).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Value summary */}
        <div className="mt-4 bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-4 text-white flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-xs font-medium mb-0.5">Valor total estimado da carga</p>
            <p className="text-2xl font-extrabold">R$ {valorTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-blue-300 text-xs justify-end">
              <Users className="w-3.5 h-3.5" />
              {totalCandidaturas} candidatura{totalCandidaturas !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {frete.observacoes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
              Observações
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{frete.observacoes}</p>
          </div>
        )}
      </div>

      {/* Application section */}
      {frete.status === "aberto" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Candidatar-se a este frete
          </h2>

          {candidaturaExistente ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-green-800 font-semibold">Você já se candidatou a este frete</p>
                  <p className="text-green-600 text-sm mt-0.5">
                    Status da candidatura:{" "}
                    <strong className="capitalize">{candidaturaExistente.status}</strong>
                  </p>
                  <Link
                    href="/caminhoneiro/candidaturas"
                    className="inline-flex items-center gap-1 text-blue-700 text-sm mt-2 hover:underline font-medium"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Ver minhas candidaturas
                  </Link>
                </div>
              </div>
            </div>
          ) : bloqueado ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-800 font-semibold">Capacidade insuficiente</p>
                  <p className="text-red-600 text-sm mt-0.5">
                    Sua capacidade ({capacidade}t) é inferior ao peso mínimo exigido ({pesoMinimo}t).
                    Você não pode se candidatar a este frete.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <CandidaturaForm freteId={frete.id} capacidadeMaxima={capacidade} />
          )}
        </div>
      )}
    </div>
  );
}
