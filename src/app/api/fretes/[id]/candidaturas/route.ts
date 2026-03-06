import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const candidaturaSchema = z.object({
  toneladas_ofertadas: z.number().positive("Toneladas ofertadas devem ser positivas"),
  mensagem: z.string().optional(),
});

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
    const admin = createAdminClient();

    const { data: frete } = await admin
      .from("fretes")
      .select("empresa_id")
      .eq("id", id)
      .single();

    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    if (session.role !== "admin" && frete.empresa_id !== session.userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { data: candidaturas, error } = await admin
      .from("candidaturas")
      .select("*, caminhoneiro:caminhoneiros(*, user:users(email, status))")
      .eq("frete_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ candidaturas });
  } catch (error) {
    console.error("Erro ao listar candidaturas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (session.role !== "caminhoneiro" && session.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas caminhoneiros podem se candidatar" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { toneladas_ofertadas, mensagem } = candidaturaSchema.parse(body);

    const admin = createAdminClient();

    const { data: frete } = await admin
      .from("fretes")
      .select("status, peso_minimo_ton")
      .eq("id", id)
      .single();

    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }
    if (frete.status !== "aberto") {
      return NextResponse.json({ error: "Este frete não está mais disponível" }, { status: 400 });
    }

    const { data: caminhoneiro } = await admin
      .from("caminhoneiros")
      .select("capacidade_toneladas")
      .eq("id", session.userId)
      .single();

    if (!caminhoneiro) {
      return NextResponse.json(
        { error: "Perfil de caminhoneiro não encontrado" },
        { status: 404 }
      );
    }

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

    const { data: candidaturaExistente } = await admin
      .from("candidaturas")
      .select("id")
      .eq("frete_id", id)
      .eq("caminhoneiro_id", session.userId)
      .single();

    if (candidaturaExistente) {
      return NextResponse.json(
        { error: "Você já se candidatou a este frete" },
        { status: 409 }
      );
    }

    const { data: candidatura, error } = await admin
      .from("candidaturas")
      .insert({
        frete_id: id,
        caminhoneiro_id: session.userId,
        toneladas_ofertadas,
        mensagem,
        status: "pendente",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ candidatura }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro ao criar candidatura:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
