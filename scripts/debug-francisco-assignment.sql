-- Debug: Verificar asignación de Francisco
-- Fecha: 2025-10-23

-- 1. Ver datos de Francisco
SELECT id, name, email, role, center_id
FROM employees
WHERE email = 'franciscogiraldezmorales@gmail.com';

-- 2. Ver revisión de Sevilla
SELECT *
FROM quarterly_reviews
WHERE center_id = 9
ORDER BY id DESC
LIMIT 1;

-- 3. Ver asignaciones de Sevilla
SELECT *
FROM quarterly_inventory_assignments
WHERE center_id = 9;

-- 4. Ver si hay asignación para Francisco
SELECT 
  a.*,
  r.quarter,
  r.status as review_status,
  r.deadline_date
FROM quarterly_inventory_assignments a
JOIN quarterly_reviews r ON a.review_id = r.id
WHERE a.center_id = 9;

-- 5. Ver todas las asignaciones activas
SELECT 
  a.id,
  a.center_id,
  a.center_name,
  a.assigned_to,
  a.status as assignment_status,
  r.quarter,
  r.status as review_status
FROM quarterly_inventory_assignments a
JOIN quarterly_reviews r ON a.review_id = r.id
WHERE r.status = 'active';
