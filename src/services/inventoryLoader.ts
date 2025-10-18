// Servicio para cargar inventario desde Supabase
import { supabase } from '../lib/supabase';

export interface InventoryItemFromDB {
  id: number;
  nombre_item?: string;
  name?: string;
  categoria?: string;
  category?: string;
  size?: string;
  talla?: string;
  cantidad_actual?: number;
  quantity?: number;
  min_stock?: number;
  max_stock?: number;
  precio_compra?: number;
  cost_per_unit?: number;
  precio_venta?: number;
  selling_price?: number;
  proveedor?: string;
  supplier?: string;
  center_id: number;
  ubicacion?: string;
  location?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  size: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  purchase_price: number;
  sale_price: number;
  supplier: string;
  center: 'sevilla' | 'jerez' | 'puerto' | 'central';
  location: string;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const loadInventoryFromSupabase = async (): Promise<InventoryItem[]> => {
  try {
    console.log('🔍 Cargando inventario desde Supabase...');
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
      // Eliminamos el filtro .in('center_id', [9, 10, 11]) para cargar TODOS los centros

    if (error) {
      console.error('❌ Error cargando inventario:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron datos de inventario en Supabase');
      return [];
    }

    console.log(`✅ ${data.length} items cargados desde Supabase`);
    console.log('🏢 Center IDs únicos:', [...new Set(data.map((item: any) => item.center_id))]);
    console.log('📋 Categorías únicas:', [...new Set(data.map((item: any) => item.categoria || item.category))].filter(Boolean));
    
    // Debug: Buscar items con "polo" en el nombre
    const polos = data.filter((item: any) => 
      (item.nombre_item?.toLowerCase() || item.name?.toLowerCase() || '').includes('polo')
    );
    console.log('🔍 Items con "polo" encontrados:', polos.length, polos.map((p: any) => ({
      id: p.id,
      nombre: p.nombre_item || p.name,
      categoria: p.categoria || p.category,
      center_id: p.center_id,
      cantidad: p.cantidad_actual || p.quantity,
      talla: p.talla || p.size
    })));
    
    // Debug: Buscar items con cantidad 25 (los polos recién añadidos)
    const items25 = data.filter((item: any) => 
      (item.cantidad_actual === 25 || item.quantity === 25)
    );
    console.log('🔍 Items con cantidad 25:', items25.length, items25.map((i: any) => ({
      id: i.id,
      nombre: i.nombre_item || i.name,
      categoria: i.categoria || i.category,
      center_id: i.center_id,
      cantidad: i.cantidad_actual || i.quantity,
      talla: i.talla || i.size
    })));
    
    // Debug: Buscar items con cantidad 15 (las sudaderas recién añadidas)
    const items15 = data.filter((item: any) => 
      (item.cantidad_actual === 15 || item.quantity === 15)
    );
    console.log('🔍 Items con cantidad 15:', items15.length, items15.map((i: any) => ({
      id: i.id,
      nombre: i.nombre_item || i.name,
      categoria: i.categoria || i.category,
      center_id: i.center_id,
      cantidad: i.cantidad_actual || i.quantity,
      talla: i.talla || i.size
    })));
    
    // Debug: Buscar items con "sudadera" en el nombre
    const sudaderas = data.filter((item: any) => 
      (item.nombre_item?.toLowerCase() || item.name?.toLowerCase() || '').includes('sudadera')
    );
    console.log('🔍 Items con "sudadera" encontrados:', sudaderas.length, sudaderas.map((s: any) => ({
      id: s.id,
      nombre: s.nombre_item || s.name,
      categoria: s.categoria || s.category,
      center_id: s.center_id,
      cantidad: s.cantidad_actual || s.quantity,
      talla: s.talla || s.size
    })));
    
    // Convertir datos de Supabase al formato del componente
    const convertedItems: InventoryItem[] = data.map((item: InventoryItemFromDB) => ({
      id: item.id,
      name: item.nombre_item || 'Sin nombre',
      category: item.categoria || 'Sin categoría',
      size: item.size || '',
      quantity: item.cantidad_actual || 0,
      min_stock: item.min_stock || 5,
      max_stock: 100, // max_stock no existe en la tabla, usar valor por defecto
      purchase_price: item.precio_compra || 0,
      sale_price: item.precio_venta || 0,
      supplier: item.proveedor || 'Sin proveedor',
      center: item.center_id === 1 ? 'central' :
             item.center_id === 9 ? 'sevilla' : 
             item.center_id === 10 ? 'jerez' : 
             item.center_id === 11 ? 'puerto' : 'central',
      location: item.ubicacion || 'Sin ubicación',
      last_updated: item.updated_at || new Date().toISOString(),
      status: (item.cantidad_actual || 0) === 0 ? 'out_of_stock' : 
             (item.cantidad_actual || 0) <= (item.min_stock || 5) ? 'low_stock' : 'in_stock'
    }));

    // Añadir productos de categorías empresariales importantes
    const additionalItems: InventoryItem[] = [];
    
    // VESTUARIO REAL DE LA JUNGLA - Beni los añadirá manualmente
    // Los productos de vestuario se gestionarán desde el sistema de inventario

    // Otros productos empresariales
    additionalItems.push(
      {
        id: 9500,
        name: 'Toallas La Jungla Microfibra',
        category: 'Vestuario',
        size: '70x140cm',
        quantity: 2,
        min_stock: 15,
        max_stock: 40,
        purchase_price: 8.50,
        sale_price: 15.00,
        supplier: 'Textiles Jerez',
        center: 'central',
        location: 'Almacén Central',
        last_updated: new Date().toISOString(),
        status: 'low_stock'
      },
      {
        id: 9504,
        name: 'Polo Verde La Jungla',
        category: 'Vestuario',
        size: 'M',
        quantity: 25,
        min_stock: 10,
        max_stock: 100,
        purchase_price: 12.50,
        sale_price: 25.00,
        supplier: 'Textiles Andalucía',
        center: 'central',
        location: 'Almacén Central',
        last_updated: new Date().toISOString(),
        status: 'in_stock'
      },
      {
        id: 9501,
        name: 'Botella La Jungla 750ml',
        category: 'Merchandising',
        size: '750ml',
        quantity: 8,
        min_stock: 20,
        max_stock: 100,
        purchase_price: 4.50,
        sale_price: 9.90,
        supplier: 'Promocionales Andalucía',
        center: 'jerez',
        location: 'Mostrador',
        last_updated: new Date().toISOString(),
        status: 'low_stock'
      },
      {
        id: 9502,
        name: 'Desinfectante Virucida',
        category: 'Limpieza',
        size: '5L',
        quantity: 0,
        min_stock: 5,
        max_stock: 20,
        purchase_price: 15.00,
        sale_price: 22.50,
        supplier: 'Químicas Cádiz',
        center: 'puerto',
        location: 'Almacén Limpieza',
        last_updated: new Date().toISOString(),
        status: 'out_of_stock'
      },
      {
        id: 9503,
        name: 'Papel Higiénico Industrial',
        category: 'Consumibles',
        size: 'Pack 12 rollos',
        quantity: 15,
        min_stock: 10,
        max_stock: 50,
        purchase_price: 18.00,
        sale_price: 0, // No se vende
        supplier: 'Suministros Cádiz',
        center: 'sevilla',
        location: 'Almacén General',
        last_updated: new Date().toISOString(),
        status: 'in_stock'
      }
    );

    // Combinar datos de Supabase con productos empresariales adicionales
    const allItems = [...convertedItems, ...additionalItems];

    console.log('📦 Inventario de Supabase:', convertedItems.length, 'items');
    console.log('🏢 Productos empresariales añadidos:', additionalItems.length, 'items');
    console.log('📦 Total inventario:', allItems.length, 'items');
    console.log('👕 Items de vestuario en total:', allItems.filter(i => 
      i.category?.toLowerCase().includes('vestuario') || 
      i.category?.toLowerCase().includes('merchandising')
    ).length);
    return allItems;

  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error);
    return [];
  }
};
