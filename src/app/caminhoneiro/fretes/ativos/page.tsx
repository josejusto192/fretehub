export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import {
  Activity,
  MapPin,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
} from "lucide-react";

export default async function CaminhoneiroFretesAtivosPage() {
  const session = await getSession();
  if (!session || (session.role !== "caminhoneiro" && session.role !== "admin"))
    redirect("/login");

  const admin = createAdminClient();

  const { data: candidaturas } = await admin
    .from("candidaturas")
    .select("*, frete:fretes(*, empresa:empresas(razao_social))")
    .eq("caminhoneiro_id", session.userId)
    .eq("status", "aceita")
    .order("created_at", { ascending: false });

  // Filter to only active/concluded fretes
  const list = (candidaturas ?? []).filter(
    (c) => c.frete && (c.frete.status === "em_andamento" || c.frete.status === "concluido")
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-amber-600" />
            Meus Fretes Ativos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fretes que você está transportando agora
          </p>
        </div>
        <Link href="/caminhoneiro/dashboard">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Buscar fretes
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Nenhum frete ativo</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Quando sua candidatura for aceita, o frete aparecerá aqui com o chat e acompanhamento.
          </p>
          <Link href="/caminhoneiro/dashboard">
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Search className="w-4 h-4 mr-2" />
              Buscar fretes disponíveis
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((candidatura) => {
            const frete = candidatura.frete;
            const isConcluido = frete.status === "concluido";

            return (
              <div
                key={candidatura.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Status bar */}
                <div className={`h-1 w-full ${isConcluido ? "bg-green-500" : "bg-amber-400"}`} />

                {/* Concluded banner */}
                {isConcluido && (
                  <div className="bg-green-50 border-b border-green-100 px-5 py-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-green-700 text-sm font-semibold">
                      Frete concluído — obrigado pelo trabalho!
                    </p>
                  </div>
                )}

                {!isConcluido && (
                  <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                    <p className="text-amber-700 text-sm font-semibold">
                      Em andamento — confirme as etapas na tela de acompanhamento
                    </p>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="font-bold text-gray-900 mb-2">{frete.titulo}</h3>

                      {/* Company */}
                      <p className="text-sm text-gray-500 mb-3">{frete.empresa.razao_social}</p>

                      {/* Route */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-medium text-blue-700">
                          {frete.origem_cidade}/{frete.origem_estado}
                        </span>
                        <span className="text-gray-300 mx-0.5">→</span>
                        <span className="font-medium text-gray-700">
                          {frete.destino_cidade}/{frete.destino_estado}
                        </span>
                        {frete.distancia_km && (
                          <span className="ml-1 text-xs text-gray-400 font-medium">
                            (~{Number(frete.distancia_km).toLocaleString("pt-BR")} km)
                          </span>
                        )}
                      </div>

                      {/* Value */}
                      <div className="flex items-center gap-1 text-green-700">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-extrabold text-lg">
                          {Number(frete.valor_por_tonelada).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium ml-1">/ tonelada</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      <Link href={`/caminhoneiro/fretes/${frete.id}/acompanhar`}>
                        <Button
                          size="sm"
                          className="bg-blue-900 hover:bg-blue-800 font-semibold gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Acompanhar + Chat
                          <ArrowRight className="w-3.5 h-3.5" />
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
  );
}
