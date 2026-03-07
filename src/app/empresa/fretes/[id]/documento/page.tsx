export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PrintButton } from "@/components/empresa/PrintButton";

export default async function DocumentoTransportePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "empresa" && session.role !== "admin")) redirect("/login");

  const { id: freteId } = await params;
  const admin = createAdminClient();

  const [{ data: frete }, { data: candidatura }, { data: etapas }] = await Promise.all([
    admin
      .from("fretes")
      .select("*, empresa:empresas(razao_social, cnpj, telefone, verificado)")
      .eq("id", freteId)
      .single(),
    admin
      .from("candidaturas")
      .select("*, caminhoneiro:caminhoneiros(nome_completo, cpf, numero_cnh, categoria_cnh, numero_antt, tipo_caminhao, capacidade_toneladas, telefone)")
      .eq("frete_id", freteId)
      .eq("status", "aceita")
      .single(),
    admin
      .from("frete_etapas")
      .select("*")
      .eq("frete_id", freteId)
      .order("confirmado_em", { ascending: true }),
  ]);

  if (!frete) notFound();
  if (session.role === "empresa" && frete.empresa_id !== session.userId) redirect("/empresa/dashboard");

  const dataEmissao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const etapasConfig = [
    { tipo: "aceito", label: "Candidatura aceita" },
    { tipo: "motorista_a_caminho", label: "Motorista a caminho" },
    { tipo: "coleta_realizada", label: "Coleta realizada" },
    { tipo: "em_transito", label: "Em trânsito" },
    { tipo: "entregue", label: "Entregue ao destinatário" },
    { tipo: "concluido", label: "Concluído" },
  ];

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <PrintButton />
        <a
          href={`/empresa/fretes/${freteId}/acompanhar`}
          className="inline-flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 font-medium shadow-sm"
        >
          ← Voltar
        </a>
      </div>

      {/* Document — this is what gets printed */}
      <div className="min-h-screen bg-gray-100 print:bg-white flex items-start justify-center py-10 print:py-0">
        <div
          id="documento"
          className="bg-white w-[210mm] min-h-[297mm] shadow-xl print:shadow-none p-12 print:p-10 text-gray-900 font-sans"
          style={{ fontFamily: "'Arial', sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-blue-900 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-xs">FH</span>
                </div>
                <span className="text-xl font-extrabold text-blue-900">
                  Frete<span className="text-amber-500">Hub</span>
                </span>
              </div>
              <p className="text-xs text-gray-400">Plataforma de logística de grande porte</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-blue-900 uppercase tracking-wide">Documento de Transporte</p>
              <p className="text-xs text-gray-500 mt-0.5">Nº {freteId.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-gray-500">Emitido em: {dataEmissao}</p>
            </div>
          </div>

          {/* Status banner */}
          <div className={`rounded-lg px-4 py-2.5 mb-6 text-sm font-semibold text-center ${
            frete.status === "concluido"
              ? "bg-green-50 text-green-700 border border-green-200"
              : frete.status === "em_andamento"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-50 text-gray-700 border border-gray-200"
          }`}>
            Status do frete: {frete.status === "concluido" ? "✅ Concluído" : frete.status === "em_andamento" ? "🚛 Em andamento" : frete.status}
          </div>

          {/* Section: Empresa */}
          <section className="mb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
              1. Contratante (Empresa)
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div>
                <span className="text-xs text-gray-400">Razão Social</span>
                <p className="font-semibold">{frete.empresa.razao_social}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">CNPJ</span>
                <p className="font-semibold">{frete.empresa.cnpj || "—"}</p>
              </div>
              {frete.empresa.telefone && (
                <div>
                  <span className="text-xs text-gray-400">Telefone</span>
                  <p className="font-semibold">{frete.empresa.telefone}</p>
                </div>
              )}
            </div>
          </section>

          {/* Section: Motorista */}
          <section className="mb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
              2. Transportador (Motorista)
            </h2>
            {candidatura ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div>
                  <span className="text-xs text-gray-400">Nome completo</span>
                  <p className="font-semibold">{candidatura.caminhoneiro.nome_completo}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">CPF</span>
                  <p className="font-semibold">{candidatura.caminhoneiro.cpf}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">CNH</span>
                  <p className="font-semibold">{candidatura.caminhoneiro.numero_cnh} — Cat. {candidatura.caminhoneiro.categoria_cnh}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">ANTT</span>
                  <p className="font-semibold">{candidatura.caminhoneiro.numero_antt}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Veículo</span>
                  <p className="font-semibold">{candidatura.caminhoneiro.tipo_caminhao} · {candidatura.caminhoneiro.capacidade_toneladas}t</p>
                </div>
                {candidatura.caminhoneiro.telefone && (
                  <div>
                    <span className="text-xs text-gray-400">Telefone</span>
                    <p className="font-semibold">{candidatura.caminhoneiro.telefone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Motorista ainda não designado</p>
            )}
          </section>

          {/* Section: Carga e Rota */}
          <section className="mb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
              3. Carga e Rota
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div className="col-span-2">
                <span className="text-xs text-gray-400">Descrição do frete</span>
                <p className="font-semibold">{frete.titulo}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Tipo de carga</span>
                <p className="font-semibold">{frete.tipo_carga}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Peso total</span>
                <p className="font-semibold">{Number(frete.peso_total_ton)}t</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Valor por tonelada</span>
                <p className="font-semibold">R$ {Number(frete.valor_por_tonelada).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Valor total estimado</span>
                <p className="font-bold text-green-700">
                  R$ {(Number(frete.valor_por_tonelada) * Number(frete.peso_total_ton)).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Origem</span>
                <p className="font-semibold">{frete.origem_cidade} / {frete.origem_estado}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Destino</span>
                <p className="font-semibold">{frete.destino_cidade} / {frete.destino_estado}</p>
              </div>
              {frete.distancia_km && (
                <div>
                  <span className="text-xs text-gray-400">Distância estimada</span>
                  <p className="font-semibold">~{Number(frete.distancia_km).toLocaleString("pt-BR")} km</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-400">Data de coleta</span>
                <p className="font-semibold">{new Date(frete.data_coleta).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Prazo de entrega</span>
                <p className="font-semibold">{new Date(frete.prazo_entrega).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </section>

          {/* Section: Destinatário */}
          {frete.destinatario_nome && (
            <section className="mb-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
                4. Destinatário
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div>
                  <span className="text-xs text-gray-400">Responsável pelo recebimento</span>
                  <p className="font-semibold">{frete.destinatario_nome}</p>
                </div>
                {frete.destinatario_telefone && (
                  <div>
                    <span className="text-xs text-gray-400">Telefone</span>
                    <p className="font-semibold">{frete.destinatario_telefone}</p>
                  </div>
                )}
                {frete.destinatario_documento && (
                  <div>
                    <span className="text-xs text-gray-400">CPF/CNPJ</span>
                    <p className="font-semibold">{frete.destinatario_documento}</p>
                  </div>
                )}
                {frete.destinatario_instrucoes && (
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400">Instruções de entrega</span>
                    <p className="font-medium text-gray-700 mt-0.5 bg-amber-50 border border-amber-100 rounded p-2">
                      {frete.destinatario_instrucoes}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Section: Etapas */}
          <section className="mb-8">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
              {frete.destinatario_nome ? "5" : "4"}. Rastreamento das Etapas
            </h2>
            <div className="space-y-2">
              {etapasConfig.map((ec) => {
                const etapa = (etapas ?? []).find((e) => e.tipo === ec.tipo);
                return (
                  <div
                    key={ec.tipo}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                      etapa ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <span className="font-extrabold text-lg w-6 text-center shrink-0">
                      {etapa ? "✓" : "○"}
                    </span>
                    <div className="flex-1">
                      <span className={`font-semibold ${etapa ? "text-green-700" : "text-gray-400"}`}>
                        {ec.label}
                      </span>
                    </div>
                    {etapa ? (
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(etapa.confirmado_em).toLocaleString("pt-BR")}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 shrink-0">Pendente</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Signatures */}
          <section className="mt-auto">
            <div className="grid grid-cols-3 gap-6 text-center text-sm">
              {[
                { label: "Empresa (Contratante)", sub: frete.empresa.razao_social },
                { label: "Motorista (Transportador)", sub: candidatura?.caminhoneiro.nome_completo ?? "—" },
                { label: "Destinatário", sub: frete.destinatario_nome ?? "—" },
              ].map((sig) => (
                <div key={sig.label} className="border-t-2 border-gray-300 pt-3">
                  <p className="font-semibold text-gray-700 text-xs">{sig.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sig.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-300 mt-6">
              Documento gerado pelo FreteHub · {dataEmissao} · Nº {freteId.slice(0, 8).toUpperCase()}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
