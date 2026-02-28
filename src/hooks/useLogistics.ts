// src/hooks/useLogistics.ts
import { useState, useEffect, useCallback } from 'react';
import logisticsService from '../services/logisticsService';
import type { Database } from '../types/database.gen';

// Tipos de la base de datos
type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type Supplier = Database['public']['Tables']['suppliers']['Row'];
type SupplierOrder = Database['public']['Tables']['supplier_orders']['Row'];
type ProductCategory = Database['public']['Tables']['product_categories']['Row'];
type StockAlert = Database['public']['Tables']['stock_alerts']['Row'];

// Tipos extendidos para la UI
export interface ExtendedInventoryItem extends InventoryItem {
  product_categories?: { name: string };
  suppliers?: { name: string; contact_person?: string; email?: string };
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface ExtendedSupplier extends Supplier {
  total_orders?: number;
  total_amount?: number;
  last_order_date?: string;
  rating?: number;
  category?: string[];
  type?: 'local' | 'nacional' | 'internacional';
  delivery_time?: string;
}

export interface OrderItem {
  id?: number;
  inventory_item_id?: number;
  product_name?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
}

export interface ExtendedOrder extends SupplierOrder {
  supplier_name?: string;
  supplier_contact?: string;
  supplier_email?: string;
  supplier_phone?: string;
  order_items?: OrderItem[];
  type?: 'center_to_brand' | 'brand_to_supplier';
  from?: string;
  to?: string;
  delivery_date?: string;
  amount?: number;
  created_by_name?: string;
}

export interface LogisticsState {
  // Datos
  inventoryItems: ExtendedInventoryItem[];
  suppliers: ExtendedSupplier[];
  orders: ExtendedOrder[];
  categories: ProductCategory[];
  alerts: StockAlert[];

  // Estados de carga
  loading: {
    inventory: boolean;
    suppliers: boolean;
    orders: boolean;
    categories: boolean;
    alerts: boolean;
  };

