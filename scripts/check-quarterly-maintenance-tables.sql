-- =====================================================
-- VERIFICAR TABLAS DE REVISIONES TRIMESTRALES DE MANTENIMIENTO
-- =====================================================

-- 1. Ver estructura de todas las tablas de mantenimiento
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN (
  'quarterly_maintenance_reviews',
  'quarterly_maintenance_assignments',
  'quarterly_maintenance_items',
  'maintenance_review_notifications'
)
ORDER BY table_name, ordinal_position;

-- 2. Contar registros en quarterly_maintenance_reviews
SELECT COUNT(*) as total_reviews FROM quarterly_maintenance_reviews;

-- 3. Contar registros en quarterly_maintenance_assignments
SELECT COUNT(*) as total_assignments FROM quarterly_maintenance_assignments;

-- 4. Contar registros en quarterly_maintenance_items
SELECT COUNT(*) as total_items FROM quarterly_maintenance_items;

-- 5. Contar registros en maintenance_review_notifications
SELECT COUNT(*) as total_notifications FROM maintenance_review_notifications;

-- 6. Ver últimas revisiones de mantenimiento
SELECT *
FROM quarterly_maintenance_reviews
LIMIT 5;

-- 7. Ver asignaciones activas
SELECT *
FROM quarterly_maintenance_assignments
LIMIT 5;

-- 8. Ver items de mantenimiento
SELECT *
FROM quarterly_maintenance_items
LIMIT 5;

-- 9. Ver notificaciones
SELECT *
FROM maintenance_review_notifications
LIMIT 5;
