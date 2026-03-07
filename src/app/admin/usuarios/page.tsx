export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUserActions } from "@/components/admin/AdminUserActions";
import { Building2, Truck, Users, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

interface SearchParams {
  role?: string;
  status?: string;
}

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const params = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("users")
    .select(
      "id, email, role, status, created_at, empresa:empresas(razao_social, cnpj, verificado), caminhoneiro:caminhoneiros(nome_completo, cpf, verificado, tipo_caminhao)"
    )
    .order("created_at", { ascending: false });

  if (params.role) query = query.eq("role", params.role);
  if (params.status) query = query.eq("status", params.status);

  const { data: _users } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = (_users ?? []) as any[];

  const totalEmpresas = list.filter((u) => u.role === "empresa").length;
  const totalCaminhoneiros = list.filter((u) => u.role === "caminhoneiro").length;
  const totalPendentes = list.filter((u) => u.status === "pendente").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
          <Users className="w-6 h-6 text-blue-900" />
          Gerenciar Usuários
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {list.length} usuário{list.length !== 1 ? "s" : ""} cadastrados
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-blue-100 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-900">{totalEmpresas}</div>
            <div className="text-xs text-gray-500 font-medium">Empresas</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-600">{totalCaminhoneiros}</div>
            <div className="text-xs text-gray-500 font-medium">Caminhoneiros</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-orange-100 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-orange-500">{totalPendentes}</div>
            <div className="text-xs text-gray-500 font-medium">Pendentes</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
          {[
            { label: "Todos", role: "", status: "" },
            { label: "Empresas", role: "empresa", status: "" },
            { label: "Caminhoneiros", role: "caminhoneiro", status: "" },
            { label: "Pendentes", role: "", status: "pendente" },
            { label: "Ativos", role: "", status: "ativo" },
          ].map((f) => {
            const isActive = params.role === f.role && params.status === f.status;
            const href = f.role || f.status
              ? `/admin/usuarios?${f.role ? `role=${f.role}` : ""}${f.status ? `${f.role ? "&" : ""}status=${f.status}` : ""}`
              : "/admin/usuarios";
            return (
              <a
                key={f.label}
                href={href}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </a>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Verificado
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cadastrado
                </th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-gray-900">
                      {u.empresa?.razao_social || u.caminhoneiro?.nome_completo || "Admin"}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {u.empresa?.cnpj || u.caminhoneiro?.cpf || ""}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-sm">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === "empresa"
                          ? "bg-blue-100 text-blue-700"
                          : u.role === "caminhoneiro"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {u.role === "empresa" ? (
                        <Building2 className="w-3 h-3" />
                      ) : u.role === "caminhoneiro" ? (
                        <Truck className="w-3 h-3" />
                      ) : null}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.status === "ativo"
                          ? "bg-green-100 text-green-700"
                          : u.status === "pendente"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.status === "ativo" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : u.status === "pendente" ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.empresa?.verificado || u.caminhoneiro?.verificado ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3.5 px-4">
                    <AdminUserActions
                      userId={u.id}
                      currentStatus={u.status}
                      currentVerificado={
                        u.empresa?.verificado || u.caminhoneiro?.verificado || false
                      }
                      role={u.role}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
