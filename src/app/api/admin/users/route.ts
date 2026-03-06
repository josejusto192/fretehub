import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as "empresa" | "caminhoneiro" | "admin" }),
        ...(status && { status: status as "pendente" | "ativo" | "bloqueado" }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        empresa: { select: { razao_social: true, cnpj: true, verificado: true } },
        caminhoneiro: { select: { nome_completo: true, cpf: true, verificado: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status, verificado } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (status) {
      await prisma.user.update({
        where: { id: userId },
        data: { status },
      });
    }

    if (verificado !== undefined) {
      if (user.role === "empresa") {
        await prisma.empresa.update({
          where: { id: userId },
          data: { verificado },
        });
      } else if (user.role === "caminhoneiro") {
        await prisma.caminhoneiro.update({
          where: { id: userId },
          data: { verificado },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
