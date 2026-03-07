export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { FreteChat } from "@/components/shared/FreteChat";
import { AcompanharLayout } from "@/components/shared/AcompanharLayout";
import { ConfirmarEtapaButton } from "@/components/empresa/ConfirmarEtapaButton";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
  FileText,
  Package,
  FileDown,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ETAPAS_CONFIG = [
  { tipo: "aceito", label: "Candidatura aceita", desc: "Empresa aceitou o motorista", icon: "🤝" },
  { tipo: "motorista_a_caminho", label: "Motorista a caminho", desc: "Motorista confirmou saída para coleta", icon: "🚛" },
  { tipo: "coleta_realizada", label: "Coleta realizada", desc: "Carga coletada na origem", icon: "📦" },
  { tipo: "em_transito", label: "Em trânsito", desc: "Carga em rota para o destino", icon: "🛣️" },
  { tipo: "entregue", label: "Entregue", desc: "Motorista confirmou entrega", icon: "✅" },
  { tipo: "concluido", label: "Concluído", desc: "Empresa confirmou recebimento", icon: "🏁" },
];

export default async function EmpresaAcompanharPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "empresa" && session.role !== "admin")) redirect("/login");

  const { id: freteId } = await params;
  const admin = createAdminClient();

  const [{ data: frete }, { data: etapas }, { data: candidaturaAceita }] = await Promise.all([
    admin
      .from("fretes")
      .select("*, empresa:empresas(razao_social)")
      .eq("id", freteId)
      .single(),
    admin
      .from("frete_etapas")
      .select("*")
      .eq("frete_id", freteId)
      .order("confirmado_em", { ascending: true }),
    admin
      .from("candidaturas")
      .select("*, caminhoneiro:caminhoneiros(nome_completo, tipo_caminhao, capacidade_toneladas, telefone, numero_antt, verificado)")
      .eq("frete_id", freteId)
      .eq("status", "aceita")
      .single(),
  ]);

  if (!frete) notFound();
  if (session.role === "empresa" && frete.empresa_id !== session.userId) redirect("/empresa/dashboard");

  // Pre-migration fretes: if em_andamento but no "aceito" row yet, treat it as completed
  const tiposConcluidos = (etapas ?? []).map((e) => e.tipo);
  const effectiveTipos =
    (frete.status === "em_andamento" || frete.status === "concluido") &&
    !tiposConcluidos.includes("aceito")
      ? ["aceito", ...tiposConcluidos]
      : tiposConcluidos;

  const ultimaEtapa = effectiveTipos[effectiveTipos.length - 1];
  const indexUltima = ETAPAS_CONFIG.findIndex((e) => e.tipo === ultimaEtapa);
  const proximaEtapa = indexUltima < ETAPAS_CONFIG.length - 1 ? ETAPAS_CONFIG[indexUltima + 1] : null;
  const isConcluidaPelaEmpresa = effectiveTipos.includes("concluido");
  const progressoPct = Math.round((effectiveTipos.length / ETAPAS_CONFIG.length) * 100);

  const progressoContent = (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            Acompanhamento
          </h2>
          <span className="text-sm font-extrabold text-blue-900">{progressoPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-900 to-blue-500 transition-all duration-700"
            style={{ width: `${progressoPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {effectiveTipos.length} de {ETAPAS_CONFIG.length} etapas concluídas
        </p>
      </div>

      {/* CTA: confirm conclusion */}
      {proximaEtapa?.tipo === "concluido" && !isConcluidaPelaEmpresa && (
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-5 text-white shadow-md">
          <p className="text-green-100 text-xs font-semibold uppercase tracking-wide mb-1">Ação necessária</p>
          <p className="font-bold text-lg mb-1">🏁 Confirmar recebimento da carga</p>
          <p className="text-green-200 text-sm mb-4">
            O motorista marcou a entrega. Confirme que a carga chegou corretamente.
          </p>
          <ConfirmarEtapaButton
            freteId={freteId}
            tipo="concluido"
            label="✅ Confirmar recebimento"
            variant="success"
          />
        </div>
      )}

      {isConcluidaPelaEmpresa && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="font-bold text-green-800 text-lg mb-1">🎉 Frete concluído com sucesso!</p>
          <p className="text-sm text-green-600">Recebimento confirmado. Obrigado!</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 text-sm">Etapas do frete</h3>
        <div className="relative">
          {ETAPAS_CONFIG.map((etapa, idx) => {
            const concluida = effectiveTipos.includes(etapa.tipo);
            const isAtual = etapa.tipo === ultimaEtapa;
            const etapaData = (etapas ?? []).find((e) => e.tipo === etapa.tipo);
            const isLast = idx === ETAPAS_CONFIG.length - 1;

            return (
              <div key={etapa.tipo} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      concluida
                        ? "bg-green-500 border-green-500"
                        : isAtual
                        ? "bg-blue-50 border-blue-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {concluida ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-base">{etapa.icon}</span>
                    )}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${concluida ? "bg-green-300" : "bg-gray-100"}`} />
                  )}
                </div>

                <div className={`pb-4 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                  <p className={`font-semibold text-sm ${concluida ? "text-green-700" : isAtual ? "text-blue-700" : "text-gray-400"}`}>
                    {etapa.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{etapa.desc}</p>
                  {etapaData && (
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                      {new Date(etapaData.confirmado_em).toLocaleString("pt-BR")}
                      {etapaData.observacoes && (
                        <span className="ml-1 text-gray-400">· {etapaData.observacoes}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver info */}
      {candidaturaAceita && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Motorista designado
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-400 rounded-xl flex items-center justify-center text-white font-extrabold text-base shrink-0">
              {candidaturaAceita.caminhoneiro.nome_completo.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900 text-sm">{candidaturaAceita.caminhoneiro.nome_completo}</p>
              {candidaturaAceita.caminhoneiro.verificado && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verificado
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Veículo</p>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gray-500" />
                <p className="font-semibold text-gray-900 text-xs">{candidaturaAceita.caminhoneiro.tipo_caminhao}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Capacidade</p>
              <p className="font-semibold text-gray-900 text-xs">{candidaturaAceita.caminhoneiro.capacidade_toneladas}t</p>
            </div>
            {candidaturaAceita.caminhoneiro.telefone && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Telefone</p>
                <a
                  href={`tel:${candidaturaAceita.caminhoneiro.telefone}`}
                  className="font-semibold text-blue-700 flex items-center gap-1.5 hover:underline text-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {candidaturaAceita.caminhoneiro.telefone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recipient */}
      {frete.destinatario_nome && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            Destinatário
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Nome</p>
                <p className="font-semibold text-gray-900 text-xs">{frete.destinatario_nome}</p>
              </div>
              {frete.destinatario_telefone && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Telefone</p>
                  <a href={`tel:${frete.destinatario_telefone}`} className="font-semibold text-blue-700 text-xs hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {frete.destinatario_telefone}
                  </a>
                </div>
              )}
            </div>
            {frete.destinatario_instrucoes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-xs text-amber-600 font-semibold">Instruções de entrega</p>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{frete.destinatario_instrucoes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const chatContent = (
    <FreteChat
      freteId={freteId}
      currentUserId={session.userId}
      currentUserRole={session.role as "empresa" | "caminhoneiro" | "admin"}
    />
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Back */}
      <Link
        href="/empresa/fretes/ativos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Fretes em andamento
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-gray-900 truncate">{frete.titulo}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 flex-wrap">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span className="font-semibold text-blue-700">{frete.origem_cidade}/{frete.origem_estado}</span>
              <span className="text-gray-300">→</span>
              <span className="font-semibold text-gray-700">{frete.destino_cidade}/{frete.destino_estado}</span>
              {frete.distancia_km && (
                <span className="text-xs text-gray-400 font-medium">
                  · ~{Number(frete.distancia_km).toLocaleString("pt-BR")} km
                </span>
              )}
            </div>
          </div>
          <Link href={`/empresa/fretes/${freteId}/documento`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-gray-600 shrink-0">
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Documento</span>
            </Button>
          </Link>
        </div>
      </div>

      <AcompanharLayout progresso={progressoContent} chat={chatContent} />
    </div>
  );
}
