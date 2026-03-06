import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CandidaturaForm } from "@/components/caminhoneiro/CandidaturaForm";

export default async function FreteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "caminhoneiro") redirect("/login");

  const { id } = await params;

  const [frete, caminhoneiro, candidaturaExistente] = await Promise.all([
    prisma.frete.findUnique({
      where: { id },
      include: {
        empresa: {
          select: { razao_social: true, telefone: true, verificado: true },
        },
        _count: { select: { candidaturas: true } },
      },
    }),
    prisma.caminhoneiro.findUnique({
      where: { id: session.userId },
      select: { capacidade_toneladas: true, nome_completo: true },
    }),
    prisma.candidatura.findUnique({
      where: {
        frete_id_caminhoneiro_id: { frete_id: id, caminhoneiro_id: session.userId },
      },
    }),
  ]);

  if (!frete) notFound();

  const capacidade = Number(caminhoneiro?.capacidade_toneladas || 0);
  const pesoMinimo = frete.peso_minimo_ton ? Number(frete.peso_minimo_ton) : null;
  const bloqueado = pesoMinimo !== null && capacidade < pesoMinimo;
  const valorTotal = Number(frete.valor_por_tonelada) * Number(frete.peso_total_ton);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/caminhoneiro/dashboard" className="text-blue-700 text-sm hover:underline">
          ← Voltar à busca
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{frete.titulo}</CardTitle>
                <p className="text-gray-500 mt-1">
                  {frete.empresa.razao_social}
                  {frete.empresa.verificado && (
                    <span className="ml-2 text-green-600 text-sm">✅ Verificada</span>
                  )}
                </p>
              </div>
              <Badge
                className={
                  frete.status === "aberto"
                    ? "bg-green-100 text-green-700 border-0"
                    : "bg-gray-100 text-gray-600 border-0"
                }
              >
                {frete.status === "aberto" ? "Aberto" : frete.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Origem</p>
                <p className="font-semibold">
                  {frete.origem_cidade} / {frete.origem_estado}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Destino</p>
                <p className="font-semibold">
                  {frete.destino_cidade} / {frete.destino_estado}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Carga</p>
                <p className="font-semibold">{frete.tipo_carga}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Peso Total</p>
                <p className="font-semibold">{Number(frete.peso_total_ton)}t</p>
              </div>
              {pesoMinimo && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Peso Mínimo Exigido
                  </p>
                  <p className="font-semibold text-orange-600">{pesoMinimo}t</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Valor por Tonelada</p>
                <p className="font-semibold text-green-700">
                  R$ {Number(frete.valor_por_tonelada).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Data de Coleta</p>
                <p className="font-semibold">
                  {new Date(frete.data_coleta).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Prazo de Entrega</p>
                <p className="font-semibold">
                  {new Date(frete.prazo_entrega).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                💰 Valor estimado total da carga:{" "}
                <strong>R$ {valorTotal.toFixed(2)}</strong>
              </p>
              <p className="text-xs text-blue-500 mt-0.5">
                {frete._count.candidaturas} candidatura
                {frete._count.candidaturas !== 1 ? "s" : ""} recebida
                {frete._count.candidaturas !== 1 ? "s" : ""}
              </p>
            </div>

            {frete.observacoes && (
              <div>
                <Separator className="my-2" />
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Observações
                </p>
                <p className="text-gray-700 text-sm">{frete.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de candidatura */}
        {frete.status === "aberto" && (
          <Card>
            <CardHeader>
              <CardTitle>Candidatar-se a este frete</CardTitle>
            </CardHeader>
            <CardContent>
              {candidaturaExistente ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-700 font-medium">
                    ✅ Você já se candidatou a este frete
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Status: {candidaturaExistente.status}
                  </p>
                  <Link href="/caminhoneiro/candidaturas" className="mt-2 inline-block">
                    <span className="text-blue-700 text-sm hover:underline">
                      Ver minhas candidaturas
                    </span>
                  </Link>
                </div>
              ) : bloqueado ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium">
                    ⚠️ Capacidade insuficiente para este frete
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    Sua capacidade ({capacidade}t) é inferior ao peso mínimo exigido (
                    {pesoMinimo}t). Você não pode se candidatar a este frete.
                  </p>
                </div>
              ) : (
                <CandidaturaForm freteId={frete.id} capacidadeMaxima={capacidade} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
