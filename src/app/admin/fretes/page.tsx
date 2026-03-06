export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function AdminFretesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const fretes = await prisma.frete.findMany({
    include: {
      empresa: { select: { razao_social: true } },
      _count: { select: { candidaturas: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Fretes</h1>
        <p className="text-gray-500 mt-1">{fretes.length} fretes cadastrados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Fretes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-3 px-2">Título</th>
                  <th className="text-left py-3 px-2">Empresa</th>
                  <th className="text-left py-3 px-2">Rota</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Peso</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Candidaturas</th>
                  <th className="text-left py-3 px-2">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {fretes.map((frete) => (
                  <tr key={frete.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{frete.titulo}</td>
                    <td className="py-3 px-2 text-gray-600">{frete.empresa.razao_social}</td>
                    <td className="py-3 px-2 text-gray-600">
                      {frete.origem_estado} → {frete.destino_estado}
                    </td>
                    <td className="py-3 px-2 text-gray-600">{frete.tipo_carga}</td>
                    <td className="py-3 px-2 text-gray-600">
                      {Number(frete.peso_total_ton)}t
                      {frete.peso_minimo_ton && (
                        <span className="text-xs text-orange-500 block">
                          mín: {Number(frete.peso_minimo_ton)}t
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={frete.status} />
                    </td>
                    <td className="py-3 px-2 font-medium">{frete._count.candidaturas}</td>
                    <td className="py-3 px-2 text-gray-600">
                      {new Date(frete.created_at).toLocaleDateString("pt-BR")}
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
