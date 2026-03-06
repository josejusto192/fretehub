import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        empresa: true,
        caminhoneiro: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    if (session.role === "empresa") {
      const { razao_social, telefone, cidade, estado } = body;
      await prisma.empresa.update({
        where: { id: session.userId },
        data: {
          ...(razao_social && { razao_social }),
          ...(telefone && { telefone }),
          ...((cidade || estado) && {
            endereco: { cidade: cidade || undefined, estado: estado || undefined },
          }),
        },
      });
    } else if (session.role === "caminhoneiro") {
      const { nome_completo, tipo_caminhao, capacidade_toneladas } = body;
      await prisma.caminhoneiro.update({
        where: { id: session.userId },
        data: {
          ...(nome_completo && { nome_completo }),
          ...(tipo_caminhao && { tipo_caminhao }),
          ...(capacidade_toneladas && { capacidade_toneladas }),
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        empresa: true,
        caminhoneiro: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
