import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { sendCandidaturaAceitaEmail, sendCandidaturaRecusadaEmail } from "@/lib/email";

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

    const admin = createAdminClient();

    const { data: frete } = await admin
      .from("fretes")
      .select("empresa_id, titulo, origem_cidade, origem_estado, destino_cidade, destino_estado")
      .eq("id", id)
      .single();

    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    if (session.role !== "admin" && frete.empresa_id !== session.userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { data: candidatura } = await admin
      .from("candidaturas")
      .select("*, caminhoneiro:caminhoneiros(nome_completo, user:users(email))")
      .eq("id", candidaturaId)
      .single();

    if (!candidatura) {
      return NextResponse.json({ error: "Candidatura não encontrada" }, { status: 404 });
    }

    const { data: updated, error } = await admin
      .from("candidaturas")
      .update({ status })
      .eq("id", candidaturaId)
      .select()
      .single();

    if (error) throw error;

    if (status === "aceita") {
      await sendCandidaturaAceitaEmail(
        candidatura.caminhoneiro.user.email,
        candidatura.caminhoneiro.nome_completo,
        frete.titulo,
        frete.origem_cidade,
        frete.origem_estado,
        frete.destino_cidade,
        frete.destino_estado
      );

      await admin.from("fretes").update({ status: "em_andamento" }).eq("id", id);

      // Auto-create the first lifecycle stage
      await admin.from("frete_etapas").insert({
        frete_id: id,
        candidatura_id: candidaturaId,
        tipo: "aceito",
        confirmado_por: session.userId,
        observacoes: "Candidatura aceita pela empresa",
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
