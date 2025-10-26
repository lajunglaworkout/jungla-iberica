-- Ver estructura completa de la tabla centers
SELECT * FROM information_schema.columns WHERE table_name = 'centers';

-- Ver todos los datos de centers
SELECT * FROM centers;

-- Ver qué tablas existen que contengan "center"
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%center%';
