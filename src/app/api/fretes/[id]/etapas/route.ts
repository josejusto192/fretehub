import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDEM_ETAPAS = [
  "aceito",
  "motorista_a_caminho",
  "coleta_realizada",
  "em_transito",
  "entregue",
  "concluido",
] as const;

type EtapaTipo = (typeof ORDEM_ETAPAS)[number];

// Etapas que só a empresa pode confirmar
const ETAPAS_EMPRESA: EtapaTipo[] = ["concluido"];
// Etapas que só o caminhoneiro pode confirmar
const ETAPAS_CAMINHONEIRO: EtapaTipo[] = [
  "motorista_a_caminho",
  "coleta_realizada",
  "em_transito",
  "entregue",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: freteId } = await params;
  const admin = createAdminClient();

  // Verify access: must be the empresa owner or the accepted caminhoneiro
  const { data: frete } = await admin
    .from("fretes")
    .select("empresa_id")
    .eq("id", freteId)
    .single();

  if (!frete) return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });

  const isEmpresaOwner = session.role === "empresa" && frete.empresa_id === session.userId;
  const isAdmin = session.role === "admin";

  let isCaminhoneiroAccepted = false;
  if (session.role === "caminhoneiro") {
    const { data: cand } = await admin
      .from("candidaturas")
      .select("id")
      .eq("frete_id", freteId)
      .eq("caminhoneiro_id", session.userId)
      .eq("status", "aceita")
      .single();
    isCaminhoneiroAccepted = !!cand;
  }

  if (!isEmpresaOwner && !isAdmin && !isCaminhoneiroAccepted) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { data: etapas } = await admin
    .from("frete_etapas")
    .select("*, confirmado_por_user:users!confirmado_por(email)")
    .eq("frete_id", freteId)
    .order("confirmado_em", { ascending: true });

  return NextResponse.json(etapas ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: freteId } = await params;
  const admin = createAdminClient();

  const body = await req.json();
  const { tipo, observacoes } = body as { tipo: EtapaTipo; observacoes?: string };

  if (!ORDEM_ETAPAS.includes(tipo)) {
    return NextResponse.json({ error: "Tipo de etapa inválido" }, { status: 400 });
  }

  // Fetch frete and accepted candidatura
  const { data: frete } = await admin
    .from("fretes")
    .select("empresa_id, status")
    .eq("id", freteId)
    .single();

  if (!frete) return NextResponse.json({ error: "Frete não encontrado" }, { status: 404 });
  if (frete.status === "concluido" || frete.status === "cancelado") {
    return NextResponse.json({ error: "Frete já finalizado" }, { status: 400 });
  }

  const { data: candidaturaAceita } = await admin
    .from("candidaturas")
    .select("id, caminhoneiro_id")
    .eq("frete_id", freteId)
    .eq("status", "aceita")
    .single();

  const isEmpresaOwner = session.role === "empresa" && frete.empresa_id === session.userId;
  const isAdmin = session.role === "admin";
  const isCaminhoneiro =
    session.role === "caminhoneiro" &&
    candidaturaAceita?.caminhoneiro_id === session.userId;

  // Permission check per etapa type
  if (ETAPAS_EMPRESA.includes(tipo) && !isEmpresaOwner && !isAdmin) {
    return NextResponse.json({ error: "Apenas a empresa pode confirmar esta etapa" }, { status: 403 });
  }
  if (ETAPAS_CAMINHONEIRO.includes(tipo) && !isCaminhoneiro && !isAdmin) {
    return NextResponse.json({ error: "Apenas o motorista pode confirmar esta etapa" }, { status: 403 });
  }

  // Check sequential order
  const { data: existingEtapas } = await admin
    .from("frete_etapas")
    .select("tipo")
    .eq("frete_id", freteId)
    .order("confirmado_em", { ascending: true });

  const tiposCriados = (existingEtapas ?? []).map((e) => e.tipo as EtapaTipo);

  // Cannot create same etapa twice
  if (tiposCriados.includes(tipo)) {
    return NextResponse.json({ error: "Esta etapa já foi confirmada" }, { status: 400 });
  }

  // Must follow order (except 'aceito' which is created by system)
  const indexDesejado = ORDEM_ETAPAS.indexOf(tipo);
  const ultimaCriada = tiposCriados[tiposCriados.length - 1];
  const indexUltima = ultimaCriada ? ORDEM_ETAPAS.indexOf(ultimaCriada) : -1;

  if (indexDesejado !== indexUltima + 1) {
    return NextResponse.json(
      { error: `Confirme a etapa anterior primeiro: "${ORDEM_ETAPAS[indexUltima + 1]}"` },
      { status: 400 }
    );
  }

  // Create the etapa
  const { data: novaEtapa, error } = await admin
    .from("frete_etapas")
    .insert({
      frete_id: freteId,
      candidatura_id: candidaturaAceita?.id ?? null,
      tipo,
      observacoes: observacoes ?? null,
      confirmado_por: session.userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If concluido: update frete status
  if (tipo === "concluido") {
    await admin
      .from("fretes")
      .update({ status: "concluido" })
      .eq("id", freteId);
  }

  return NextResponse.json(novaEtapa, { status: 201 });
}
