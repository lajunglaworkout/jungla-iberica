-- ============================================
-- SCRIPT DE LIMPIEZA DE MÓDULO DE REUNIONES
-- ============================================
-- Este script elimina todas las reuniones, tareas relacionadas
-- y datos de prueba del módulo de reuniones
-- 
-- IMPORTANTE: Este script es irreversible
-- Hacer backup antes de ejecutar si hay datos que quieras conservar
-- ============================================

-- 1. Eliminar tareas relacionadas con reuniones
-- (Tareas que fueron generadas en reuniones)
DELETE FROM tareas 
WHERE reunion_titulo IS NOT NULL 
   AND reunion_titulo != '';

-- 2. Eliminar todas las reuniones
DELETE FROM meetings;

-- 3. Resetear secuencias (si usas serial/auto-increment)
-- ALTER SEQUENCE meetings_id_seq RESTART WITH 1;
-- ALTER SEQUENCE tareas_id_seq RESTART WITH 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Descomentar para verificar que todo está limpio:

-- SELECT COUNT(*) as total_reuniones FROM meetings;
-- SELECT COUNT(*) as total_tareas_reunion FROM tareas WHERE reunion_titulo IS NOT NULL AND reunion_titulo != '';

-- ============================================
-- RESULTADO ESPERADO: 0 en todos los conteos
-- ============================================
