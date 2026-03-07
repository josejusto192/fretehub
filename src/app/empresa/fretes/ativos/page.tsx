export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  MapPin,
  Calendar,
  ArrowRight,
  MessageSquare,
  FileDown,
  Package,
  Truck,
} from "lucide-react";

export default async function FretesAtivosPage() {
  const session = await getSession();
  if (!session || (session.role !== "empresa" && session.role !== "admin"))
    redirect("/login");

  const admin = createAdminClient();

  const { data: fretes } = await admin
    .from("fretes")
    .select(
      "*, caminhoneiro_aceito:candidaturas!inner(caminhoneiro:caminhoneiros(nome_completo, tipo_caminhao))"
    )
    .eq("empresa_id", session.userId)
    .in("status", ["em_andamento", "concluido"])
    .eq("caminhoneiro_aceito.status", "aceita")
    .order("created_at", { ascending: false });

  const list = fretes ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-900" />
            Fretes em Andamento
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe as operações ativas e converse com os motoristas
          </p>
        </div>
        <Link href="/empresa/fretes/novo">
          <Button className="bg-blue-900 hover:bg-blue-800 font-semibold gap-1.5">
            <Package className="w-4 h-4" />
            Publicar frete
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
            Quando você aceitar uma candidatura, o frete aparecerá aqui para acompanhamento.
          </p>
          <Link href="/empresa/dashboard">
            <Button className="bg-blue-900 hover:bg-blue-800">
              Ver todos os fretes
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((frete) => {
            const caminhoneiro =
              (frete.caminhoneiro_aceito as { caminhoneiro: { nome_completo: string; tipo_caminhao: string } }[])?.[0]?.caminhoneiro;

            return (
              <div
                key={frete.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Status bar */}
                <div
                  className={`h-1 w-full ${
                    frete.status === "concluido" ? "bg-green-500" : "bg-amber-400"
                  }`}
                />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title + status */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{frete.titulo}</h3>
                        <StatusBadge status={frete.status} />
                      </div>

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
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                          <Calendar className="w-3 h-3" />
                          Coleta: {new Date(frete.data_coleta).toLocaleDateString("pt-BR")}
                        </span>
                        {caminhoneiro && (
                          <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-amber-700 font-medium">
                            <Truck className="w-3 h-3" />
                            {caminhoneiro.nome_completo} · {caminhoneiro.tipo_caminhao}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Link href={`/empresa/fretes/${frete.id}/acompanhar`}>
                        <Button
                          size="sm"
                          className="bg-blue-900 hover:bg-blue-800 font-semibold gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Acompanhar + Chat
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/empresa/fretes/${frete.id}/documento`} target="_blank">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-gray-600 hover:text-blue-700 hover:border-blue-300"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Documento
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
