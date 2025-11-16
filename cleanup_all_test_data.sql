-- ============================================
-- LIMPIEZA COMPLETA DE DATOS DE PRUEBA
-- Fecha: 16 Noviembre 2025
-- ADVERTENCIA: Este script eliminará TODOS los datos
-- ============================================

-- INSTRUCCIONES:
-- 1. HACER BACKUP ANTES DE EJECUTAR (ya hecho en v1.2)
-- 2. Revisar cada sección antes de ejecutar
-- 3. Ejecutar en Supabase SQL Editor
-- 4. NO hay vuelta atrás después de ejecutar

-- ============================================
-- VERIFICACIÓN PREVIA - Contar registros
-- ============================================

SELECT 'CONTEO ANTES DE LIMPIAR' as info;

SELECT 'meetings' as tabla, COUNT(*) as total FROM meetings
UNION ALL
SELECT 'tareas' as tabla, COUNT(*) as total FROM tareas;

-- Descomentar si existen estas tablas:
-- UNION ALL
-- SELECT 'clientes' as tabla, COUNT(*) as total FROM clientes
-- UNION ALL
-- SELECT 'leads' as tabla, COUNT(*) as total FROM leads
-- UNION ALL
-- SELECT 'incidencias' as tabla, COUNT(*) as total FROM incidencias
-- UNION ALL
-- SELECT 'checklist' as tabla, COUNT(*) as total FROM checklist
-- UNION ALL
-- SELECT 'logistica_notificaciones' as tabla, COUNT(*) as total FROM logistica_notificaciones
-- UNION ALL
-- SELECT 'logistica_pedidos' as tabla, COUNT(*) as total FROM logistica_pedidos
-- UNION ALL
-- SELECT 'logistica_inventario' as tabla, COUNT(*) as total FROM logistica_inventario
-- UNION ALL
-- SELECT 'contabilidad_pagos' as tabla, COUNT(*) as total FROM contabilidad_pagos
-- UNION ALL
-- SELECT 'contabilidad_transferencias' as tabla, COUNT(*) as total FROM contabilidad_transferencias;

-- ============================================
-- 1. LIMPIAR REUNIONES Y TAREAS
-- ============================================

SELECT 'LIMPIANDO: Reuniones y Tareas' as info;

-- Eliminar todas las tareas (incluye tareas de reuniones)
DELETE FROM tareas;

-- Eliminar todas las reuniones
DELETE FROM meetings;

-- Verificar
SELECT 'meetings' as tabla, COUNT(*) as restantes FROM meetings
UNION ALL
SELECT 'tareas' as tabla, COUNT(*) as restantes FROM tareas;

-- ============================================
-- 2. LIMPIAR CLIENTES Y LEADS (si existen)
-- ============================================

-- DESCOMENTAR SI EXISTEN ESTAS TABLAS:

-- SELECT 'LIMPIANDO: Clientes y Leads' as info;

-- Eliminar todos los leads
-- DELETE FROM leads;

-- Eliminar todos los clientes de prueba
-- DELETE FROM clientes;

-- Verificar
-- SELECT 'clientes' as tabla, COUNT(*) as restantes FROM clientes
-- UNION ALL
-- SELECT 'leads' as tabla, COUNT(*) as restantes FROM leads;

-- ============================================
-- 3. LIMPIAR INCIDENCIAS Y CHECKLIST (si existen)
-- ============================================

-- DESCOMENTAR SI EXISTEN ESTAS TABLAS:

-- SELECT 'LIMPIANDO: Incidencias y Checklist' as info;

-- Eliminar todas las incidencias
-- DELETE FROM incidencias;

-- Eliminar todos los checklist
-- DELETE FROM checklist;

-- Verificar
-- SELECT 'incidencias' as tabla, COUNT(*) as restantes FROM incidencias
-- UNION ALL
-- SELECT 'checklist' as tabla, COUNT(*) as restantes FROM checklist;

-- ============================================
-- 4. LIMPIAR LOGÍSTICA (si existe)
-- ============================================

-- DESCOMENTAR SI EXISTEN ESTAS TABLAS:

-- SELECT 'LIMPIANDO: Logística' as info;

-- Eliminar notificaciones críticas
-- DELETE FROM logistica_notificaciones;

-- Eliminar pedidos de prueba
-- DELETE FROM logistica_pedidos;

-- ⚠️ IMPORTANTE: Mantener productos pero resetear cantidades
-- Esto NO elimina los productos, solo pone las cantidades en 0
-- UPDATE logistica_inventario SET cantidad = 0, stock_minimo = 0;

-- ❌ NO USAR: Esto eliminaría los productos completamente
-- DELETE FROM logistica_inventario;

-- Verificar
-- SELECT 'logistica_notificaciones' as tabla, COUNT(*) as restantes FROM logistica_notificaciones
-- UNION ALL
-- SELECT 'logistica_pedidos' as tabla, COUNT(*) as restantes FROM logistica_pedidos
-- UNION ALL
-- SELECT 'logistica_inventario (productos)' as tabla, COUNT(*) as total_productos FROM logistica_inventario;

-- ============================================
-- 5. LIMPIAR CONTABILIDAD (si existe)
-- ============================================

-- DESCOMENTAR SI EXISTEN ESTAS TABLAS:

