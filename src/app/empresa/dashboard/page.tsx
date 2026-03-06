export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  PlusCircle,
  Package,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";

export default async function EmpresaDashboard() {
  const session = await getSession();
  if (!session || session.role !== "empresa" && session.role !== "admin") redirect("/login");

  const admin = createAdminClient();

  const [{ data: rawFretes }, { data: empresa }] = await Promise.all([
    admin
      .from("fretes")
      .select("*, candidaturas(id, status)")
      .eq("empresa_id", session.userId)
      .order("created_at", { ascending: false }),
    admin.from("empresas").select("razao_social, verificado").eq("id", session.userId).single(),
  ]);

  const fretes = (rawFretes ?? []).map((f) => ({
    ...f,
    _count: { candidaturas: f.candidaturas.length },
    candidaturas: f.candidaturas.filter((c: { status: string }) => c.status === "pendente"),
  }));

  const totalAbertos = fretes.filter((f) => f.status === "aberto").length;
  const totalEmAndamento = fretes.filter((f) => f.status === "em_andamento").length;
  const totalCandidaturasPendentes = fretes.reduce((acc, f) => acc + f.candidaturas.length, 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {empresa?.razao_social}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            {empresa?.verificado ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-0.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Empresa verificada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-0.5 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Verificação pendente
              </span>
            )}
          </div>
        </div>
        <Link href="/empresa/fretes/novo">
          <Button className="bg-blue-900 hover:bg-blue-800 shadow-sm font-semibold">
            <PlusCircle className="w-4 h-4 mr-2" />
            Publicar novo frete
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <Package className="w-8 h-8 text-blue-300 mb-3" />
          <div className="text-4xl font-extrabold">{totalAbertos}</div>
          <div className="text-blue-200 text-sm font-medium mt-1">Fretes Abertos</div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <Loader2 className="w-8 h-8 text-amber-100 mb-3" />
          <div className="text-4xl font-extrabold">{totalEmAndamento}</div>
          <div className="text-amber-100 text-sm font-medium mt-1">Em Andamento</div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 to-purple-500 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <Users className="w-8 h-8 text-purple-300 mb-3" />
          <div className="text-4xl font-extrabold">{totalCandidaturasPendentes}</div>
          <div className="text-purple-200 text-sm font-medium mt-1">Candidaturas Pendentes</div>
        </div>
      </div>

      {/* Freight list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Meus Fretes</h2>
          <span className="text-sm text-gray-400">{fretes.length} publicado{fretes.length !== 1 ? "s" : ""}</span>
        </div>

        {fretes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Nenhum frete publicado</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Publique seu primeiro frete e comece a receber candidaturas de caminhoneiros verificados.
            </p>
            <Link href="/empresa/fretes/novo">
              <Button className="bg-blue-900 hover:bg-blue-800">
                <PlusCircle className="w-4 h-4 mr-2" />
                Publicar primeiro frete
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {fretes.map((frete) => (
              <div
                key={frete.id}
                className="px-6 py-4 hover:bg-gray-50/80 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-semibold text-gray-900 truncate">{frete.titulo}</h3>
                      <StatusBadge status={frete.status} />
                      {frete.candidaturas.length > 0 && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          <Clock className="w-3 h-3" />
                          {frete.candidaturas.length} pendente{frete.candidaturas.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {frete.origem_cidade}/{frete.origem_estado}
                        <span className="text-gray-300 mx-0.5">→</span>
                        {frete.destino_cidade}/{frete.destino_estado}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(frete.data_coleta).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {frete._count.candidaturas} candidatura{frete._count.candidaturas !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <Link href={`/empresa/fretes/${frete.id}/candidaturas`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 group-hover:border-blue-300 group-hover:text-blue-700 transition-colors"
                    >
                      Ver candidaturas
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
