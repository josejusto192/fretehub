import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

const empresaSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  razao_social: z.string().min(2, "Razão social obrigatória"),
  cnpj: z.string().length(14, "CNPJ deve ter 14 dígitos"),
  telefone: z.string().min(10, "Telefone inválido"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 letras"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = empresaSchema.parse(body);

    const admin = createAdminClient();

    const { data: cnpjExiste } = await admin
      .from("empresas")
      .select("id")
      .eq("cnpj", data.cnpj)
      .single();

    if (cnpjExiste) {
      return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 409 });
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { role: "empresa" } },
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
      role: "empresa",
      status: "pendente",
    });

    if (userError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Erro ao criar perfil" }, { status: 500 });
    }

    const { error: empresaError } = await admin.from("empresas").insert({
      id: authData.user.id,
      razao_social: data.razao_social,
      cnpj: data.cnpj,
      telefone: data.telefone,
      endereco: { cidade: data.cidade, estado: data.estado },
      verificado: false,
    });

    if (empresaError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Erro ao criar empresa" }, { status: 500 });
    }

    await sendWelcomeEmail(data.email, data.razao_social, "empresa");

    return NextResponse.json(
      { user: { id: authData.user.id, email: data.email, role: "empresa", status: "pendente" } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro no cadastro de empresa:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
