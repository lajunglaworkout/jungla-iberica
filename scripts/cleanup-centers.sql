-- Eliminar el centro duplicado de Marca Corporativa
DELETE FROM centers WHERE name = 'La Jungla - Marca Corporativa';

-- Verificar que solo quedan los centros correctos
SELECT id, name, city FROM centers ORDER BY id;

-- Resultado esperado:
-- 9  | Sevilla                     | Sevilla
-- 10 | Jerez                       | Jerez de la Frontera
-- 11 | Puerto                      | El Puerto de Santa María
-- 1  | Central - Almacén Principal | null
