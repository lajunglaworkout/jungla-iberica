-- ============================================
-- BACKUP DEL MÓDULO DE REUNIONES
-- Generado: 15 de noviembre de 2025
-- ============================================

-- Este archivo contendrá el backup completo
-- Ejecutar en Supabase SQL Editor para hacer backup

-- NOTA: Para hacer el backup real, copia los resultados
-- de estas queries y guárdalos en un archivo seguro

-- ============================================
-- BACKUP DE REUNIONES
-- ============================================
SELECT 
  id,
  title,
  department,
  date,
  start_time,
  end_time,
  status,
  type,
  participants,
  summary,
  tipo_reunion,
  porcentaje_cumplimiento,
  tiene_cuellos_botella,
  numero_cuellos_botella,
  created_by,
  created_at,
  updated_at
FROM meetings
ORDER BY id;

-- ============================================
-- BACKUP DE TAREAS RELACIONADAS CON REUNIONES
-- ============================================
SELECT *
FROM tareas
WHERE reunion_titulo IS NOT NULL 
   AND reunion_titulo != ''
ORDER BY id;

-- ============================================
-- BACKUP DE MÉTRICAS
-- ============================================
SELECT *
FROM meeting_analytics
ORDER BY id;

-- ============================================
-- BACKUP DE CUELLOS DE BOTELLA
-- ============================================
SELECT *
FROM meeting_bottlenecks
ORDER BY id;

-- ============================================
-- BACKUP DE OBJETIVOS
-- ============================================
SELECT *
FROM meeting_objectives
ORDER BY id;

-- ============================================
-- CONTEO DE REGISTROS
-- ============================================
SELECT 'meetings' as tabla, COUNT(*) as total FROM meetings
UNION ALL
SELECT 'tareas_reunion' as tabla, COUNT(*) FROM tareas WHERE reunion_titulo IS NOT NULL AND reunion_titulo != ''
UNION ALL
SELECT 'meeting_analytics' as tabla, COUNT(*) FROM meeting_analytics
UNION ALL
SELECT 'meeting_bottlenecks' as tabla, COUNT(*) FROM meeting_bottlenecks
UNION ALL
SELECT 'meeting_objectives' as tabla, COUNT(*) FROM meeting_objectives;
