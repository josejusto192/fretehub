export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { FreteChat } from "@/components/shared/FreteChat";
import { AcompanharLayout } from "@/components/shared/AcompanharLayout";
import { AvancarEtapaButton } from "@/components/caminhoneiro/AvancarEtapaButton";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  FileText,
  Package,
} from "lucide-react";

const ETAPAS_CONFIG = [
  { tipo: "aceito", label: "Candidatura aceita", desc: "Empresa aceitou você para este frete", icon: "🤝", quemConfirma: "sistema" },
  { tipo: "motorista_a_caminho", label: "Motorista a caminho", desc: "Confirme quando sair em direção ao local de coleta", icon: "🚛", quemConfirma: "caminhoneiro" },
  { tipo: "coleta_realizada", label: "Coleta realizada", desc: "Confirme quando a carga estiver no caminhão", icon: "📦", quemConfirma: "caminhoneiro" },
  { tipo: "em_transito", label: "Em trânsito", desc: "Confirme quando estiver em rota para o destino", icon: "🛣️", quemConfirma: "caminhoneiro" },
  { tipo: "entregue", label: "Entregue ao destinatário", desc: "Confirme quando a carga for entregue", icon: "✅", quemConfirma: "caminhoneiro" },
  { tipo: "concluido", label: "Concluído", desc: "Empresa confirma o recebimento da carga", icon: "🏁", quemConfirma: "empresa" },
];

export default async function CaminhoneiroAcompanharPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "caminhoneiro" && session.role !== "admin")) redirect("/login");

  const { id: freteId } = await params;
  const admin = createAdminClient();

  const [{ data: frete }, { data: etapas }, { data: candidatura }] = await Promise.all([
    admin
      .from("fretes")
      .select("*, empresa:empresas(razao_social, telefone, verificado)")
      .eq("id", freteId)
      .single(),
    admin
      .from("frete_etapas")
      .select("*")
      .eq("frete_id", freteId)
      .order("confirmado_em", { ascending: true }),
    admin
      .from("candidaturas")
      .select("id, status")
      .eq("frete_id", freteId)
      .eq("caminhoneiro_id", session.userId)
      .eq("status", "aceita")
      .single(),
  ]);

  if (!frete || !candidatura) notFound();

  // Pre-migration fretes: treat "aceito" as completed if frete is em_andamento
  const tiposConcluidos = (etapas ?? []).map((e) => e.tipo);
  const effectiveTipos =
    (frete.status === "em_andamento" || frete.status === "concluido") &&
    !tiposConcluidos.includes("aceito")
      ? ["aceito", ...tiposConcluidos]
      : tiposConcluidos;

  const ultimaEtapa = effectiveTipos[effectiveTipos.length - 1];
  const indexUltima = ETAPAS_CONFIG.findIndex((e) => e.tipo === ultimaEtapa);
  const proximaEtapa = indexUltima < ETAPAS_CONFIG.length - 1 ? ETAPAS_CONFIG[indexUltima + 1] : null;
  const podeAvancar = proximaEtapa?.quemConfirma === "caminhoneiro";
  const progressoPct = Math.round((effectiveTipos.length / ETAPAS_CONFIG.length) * 100);

  const progressoContent = (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-600" />
            Progresso do frete
          </h2>
          <span className="text-sm font-extrabold text-amber-600">{progressoPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
            style={{ width: `${progressoPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {effectiveTipos.length} de {ETAPAS_CONFIG.length} etapas concluídas
        </p>
      </div>

      {/* CTA: next driver action */}
      {podeAvancar && proximaEtapa && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-5 text-white shadow-md">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Próxima ação</p>
          <p className="font-bold text-lg mb-1">{proximaEtapa.icon} {proximaEtapa.label}</p>
          <p className="text-blue-200 text-sm mb-4">{proximaEtapa.desc}</p>
          <AvancarEtapaButton
            freteId={freteId}
            tipo={proximaEtapa.tipo}
            label={`Confirmar: ${proximaEtapa.label}`}
          />
        </div>
      )}

      {proximaEtapa?.quemConfirma === "empresa" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-semibold text-amber-800 mb-1">🕐 Aguardando confirmação da empresa</p>
          <p className="text-sm text-amber-600">
            A empresa precisa confirmar o recebimento da carga para concluir o frete.
          </p>
        </div>
      )}

      {effectiveTipos.includes("concluido") && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="font-bold text-green-800 text-lg mb-1">🎉 Frete concluído!</p>
          <p className="text-sm text-green-600">A empresa confirmou o recebimento. Obrigado pelo trabalho!</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 text-sm">Etapas do frete</h3>
        <div className="relative">
          {ETAPAS_CONFIG.map((etapa, idx) => {
            const concluida = effectiveTipos.includes(etapa.tipo);
            const isAtual = etapa.tipo === ultimaEtapa;
            const isLast = idx === ETAPAS_CONFIG.length - 1;
            const etapaData = (etapas ?? []).find((e) => e.tipo === etapa.tipo);

            return (
              <div key={etapa.tipo} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 border-2 transition-all ${
                      concluida
                        ? "bg-green-500 border-green-500"
                        : isAtual
                        ? "bg-blue-50 border-blue-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {concluida ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span>{etapa.icon}</span>}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${concluida ? "bg-green-300" : "bg-gray-100"}`} />
                  )}
                </div>

                <div className={`pb-4 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-sm ${concluida ? "text-green-700" : isAtual ? "text-blue-700" : "text-gray-400"}`}>
                      {etapa.label}
                    </p>
                    {etapa.quemConfirma === "empresa" && !concluida && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">empresa confirma</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{etapa.desc}</p>
                  {etapaData && (
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                      {new Date(etapaData.confirmado_em).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery info */}
      {frete.destinatario_nome && (
        <div className="bg-white rounded-2xl border border-amber-100 border-l-4 border-l-amber-400 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            Informações de entrega
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Responsável pelo recebimento</p>
              <p className="font-bold text-gray-900">{frete.destinatario_nome}</p>
            </div>
            {frete.destinatario_telefone && (
              <a
                href={`tel:${frete.destinatario_telefone}`}
                className="flex items-center gap-2 text-blue-700 font-semibold hover:underline"
              >
                <Phone className="w-4 h-4" />
                {frete.destinatario_telefone}
              </a>
            )}
            {frete.destinatario_documento && (
              <p className="text-sm text-gray-600">
                CPF/CNPJ: <strong>{frete.destinatario_documento}</strong>
              </p>
            )}
            {frete.destinatario_instrucoes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Instruções de entrega</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{frete.destinatario_instrucoes}</p>
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
        href="/caminhoneiro/fretes/ativos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Meus fretes ativos
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-lg font-extrabold text-gray-900 truncate mb-1">{frete.titulo}</h1>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
          <span className="font-semibold text-blue-700">{frete.origem_cidade}/{frete.origem_estado}</span>
          <span className="text-gray-300">→</span>
          <span className="font-semibold text-gray-700">{frete.destino_cidade}/{frete.destino_estado}</span>
          {frete.distancia_km && (
            <span className="ml-auto text-xs font-bold text-gray-400">
              ~{Number(frete.distancia_km).toLocaleString("pt-BR")} km
            </span>
          )}
        </div>
      </div>

      <AcompanharLayout progresso={progressoContent} chat={chatContent} />
    </div>
  );
}
