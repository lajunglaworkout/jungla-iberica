// src/services/logisticsService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// Tipos para las operaciones de logística
type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

type SupplierOrder = Database['public']['Tables']['supplier_orders']['Row'];
type SupplierOrderInsert = Database['public']['Tables']['supplier_orders']['Insert'];
type SupplierOrderUpdate = Database['public']['Tables']['supplier_orders']['Update'];

type ProductCategory = Database['public']['Tables']['product_categories']['Row'];
type StockAlert = Database['public']['Tables']['stock_alerts']['Row'];

// ===== SERVICIOS DE INVENTARIO =====

export const inventoryService = {
  // Obtener todos los items de inventario con información de categoría y proveedor
  async getAll(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          suppliers(name, contact_person, email)
        `)
        .eq('status', 'active')
        .order('nombre_item');

      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll inventory:', error);
      throw error;
    }
  },

  // Crear nuevo item de inventario
  async create(item: InventoryItemInsert): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error('Error creating inventory item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create inventory item:', error);
      throw error;
    }
  },

  // Actualizar item de inventario
  async update(id: number, updates: InventoryItemUpdate): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating inventory item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in update inventory item:', error);
      throw error;
    }
  },

  // Eliminar item de inventario (soft delete)
  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ status: 'discontinued', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting inventory item:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete inventory item:', error);
      throw error;
    }
  },

  // Actualizar stock de un item
  async updateStock(id: number, newQuantity: number, reason: string, performedBy?: number): Promise<void> {
    try {
      // Primero obtenemos la cantidad actual
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const previousQuantity = currentItem.quantity;
      const quantityChange = newQuantity - previousQuantity;

      // Actualizamos el inventario
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ 
          quantity: newQuantity, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Registramos el movimiento
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          inventory_item_id: id,
          movement_type: quantityChange > 0 ? 'in' : 'out',
          quantity: Math.abs(quantityChange),
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reason,
          performed_by: performedBy,
          reference_type: 'manual_adjustment'
        });

      if (movementError) throw movementError;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE PROVEEDORES =====

export const supplierService = {
  // Obtener todos los proveedores activos
  async getAll(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll suppliers:', error);
      throw error;
    }
  },

  // Crear nuevo proveedor
  async create(supplier: SupplierInsert): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create supplier:', error);
      throw error;
    }
  },

  // Actualizar proveedor
  async update(id: number, updates: SupplierUpdate): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in update supplier:', error);
      throw error;
    }
  },

  // Desactivar proveedor
  async deactivate(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deactivating supplier:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deactivate supplier:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE PEDIDOS =====

export const orderService = {
  // Obtener todos los pedidos con información de proveedor
  async getAll(): Promise<SupplierOrder[]> {
    try {
      const { data, error } = await supabase
        .from('supplier_orders')
        .select(`
          *,
          suppliers(name, contact_person, email, phone),
          supplier_order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll orders:', error);
      throw error;
    }
  },

  // Crear nuevo pedido
  async create(order: SupplierOrderInsert): Promise<SupplierOrder> {
    try {
      const { data, error } = await supabase
        .from('supplier_orders')
        .insert(order)
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create order:', error);
      throw error;
    }
  },

  // Actualizar estado de pedido
  async updateStatus(id: number, status: string, notes?: string): Promise<SupplierOrder> {
    try {
      const updates: SupplierOrderUpdate = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) updates.notes = notes;

      // Agregar fechas según el estado
      if (status === 'shipped') {
        updates.actual_delivery = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('supplier_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateStatus order:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE CATEGORÍAS =====

export const categoryService = {
  // Obtener todas las categorías
  async getAll(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll categories:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE ALERTAS =====

export const alertService = {
  // Obtener alertas activas
  async getActive(): Promise<StockAlert[]> {
    try {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select(`
          *,
          inventory_items(nombre_item, codigo, quantity, min_stock)
        `)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActive alerts:', error);
      throw error;
    }
  },

  // Marcar alerta como resuelta
  async resolve(id: number, resolvedBy?: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({
          is_resolved: true,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error resolving alert:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in resolve alert:', error);
      throw error;
    }
  }
};

// ===== FUNCIONES UTILITARIAS =====

export const logisticsUtils = {
  // Calcular estado de stock
  getStockStatus(quantity: number, minStock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= minStock) return 'low_stock';
    return 'in_stock';
  },

  // Formatear precio
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  },

  // Formatear fecha
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
};

// Pedidos internos (tabla 'orders', distinta de supplier_orders)
export const getOrdersByStatus = async (statusFilter: string[]): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', statusFilter)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

// ── LogisticsManagementSystem helpers ────────────────────────────────────────

export const getInventoryAlerts = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, nombre_item, quantity, min_stock, center_id')
      .order('center_id');
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getInventoryByCenters = async (centerIds: number[]): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('inventory_items').select('*').in('center_id', centerIds);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getOrders = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getSuppliersList = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getToolsList = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('tools').select('*').order('name', { ascending: true });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getPendingUniformRequests = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('uniform_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const deleteOrder = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};

export const markOrderSent = async (orderId: string, sentDate: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('orders').update({ status: 'sent', sent_date: sentDate }).eq('id', orderId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};

export const deleteSupplierById = async (supplierId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};

export const deleteToolById = async (toolId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('tools').delete().eq('id', toolId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};

export const createInventoryItem = async (data: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; error?: string }> => {
  try {
    const { data: result, error } = await supabase.from('inventory_items').insert(data).select().single();
    if (error) return { data: null, error: error.message };
    return { data: result as Record<string, unknown> };
  } catch (err) { return { data: null, error: String(err) }; }
};

export const deleteInventoryItem = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};

export const getInventoryItemById = async (id: number): Promise<{ data: Record<string, unknown> | null; error?: string }> => {
  try {
    const { data, error } = await supabase.from('inventory_items').select('*').eq('id', id).single();
    if (error) return { data: null, error: error.message };
    return { data: data as Record<string, unknown> };
  } catch (err) { return { data: null, error: String(err) }; }
};

export const updateInventoryItem = async (id: number, data: Record<string, unknown>): Promise<{ data: Record<string, unknown>[] | null; error?: string }> => {
  try {
    const { data: result, error } = await supabase.from('inventory_items').update(data).eq('id', id).select();
    if (error) return { data: null, error: error.message };
    return { data: (result ?? []) as Record<string, unknown>[] };
  } catch (err) { return { data: null, error: String(err) }; }
};

// Exportar todos los servicios
export default {
  inventory: inventoryService,
  suppliers: supplierService,
  orders: orderService,
  categories: categoryService,
  alerts: alertService,
  utils: logisticsUtils
};
