-- =============================================================
-- FreteHub - Migration v2
-- Adiciona campos de rota/mapa em fretes,
-- campos extras em caminhoneiros e empresas.
-- Execute no Supabase Dashboard → SQL Editor
-- =============================================================

-- ---- fretes: coordenadas e distância ----
ALTER TABLE "fretes"
  ADD COLUMN IF NOT EXISTS "distancia_km"  INTEGER,
  ADD COLUMN IF NOT EXISTS "origem_lat"    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "origem_lng"    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "destino_lat"   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "destino_lng"   DOUBLE PRECISION;

-- ---- caminhoneiros: perfil expandido ----
ALTER TABLE "caminhoneiros"
  ADD COLUMN IF NOT EXISTS "telefone"          TEXT,
  ADD COLUMN IF NOT EXISTS "cidade"            TEXT,
  ADD COLUMN IF NOT EXISTS "estado"            TEXT,
  ADD COLUMN IF NOT EXISTS "experiencia_anos"  INTEGER,
  ADD COLUMN IF NOT EXISTS "descricao"         TEXT,
  ADD COLUMN IF NOT EXISTS "possui_rastreador" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "possui_seguro"     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "areas_atendimento" TEXT[]  NOT NULL DEFAULT '{}';

-- ---- empresas: perfil expandido ----
ALTER TABLE "empresas"
  ADD COLUMN IF NOT EXISTS "nome_fantasia"       TEXT,
  ADD COLUMN IF NOT EXISTS "site"                TEXT,
  ADD COLUMN IF NOT EXISTS "descricao"           TEXT,
  ADD COLUMN IF NOT EXISTS "numero_funcionarios" INTEGER;
