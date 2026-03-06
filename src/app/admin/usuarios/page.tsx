import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

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

  const users = await prisma.user.findMany({
    where: {
      ...(params.role && { role: params.role as "empresa" | "caminhoneiro" | "admin" }),
      ...(params.status && {
        status: params.status as "pendente" | "ativo" | "bloqueado",
      }),
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
      empresa: { select: { razao_social: true, cnpj: true, verificado: true } },
      caminhoneiro: {
        select: { nome_completo: true, cpf: true, verificado: true, tipo_caminhao: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-500 mt-1">{users.length} usuário{users.length !== 1 ? "s" : ""}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-3 px-2">Nome/Empresa</th>
                  <th className="text-left py-3 px-2">E-mail</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Verificado</th>
                  <th className="text-left py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="font-medium">
                        {u.empresa?.razao_social || u.caminhoneiro?.nome_completo || "Admin"}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {u.empresa?.cnpj || u.caminhoneiro?.cpf || ""}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-600">{u.email}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "empresa"
                            ? "bg-blue-100 text-blue-700"
                            : u.role === "caminhoneiro"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status === "ativo"
                            ? "bg-green-100 text-green-700"
                            : u.status === "pendente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {u.empresa?.verificado || u.caminhoneiro?.verificado ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
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
        </CardContent>
      </Card>
    </div>
  );
}
