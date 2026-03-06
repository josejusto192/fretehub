import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendCandidaturaAceitaEmail, sendCandidaturaRecusadaEmail } from "@/lib/email";
import { z } from "zod";

const candidaturaSchema = z.object({
  toneladas_ofertadas: z.number().positive("Toneladas ofertadas devem ser positivas"),
  mensagem: z.string().optional(),
});

// GET - Listar candidaturas de um frete
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

    const frete = await prisma.frete.findUnique({ where: { id } });
    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    // Somente empresa dona ou admin pode ver todas as candidaturas
    if (session.role !== "admin" && frete.empresa_id !== session.userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const candidaturas = await prisma.candidatura.findMany({
      where: { frete_id: id },
      include: {
        caminhoneiro: {
          include: {
            user: { select: { email: true, status: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ candidaturas });
  } catch (error) {
    console.error("Erro ao listar candidaturas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Criar candidatura (somente caminhoneiro)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (session.role !== "caminhoneiro") {
      return NextResponse.json(
        { error: "Apenas caminhoneiros podem se candidatar" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { toneladas_ofertadas, mensagem } = candidaturaSchema.parse(body);

    const frete = await prisma.frete.findUnique({ where: { id } });
    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }
    if (frete.status !== "aberto") {
      return NextResponse.json({ error: "Este frete não está mais disponível" }, { status: 400 });
    }

    const caminhoneiro = await prisma.caminhoneiro.findUnique({
      where: { id: session.userId },
    });
    if (!caminhoneiro) {
      return NextResponse.json({ error: "Perfil de caminhoneiro não encontrado" }, { status: 404 });
    }

    // Regra de negócio: verificar peso mínimo
    if (frete.peso_minimo_ton !== null && frete.peso_minimo_ton !== undefined) {
      const capacidade = Number(caminhoneiro.capacidade_toneladas);
      const pesoMinimo = Number(frete.peso_minimo_ton);
      if (capacidade < pesoMinimo) {
        return NextResponse.json(
          {
            error: `Sua capacidade (${capacidade}t) é inferior ao peso mínimo exigido (${pesoMinimo}t) para este frete.`,
          },
          { status: 400 }
        );
      }
    }

    // Verificar se já se candidatou
    const candidaturaExistente = await prisma.candidatura.findUnique({
      where: { frete_id_caminhoneiro_id: { frete_id: id, caminhoneiro_id: session.userId } },
    });
    if (candidaturaExistente) {
      return NextResponse.json(
        { error: "Você já se candidatou a este frete" },
        { status: 409 }
      );
    }

    const candidatura = await prisma.candidatura.create({
      data: {
        frete_id: id,
        caminhoneiro_id: session.userId,
        toneladas_ofertadas,
        mensagem,
        status: "pendente",
      },
    });

    return NextResponse.json({ candidatura }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro ao criar candidatura:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
