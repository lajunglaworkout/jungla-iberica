// Script para verificar la estructura de la tabla inventory_items en Supabase
import { supabase } from '../src/lib/supabase';

async function checkInventorySchema() {
  console.log('🔍 Verificando estructura de la tabla inventory_items...\n');

  try {
    // 1. Obtener un item de ejemplo para ver las columnas
    const { data: sampleItem, error: sampleError } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Error obteniendo item de ejemplo:', sampleError);
    } else if (sampleItem) {
      console.log('✅ Item de ejemplo obtenido:');
      console.log(JSON.stringify(sampleItem, null, 2));
      console.log('\n📋 Columnas disponibles:');
      Object.keys(sampleItem).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleItem[key]} = ${sampleItem[key]}`);
      });
    }

    // 2. Intentar obtener todos los items para ver la estructura completa
    const { data: allItems, error: allError } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(5);

    if (allError) {
      console.error('\n❌ Error obteniendo items:', allError);
    } else if (allItems && allItems.length > 0) {
      console.log(`\n✅ Se encontraron ${allItems.length} items`);
      console.log('\n📊 Primeros 5 items:');
      allItems.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.nombre_item || item.name || 'Sin nombre'}`);
        console.log(`   Columnas: ${Object.keys(item).join(', ')}`);
      });
    }

    // 3. Verificar columnas específicas que usamos
    console.log('\n🔍 Verificando columnas específicas que intentamos usar:');
    const columnsToCheck = [
      'id',
      'nombre_item',
      'name',
      'categoria',
      'category',
      'talla',
      'size',
      'cantidad_actual',
      'quantity',
      'min_stock',
      'max_stock',
      'precio_compra',
      'cost_per_unit',
      'precio_venta',
      'selling_price',
      'proveedor',
      'supplier',
      'center_id',
      'ubicacion',
      'location',
      'updated_at',
      'created_at'
    ];

    if (sampleItem) {
      const availableColumns = Object.keys(sampleItem);
      columnsToCheck.forEach(col => {
        const exists = availableColumns.includes(col);
        console.log(`  ${exists ? '✅' : '❌'} ${col}`);
      });
    }

    // 4. Generar script SQL para crear las columnas faltantes
    console.log('\n📝 Script SQL sugerido para añadir columnas faltantes:');
    console.log(`
-- Añadir columna 'talla' si no existe (alternativa a 'size')
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS talla TEXT;

-- Añadir columna 'max_stock' si no existe
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 100;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_inventory_items_center_id ON inventory_items(center_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_categoria ON inventory_items(categoria);
CREATE INDEX IF NOT EXISTS idx_inventory_items_cantidad ON inventory_items(cantidad_actual);
    `);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar el script
checkInventorySchema()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  });
