import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
});

// GET - Listar fretes (com filtros)
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

    const where: Record<string, unknown> = {};

    if (session.role === "caminhoneiro") {
      where.status = "aberto";
    }

    if (empresa_id) where.empresa_id = empresa_id;
    if (origem_estado) where.origem_estado = origem_estado;
    if (destino_estado) where.destino_estado = destino_estado;
    if (tipo_carga) where.tipo_carga = { contains: tipo_carga, mode: "insensitive" };

    const fretes = await prisma.frete.findMany({
      where,
      include: {
        empresa: { select: { razao_social: true, verificado: true } },
        _count: { select: { candidaturas: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ fretes });
  } catch (error) {
    console.error("Erro ao listar fretes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Criar frete (somente empresa)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (session.role !== "empresa") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const data = freteSchema.parse(body);

    const frete = await prisma.frete.create({
      data: {
        empresa_id: session.userId,
        titulo: data.titulo,
        tipo_carga: data.tipo_carga,
        origem_cidade: data.origem_cidade,
        origem_estado: data.origem_estado,
        destino_cidade: data.destino_cidade,
        destino_estado: data.destino_estado,
        peso_total_ton: data.peso_total_ton,
        peso_minimo_ton: data.peso_minimo_ton || null,
        valor_por_tonelada: data.valor_por_tonelada,
        data_coleta: new Date(data.data_coleta),
        prazo_entrega: new Date(data.prazo_entrega),
        observacoes: data.observacoes,
      },
    });

    return NextResponse.json({ frete }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro ao criar frete:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
