-- Verificar centros existentes
SELECT id, name FROM centers ORDER BY id;

-- Añadir centro para documentos de la marca corporativa (si no existe)
INSERT INTO centers (name, address, phone, email, capacity, opening_time, closing_time)
VALUES (
  'La Jungla - Marca Corporativa',
  'Oficinas Centrales',
  '',
  'info@lajungla.com',
  0,
  '00:00',
  '23:59'
)
ON CONFLICT DO NOTHING;

-- Verificar que se creó
SELECT id, name FROM centers WHERE name LIKE '%Marca%' OR name LIKE '%Corporativa%';
