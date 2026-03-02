-- ============================================================
-- wodbuster_pagos_sync: snapshot mensual de pagos por centro
-- Un registro por centro por mes, actualizado en cada sync
-- ============================================================

CREATE TABLE IF NOT EXISTS wodbuster_pagos_sync (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id       text NOT NULL CHECK (center_id IN ('sevilla', 'jerez', 'puerto')),
    mes_sync        date NOT NULL,           -- primer día del mes (ej: 2026-03-01)
    data            jsonb NOT NULL DEFAULT '[]',  -- array completo de pagos raw
    total_pagos     integer DEFAULT 0,
    importe_total   numeric(10,2) DEFAULT 0,
    synced_at       timestamptz DEFAULT now(),
    UNIQUE (center_id, mes_sync)
);

CREATE INDEX IF NOT EXISTS idx_wodbuster_pagos_center_mes
    ON wodbuster_pagos_sync (center_id, mes_sync DESC);

-- RLS
ALTER TABLE wodbuster_pagos_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read wodbuster_pagos_sync"
    ON wodbuster_pagos_sync FOR SELECT
    TO authenticated
    USING (true);

-- Solo service_role escribe (funciones server-side)
CREATE POLICY "Service role full access wodbuster_pagos_sync"
    ON wodbuster_pagos_sync FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- wodbuster_webhook_log: log de eventos recibidos via RestHook
-- ============================================================

CREATE TABLE IF NOT EXISTS wodbuster_webhook_log (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    received_at timestamptz DEFAULT now(),
    event_type  text,
    center_id   text,
    payload     jsonb,
    processed   boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_wodbuster_webhook_log_received
    ON wodbuster_webhook_log (received_at DESC);

ALTER TABLE wodbuster_webhook_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access wodbuster_webhook_log"
    ON wodbuster_webhook_log FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read wodbuster_webhook_log"
    ON wodbuster_webhook_log FOR SELECT
    TO authenticated
    USING (true);
