import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

const caminhoneiroSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  nome_completo: z.string().min(2, "Nome completo obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  numero_cnh: z.string().min(1, "Número da CNH obrigatório"),
  categoria_cnh: z.string().min(1, "Categoria da CNH obrigatória"),
  numero_antt: z.string().min(1, "Número ANTT obrigatório"),
  tipo_caminhao: z.string().min(1, "Tipo de caminhão obrigatório"),
  capacidade_toneladas: z.number().positive("Capacidade deve ser positiva"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = caminhoneiroSchema.parse(body);

    const admin = createAdminClient();

    const { data: cpfExiste } = await admin
      .from("caminhoneiros")
      .select("id")
      .eq("cpf", data.cpf)
      .single();

    if (cpfExiste) {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { role: "caminhoneiro" } },
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes("already registered")) {
        return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
      }
      return NextResponse.json(
        { error: authError?.message || "Erro ao criar conta" },
        { status: 400 }
      );
    }

    const { error: userError } = await admin.from("users").insert({
      id: authData.user.id,
      email: data.email,
      role: "caminhoneiro",
      status: "pendente",
    });

    if (userError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Erro ao criar perfil" }, { status: 500 });
    }

    const { error: caminhoneiroError } = await admin.from("caminhoneiros").insert({
      id: authData.user.id,
      nome_completo: data.nome_completo,
      cpf: data.cpf,
      numero_cnh: data.numero_cnh,
      categoria_cnh: data.categoria_cnh,
      numero_antt: data.numero_antt,
      tipo_caminhao: data.tipo_caminhao,
      capacidade_toneladas: data.capacidade_toneladas,
      verificado: false,
    });

    if (caminhoneiroError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Erro ao criar perfil de caminhoneiro" }, { status: 500 });
    }

    await sendWelcomeEmail(data.email, data.nome_completo, "caminhoneiro");

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: data.email,
          role: "caminhoneiro",
          status: "pendente",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro no cadastro de caminhoneiro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
