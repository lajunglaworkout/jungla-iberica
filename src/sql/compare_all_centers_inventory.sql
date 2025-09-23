-- Análisis comparativo de inventario entre los 3 gimnasios
-- Ejecutar DESPUÉS de importar Sevilla, Jerez y Puerto

-- 1. Resumen general por centro
SELECT 
    '📊 RESUMEN GENERAL POR CENTRO' as seccion;

SELECT 
    CASE 
        WHEN center_id = 9 THEN 'Sevilla'
        WHEN center_id = 10 THEN 'Jerez'
        WHEN center_id = 11 THEN 'Puerto'
    END as gimnasio,
    COUNT(*) as total_items,
    SUM(cantidad_inicial) as equipamiento_inicial,
    SUM(cantidad_actual) as equipamiento_actual,
    SUM(roturas) as total_roturas,
    SUM(deterioradas) as total_deterioradas,
    SUM(compradas) as total_compradas,
    ROUND(
        (SUM(roturas)::decimal / NULLIF(SUM(cantidad_inicial + compradas), 0)) * 100, 
        2
    ) as tasa_rotura_porcentaje
FROM inventory_items 
WHERE center_id IN (9, 10, 11)
GROUP BY center_id
ORDER BY center_id;

-- 2. Comparativa de gomas elásticas (el problema más crítico)
SELECT 
    '🔴 ANÁLISIS CRÍTICO: GOMAS ELÁSTICAS' as seccion;

SELECT 
    CASE 
        WHEN center_id = 9 THEN 'Sevilla'
        WHEN center_id = 10 THEN 'Jerez'
        WHEN center_id = 11 THEN 'Puerto'
    END as gimnasio,
    nombre_item,
    cantidad_inicial,
    cantidad_actual,
    roturas,
    compradas,
    CASE 
        WHEN (cantidad_inicial + compradas) > 0 THEN 
            ROUND((roturas::decimal / (cantidad_inicial + compradas)) * 100, 1)
        ELSE 0
    END as tasa_rotura_porcentaje
FROM inventory_items 
WHERE categoria = 'Gomas' 
AND center_id IN (9, 10, 11)
AND roturas > 0
ORDER BY 
    nombre_item, 
    center_id;

-- 3. Items más problemáticos por centro
SELECT 
    '⚠️ TOP 5 ITEMS MÁS PROBLEMÁTICOS POR CENTRO' as seccion;

WITH problemas_por_centro AS (
    SELECT 
        center_id,
        CASE 
            WHEN center_id = 9 THEN 'Sevilla'
            WHEN center_id = 10 THEN 'Jerez'
            WHEN center_id = 11 THEN 'Puerto'
        END as gimnasio,
        codigo,
        nombre_item,
        categoria,
        roturas + deterioradas as problemas_total,
        cantidad_actual,
        ROW_NUMBER() OVER (PARTITION BY center_id ORDER BY (roturas + deterioradas) DESC) as ranking
    FROM inventory_items 
    WHERE center_id IN (9, 10, 11)
    AND (roturas > 0 OR deterioradas > 0)
)
SELECT 
    gimnasio,
    ranking,
    codigo,
    nombre_item,
    categoria,
    problemas_total,
    cantidad_actual
FROM problemas_por_centro
WHERE ranking <= 5
ORDER BY center_id, ranking;

-- 4. Comparativa de compras por categoría
SELECT 
    '🛒 COMPRAS POR CATEGORÍA Y CENTRO' as seccion;

SELECT 
    categoria,
    SUM(CASE WHEN center_id = 9 THEN compradas ELSE 0 END) as sevilla_compradas,
    SUM(CASE WHEN center_id = 10 THEN compradas ELSE 0 END) as jerez_compradas,
    SUM(CASE WHEN center_id = 11 THEN compradas ELSE 0 END) as puerto_compradas,
    SUM(compradas) as total_compradas
FROM inventory_items 
WHERE center_id IN (9, 10, 11)
GROUP BY categoria
HAVING SUM(compradas) > 0
ORDER BY total_compradas DESC;

-- 5. Items que necesitan estandarización (diferentes cantidades entre centros)
SELECT 
    '📋 ITEMS PARA ESTANDARIZAR' as seccion;

WITH comparativa_items AS (
    SELECT 
        nombre_item,
        categoria,
        MAX(cantidad_actual) as max_cantidad,
        MIN(cantidad_actual) as min_cantidad,
        AVG(cantidad_actual::decimal) as promedio_cantidad,
        COUNT(*) as centros_con_item
    FROM inventory_items 
    WHERE center_id IN (9, 10, 11)
    AND cantidad_actual > 0
    GROUP BY nombre_item, categoria
    HAVING COUNT(*) = 3  -- Solo items que están en los 3 centros
)
SELECT 
    nombre_item,
    categoria,
    min_cantidad,
    max_cantidad,
    ROUND(promedio_cantidad, 1) as promedio,
    (max_cantidad - min_cantidad) as diferencia
FROM comparativa_items
WHERE (max_cantidad - min_cantidad) > 5  -- Diferencia significativa
ORDER BY diferencia DESC;

-- 6. Resumen ejecutivo final
SELECT 
    '📈 RESUMEN EJECUTIVO' as seccion;

SELECT 
    'TOTAL GENERAL' as concepto,
    COUNT(*) as items_catalogados,
    SUM(cantidad_actual) as equipamiento_total,
    SUM(roturas) as roturas_totales,
    SUM(compradas) as compras_totales,
    ROUND(
        (SUM(roturas)::decimal / NULLIF(SUM(cantidad_inicial + compradas), 0)) * 100, 
        2
    ) as tasa_rotura_general
FROM inventory_items 
WHERE center_id IN (9, 10, 11);

-- 7. Recomendaciones automáticas
SELECT 
    '💡 RECOMENDACIONES AUTOMÁTICAS' as seccion;

SELECT 
    'GOMAS ELÁSTICAS' as categoria_critica,
    'Cambiar proveedor - Tasa de rotura >50%' as recomendacion,
    COUNT(*) as items_afectados
FROM inventory_items 
WHERE categoria = 'Gomas' 
AND center_id IN (9, 10, 11)
AND (roturas::decimal / NULLIF(cantidad_inicial + compradas, 0)) > 0.5

UNION ALL

SELECT 
    'CIERRE BARRA' as categoria_critica,
    'Revisar calidad - Muchas roturas en todos los centros' as recomendacion,
    SUM(roturas) as items_afectados
FROM inventory_items 
WHERE nombre_item LIKE '%Cierre%'
AND center_id IN (9, 10, 11);
