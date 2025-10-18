-- Crear el centro 'Central' en la tabla centers
-- Este será el almacén principal donde se guarda el vestuario

-- Primero, verificar qué columnas tiene la tabla centers
SELECT column_name FROM information_schema.columns WHERE table_name = 'centers';

-- Insertar solo con las columnas básicas que seguramente existen
INSERT INTO centers (id, name)
VALUES (1, 'Central - Almacén Principal')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Verificar que se creó correctamente
SELECT * FROM centers WHERE id = 1;

-- Comentario explicativo
COMMENT ON TABLE centers IS 'Centros de La Jungla: 1=Central (almacén), 9=Sevilla, 10=Jerez, 11=Puerto';
