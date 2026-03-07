import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkAccess(
  freteId: string,
  userId: string,
  role: string
): Promise<{ allowed: boolean; otherPartyId?: string }> {
  const admin = createAdminClient();

  const { data: frete } = await admin
    .from("fretes")
    .select("empresa_id")
    .eq("id", freteId)
    .single();

  if (!frete) return { allowed: false };

  if (role === "admin") return { allowed: true };

  if (role === "empresa" && frete.empresa_id === userId) {
    // Find the accepted caminhoneiro
    const { data: cand } = await admin
      .from("candidaturas")
      .select("caminhoneiro_id")
      .eq("frete_id", freteId)
      .eq("status", "aceita")
      .single();
    return { allowed: true, otherPartyId: cand?.caminhoneiro_id };
  }

  if (role === "caminhoneiro") {
    const { data: cand } = await admin
      .from("candidaturas")
      .select("id")
      .eq("frete_id", freteId)
      .eq("caminhoneiro_id", userId)
      .eq("status", "aceita")
      .single();
    if (cand) return { allowed: true, otherPartyId: frete.empresa_id };
  }

  return { allowed: false };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: freteId } = await params;

  const { allowed } = await checkAccess(freteId, session.userId, session.role);
  if (!allowed) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const admin = createAdminClient();

  const { data: mensagens } = await admin
    .from("mensagens")
    .select("*, remetente:users!remetente_id(email, role)")
    .eq("frete_id", freteId)
    .order("created_at", { ascending: true });

  // Mark unread messages from the other party as read
  await admin
    .from("mensagens")
    .update({ lida: true })
    .eq("frete_id", freteId)
    .eq("lida", false)
    .neq("remetente_id", session.userId);

  return NextResponse.json(mensagens ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: freteId } = await params;

  const { allowed } = await checkAccess(freteId, session.userId, session.role);
  if (!allowed) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await req.json();
  const conteudo = (body.conteudo ?? "").trim();

  if (!conteudo) {
    return NextResponse.json({ error: "Mensagem não pode ser vazia" }, { status: 400 });
  }
  if (conteudo.length > 2000) {
    return NextResponse.json({ error: "Mensagem muito longa (máx. 2000 caracteres)" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: msg, error } = await admin
    .from("mensagens")
    .insert({ frete_id: freteId, remetente_id: session.userId, conteudo })
    .select("*, remetente:users!remetente_id(email, role)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(msg, { status: 201 });
}
