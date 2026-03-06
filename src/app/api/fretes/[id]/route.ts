import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const frete = await prisma.frete.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            razao_social: true,
            telefone: true,
            verificado: true,
            endereco: true,
          },
        },
        candidaturas: {
          include: {
            caminhoneiro: {
              select: {
                nome_completo: true,
                tipo_caminhao: true,
                capacidade_toneladas: true,
                verificado: true,
                categoria_cnh: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
        _count: { select: { candidaturas: true } },
      },
    });

    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ frete });
  } catch (error) {
    console.error("Erro ao buscar frete:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const frete = await prisma.frete.findUnique({ where: { id } });
    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    // Apenas a empresa dona ou admin pode atualizar
    if (session.role !== "admin" && frete.empresa_id !== session.userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const updated = await prisma.frete.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ frete: updated });
  } catch (error) {
    console.error("Erro ao atualizar frete:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
