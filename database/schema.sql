-- SRQMS validation prototype PostgreSQL schema
-- All example beneficiaries and transactions must be synthetic/demo records only.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SHOP_OPERATOR','SHOP_SUPERVISOR','SYSTEM_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE card_category AS ENUM ('AAY','PHH','NPHH','OTHER_DEMO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE queue_status AS ENUM ('WAITING','SERVING','COMPLETED','CANCELLED','NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE stock_transaction_type AS ENUM ('RESTOCK','DISTRIBUTION','ADJUSTMENT','REVERSAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM ('RECEIVED','IN_REVIEW','RESOLVED','CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('PENDING','SENT','FAILED','SKIPPED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  district VARCHAR(100) NOT NULL,
  taluk VARCHAR(100),
  locality VARCHAR(120),
  address TEXT NOT NULL,
  pincode CHAR(6),
  phone_display VARCHAR(40),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_demo BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shops_demo_only CHECK (is_demo = TRUE)
);

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(80) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shop_roles_require_shop CHECK (role = 'SYSTEM_ADMIN' OR shop_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL UNIQUE,
  name_i18n JSONB NOT NULL,
  unit VARCHAR(24) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ration_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number VARCHAR(40) NOT NULL UNIQUE,
  category card_category NOT NULL,
  head_name VARCHAR(160) NOT NULL,
  family_members SMALLINT NOT NULL CHECK (family_members > 0 AND family_members <= 20),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  locality VARCHAR(120),
  demo_mobile_masked VARCHAR(30),
  is_demo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ration_cards_demo_only CHECK (is_demo = TRUE)
);

CREATE TABLE IF NOT EXISTS policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code VARCHAR(80) NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  card_category card_category NOT NULL,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  district VARCHAR(100),
  rule_config JSONB NOT NULL,
  explanation_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_url TEXT,
  source_note TEXT,
  verified_at TIMESTAMPTZ,
  valid_from DATE NOT NULL,
  valid_to DATE,
  is_demo BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rule_code, version),
  CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE TABLE IF NOT EXISTS shop_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  quantity_available NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  reorder_level NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  updated_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shop_id, commodity_id)
);

CREATE TABLE IF NOT EXISTS queue_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  counter_no SMALLINT NOT NULL CHECK (counter_no > 0),
  display_name VARCHAR(80) NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shop_id, counter_no)
);

CREATE TABLE IF NOT EXISTS queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  ration_card_id UUID NOT NULL REFERENCES ration_cards(id) ON DELETE RESTRICT,
  service_date DATE NOT NULL,
  sequence_no BIGINT NOT NULL CHECK (sequence_no > 0),
  token_number VARCHAR(32) NOT NULL,
  status queue_status NOT NULL DEFAULT 'WAITING',
  counter_no SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  serving_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  no_show_at TIMESTAMPTZ,
  status_reason TEXT,
  created_by_verification UUID,
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE (shop_id, service_date, sequence_no),
  UNIQUE (shop_id, service_date, token_number),
  FOREIGN KEY (shop_id, counter_no) REFERENCES queue_counters(shop_id, counter_no) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_queue_active_card_per_shop_day
  ON queue_tokens (ration_card_id, shop_id, service_date)
  WHERE status IN ('WAITING','SERVING');
CREATE INDEX IF NOT EXISTS ix_queue_shop_date_status_seq
  ON queue_tokens (shop_id, service_date, status, sequence_no);

CREATE TABLE IF NOT EXISTS distribution_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL UNIQUE REFERENCES queue_tokens(id) ON DELETE RESTRICT,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  ration_card_id UUID NOT NULL REFERENCES ration_cards(id) ON DELETE RESTRICT,
  operator_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribution_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES distribution_transactions(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(24) NOT NULL,
  UNIQUE (distribution_id, commodity_id)
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  transaction_type stock_transaction_type NOT NULL,
  quantity_delta NUMERIC(12,3) NOT NULL CHECK (quantity_delta <> 0),
  quantity_before NUMERIC(12,3) NOT NULL CHECK (quantity_before >= 0),
  quantity_after NUMERIC(12,3) NOT NULL CHECK (quantity_after >= 0),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  actor_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  distribution_item_id UUID UNIQUE REFERENCES distribution_items(id) ON DELETE RESTRICT,
  idempotency_key VARCHAR(120),
  request_id VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (quantity_after = quantity_before + quantity_delta)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_stock_actor_idempotency
  ON stock_transactions (actor_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_stock_ledger_shop_commodity_created
  ON stock_transactions (shop_id, commodity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code VARCHAR(24) NOT NULL UNIQUE,
  category VARCHAR(60) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  message TEXT NOT NULL CHECK (length(message) <= 4000),
  status complaint_status NOT NULL DEFAULT 'RECEIVED',
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  demo_contact_hint VARCHAR(80),
  response_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_i18n JSONB NOT NULL,
  body_i18n JSONB NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'GENERAL',
  status VARCHAR(16) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES queue_tokens(id) ON DELETE SET NULL,
  channel VARCHAR(24) NOT NULL,
  event_type VARCHAR(48) NOT NULL,
  status notification_status NOT NULL DEFAULT 'PENDING',
  destination_masked VARCHAR(60),
  provider_message_id VARCHAR(120),
  attempt_count SMALLINT NOT NULL DEFAULT 0,
  last_error_code VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(80) NOT NULL,
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  request_id VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_audit_created ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS ix_audit_resource ON audit_logs (resource_type, resource_id, created_at DESC);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_scope VARCHAR(100) NOT NULL,
  route_key VARCHAR(160) NOT NULL,
  idempotency_key VARCHAR(120) NOT NULL,
  response_status SMALLINT,
  response_body JSONB,
  resource_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (actor_scope, route_key, idempotency_key)
);

-- Note: create app-level triggers/services to update updated_at consistently and to make ledgers append-only.
-- PostgreSQL GRANTs for production should deny UPDATE/DELETE on stock_transactions and audit_logs to the app role.
