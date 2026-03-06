import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Admin
  const adminHash = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@fretehub.com" },
    update: {},
    create: {
      email: "admin@fretehub.com",
      password_hash: adminHash,
      role: "admin",
      status: "ativo",
    },
  });
  console.log("✅ Admin criado:", admin.email);

  // Empresa de exemplo
  const empresaHash = await bcrypt.hash("empresa123456", 12);
  const empresaUser = await prisma.user.upsert({
    where: { email: "empresa@exemplo.com" },
    update: {},
    create: {
      email: "empresa@exemplo.com",
      password_hash: empresaHash,
      role: "empresa",
      status: "ativo",
      empresa: {
        create: {
          razao_social: "Transportes Exemplo Ltda",
          cnpj: "12345678000195",
          telefone: "(11) 99999-9999",
          endereco: { cidade: "São Paulo", estado: "SP" },
          verificado: true,
        },
      },
    },
  });
  console.log("✅ Empresa criada:", empresaUser.email);

  // Caminhoneiro de exemplo
  const caminhoneiroHash = await bcrypt.hash("caminhoneiro123456", 12);
  const caminhoneiroUser = await prisma.user.upsert({
    where: { email: "joao@exemplo.com" },
    update: {},
    create: {
      email: "joao@exemplo.com",
      password_hash: caminhoneiroHash,
      role: "caminhoneiro",
      status: "ativo",
      caminhoneiro: {
        create: {
          nome_completo: "João da Silva",
          cpf: "12345678901",
          numero_cnh: "12345678901",
          categoria_cnh: "E",
          numero_antt: "12345678",
          tipo_caminhao: "Carreta LS",
          capacidade_toneladas: 27.5,
          verificado: true,
        },
      },
    },
  });
  console.log("✅ Caminhoneiro criado:", caminhoneiroUser.email);

  // Frete de exemplo
  const frete = await prisma.frete.create({
    data: {
      empresa_id: empresaUser.id,
      titulo: "Transporte de Soja — SP para MT",
      tipo_carga: "Soja",
      origem_cidade: "Campinas",
      origem_estado: "SP",
      destino_cidade: "Cuiabá",
      destino_estado: "MT",
      peso_total_ton: 27.5,
      peso_minimo_ton: 20.0,
      valor_por_tonelada: 145.0,
      data_coleta: new Date("2026-04-15"),
      prazo_entrega: new Date("2026-04-20"),
      status: "aberto",
      observacoes: "Carga paletizada. Necessário caminhão com baú ou sider.",
    },
  });
  console.log("✅ Frete criado:", frete.titulo);

  console.log("\n📋 Credenciais de teste:");
  console.log("Admin: admin@fretehub.com / admin123456");
  console.log("Empresa: empresa@exemplo.com / empresa123456");
  console.log("Caminhoneiro: joao@exemplo.com / caminhoneiro123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
