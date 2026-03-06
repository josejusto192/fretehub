import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const admin = createAdminClient();

    const { data: frete, error } = await admin
      .from("fretes")
      .select(`
        *,
        empresa:empresas(razao_social, telefone, verificado, endereco),
        candidaturas(
          *,
          caminhoneiro:caminhoneiros(nome_completo, tipo_caminhao, capacidade_toneladas, verificado, categoria_cnh)
        )
      `)
      .eq("id", id)
      .order("created_at", { ascending: false, referencedTable: "candidaturas" })
      .single();

    if (error || !frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    const normalized = {
      ...frete,
      _count: { candidaturas: frete.candidaturas?.length ?? 0 },
    };

    return NextResponse.json({ frete: normalized });
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
    const admin = createAdminClient();

    const { data: frete } = await admin.from("fretes").select("empresa_id").eq("id", id).single();
    if (!frete) {
      return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
    }

    if (session.role !== "admin" && frete.empresa_id !== session.userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { data: updated, error } = await admin
      .from("fretes")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ frete: updated });
  } catch (error) {
    console.error("Erro ao atualizar frete:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
