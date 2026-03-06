import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (session.role !== "caminhoneiro") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const candidaturas = await prisma.candidatura.findMany({
      where: { caminhoneiro_id: session.userId },
      include: {
        frete: {
          include: {
            empresa: { select: { razao_social: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ candidaturas });
  } catch (error) {
    console.error("Erro ao listar candidaturas do caminhoneiro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
