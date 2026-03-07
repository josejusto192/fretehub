-- Migration v3: Freight lifecycle intermediation
-- Run this after migration_v2.sql

-- 1. Recipient information on fretes
ALTER TABLE fretes
  ADD COLUMN IF NOT EXISTS destinatario_nome       TEXT,
  ADD COLUMN IF NOT EXISTS destinatario_telefone   TEXT,
  ADD COLUMN IF NOT EXISTS destinatario_documento  TEXT,
  ADD COLUMN IF NOT EXISTS destinatario_instrucoes TEXT;

-- 2. Freight lifecycle stages
DO $$ BEGIN
  CREATE TYPE etapa_tipo AS ENUM (
    'aceito',
    'motorista_a_caminho',
    'coleta_realizada',
    'em_transito',
    'entregue',
    'concluido'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS frete_etapas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frete_id        UUID NOT NULL REFERENCES fretes(id) ON DELETE CASCADE,
  candidatura_id  UUID REFERENCES candidaturas(id),
  tipo            etapa_tipo NOT NULL,
  observacoes     TEXT,
  confirmado_por  UUID REFERENCES users(id),
  confirmado_em   TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_frete_etapas_frete_id ON frete_etapas(frete_id);

-- 3. Chat messages between empresa and caminhoneiro
CREATE TABLE IF NOT EXISTS mensagens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frete_id      UUID NOT NULL REFERENCES fretes(id) ON DELETE CASCADE,
  remetente_id  UUID NOT NULL REFERENCES users(id),
  conteudo      TEXT NOT NULL CHECK (char_length(conteudo) > 0),
  lida          BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_frete_id ON mensagens(frete_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens(frete_id, created_at ASC);
