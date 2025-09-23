-- Verificar la importación del inventario de Sevilla
-- Ejecutar DESPUÉS de import_sevilla_inventory.sql

-- 1. Resumen por categorías
SELECT 
    '📊 RESUMEN POR CATEGORÍAS' as seccion;

SELECT 
    categoria,
    COUNT(*) as total_items,
    SUM(cantidad_inicial) as inicial_total,
    SUM(cantidad_actual) as actual_total,
    SUM(roturas) as roturas_total,
    SUM(deterioradas) as deterioradas_total,
    SUM(compradas) as compradas_total,
    ROUND(AVG(cantidad_actual::decimal), 1) as promedio_por_item
FROM inventory_items 
WHERE center_id = 9
GROUP BY categoria
ORDER BY actual_total DESC;

-- 2. Items con más roturas/deterioro
SELECT 
    '🔧 ITEMS CON MÁS PROBLEMAS' as seccion;

SELECT 
    codigo,
    nombre_item,
    categoria,
    cantidad_actual,
    roturas,
    deterioradas,
    (roturas + deterioradas) as problemas_total
FROM inventory_items 
WHERE center_id = 9 
AND (roturas > 0 OR deterioradas > 0)
ORDER BY (roturas + deterioradas) DESC
LIMIT 10;

-- 3. Items agotados que necesitan reposición
SELECT 
    '⚠️ ITEMS AGOTADOS' as seccion;

SELECT 
    codigo,
    nombre_item,
    categoria,
    cantidad_inicial,
    roturas,
    deterioradas
FROM inventory_items 
WHERE center_id = 9 
AND cantidad_actual = 0
ORDER BY categoria, nombre_item;

-- 4. Items más comprados (reposiciones frecuentes)
SELECT 
    '🛒 ITEMS MÁS COMPRADOS' as seccion;

SELECT 
    codigo,
    nombre_item,
    categoria,
    cantidad_inicial,
    cantidad_actual,
    compradas,
    CASE 
        WHEN cantidad_inicial > 0 THEN ROUND((compradas::decimal / cantidad_inicial) * 100, 1)
        ELSE 0
    END as porcentaje_reposicion
FROM inventory_items 
WHERE center_id = 9 
AND compradas > 0
ORDER BY compradas DESC;

-- 5. Resumen general final
SELECT 
    '📈 RESUMEN GENERAL SEVILLA' as seccion;

SELECT 
    COUNT(*) as total_items_catalogados,
    SUM(cantidad_inicial) as equipamiento_inicial,
    SUM(cantidad_actual) as equipamiento_actual,
    SUM(roturas) as total_roturas,
    SUM(deterioradas) as total_deterioradas,
    SUM(compradas) as total_compradas,
    SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as items_activos,
    SUM(CASE WHEN estado = 'agotado' THEN 1 ELSE 0 END) as items_agotados,
    ROUND(
        (SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 
        1
    ) as porcentaje_disponibilidad
FROM inventory_items 
WHERE center_id = 9;

-- 6. Estado de las gomas (las que más se rompen)
SELECT 
    '🔴 ESTADO GOMAS ELÁSTICAS' as seccion;

SELECT 
    codigo,
    nombre_item,
    cantidad_inicial,
    cantidad_actual,
    roturas,
    compradas,
    CASE 
        WHEN cantidad_inicial > 0 THEN ROUND((roturas::decimal / (cantidad_inicial + compradas)) * 100, 1)
        ELSE 0
    END as tasa_rotura_porcentaje
FROM inventory_items 
WHERE center_id = 9 
AND categoria = 'Gomas'
ORDER BY roturas DESC;
