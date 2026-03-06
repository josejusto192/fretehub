import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AceitarRecusarButtons } from "@/components/empresa/AceitarRecusarButtons";

export default async function CandidaturasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "empresa") redirect("/login");

  const { id } = await params;

  const frete = await prisma.frete.findUnique({
    where: { id },
    include: {
      candidaturas: {
        include: {
          caminhoneiro: {
            include: {
              user: { select: { email: true, status: true } },
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!frete || frete.empresa_id !== session.userId) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/empresa/dashboard" className="text-blue-700 text-sm hover:underline">
          ← Voltar ao dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{frete.titulo}</h1>
        <p className="text-gray-500 mt-1">
          {frete.origem_cidade}/{frete.origem_estado} → {frete.destino_cidade}/{frete.destino_estado}{" "}
          · <StatusBadge status={frete.status} />
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-900">{frete.candidaturas.length}</div>
            <div className="text-gray-500 text-sm">Total de candidaturas</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {frete.candidaturas.filter((c) => c.status === "pendente").length}
            </div>
            <div className="text-gray-500 text-sm">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {frete.candidaturas.filter((c) => c.status === "aceita").length}
            </div>
            <div className="text-gray-500 text-sm">Aceitas</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidatos</CardTitle>
        </CardHeader>
        <CardContent>
          {frete.candidaturas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhuma candidatura recebida ainda</p>
              <p className="text-sm mt-1">Os caminhoneiros podem se candidatar enquanto o frete estiver aberto</p>
            </div>
          ) : (
            <div className="space-y-4">
              {frete.candidaturas.map((candidatura) => (
                <div
                  key={candidatura.id}
                  className="border rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">
                        {candidatura.caminhoneiro.nome_completo}
                      </span>
                      {candidatura.caminhoneiro.verificado && (
                        <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">
                          ✅ Verificado
                        </span>
                      )}
                      <StatusBadge status={candidatura.status} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p>
                        🚛 {candidatura.caminhoneiro.tipo_caminhao} ·{" "}
                        Capacidade: {Number(candidatura.caminhoneiro.capacidade_toneladas)}t
                      </p>
                      <p>
                        📦 Toneladas ofertadas:{" "}
                        <strong>{Number(candidatura.toneladas_ofertadas)}t</strong>
                      </p>
                      {frete.peso_minimo_ton && (
                        <p className="text-xs text-gray-400">
                          Peso mínimo do frete: {Number(frete.peso_minimo_ton)}t
                        </p>
                      )}
                      {candidatura.mensagem && (
                        <p className="italic text-gray-500">"{candidatura.mensagem}"</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {candidatura.caminhoneiro.user.email} ·{" "}
                        CNH {candidatura.caminhoneiro.categoria_cnh}
                      </p>
                    </div>
                  </div>

                  {candidatura.status === "pendente" && frete.status === "aberto" && (
                    <AceitarRecusarButtons
                      freteId={frete.id}
                      candidaturaId={candidatura.id}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
