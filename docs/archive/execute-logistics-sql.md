# Ejecutar Base de Datos de Logística en Supabase

## Pasos para configurar la base de datos:

### 1. Acceder a Supabase Dashboard
- Ve a [supabase.com](https://supabase.com)
- Accede a tu proyecto de La Jungla

### 2. Abrir SQL Editor
- En el panel izquierdo, click en "SQL Editor"
- Click en "New query"

### 3. Copiar y ejecutar el SQL
- Abre el archivo `database-logistics.sql` en tu editor
- Copia TODO el contenido (390 líneas)
- Pégalo en el SQL Editor de Supabase
- Click en "Run" (botón verde)

### 4. Verificar tablas creadas
Ejecuta esta consulta para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'product_categories',
  'suppliers', 
  'inventory_items',
  'supplier_orders',
  'supplier_order_items',
  'inventory_movements',
  'stock_alerts'
);
```

### 5. Verificar datos iniciales
```sql
-- Verificar categorías
SELECT * FROM product_categories;

-- Verificar proveedores
SELECT * FROM suppliers;

-- Verificar inventario
SELECT * FROM inventory_items;
```

## Tablas que se crearán:

✅ **product_categories** - Categorías de productos
✅ **suppliers** - Proveedores con datos completos
✅ **inventory_items** - Inventario con precios y stock
✅ **supplier_orders** - Pedidos a proveedores
✅ **supplier_order_items** - Items de pedidos
✅ **inventory_movements** - Movimientos de stock
✅ **stock_alerts** - Alertas automáticas

## Datos iniciales incluidos:

- 6 categorías de productos
- 4 proveedores de ejemplo
- 8 productos de inventario inicial
- Triggers automáticos para stock y alertas
- Vistas optimizadas para consultas

## Siguiente paso:

Una vez ejecutado el SQL, el sistema React podrá conectarse a la base de datos real en lugar de usar datos mock.

## Troubleshooting:

Si hay errores:
1. Verificar que las variables de entorno estén configuradas
2. Comprobar permisos de RLS si están activados
3. Ejecutar las secciones del SQL por partes si falla completo
