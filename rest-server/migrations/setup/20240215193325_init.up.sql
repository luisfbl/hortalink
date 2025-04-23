CREATE DATABASE hortalink;

GRANT ALL PRIVILEGES ON DATABASE hortalink TO postgres;

-- Adicionar colunas de notificação à tabela users
ALTER TABLE IF EXISTS "users"
    ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE;