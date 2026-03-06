import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: user, error } = await admin
      .from("users")
      .select("*, empresa:empresas(*), caminhoneiro:caminhoneiros(*)")
      .eq("id", session.userId)
      .single();

    if (error || !user) {
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
    const admin = createAdminClient();

    if (session.role === "empresa") {
      const { razao_social, telefone, cidade, estado } = body;
      const updates: Record<string, unknown> = {};
      if (razao_social) updates.razao_social = razao_social;
      if (telefone) updates.telefone = telefone;
      if (cidade || estado) updates.endereco = { cidade, estado };

      await admin.from("empresas").update(updates).eq("id", session.userId);
    } else if (session.role === "caminhoneiro") {
      const { nome_completo, tipo_caminhao, capacidade_toneladas } = body;
      const updates: Record<string, unknown> = {};
      if (nome_completo) updates.nome_completo = nome_completo;
      if (tipo_caminhao) updates.tipo_caminhao = tipo_caminhao;
      if (capacidade_toneladas) updates.capacidade_toneladas = capacidade_toneladas;

      await admin.from("caminhoneiros").update(updates).eq("id", session.userId);
    }

    const { data: user } = await admin
      .from("users")
      .select("*, empresa:empresas(*), caminhoneiro:caminhoneiros(*)")
      .eq("id", session.userId)
      .single();

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
