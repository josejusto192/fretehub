import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
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

    // Verificar duplicatas
    const [emailExiste, cnpjExiste] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.empresa.findUnique({ where: { cnpj: data.cnpj } }),
    ]);

    if (emailExiste) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }
    if (cnpjExiste) {
      return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash,
        role: "empresa",
        status: "pendente",
        empresa: {
          create: {
            razao_social: data.razao_social,
            cnpj: data.cnpj,
            telefone: data.telefone,
            endereco: { cidade: data.cidade, estado: data.estado },
            verificado: false,
          },
        },
      },
    });

    // Enviar e-mail de boas-vindas
    await sendWelcomeEmail(user.email, data.razao_social, "empresa");

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, role: user.role, status: user.status } },
      { status: 201 }
    );

    response.cookies.set("fretehub-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Erro no cadastro de empresa:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
