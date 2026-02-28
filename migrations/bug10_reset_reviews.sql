-- SCRIPT DE RESETEO Y LIMPIEZA DE REVISIONES TRIMESTRALES
-- FECHA: 17/02/2026
-- USAR SOLO PARA REINICIAR EL SISTEMA ANTES DE COMENZAR EL TRABAJO REAL.

BEGIN;

-- 1. Eliminar items de revisión (Detalles de conteo)
DELETE FROM public.quarterly_review_items;

-- 2. Eliminar asignaciones (Vínculo Centro-Encargado-Revisión)
DELETE FROM public.quarterly_inventory_assignments;

-- 3. Eliminar revisiones (Cabeceras creadas por Beni)
DELETE FROM public.quarterly_reviews;

-- 4. Eliminar notificaciones relacionadas con revisiones
DELETE FROM public.notifications 
WHERE type::text LIKE 'review%';

-- 5. Eliminar movimientos de ajuste generados por pruebas de revisión
DELETE FROM public.inventory_movements 
WHERE reason LIKE 'Revisión%';

-- 6. Limpiar alertas antiguas si es necesario
DELETE FROM public.notifications 
WHERE type::text = 'alert_stock_critical';

-- 7. Eliminar pedidos autogenerados por las revisiones
DELETE FROM public.orders 
WHERE type = 'review_order' OR notes LIKE '%Pedido Post-Revisión%';

COMMIT;

-- Verificación final
SELECT count(*) as reviews_remaining FROM public.quarterly_reviews;
