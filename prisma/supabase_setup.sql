-- =============================================================
-- FretHub - Schema inicial para Supabase
-- Execute este script no Supabase SQL Editor:
-- Supabase Dashboard → SQL Editor → New Query → Cole e Execute
-- =============================================================

-- Enums
CREATE TYPE "Role" AS ENUM ('empresa', 'caminhoneiro', 'admin');
CREATE TYPE "UserStatus" AS ENUM ('pendente', 'ativo', 'bloqueado');
CREATE TYPE "FreteStatus" AS ENUM ('aberto', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE "CandidaturaStatus" AS ENUM ('pendente', 'aceita', 'recusada', 'cancelada');

-- Tabela: users
CREATE TABLE "users" (
    "id"            TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "email"         TEXT        NOT NULL,
    "password_hash" TEXT        NOT NULL,
    "role"          "Role"      NOT NULL,
    "status"        "UserStatus" NOT NULL DEFAULT 'pendente',
    "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Tabela: empresas
CREATE TABLE "empresas" (
    "id"           TEXT    NOT NULL,
    "razao_social" TEXT    NOT NULL,
    "cnpj"         TEXT    NOT NULL,
    "telefone"     TEXT    NOT NULL,
    "endereco"     JSONB   NOT NULL,
    "verificado"   BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "empresas_id_fkey" FOREIGN KEY ("id")
        REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- Tabela: caminhoneiros
CREATE TABLE "caminhoneiros" (
    "id"                   TEXT           NOT NULL,
    "nome_completo"        TEXT           NOT NULL,
    "cpf"                  TEXT           NOT NULL,
    "numero_cnh"           TEXT           NOT NULL,
    "categoria_cnh"        TEXT           NOT NULL,
    "numero_antt"          TEXT           NOT NULL,
    "tipo_caminhao"        TEXT           NOT NULL,
    "capacidade_toneladas" DECIMAL(10, 2) NOT NULL,
    "verificado"           BOOLEAN        NOT NULL DEFAULT FALSE,

    CONSTRAINT "caminhoneiros_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "caminhoneiros_id_fkey" FOREIGN KEY ("id")
        REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "caminhoneiros_cpf_key" ON "caminhoneiros"("cpf");

-- Tabela: fretes
CREATE TABLE "fretes" (
    "id"                 TEXT           NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "empresa_id"         TEXT           NOT NULL,
    "titulo"             TEXT           NOT NULL,
    "tipo_carga"         TEXT           NOT NULL,
    "origem_cidade"      TEXT           NOT NULL,
    "origem_estado"      TEXT           NOT NULL,
    "destino_cidade"     TEXT           NOT NULL,
    "destino_estado"     TEXT           NOT NULL,
    "peso_total_ton"     DECIMAL(10, 2) NOT NULL,
    "peso_minimo_ton"    DECIMAL(10, 2),
    "valor_por_tonelada" DECIMAL(10, 2) NOT NULL,
    "data_coleta"        TIMESTAMPTZ    NOT NULL,
    "prazo_entrega"      TIMESTAMPTZ    NOT NULL,
    "status"             "FreteStatus"  NOT NULL DEFAULT 'aberto',
    "observacoes"        TEXT,
    "created_at"         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT "fretes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fretes_empresa_id_fkey" FOREIGN KEY ("empresa_id")
        REFERENCES "empresas"("id")
);

-- Tabela: candidaturas
CREATE TABLE "candidaturas" (
    "id"                  TEXT                NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "frete_id"            TEXT                NOT NULL,
    "caminhoneiro_id"     TEXT                NOT NULL,
    "toneladas_ofertadas" DECIMAL(10, 2)      NOT NULL,
    "mensagem"            TEXT,
    "status"              "CandidaturaStatus" NOT NULL DEFAULT 'pendente',
    "created_at"          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT "candidaturas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "candidaturas_frete_id_caminhoneiro_id_key" UNIQUE ("frete_id", "caminhoneiro_id"),
    CONSTRAINT "candidaturas_frete_id_fkey" FOREIGN KEY ("frete_id")
        REFERENCES "fretes"("id"),
    CONSTRAINT "candidaturas_caminhoneiro_id_fkey" FOREIGN KEY ("caminhoneiro_id")
        REFERENCES "caminhoneiros"("id")
);

-- Tabela: avaliacoes
CREATE TABLE "avaliacoes" (
    "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "frete_id"     TEXT        NOT NULL,
    "avaliador_id" TEXT        NOT NULL,
    "avaliado_id"  TEXT        NOT NULL,
    "nota"         INTEGER     NOT NULL,
    "comentario"   TEXT,
    "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "avaliacoes_frete_id_fkey" FOREIGN KEY ("frete_id")
        REFERENCES "fretes"("id"),
    CONSTRAINT "avaliacoes_avaliador_id_fkey" FOREIGN KEY ("avaliador_id")
        REFERENCES "users"("id"),
    CONSTRAINT "avaliacoes_avaliado_id_fkey" FOREIGN KEY ("avaliado_id")
        REFERENCES "users"("id")
);

-- =============================================================
-- Usuário admin inicial (senha: Admin@123 - troque após o login)
-- Gera hash bcrypt via pgcrypto; se preferir, crie via API /api/auth/cadastro
-- =============================================================
-- INSERT INTO "users" ("email", "password_hash", "role", "status")
-- VALUES ('admin@fretehub.com', crypt('Admin@123', gen_salt('bf')), 'admin', 'ativo');
