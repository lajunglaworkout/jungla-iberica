// src/components/logistics/LogisticsTypes.ts

export interface InventoryItem {
  id: number;
  name: string;
  nombre_item?: string;
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

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  type: 'local' | 'nacional' | 'internacional';
  category: string[];
  rating: number;
  total_orders: number;
  total_amount: number;
  last_order_date: string;
  payment_terms: string;
  delivery_time: string;
  active: boolean;
  notes?: string;
  website?: string;
  tax_id: string;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  available_stock: number;
  has_sufficient_stock: boolean;
}

export interface Order {
  id: string;
  type: 'center_to_brand' | 'brand_to_supplier' | 'review_order';
  from: string;
  to: string;
  date: string;
  delivery_date: string;
  estimated_delivery: string;
  amount: number;
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'cancelled';
  created_by: string;
  items: OrderItem[];
  notes?: string;
  processed_date?: string;
  sent_date?: string;
  cancelled_date?: string;
  cancellation_reason?: string;
}

export interface LogisticsUser {
  id: string;
  name: string;
  role: 'ceo' | 'logistics_director' | 'hr_director' | 'online_director' | 'events_director' | 'marketing_director' | 'center_manager' | 'trainer' | 'employee';
  center: 'central' | 'sevilla' | 'jerez' | 'puerto';
  permissions: {
    canAccessLogistics: boolean;
    canAccessMaintenance: boolean;
    canAccessAccounting: boolean;
    canAccessMarketing: boolean;
    canAccessHR: boolean;
    canAccessOnline: boolean;
    canAccessEvents: boolean;
    canViewReports: boolean;
    canManageInventory: boolean;
    canCreateOrders: boolean;
    canProcessOrders: boolean;
    canManageSuppliers: boolean;
    canManageTools: boolean;
    canViewAllCenters: boolean;
    canModifyPrices: boolean;
    canViewOwnCenter: boolean;
    canUseTimeTracking: boolean;
    canUseChecklist: boolean;
    canMessageHR: boolean;
    canManageUsers: boolean;
  };
  customPermissions?: string[];
}

export interface LogisticsNotification {
  id: number;
  type: 'new_order' | 'low_stock' | 'order_update' | 'order_request' | 'stock_alert' | 'checklist_incident' | 'maintenance_due' | 'uniform_request';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  from: string;
  urgent?: boolean;
  order_id?: string;
  created_at?: string;
}

export interface Tool {
  id: number;
  name: string;
  category: 'Limpieza' | 'Mantenimiento' | 'Seguridad' | 'Deportivo' | 'Oficina' | 'Electrónico';
  brand: string;
  model: string;
  serial_number?: string;
  purchase_date: string;
  purchase_price: number;
  current_location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'lost' | 'damaged';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  last_maintenance?: string;
  next_maintenance?: string;
  assigned_to?: string;
  notes?: string;
}

export interface ToolLocation {
  id: string;
  name: string;
  type: 'permanent' | 'temporary' | 'center' | 'storage';
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  is_active: boolean;
}

export interface ToolMovement {
  id: string;
  tool_id: number;
  from_location: string;
  to_location: string;
  moved_by: string;
  moved_at: string;
  reason: 'transfer' | 'maintenance' | 'loan' | 'return' | 'lost' | 'found';
  expected_return?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue';
}

export const getRolePermissions = (role: LogisticsUser['role']): LogisticsUser['permissions'] => {
  const full = { canAccessLogistics: true, canAccessMaintenance: true, canAccessAccounting: true, canAccessMarketing: true, canAccessHR: true, canAccessOnline: true, canAccessEvents: true, canViewReports: true, canManageInventory: true, canCreateOrders: true, canProcessOrders: true, canManageSuppliers: true, canManageTools: true, canViewAllCenters: true, canModifyPrices: true, canViewOwnCenter: true, canUseTimeTracking: true, canUseChecklist: true, canMessageHR: true, canManageUsers: true };
  const none = { canAccessLogistics: false, canAccessMaintenance: false, canAccessAccounting: false, canAccessMarketing: false, canAccessHR: false, canAccessOnline: false, canAccessEvents: false, canViewReports: false, canManageInventory: false, canCreateOrders: false, canProcessOrders: false, canManageSuppliers: false, canManageTools: false, canViewAllCenters: false, canModifyPrices: false, canViewOwnCenter: true, canUseTimeTracking: true, canUseChecklist: true, canMessageHR: true, canManageUsers: false };

  switch (role) {
    case 'ceo': return full;
    case 'logistics_director': return { ...full, canAccessMaintenance: false, canAccessAccounting: false, canAccessMarketing: false, canAccessHR: false, canAccessOnline: false, canAccessEvents: false, canManageUsers: false };
    case 'center_manager': return { ...none, canViewReports: true, canManageInventory: true, canCreateOrders: true, canManageTools: true, canViewOwnCenter: true };
    default: return none;
  }
};
