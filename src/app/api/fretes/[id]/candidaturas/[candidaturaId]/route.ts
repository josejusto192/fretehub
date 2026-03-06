import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendCandidaturaAceitaEmail, sendCandidaturaRecusadaEmail } from "@/lib/email";

// PATCH - Aceitar ou recusar candidatura (somente empresa)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; candidaturaId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (session.role !== "empresa" && session.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id, candidaturaId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["aceita", "recusada", "cancelada"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const frete = await prisma.frete.findUnique({ where: { id } });
    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    if (session.role !== "admin" && frete.empresa_id !== session.userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const candidatura = await prisma.candidatura.findUnique({
      where: { id: candidaturaId },
      include: {
        caminhoneiro: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    if (!candidatura) {
      return NextResponse.json({ error: "Candidatura não encontrada" }, { status: 404 });
    }

    const updated = await prisma.candidatura.update({
      where: { id: candidaturaId },
      data: { status },
    });

    // Enviar e-mail de notificação
    if (status === "aceita") {
      // TODO: Stripe - criar PaymentIntent aqui ao aceitar a candidatura
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: calcularValorTotal(frete, candidatura),
      //   currency: 'brl',
      //   metadata: { frete_id: id, candidatura_id: candidaturaId }
      // });

      await sendCandidaturaAceitaEmail(
        candidatura.caminhoneiro.user.email,
        candidatura.caminhoneiro.nome_completo,
        frete.titulo,
        frete.origem_cidade,
        frete.origem_estado,
        frete.destino_cidade,
        frete.destino_estado
      );

      // Atualizar status do frete para em_andamento
      await prisma.frete.update({
        where: { id },
        data: { status: "em_andamento" },
      });
    } else if (status === "recusada") {
      await sendCandidaturaRecusadaEmail(
        candidatura.caminhoneiro.user.email,
        candidatura.caminhoneiro.nome_completo,
        frete.titulo
      );
    }

    return NextResponse.json({ candidatura: updated });
  } catch (error) {
    console.error("Erro ao atualizar candidatura:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
