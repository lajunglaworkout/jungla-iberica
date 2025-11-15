-- ============================================
-- SCRIPT DE LIMPIEZA SELECTIVA DE REUNIONES
-- ============================================
-- Este script elimina SOLO reuniones de prueba
-- identificadas por palabras clave en el título
-- ============================================

-- Lista de IDs de reuniones de prueba a eliminar
WITH reuniones_prueba AS (
  SELECT id FROM meetings 
  WHERE LOWER(title) LIKE '%prueba%'
     OR LOWER(title) LIKE '%test%'
     OR LOWER(title) LIKE '%nueva reunión%'
     OR LOWER(title) LIKE '%nueva reunion%'
     OR LOWER(title) = 'nueva reunión'
)

-- 1. Eliminar métricas de reuniones de prueba
DELETE FROM meeting_analytics 
WHERE meeting_id IN (SELECT id FROM reuniones_prueba);

-- 2. Eliminar cuellos de botella de reuniones de prueba
DELETE FROM meeting_bottlenecks 
WHERE meeting_id IN (SELECT id FROM reuniones_prueba);

-- 3. Eliminar objetivos de reuniones de prueba
DELETE FROM meeting_objectives 
WHERE meeting_id IN (SELECT id FROM reuniones_prueba);

-- 4. Eliminar tareas de reuniones de prueba
DELETE FROM tareas 
WHERE reunion_id IN (SELECT id FROM reuniones_prueba)
   OR LOWER(reunion_titulo) LIKE '%prueba%'
   OR LOWER(reunion_titulo) LIKE '%test%'
   OR LOWER(reunion_titulo) LIKE '%nueva reunión%';

-- 5. Eliminar las reuniones de prueba
DELETE FROM meetings 
WHERE id IN (SELECT id FROM reuniones_prueba);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ver reuniones que quedan:
SELECT id, title, date, department, status 
FROM meetings 
ORDER BY date DESC;

-- Ver tareas que quedan:
SELECT id, titulo, reunion_titulo, asignado_a, estado
FROM tareas 
WHERE reunion_id IS NOT NULL
ORDER BY fecha_creacion DESC;
