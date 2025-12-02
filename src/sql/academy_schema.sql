-- =============================================
-- ESQUEMA DE BASE DE DATOS - LA JUNGLA ACADEMY
-- =============================================

-- 1. MÓDULOS Y CONTENIDOS
-- =======================

CREATE TABLE IF NOT EXISTS academy_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  responsible_id UUID REFERENCES auth.users(id), -- Referencia a auth.users de Supabase
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES academy_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" DECIMAL(3,1) NOT NULL, -- 1.1, 1.2, etc.
  duration INTEGER, -- minutos
  video_url TEXT, -- Supabase Storage URL
  ppt_url TEXT,
  script_url TEXT,
  has_test BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('planned', 'scripted', 'recorded', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_lesson_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
  file_type TEXT CHECK (file_type IN ('video', 'ppt', 'downloadable', 'script')),
  file_name TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_lesson_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
  block_number INTEGER CHECK (block_number IN (1, 2, 3)),
  title TEXT,
  description TEXT,
  duration INTEGER -- minutos
);

-- 2. TAREAS
-- =========

CREATE TABLE IF NOT EXISTS academy_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date DATE,
  progress INTEGER DEFAULT 0, -- 0-100
  module_related UUID REFERENCES academy_modules(id),
  lesson_related UUID REFERENCES academy_lessons(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TUTORES Y CENTROS
-- ====================

CREATE TABLE IF NOT EXISTS academy_tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  center_id UUID, -- Referencia a tabla centers existente (si existe, sino dejar null o crear FK)
  city TEXT,
  specialties TEXT[], -- ['RRHH', 'Retención', etc.]
  availability TEXT CHECK (availability IN ('available', 'limited', 'unavailable')),
  compensation_rate DECIMAL(10,2) DEFAULT 50.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_partner_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  compensation_per_student DECIMAL(10,2) DEFAULT 200.00,
  agreement_date DATE,
  status TEXT CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. COHORTES
-- ===========

CREATE TABLE IF NOT EXISTS academy_cohortes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "Cohorte 1 - Sevilla"
  city TEXT NOT NULL,
  center_id UUID, -- Referencia a tabla centers existente
  partner_center_id UUID REFERENCES academy_partner_centers(id),
  start_date DATE NOT NULL,
  end_date DATE,
  max_students INTEGER DEFAULT 25,
  enrolled_students INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('planned', 'enrollment', 'in_progress', 'completed')),
  modality TEXT CHECK (modality IN ('online', 'complete', 'mixed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_cohorte_tutors (
  cohorte_id UUID REFERENCES academy_cohortes(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES academy_tutors(id) ON DELETE CASCADE,
  PRIMARY KEY (cohorte_id, tutor_id)
);

-- 5. ALUMNOS Y RELACIONES (Cache y Gestión)
-- =========================================

CREATE TABLE IF NOT EXISTS academy_students_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id UUID, -- ID en CRM Academy externo
  name TEXT,
  email TEXT,
  cohorte_id UUID REFERENCES academy_cohortes(id),
  modality TEXT CHECK (modality IN ('online', 'complete')),
  enrollment_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')),
  progress_percentage INTEGER DEFAULT 0,
  tutor_id UUID REFERENCES academy_tutors(id),
  satisfaction_rating DECIMAL(3,2),
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_tutor_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES academy_tutors(id),
  student_id UUID REFERENCES academy_students_cache(id), -- Referencia a la caché local
  student_name TEXT,
  cohorte_id UUID REFERENCES academy_cohortes(id),
  hours_completed INTEGER DEFAULT 0,
  hours_total INTEGER DEFAULT 80,
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_companies_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id UUID,
  name TEXT,
  city TEXT,
  category TEXT CHECK (category IN ('pequeña', 'mediana', 'grande')),
  contact_name TEXT,
  contact_email TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'active', 'expired')),
  amount_paid DECIMAL(10,2),
  request_date DATE,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FINANCIERO
-- =============

CREATE TABLE IF NOT EXISTS academy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  concept TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT CHECK (category IN (
    'curso_online', 'curso_completo', 'empresa',
    'tutor', 'partner_center', 'plataforma', 'marketing', 'otros'
  )),
  amount DECIMAL(10,2) NOT NULL,
  student_id UUID REFERENCES academy_students_cache(id),
  tutor_id UUID REFERENCES academy_tutors(id),
  partner_center_id UUID REFERENCES academy_partner_centers(id),
  cohorte_id UUID REFERENCES academy_cohortes(id),
  notes TEXT,
  synced_from_academy BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_partner_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_center_id UUID REFERENCES academy_partner_centers(id),
  student_id UUID REFERENCES academy_students_cache(id),
  student_name TEXT,
  amount DECIMAL(10,2),
  payment_date DATE,
  cohorte_id UUID REFERENCES academy_cohortes(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. POLÍTICAS DE SEGURIDAD (RLS)
-- ===============================

-- Habilitar RLS en todas las tablas
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_partner_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_cohortes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_cohorte_tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_students_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_tutor_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_companies_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_partner_payments ENABLE ROW LEVEL SECURITY;

-- Política de acceso total para usuarios autenticados (simplificada por ahora)
-- En producción, se debería filtrar por rol (CEO, DIRECTOR)
-- Asumimos que la aplicación ya filtra el acceso a la vista

CREATE POLICY "Academy access for authenticated users" ON academy_modules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_lessons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_lesson_files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_lesson_blocks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_tutors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_partner_centers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_cohortes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_cohorte_tutors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_students_cache FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_tutor_students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_companies_cache FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Academy access for authenticated users" ON academy_partner_payments FOR ALL USING (auth.role() = 'authenticated');