-- SELECT 'LIMPIANDO: Contabilidad' as info;

-- Eliminar pagos de prueba
-- DELETE FROM contabilidad_pagos;

-- Eliminar transferencias de prueba
-- DELETE FROM contabilidad_transferencias;

-- Eliminar gastos extra de prueba (si existe la tabla)
-- DELETE FROM contabilidad_gastos_extra;

-- Verificar
-- SELECT 'contabilidad_pagos' as tabla, COUNT(*) as restantes FROM contabilidad_pagos
-- UNION ALL
-- SELECT 'contabilidad_transferencias' as tabla, COUNT(*) as restantes FROM contabilidad_transferencias;

-- ============================================
-- 6. LIMPIAR RRHH (si existe)
-- ============================================

-- DESCOMENTAR SI EXISTEN ESTAS TABLAS:

-- SELECT 'LIMPIANDO: RRHH' as info;

-- Eliminar incidencias de personal de prueba
-- DELETE FROM rrhh_incidencias_personal;

-- Eliminar propuestas/sanciones de prueba
-- DELETE FROM rrhh_propuestas_sanciones;

-- Verificar
-- SELECT 'rrhh_incidencias_personal' as tabla, COUNT(*) as restantes FROM rrhh_incidencias_personal
-- UNION ALL
-- SELECT 'rrhh_propuestas_sanciones' as tabla, COUNT(*) as restantes FROM rrhh_propuestas_sanciones;

-- ============================================
-- 7. LIMPIAR MANTENIMIENTO (si existe)
-- ============================================

-- DESCOMENTAR SI EXISTEN ESTAS TABLAS:

-- SELECT 'LIMPIANDO: Mantenimiento' as info;

-- Eliminar incidencias de mantenimiento de prueba
-- DELETE FROM mantenimiento_incidencias;

-- Eliminar reparaciones de prueba
-- DELETE FROM mantenimiento_reparaciones;

-- Eliminar costes de prueba
-- DELETE FROM mantenimiento_costes;

-- Verificar
-- SELECT 'mantenimiento_incidencias' as tabla, COUNT(*) as restantes FROM mantenimiento_incidencias
-- UNION ALL
-- SELECT 'mantenimiento_reparaciones' as tabla, COUNT(*) as restantes FROM mantenimiento_reparaciones
-- UNION ALL
-- SELECT 'mantenimiento_costes' as tabla, COUNT(*) as restantes FROM mantenimiento_costes;

-- ============================================
-- 8. LIMPIAR OPERACIONES (si existe)
-- ============================================

-- DESCOMENTAR SI EXISTEN ESTAS TABLAS:

-- SELECT 'LIMPIANDO: Operaciones' as info;

-- Eliminar eventos de prueba
-- DELETE FROM operaciones_eventos;

-- Eliminar actividades de prueba
-- DELETE FROM operaciones_actividades;

-- Eliminar sugerencias de prueba
-- DELETE FROM operaciones_sugerencias;

-- Eliminar comunicados de prueba
-- DELETE FROM operaciones_comunicados_franquiciados;

-- Verificar
-- SELECT 'operaciones_eventos' as tabla, COUNT(*) as restantes FROM operaciones_eventos
-- UNION ALL
-- SELECT 'operaciones_actividades' as tabla, COUNT(*) as restantes FROM operaciones_actividades
-- UNION ALL
-- SELECT 'operaciones_sugerencias' as tabla, COUNT(*) as restantes FROM operaciones_sugerencias
-- UNION ALL
-- SELECT 'operaciones_comunicados_franquiciados' as tabla, COUNT(*) as restantes FROM operaciones_comunicados_franquiciados;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 'LIMPIEZA COMPLETADA' as resultado;
SELECT NOW() as fecha_limpieza;

-- Conteo final
SELECT 'CONTEO DESPUÉS DE LIMPIAR' as info;

SELECT 'meetings' as tabla, COUNT(*) as total FROM meetings
UNION ALL
SELECT 'tareas' as tabla, COUNT(*) as total FROM tareas;

-- Descomentar según las tablas que hayas limpiado:
-- UNION ALL
-- SELECT 'clientes' as tabla, COUNT(*) as total FROM clientes
-- UNION ALL
-- SELECT 'leads' as tabla, COUNT(*) as total FROM leads
-- UNION ALL
-- SELECT 'incidencias' as tabla, COUNT(*) as total FROM incidencias
-- UNION ALL
-- SELECT 'checklist' as tabla, COUNT(*) as total FROM checklist
-- UNION ALL
-- SELECT 'logistica_notificaciones' as tabla, COUNT(*) as total FROM logistica_notificaciones
-- UNION ALL
-- SELECT 'contabilidad_pagos' as tabla, COUNT(*) as total FROM contabilidad_pagos;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- 1. Este script elimina TODOS los datos de prueba
-- 2. NO afecta la estructura de las tablas (columnas, índices, etc.)
-- 3. Los IDs auto-incrementales continuarán desde donde estaban
-- 4. Si quieres resetear los IDs, necesitas ejecutar:
--    ALTER SEQUENCE nombre_tabla_id_seq RESTART WITH 1;
-- 5. Asegúrate de tener el backup v1.2 antes de ejecutar

SELECT '✅ Sistema limpio y listo para datos reales' as estado;
