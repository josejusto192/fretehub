import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    if (profile.status === "bloqueado") {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Conta bloqueada. Entre em contato com o suporte." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        status: profile.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro no login:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
