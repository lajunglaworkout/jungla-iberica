-- ============================================
-- SCRIPT DE LIMPIEZA SELECTIVA DE REUNIONES
-- ============================================
-- Este script elimina SOLO reuniones de prueba
-- identificadas por palabras clave en el título
-- ============================================

-- 1. Eliminar tareas de reuniones de prueba
DELETE FROM tareas 
WHERE LOWER(reunion_titulo) LIKE '%prueba%'
   OR LOWER(reunion_titulo) LIKE '%test%'
   OR LOWER(reunion_titulo) LIKE '%nueva reunión%'
   OR LOWER(reunion_titulo) LIKE '%nueva reunion%';

-- 2. Eliminar las reuniones de prueba
DELETE FROM meetings 
WHERE LOWER(title) LIKE '%prueba%'
   OR LOWER(title) LIKE '%test%'
   OR LOWER(title) LIKE '%nueva reunión%'
   OR LOWER(title) LIKE '%nueva reunion%'
   OR LOWER(title) = 'nueva reunión';

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
WHERE reunion_titulo IS NOT NULL AND reunion_titulo != ''
ORDER BY created_at DESC;
