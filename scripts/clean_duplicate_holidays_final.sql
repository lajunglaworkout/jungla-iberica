-- Script definitivo para limpiar festivos duplicados
-- EJECUTAR EN SUPABASE SQL EDITOR

-- Paso 1: Ver cuántos festivos hay actualmente
SELECT COUNT(*) as total_festivos FROM holidays;

-- Paso 2: Ver duplicados agrupados
SELECT name, date, type, COUNT(*) as duplicados
FROM holidays
GROUP BY name, date, type
HAVING COUNT(*) > 1
ORDER BY date;

-- Paso 3: ELIMINAR TODOS los festivos existentes (empezar limpio)
DELETE FROM holidays;

-- Paso 4: Insertar festivos únicos de 2025
-- FESTIVOS NACIONALES
INSERT INTO holidays (name, date, type, center_id, is_active) VALUES
  ('Año Nuevo', '2025-01-01', 'national', NULL, true),
  ('Reyes Magos', '2025-01-06', 'national', NULL, true),
  ('Viernes Santo', '2025-04-18', 'national', NULL, true),
  ('Día del Trabajo', '2025-05-01', 'national', NULL, true),
  ('Asunción de la Virgen', '2025-08-15', 'national', NULL, true),
  ('Fiesta Nacional de España', '2025-10-12', 'national', NULL, true),
  ('Todos los Santos', '2025-11-01', 'national', NULL, true),
  ('Día de la Constitución', '2025-12-06', 'national', NULL, true),
  ('Inmaculada Concepción', '2025-12-08', 'national', NULL, true),
  ('Navidad', '2025-12-25', 'national', NULL, true);

-- FESTIVOS REGIONALES ANDALUCÍA
INSERT INTO holidays (name, date, type, center_id, is_active) VALUES
  ('Día de Andalucía', '2025-02-28', 'regional', NULL, true),
  ('Jueves Santo', '2025-04-17', 'regional', NULL, true);

-- Paso 5: Verificar resultado final
SELECT id, name, date, type, center_id
FROM holidays
ORDER BY date;

-- Paso 6: Contar festivos finales
SELECT 
  type,
  COUNT(*) as cantidad
FROM holidays
GROUP BY type
ORDER BY type;
