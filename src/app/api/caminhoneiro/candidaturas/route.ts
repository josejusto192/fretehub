import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const admin = createAdminClient();
    const { data: candidaturas, error } = await admin
      .from("candidaturas")
      .select("*, frete:fretes(*, empresa:empresas(razao_social))")
      .eq("caminhoneiro_id", session.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ candidaturas });
  } catch (error) {
    console.error("Erro ao listar candidaturas do caminhoneiro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