  // Errores
  errors: {
    inventory?: string;
    suppliers?: string;
    orders?: string;
    categories?: string;
    alerts?: string;
  };
}

export function useLogistics() {
  const [state, setState] = useState<LogisticsState>({
    inventoryItems: [],
    suppliers: [],
    orders: [],
    categories: [],
    alerts: [],
    loading: {
      inventory: false,
      suppliers: false,
      orders: false,
      categories: false,
      alerts: false
    },
    errors: {}
  });

  // ===== FUNCIONES DE CARGA =====

  const loadInventory = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, inventory: true },
      errors: { ...prev.errors, inventory: undefined }
    }));

    try {
      const items = await logisticsService.inventory.getAll();

      // Transformar datos para la UI
      const extendedItems: ExtendedInventoryItem[] = items.map(item => ({
        ...item,
        stock_status: logisticsService.utils.getStockStatus(item.quantity, item.min_stock)
      }));

      setState(prev => ({
        ...prev,
        inventoryItems: extendedItems,
        loading: { ...prev.loading, inventory: false }
      }));
    } catch (error) {
      console.error('Error loading inventory:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, inventory: false },
        errors: { ...prev.errors, inventory: 'Error cargando inventario' }
      }));
    }
  }, []);

  const loadSuppliers = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, suppliers: true },
      errors: { ...prev.errors, suppliers: undefined }
    }));

    try {
      const suppliers = await logisticsService.suppliers.getAll();

      // Transformar datos para la UI (agregar campos calculados)
      const extendedSuppliers: ExtendedSupplier[] = suppliers.map(supplier => ({
        ...supplier,
        // Valores por defecto para compatibilidad con la UI, a la espera de integración real
        total_orders: 0,
        total_amount: 0,
        last_order_date: undefined,
        rating: 0,
        category: [],
        type: supplier.city?.includes('Sevilla') || supplier.city?.includes('Jerez') || supplier.city?.includes('Cádiz') ? 'local' : 'nacional',
        delivery_time: 'Consultar'
      }));

      setState(prev => ({
        ...prev,
        suppliers: extendedSuppliers,
        loading: { ...prev.loading, suppliers: false }
      }));
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, suppliers: false },
        errors: { ...prev.errors, suppliers: 'Error cargando proveedores' }
      }));
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, orders: true },
      errors: { ...prev.errors, orders: undefined }
    }));

    try {
      const orders = await logisticsService.orders.getAll();

      // Transformar datos para la UI
      const extendedOrders: ExtendedOrder[] = orders.map((order) => ({
        ...order,
        type: 'brand_to_supplier', // Todos los pedidos de la BD son a proveedores
        from: 'La Jungla Central',
        to: order.suppliers?.name || 'Proveedor',
        supplier_name: order.suppliers?.name,
        supplier_contact: order.suppliers?.contact_person,
        supplier_email: order.suppliers?.email,
        supplier_phone: order.suppliers?.phone,
        order_items: order.supplier_order_items || [],
        delivery_date: order.expected_delivery || order.order_date,
        amount: order.total_amount,
        created_by_name: 'Beni García - Director Logística'
      }));

      setState(prev => ({
        ...prev,
        orders: extendedOrders,
        loading: { ...prev.loading, orders: false }
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, orders: false },
        errors: { ...prev.errors, orders: 'Error cargando pedidos' }
      }));
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, categories: true },
      errors: { ...prev.errors, categories: undefined }
    }));

    try {
      const categories = await logisticsService.categories.getAll();
      setState(prev => ({
        ...prev,
        categories,
        loading: { ...prev.loading, categories: false }
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, categories: false },
        errors: { ...prev.errors, categories: 'Error cargando categorías' }
      }));
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, alerts: true },
      errors: { ...prev.errors, alerts: undefined }
    }));

    try {
      const alerts = await logisticsService.alerts.getActive();
      setState(prev => ({
        ...prev,
        alerts,
        loading: { ...prev.loading, alerts: false }
      }));
    } catch (error) {
      console.error('Error loading alerts:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, alerts: false },
        errors: { ...prev.errors, alerts: 'Error cargando alertas' }
      }));
    }
  }, []);

  // ===== FUNCIONES DE OPERACIONES =====

  const createInventoryItem = useCallback(async (item: Record<string, unknown>) => {
    try {
      // Transformar datos de la UI al formato de BD
      const dbItem = {
        name: item.name,
        description: item.description || '',
        size: item.size,
        quantity: parseInt(item.quantity) || 0,
        min_stock: parseInt(item.min_stock) || 0,
        max_stock: parseInt(item.max_stock) || 100,
        purchase_price: parseFloat(item.purchase_price) || 0,
        sale_price: parseFloat(item.sale_price) || 0,
        location: item.location,
        status: 'active'
      };

      await logisticsService.inventory.create(dbItem);
      await loadInventory(); // Recargar datos
      return true;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }, [loadInventory]);

  const updateInventoryItem = useCallback(async (id: number, updates: Record<string, unknown>) => {
    try {
      // Transformar datos de la UI al formato de BD
      const dbUpdates = {
        name: updates.name,
        description: updates.description,
        size: updates.size,
        quantity: parseInt(updates.quantity) || 0,
        min_stock: parseInt(updates.min_stock) || 0,
        max_stock: parseInt(updates.max_stock) || 100,
        purchase_price: parseFloat(updates.purchase_price) || 0,
        sale_price: parseFloat(updates.sale_price) || 0,
        location: updates.location
      };

      await logisticsService.inventory.update(id, dbUpdates);
      await loadInventory(); // Recargar datos
      return true;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }, [loadInventory]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string, notes?: string) => {
    try {
      const numericId = parseInt(orderId.split('-').pop() || '0');
      await logisticsService.orders.updateStatus(numericId, status, notes);
      await loadOrders(); // Recargar datos
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }, [loadOrders]);

  // ===== EFECTOS =====

  // Cargar datos iniciales
  useEffect(() => {
    loadInventory();
    loadSuppliers();
    loadOrders();
    loadCategories();
    loadAlerts();
  }, [loadInventory, loadSuppliers, loadOrders, loadCategories, loadAlerts]);

  // ===== FUNCIONES UTILITARIAS =====

  const getOrderStats = useCallback(() => {
    const pendingOrders = state.orders.filter(order => order.status === 'draft' || order.status === 'sent').length;
    const sentOrders = state.orders.filter(order => order.status === 'shipped' || order.status === 'delivered').length;
    const pendingAmount = state.orders
      .filter(order => order.payment_status === 'pending')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    return { pendingOrders, sentOrders, pendingAmount };
  }, [state.orders]);

  return {
    // Estado
    ...state,

    // Funciones de carga
    loadInventory,
    loadSuppliers,
    loadOrders,
    loadCategories,
    loadAlerts,

    // Funciones de operaciones
    createInventoryItem,
    updateInventoryItem,
    updateOrderStatus,

    // Funciones utilitarias
    getOrderStats,

    // Servicios directos (para operaciones avanzadas)
    services: logisticsService
  };
}
