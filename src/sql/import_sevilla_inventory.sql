-- Importar inventario real de Sevilla con datos de Beni
-- Ejecutar DESPUÉS de create_real_inventory_table.sql

INSERT INTO inventory_items (center_id, codigo, nombre_item, categoria, cantidad_inicial, cantidad_actual, roturas, deterioradas, compradas, estado) VALUES 
-- MANCUERNAS
(9, 'MD001', 'Mancuerna 4KG', 'Mancuernas', 0, 0, 0, 0, 0, 'agotado'),
(9, 'MD002', 'Mancuerna 7KG', 'Mancuernas', 0, 6, 0, 0, 6, 'activo'),
(9, 'MD003', 'Mancuerna 5KG', 'Mancuernas', 30, 30, 0, 0, 0, 'activo'),
(9, 'MD004', 'Mancuerna 8KG', 'Mancuernas', 24, 24, 0, 1, 0, 'activo'),
(9, 'MD005', 'Mancuerna 10KG', 'Mancuernas', 34, 33, 1, 0, 0, 'activo'),
(9, 'MD006', 'Mancuerna 12,5KG', 'Mancuernas', 24, 24, 0, 0, 0, 'activo'),
(9, 'MD007', 'Mancuerna 15KG', 'Mancuernas', 16, 15, 1, 1, 0, 'activo'),
(9, 'MD008', 'Mancuerna 17,5KG', 'Mancuernas', 10, 10, 0, 0, 0, 'activo'),
(9, 'MD009', 'Mancuerna 20KG', 'Mancuernas', 18, 18, 0, 2, 0, 'activo'),
(9, 'MD010', 'Mancuerna 25KG', 'Mancuernas', 12, 18, 0, 9, 6, 'activo'),
(9, 'MD011', 'Mancuerna 30KG', 'Mancuernas', 10, 10, 0, 8, 0, 'activo'),
(9, 'MD012', 'Mancuerna 35KG', 'Mancuernas', 2, 2, 0, 0, 0, 'activo'),
(9, 'MD013', 'Mancuerna 40KG', 'Mancuernas', 2, 2, 0, 0, 0, 'activo'),

-- DISCOS
(9, 'MD014', 'Disco 1,25KG Funcional', 'Discos', 4, 4, 0, 0, 0, 'activo'),
(9, 'MD015', 'Disco 2,5KG Funcional', 'Discos', 1, 1, 0, 0, 0, 'activo'),
(9, 'MD016', 'Disco 5KG Funcional', 'Discos', 10, 10, 0, 0, 0, 'activo'),
(9, 'MD017', 'Disco Bumper 2,5 KG', 'Discos', 34, 34, 0, 0, 0, 'activo'),
(9, 'MD018', 'Disco Bumper 5 KG', 'Discos', 44, 44, 0, 0, 0, 'activo'),
(9, 'MD019', 'Disco Bumper 10KG', 'Discos', 44, 44, 0, 0, 0, 'activo'),
(9, 'MD020', 'Disco Bumper 20 KG', 'Discos', 12, 12, 0, 0, 0, 'activo'),

-- KETTLEBELLS
(9, 'MD021', 'Kettlebell 8KG', 'Kettlebells', 10, 10, 0, 0, 0, 'activo'),
(9, 'MD022', 'Kettlebell 10KG', 'Kettlebells', 6, 6, 0, 0, 0, 'activo'),
(9, 'MD023', 'Kettlebell 12KG', 'Kettlebells', 11, 11, 0, 0, 0, 'activo'),
(9, 'MD024', 'Kettlebell 16KG', 'Kettlebells', 11, 11, 0, 0, 0, 'activo'),
(9, 'MD025', 'Kettlebell 20KG', 'Kettlebells', 6, 6, 0, 0, 0, 'activo'),
(9, 'MD026', 'Kettlebell 24KG', 'Kettlebells', 4, 4, 0, 0, 0, 'activo'),
(9, 'MD027', 'Kettlebell 28KG', 'Kettlebells', 4, 4, 0, 0, 0, 'activo'),
(9, 'MD028', 'Kettlebell 32KG', 'Kettlebells', 0, 0, 0, 0, 0, 'agotado'),

-- GOMAS ELÁSTICAS
(9, 'MD029', 'Goma 1,2 CM', 'Gomas', 11, 14, 20, 0, 23, 'activo'),
(9, 'MD030', 'Goma 2,1 CM', 'Gomas', 14, 18, 21, 0, 25, 'activo'),
(9, 'MD031', 'Goma 3,15 CM', 'Gomas', 16, 10, 23, 0, 17, 'activo'),
(9, 'MD032', 'Goma 4,5 CM', 'Gomas', 8, 11, 4, 0, 7, 'activo'),
(9, 'MD034', 'Goma 6 CM', 'Gomas', 0, 0, 1, 0, 1, 'agotado'),
(9, 'MD035', 'Goma Glúteo Corta', 'Gomas', 4, 5, 0, 0, 1, 'activo'),
(9, 'MD036', 'Goma Glúteo Medio', 'Gomas', 4, 3, 2, 0, 1, 'activo'),
(9, 'MD037', 'Goma Glúteo Larga', 'Gomas', 4, 5, 0, 0, 1, 'activo'),
(9, 'MD038', 'Goma Glúteo Devil', 'Gomas', 0, 0, 0, 0, 0, 'agotado'),

