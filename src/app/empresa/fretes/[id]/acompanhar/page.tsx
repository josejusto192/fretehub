export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { FreteChat } from "@/components/shared/FreteChat";
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
      .select(
        "*, empresa:empresas(razao_social)"
      )
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

  const tiposConcluidos = (etapas ?? []).map((e) => e.tipo);
  const ultimaEtapa = tiposConcluidos[tiposConcluidos.length - 1];
  const indexUltima = ETAPAS_CONFIG.findIndex((e) => e.tipo === ultimaEtapa);
  const proximaEtapa = indexUltima < ETAPAS_CONFIG.length - 1 ? ETAPAS_CONFIG[indexUltima + 1] : null;
  const isConcluidaPelaEmpresa = tiposConcluidos.includes("concluido");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/empresa/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{frete.titulo}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-semibold text-blue-700">{frete.origem_cidade}/{frete.origem_estado}</span>
              <span>→</span>
              <span className="font-semibold">{frete.destino_cidade}/{frete.destino_estado}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/empresa/fretes/${freteId}/documento`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5 text-gray-600">
                <FileDown className="w-4 h-4" />
                Documento de transporte
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: timeline + driver + recipient */}
        <div className="lg:col-span-2 space-y-5">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Acompanhamento do frete
            </h2>

            <div className="relative">
              {ETAPAS_CONFIG.map((etapa, idx) => {
                const concluida = tiposConcluidos.includes(etapa.tipo);
                const isAtual = etapa.tipo === ultimaEtapa;
                const etapaData = (etapas ?? []).find((e) => e.tipo === etapa.tipo);
                const isLast = idx === ETAPAS_CONFIG.length - 1;

                return (
                  <div key={etapa.tipo} className="flex gap-4">
                    {/* Connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2 transition-all ${
                          concluida
                            ? "bg-green-500 border-green-500 text-white"
                            : isAtual
                            ? "bg-blue-50 border-blue-500"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {concluida ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span>{etapa.icon}</span>}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 mt-1 mb-1 min-h-[24px] ${concluida ? "bg-green-300" : "bg-gray-100"}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-5 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-sm ${concluida ? "text-green-700" : isAtual ? "text-blue-700" : "text-gray-400"}`}>
                          {etapa.label}
                        </p>
                        {isAtual && !concluida && (
                          <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">Última etapa</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{etapa.desc}</p>
                      {etapaData && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(etapaData.confirmado_em).toLocaleString("pt-BR")}
                          {etapaData.observacoes && <span className="ml-1 text-gray-400">· {etapaData.observacoes}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confirm conclusion button */}
            {proximaEtapa?.tipo === "concluido" && !isConcluidaPelaEmpresa && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <ConfirmarEtapaButton
                  freteId={freteId}
                  tipo="concluido"
                  label="✅ Confirmar recebimento da carga"
                  variant="success"
                />
              </div>
            )}
          </div>

          {/* Driver info */}
          {candidaturaAceita && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Motorista designado
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-400 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0">
                  {candidaturaAceita.caminhoneiro.nome_completo.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{candidaturaAceita.caminhoneiro.nome_completo}</p>
                    {candidaturaAceita.caminhoneiro.verificado && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Veículo</p>
                      <p className="font-semibold text-gray-900">{candidaturaAceita.caminhoneiro.tipo_caminhao}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Capacidade</p>
                      <p className="font-semibold text-gray-900">{candidaturaAceita.caminhoneiro.capacidade_toneladas}t</p>
                    </div>
                    {candidaturaAceita.caminhoneiro.telefone && (
                      <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                        <p className="text-xs text-gray-400 mb-0.5">Telefone</p>
                        <a
                          href={`tel:${candidaturaAceita.caminhoneiro.telefone}`}
                          className="font-semibold text-blue-700 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {candidaturaAceita.caminhoneiro.telefone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipient info */}
          {frete.destinatario_nome && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Destinatário
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Nome</p>
                    <p className="font-semibold text-gray-900 text-sm">{frete.destinatario_nome}</p>
                  </div>
                  {frete.destinatario_telefone && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Telefone</p>
                      <a href={`tel:${frete.destinatario_telefone}`} className="font-semibold text-blue-700 text-sm hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {frete.destinatario_telefone}
                      </a>
                    </div>
                  )}
                </div>
                {frete.destinatario_documento && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">CPF/CNPJ</p>
                    <p className="font-semibold text-gray-900 text-sm">{frete.destinatario_documento}</p>
                  </div>
                )}
                {frete.destinatario_instrucoes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <p className="text-xs text-amber-600 font-semibold">Instruções de entrega</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{frete.destinatario_instrucoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: chat */}
        <div className="lg:col-span-1">
          <FreteChat
            freteId={freteId}
            currentUserId={session.userId}
            currentUserRole={session.role as "empresa" | "caminhoneiro" | "admin"}
          />
        </div>
      </div>
    </div>
  );
}
