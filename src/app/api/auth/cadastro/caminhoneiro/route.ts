import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
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
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 letras"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = caminhoneiroSchema.parse(body);

    // Verificar duplicatas
    const [emailExiste, cpfExiste] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.caminhoneiro.findUnique({ where: { cpf: data.cpf } }),
    ]);

    if (emailExiste) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }
    if (cpfExiste) {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash,
        role: "caminhoneiro",
        status: "pendente",
        caminhoneiro: {
          create: {
            nome_completo: data.nome_completo,
            cpf: data.cpf,
            numero_cnh: data.numero_cnh,
            categoria_cnh: data.categoria_cnh,
            numero_antt: data.numero_antt,
            tipo_caminhao: data.tipo_caminhao,
            capacidade_toneladas: data.capacidade_toneladas,
            verificado: false,
          },
        },
      },
    });

    // Enviar e-mail de boas-vindas
    await sendWelcomeEmail(user.email, data.nome_completo, "caminhoneiro");

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
    console.error("Erro no cadastro de caminhoneiro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