-- SACOS Y PELOTAS
(9, 'MD039', 'Saco 10KG', 'Sacos', 0, 0, 0, 0, 0, 'agotado'),
(9, 'MD040', 'Saco 15KG', 'Sacos', 0, 0, 0, 0, 0, 'agotado'),
(9, 'MD041', 'Saco 25KG', 'Sacos', 5, 5, 0, 0, 0, 'activo'),
(9, 'MD042', 'Pelota 3KG', 'Pelotas', 0, 0, 0, 0, 0, 'agotado'),
(9, 'MD043', 'Pelota 5KG', 'Pelotas', 0, 0, 0, 0, 0, 'agotado'),
(9, 'MD044', 'Pelota 7KG', 'Pelotas', 6, 6, 0, 0, 0, 'activo'),
(9, 'MD045', 'Pelota 9KG', 'Pelotas', 6, 4, 2, 0, 0, 'activo'),
(9, 'MD046', 'Pelota 10 KG', 'Pelotas', 1, 1, 0, 0, 0, 'activo'),
(9, 'MD047', 'Pelota 12 KG', 'Pelotas', 0, 0, 0, 0, 0, 'agotado'),
(9, 'MD048', 'Pelota 15KG', 'Pelotas', 0, 0, 0, 0, 0, 'agotado'),

-- EQUIPAMIENTO FUNCIONAL
(9, 'MD049', 'Cinturón Lastre', 'Accesorios', 12, 12, 0, 0, 0, 'activo'),
(9, 'MD050', 'Barra Olímpica', 'Barras', 16, 16, 0, 0, 0, 'activo'),
(9, 'MD051', 'Protector', 'Accesorios', 11, 19, 0, 0, 8, 'activo'),
(9, 'MD052', 'Cierre Barra', 'Accesorios', 34, 34, 0, 0, 0, 'activo'),
(9, 'MD053', 'Step', 'Cardio', 15, 9, 7, 0, 0, 'activo'),
(9, 'MD054', 'Pies Step', 'Cardio', 82, 71, 1, 0, 0, 'activo'),
(9, 'MD055', 'Combas', 'Cardio', 3, 3, 0, 0, 0, 'activo'),
(9, 'MD056', 'Cinturon Ruso', 'Accesorios', 4, 4, 0, 0, 0, 'activo'),
(9, 'MD057', 'Paralelas', 'Funcional', 2, 2, 0, 0, 0, 'activo'),
(9, 'MD058', 'Paralelas Bajas (Pares)', 'Funcional', 7, 7, 0, 0, 0, 'activo'),
(9, 'MD059', 'Bosul', 'Funcional', 3, 2, 0, 0, 0, 'activo'),
(9, 'MD060', 'Vallas', 'Funcional', 8, 8, 0, 0, 0, 'activo'),
(9, 'MD061', 'Escaleras', 'Funcional', 2, 2, 2, 0, 2, 'activo'),
(9, 'MD062', 'TRX (Pares)', 'Funcional', 13, 12, 1, 0, 0, 'activo'),
(9, 'MD063', 'Anillas (Pares)', 'Funcional', 7, 7, 1, 0, 1, 'activo'),
(9, 'MD064', 'Esterillas', 'Accesorios', 53, 52, 1, 0, 0, 'activo'),
(9, 'MD065', 'Rodillos', 'Accesorios', 5, 4, 0, 0, 0, 'activo'),
(9, 'MD066', 'Barra Funcional', 'Barras', 2, 2, 0, 0, 0, 'activo'),
(9, 'MD067', 'Cuerda', 'Funcional', 2, 2, 2, 0, 2, 'activo'),
(9, 'MD068', 'Paralelas Antiguas (Pares)', 'Funcional', 4, 3, 1, 0, 0, 'activo'),
(9, 'MD069', 'Landmine', 'Funcional', 6, 6, 0, 0, 0, 'activo'),
(9, 'MD070', 'pelota pilates', 'Accesorios', 1, 1, 0, 0, 0, 'activo'),
(9, 'MD071', 'agarre ladmine', 'Accesorios', 0, 5, 0, 0, 5, 'activo'),
(9, 'MD072', 'rueda abdomen', 'Accesorios', 5, 5, 0, 0, 0, 'activo'),
(9, 'MD073', 'conos', 'Accesorios', 9, 9, 0, 0, 0, 'activo'),
(9, 'MD074', 'conos apositores', 'Accesorios', 0, 0, 0, 0, 0, 'agotado'),
(9, 'MD075', 'PICAS', 'Accesorios', 9, 9, 0, 0, 0, 'activo'),
(9, 'MD076', 'RACK', 'Funcional', 4, 7, 1, 0, 4, 'activo'),
(9, 'MD077', 'CAJON PIOMETRICO', 'Funcional', 0, 1, 0, 0, 1, 'activo');

-- Verificar la importación
SELECT 
    categoria,
    COUNT(*) as total_items,
    SUM(cantidad_actual) as total_cantidad,
    SUM(roturas) as total_roturas,
    SUM(deterioradas) as total_deterioradas,
    SUM(compradas) as total_compradas
FROM inventory_items 
WHERE center_id = 9
GROUP BY categoria
ORDER BY categoria;

-- Resumen general
SELECT 
    COUNT(*) as total_items_sevilla,
    SUM(cantidad_actual) as equipamiento_total,
    SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as items_activos,
    SUM(CASE WHEN estado = 'agotado' THEN 1 ELSE 0 END) as items_agotados
FROM inventory_items 
WHERE center_id = 9;
