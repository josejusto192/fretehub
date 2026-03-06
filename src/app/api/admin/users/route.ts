import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const admin = createAdminClient();
    let query = admin
      .from("users")
      .select("id, email, role, status, created_at, empresa:empresas(razao_social, cnpj, verificado), caminhoneiro:caminhoneiros(nome_completo, cpf, verificado)")
      .order("created_at", { ascending: false });

    if (role) query = query.eq("role", role);
    if (status) query = query.eq("status", status);

    const { data: users, error } = await query;
    if (error) throw error;

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

    const admin = createAdminClient();

    const { data: user } = await admin.from("users").select("role").eq("id", userId).single();
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (status) {
      await admin.from("users").update({ status }).eq("id", userId);
    }

    if (verificado !== undefined) {
      if (user.role === "empresa") {
        await admin.from("empresas").update({ verificado }).eq("id", userId);
      } else if (user.role === "caminhoneiro") {
        await admin.from("caminhoneiros").update({ verificado }).eq("id", userId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
