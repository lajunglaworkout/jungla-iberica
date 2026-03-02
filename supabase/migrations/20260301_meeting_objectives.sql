-- ================================================================
-- meeting_objectives: objetivos por reunión con seguimiento AI
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS meeting_objectives (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Reunión en la que se creó el objetivo
  meeting_id    integer REFERENCES meetings(id) ON DELETE CASCADE,
  department    text NOT NULL,
  texto         text NOT NULL,          -- Texto libre del objetivo
  orden         integer DEFAULT 0,      -- Orden dentro de la reunión

  -- Revisión en la siguiente reunión
  revisado                  boolean DEFAULT false,
  conseguido                boolean,       -- null = sin revisar, true/false = resultado
  nota_revision             text,          -- Comentario al revisar
  revisado_en_meeting_id    integer REFERENCES meetings(id),
  revisado_at               timestamptz,

  -- Interpretación AI (generada al crear el acta de la siguiente reunión)
  interpretacion_ai         text,

  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Índices para las queries más frecuentes
CREATE INDEX IF NOT EXISTS idx_meeting_objectives_meeting_id
  ON meeting_objectives(meeting_id);

CREATE INDEX IF NOT EXISTS idx_meeting_objectives_department_revisado
  ON meeting_objectives(department, revisado);

-- RLS: solo usuarios autenticados
ALTER TABLE meeting_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage objectives"
  ON meeting_objectives
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
