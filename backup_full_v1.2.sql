-- ============================================
-- BACKUP COMPLETO v1.2 - JUNGLA IBERICA
-- Fecha: 16 Noviembre 2025
-- Checkpoint: Modulo de reuniones configurado
-- ============================================

-- INSTRUCCIONES:
-- Este script realiza un backup completo de todas las tablas
-- Para ejecutar en Supabase SQL Editor

-- ============================================
-- 1. BACKUP DE REUNIONES
-- ============================================

-- Tabla: meetings
SELECT 'BACKUP: meetings' as info;
SELECT COUNT(*) as total_meetings FROM meetings;
SELECT * FROM meetings ORDER BY created_at DESC;

-- Tabla: tareas relacionadas con reuniones
SELECT 'BACKUP: tareas (reuniones)' as info;
SELECT COUNT(*) as total_tareas_reuniones 
FROM tareas 
WHERE reunion_titulo IS NOT NULL AND reunion_titulo != '';

SELECT * FROM tareas 
WHERE reunion_titulo IS NOT NULL AND reunion_titulo != ''
ORDER BY created_at DESC;

-- ============================================
-- 2. BACKUP DE CLIENTES
-- ============================================

SELECT 'BACKUP: clientes' as info;
SELECT COUNT(*) as total_clientes FROM clientes;
SELECT * FROM clientes ORDER BY fecha_registro DESC;

-- ============================================
-- 3. BACKUP DE LEADS
-- ============================================

SELECT 'BACKUP: leads' as info;
SELECT COUNT(*) as total_leads FROM leads;
SELECT * FROM leads ORDER BY fecha_creacion DESC;

-- ============================================
-- 4. BACKUP DE TAREAS GENERALES
-- ============================================

SELECT 'BACKUP: tareas (generales)' as info;
SELECT COUNT(*) as total_tareas_generales 
FROM tareas 
WHERE reunion_titulo IS NULL OR reunion_titulo = '';

SELECT * FROM tareas 
WHERE reunion_titulo IS NULL OR reunion_titulo = ''
ORDER BY created_at DESC;

-- ============================================
-- 5. BACKUP DE INCIDENCIAS
-- ============================================

SELECT 'BACKUP: incidencias' as info;
SELECT COUNT(*) as total_incidencias FROM incidencias;
SELECT * FROM incidencias ORDER BY fecha_creacion DESC;

-- ============================================
-- 6. BACKUP DE CHECKLIST
-- ============================================

SELECT 'BACKUP: checklist' as info;
SELECT COUNT(*) as total_checklist FROM checklist;
SELECT * FROM checklist ORDER BY fecha_creacion DESC;

-- ============================================
-- 7. BACKUP DE LOGISTICA (si existe)
-- ============================================

-- Descomentar si las tablas existen
-- SELECT 'BACKUP: logistica' as info;
-- SELECT * FROM logistica_pedidos ORDER BY fecha_creacion DESC;
-- SELECT * FROM logistica_inventario ORDER BY fecha_actualizacion DESC;

-- ============================================
-- 8. BACKUP DE CONTABILIDAD (si existe)
-- ============================================

-- Descomentar si las tablas existen
-- SELECT 'BACKUP: contabilidad' as info;
-- SELECT * FROM contabilidad_pagos ORDER BY fecha DESC;
-- SELECT * FROM contabilidad_transferencias ORDER BY fecha DESC;

-- ============================================
-- 9. ESTADISTICAS GENERALES
-- ============================================

SELECT 'ESTADISTICAS GENERALES' as info;

SELECT 
  'Reuniones' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completadas,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as programadas
FROM meetings

UNION ALL

SELECT 
  'Clientes' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
  COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as inactivos
FROM clientes

UNION ALL

SELECT 
  'Leads' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN estado = 'nuevo' THEN 1 END) as nuevos,
  COUNT(CASE WHEN estado = 'contactado' THEN 1 END) as contactados
FROM leads

UNION ALL

SELECT 
  'Tareas' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN completada = true THEN 1 END) as completadas,
  COUNT(CASE WHEN completada = false THEN 1 END) as pendientes
FROM tareas

UNION ALL

SELECT 
  'Incidencias' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN estado = 'abierta' THEN 1 END) as abiertas,
  COUNT(CASE WHEN estado = 'cerrada' THEN 1 END) as cerradas
FROM incidencias;

-- ============================================
-- FIN DEL BACKUP
-- ============================================

SELECT 'BACKUP COMPLETADO v1.2' as resultado;
SELECT NOW() as fecha_backup;
