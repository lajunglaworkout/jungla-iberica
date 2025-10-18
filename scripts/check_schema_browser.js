// Script para ejecutar en la consola del navegador
// Copia y pega este código en la consola del navegador mientras estás en la app

(async function checkInventorySchema() {
  console.log('🔍 Verificando estructura de inventory_items...\n');

  try {
    // Importar supabase desde el módulo
    const { supabase } = await import('/src/lib/supabase.ts');

    // Obtener un item de ejemplo
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (data) {
      console.log('✅ Item de ejemplo:');
      console.log(data);
      
      console.log('\n📋 Columnas disponibles en la tabla:');
      const columns = Object.keys(data);
      columns.forEach(col => {
        const value = data[col];
        const type = typeof value;
        console.log(`  ✓ ${col} (${type}): ${value}`);
      });

      console.log('\n🔍 Verificando columnas que necesitamos:');
      const requiredColumns = {
        'nombre_item o name': data.hasOwnProperty('nombre_item') || data.hasOwnProperty('name'),
        'categoria o category': data.hasOwnProperty('categoria') || data.hasOwnProperty('category'),
        'talla o size': data.hasOwnProperty('talla') || data.hasOwnProperty('size'),
        'cantidad_actual o quantity': data.hasOwnProperty('cantidad_actual') || data.hasOwnProperty('quantity'),
        'min_stock': data.hasOwnProperty('min_stock'),
        'max_stock': data.hasOwnProperty('max_stock'),
        'precio_compra': data.hasOwnProperty('precio_compra'),
        'precio_venta': data.hasOwnProperty('precio_venta'),
        'proveedor': data.hasOwnProperty('proveedor'),
        'center_id': data.hasOwnProperty('center_id'),
        'ubicacion': data.hasOwnProperty('ubicacion')
      };

      Object.entries(requiredColumns).forEach(([col, exists]) => {
        console.log(`  ${exists ? '✅' : '❌'} ${col}`);
      });

      console.log('\n📝 Columnas exactas a usar en el código:');
      console.log('const dataToInsert = {');
      if (data.hasOwnProperty('nombre_item')) console.log('  nombre_item: "...",');
      if (data.hasOwnProperty('name')) console.log('  name: "...",');
      if (data.hasOwnProperty('categoria')) console.log('  categoria: "...",');
      if (data.hasOwnProperty('category')) console.log('  category: "...",');
      if (data.hasOwnProperty('talla')) console.log('  talla: "...",');
      if (data.hasOwnProperty('size')) console.log('  size: "...",');
      if (data.hasOwnProperty('cantidad_actual')) console.log('  cantidad_actual: 0,');
      if (data.hasOwnProperty('quantity')) console.log('  quantity: 0,');
      if (data.hasOwnProperty('min_stock')) console.log('  min_stock: 0,');
      if (data.hasOwnProperty('precio_compra')) console.log('  precio_compra: 0,');
      if (data.hasOwnProperty('precio_venta')) console.log('  precio_venta: 0,');
      if (data.hasOwnProperty('proveedor')) console.log('  proveedor: "...",');
      if (data.hasOwnProperty('center_id')) console.log('  center_id: 1,');
      if (data.hasOwnProperty('ubicacion')) console.log('  ubicacion: "...",');
      console.log('};');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
