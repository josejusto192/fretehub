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
      const {
        razao_social,
        nome_fantasia,
        telefone,
        site,
        descricao,
        numero_funcionarios,
        cidade,
        estado,
      } = body;

      const updates: Record<string, unknown> = {};
      if (razao_social !== undefined) updates.razao_social = razao_social;
      if (nome_fantasia !== undefined) updates.nome_fantasia = nome_fantasia;
      if (telefone !== undefined) updates.telefone = telefone;
      if (site !== undefined) updates.site = site;
      if (descricao !== undefined) updates.descricao = descricao;
      if (numero_funcionarios !== undefined) updates.numero_funcionarios = numero_funcionarios;
      if (cidade !== undefined || estado !== undefined) {
        updates.endereco = { cidade: cidade ?? "", estado: estado ?? "" };
      }

      const { error } = await admin
        .from("empresas")
        .update(updates)
        .eq("id", session.userId);

      if (error) throw error;
    } else if (session.role === "caminhoneiro") {
      const {
        nome_completo,
        telefone,
        cidade,
        estado,
        tipo_caminhao,
        capacidade_toneladas,
        experiencia_anos,
        descricao,
        possui_rastreador,
        possui_seguro,
        areas_atendimento,
      } = body;

      const updates: Record<string, unknown> = {};
      if (nome_completo !== undefined) updates.nome_completo = nome_completo;
      if (telefone !== undefined) updates.telefone = telefone;
      if (cidade !== undefined) updates.cidade = cidade;
      if (estado !== undefined) updates.estado = estado;
      if (tipo_caminhao !== undefined) updates.tipo_caminhao = tipo_caminhao;
      if (capacidade_toneladas !== undefined) updates.capacidade_toneladas = capacidade_toneladas;
      if (experiencia_anos !== undefined) updates.experiencia_anos = experiencia_anos;
      if (descricao !== undefined) updates.descricao = descricao;
      if (possui_rastreador !== undefined) updates.possui_rastreador = possui_rastreador;
      if (possui_seguro !== undefined) updates.possui_seguro = possui_seguro;
      if (areas_atendimento !== undefined) updates.areas_atendimento = areas_atendimento;

      const { error } = await admin
        .from("caminhoneiros")
        .update(updates)
        .eq("id", session.userId);

      if (error) throw error;
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
