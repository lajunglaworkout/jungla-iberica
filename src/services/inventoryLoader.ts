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
      .select('*')
      .in('center_id', [9, 10, 11]);

    if (error) {
      console.error('❌ Error cargando inventario:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron datos de inventario en Supabase');
      return [];
    }

    console.log(`✅ ${data.length} items cargados desde Supabase`);
    
    // Convertir datos de Supabase al formato del componente
    const convertedItems: InventoryItem[] = data.map((item: InventoryItemFromDB) => ({
      id: item.id,
      name: item.nombre_item || item.name || 'Sin nombre',
      category: item.categoria || item.category || 'Sin categoría',
      size: item.size || item.talla || '',
      quantity: item.cantidad_actual || item.quantity || 0,
      min_stock: item.min_stock || 5,
      max_stock: item.max_stock || 100,
      purchase_price: item.precio_compra || item.cost_per_unit || 0,
      sale_price: item.precio_venta || item.selling_price || 0,
      supplier: item.proveedor || item.supplier || 'Sin proveedor',
      center: item.center_id === 9 ? 'sevilla' : 
             item.center_id === 10 ? 'jerez' : 
             item.center_id === 11 ? 'puerto' : 'central',
      location: item.ubicacion || item.location || 'Sin ubicación',
      last_updated: item.updated_at || new Date().toISOString(),
      status: (item.cantidad_actual || 0) === 0 ? 'out_of_stock' : 
             (item.cantidad_actual || 0) <= (item.min_stock || 5) ? 'low_stock' : 'in_stock'
    }));

    console.log('📦 Inventario convertido correctamente:', convertedItems.length, 'items');
    return convertedItems;

  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error);
    return [];
  }
};
