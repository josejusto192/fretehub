import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const freteSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório"),
  tipo_carga: z.string().min(1, "Tipo de carga obrigatório"),
  origem_cidade: z.string().min(1, "Cidade de origem obrigatória"),
  origem_estado: z.string().length(2, "Estado de origem deve ter 2 letras"),
  destino_cidade: z.string().min(1, "Cidade de destino obrigatória"),
  destino_estado: z.string().length(2, "Estado de destino deve ter 2 letras"),
  peso_total_ton: z.number().positive("Peso total deve ser positivo"),
  peso_minimo_ton: z.number().positive().optional().nullable(),
  valor_por_tonelada: z.number().positive("Valor por tonelada deve ser positivo"),
  data_coleta: z.string().min(1, "Data de coleta obrigatória"),
  prazo_entrega: z.string().min(1, "Prazo de entrega obrigatório"),
  observacoes: z.string().optional(),
  distancia_km: z.number().int().positive().optional().nullable(),
  origem_lat: z.number().optional().nullable(),
  origem_lng: z.number().optional().nullable(),
  destino_lat: z.number().optional().nullable(),
  destino_lng: z.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const origem_estado = searchParams.get("origem_estado");
    const destino_estado = searchParams.get("destino_estado");
    const tipo_carga = searchParams.get("tipo_carga");
    const empresa_id = searchParams.get("empresa_id");

    const admin = createAdminClient();
    let query = admin
      .from("fretes")
      .select("*, empresa:empresas(razao_social, verificado), candidaturas(count)")
      .order("created_at", { ascending: false });

    if (session.role === "caminhoneiro") {
      query = query.eq("status", "aberto");
    }
    if (empresa_id) query = query.eq("empresa_id", empresa_id);
    if (origem_estado) query = query.eq("origem_estado", origem_estado);
    if (destino_estado) query = query.eq("destino_estado", destino_estado);
    if (tipo_carga) query = query.ilike("tipo_carga", `%${tipo_carga}%`);

    const { data: fretes, error } = await query;
    if (error) throw error;

    const normalized = (fretes ?? []).map((f) => ({
      ...f,
      _count: { candidaturas: f.candidaturas?.[0]?.count ?? 0 },
      candidaturas: undefined,
    }));

    return NextResponse.json({ fretes: normalized });
  } catch (error) {
    console.error("Erro ao listar fretes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (session.role !== "empresa" && session.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = freteSchema.parse(body);

    const admin = createAdminClient();
    const { data: frete, error } = await admin
      .from("fretes")
      .insert({
        empresa_id: session.userId,
        titulo: data.titulo,
        tipo_carga: data.tipo_carga,
        origem_cidade: data.origem_cidade,
        origem_estado: data.origem_estado,
        destino_cidade: data.destino_cidade,
        destino_estado: data.destino_estado,
        peso_total_ton: data.peso_total_ton,
        peso_minimo_ton: data.peso_minimo_ton ?? null,
        valor_por_tonelada: data.valor_por_tonelada,
        data_coleta: new Date(data.data_coleta).toISOString(),
        prazo_entrega: new Date(data.prazo_entrega).toISOString(),
        observacoes: data.observacoes,
        distancia_km: data.distancia_km ?? null,
        origem_lat: data.origem_lat ?? null,
        origem_lng: data.origem_lng ?? null,
        destino_lat: data.destino_lat ?? null,
        destino_lng: data.destino_lng ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ frete }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro ao criar frete:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
