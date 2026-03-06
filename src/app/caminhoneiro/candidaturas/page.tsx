export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Building2,
  ArrowRight,
  CheckCircle2,
  Search,
  Truck,
} from "lucide-react";

export default async function MeusCandidaturasPage() {
  const session = await getSession();
  if (!session || (session.role !== "caminhoneiro" && session.role !== "admin")) redirect("/login");

  const admin = createAdminClient();
  const { data: candidaturas } = await admin
    .from("candidaturas")
    .select("*, frete:fretes(*, empresa:empresas(razao_social))")
    .eq("caminhoneiro_id", session.userId)
    .order("created_at", { ascending: false });

  const list = candidaturas ?? [];

  const stats = {
    total: list.length,
    pendentes: list.filter((c) => c.status === "pendente").length,
    aceitas: list.filter((c) => c.status === "aceita").length,
    recusadas: list.filter((c) => c.status === "recusada").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-blue-900" />
            Minhas Candidaturas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {list.length} candidatura{list.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <Link href="/caminhoneiro/dashboard">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Buscar fretes
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900", bg: "bg-white border-gray-100" },
          { label: "Pendentes", value: stats.pendentes, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Aceitas", value: stats.aceitas, color: "text-green-600", bg: "bg-green-50 border-green-100" },
          { label: "Recusadas", value: stats.recusadas, color: "text-red-500", bg: "bg-red-50 border-red-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl border p-5 text-center shadow-sm`}>
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Nenhuma candidatura ainda</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Busque fretes disponíveis e se candidate para começar a receber cargas.
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
          {list.map((candidatura) => (
            <div
              key={candidatura.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Accepted banner */}
              {candidatura.status === "aceita" && (
                <div className="bg-green-500 px-5 py-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <p className="text-white text-sm font-semibold">
                    Candidatura aceita! Entre em contato com a empresa para combinar os próximos passos.
                  </p>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + status */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{candidatura.frete.titulo}</h3>
                      <StatusBadge status={candidatura.status} />
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {candidatura.frete.empresa.razao_social}
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-blue-700">
                        {candidatura.frete.origem_cidade}/{candidatura.frete.origem_estado}
                      </span>
                      <span className="text-gray-300 mx-0.5">→</span>
                      <span className="font-medium text-gray-700">
                        {candidatura.frete.destino_cidade}/{candidatura.frete.destino_estado}
                      </span>
                    </div>

                    {/* Details pills */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                        <Package className="w-3 h-3" />
                        {candidatura.frete.tipo_carga}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-amber-700 font-medium">
                        <Truck className="w-3 h-3" />
                        Ofertei: {Number(candidatura.toneladas_ofertadas)}t
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600 font-medium">
                        <Calendar className="w-3 h-3" />
                        Enviada em {new Date(candidatura.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {candidatura.mensagem && (
                      <p className="text-gray-400 text-xs italic mt-3 border-l-2 border-gray-200 pl-3">
                        &ldquo;{candidatura.mensagem}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-green-700">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xl font-extrabold">
                          {Number(candidatura.frete.valor_por_tonelada).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-medium">por tonelada</div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div className="font-medium">Coleta:</div>
                      <div>{new Date(candidatura.frete.data_coleta).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <Link href={`/caminhoneiro/fretes/${candidatura.frete_id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 hover:border-blue-300 hover:text-blue-700">
                        Ver frete
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
