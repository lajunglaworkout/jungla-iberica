// Tipos para el sistema de logística de La Jungla

export type LocationType = 'central' | 'sevilla' | 'jerez' | 'puerto';

export type ItemCategory = 
  | 'material_deportivo'
  | 'herramientas'
  | 'maquinaria'
  | 'mobiliario'
  | 'merchandising'
  | 'vestuario'
  | 'consumibles';

export type MovementType = 
  | 'entrada'        // Compra a proveedor
  | 'salida'         // Venta o uso
  | 'transferencia'  // Entre ubicaciones
  | 'ajuste'         // Corrección de inventario
  | 'merma'          // Pérdida/rotura
  | 'devolucion';    // Devolución

export type OrderStatus = 
  | 'pendiente'
  | 'procesando'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export type PaymentStatus = 
  | 'pendiente'
  | 'pagado'
  | 'vencido';

// Artículo del inventario
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: ItemCategory;
  sku: string; // Código único del artículo
  brand?: string;
  model?: string;
  unit: string; // unidad, kg, litro, etc.
  purchasePrice: number;
  salePrice: number;
  salePriceByLocation?: Record<LocationType, number>; // Precios específicos por centro
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Stock por ubicación
export interface InventoryStock {
  id: string;
  itemId: string;
  location: LocationType;
  currentStock: number;
  minStock: number; // Stock mínimo para alertas
  maxStock?: number; // Stock máximo recomendado
  reservedStock: number; // Stock reservado para pedidos
  availableStock: number; // Stock disponible (current - reserved)
  lastMovementDate: string;
  updatedAt: string;
}

// Movimiento de inventario
export interface InventoryMovement {
  id: string;
  itemId: string;
  fromLocation?: LocationType;
  toLocation?: LocationType;
  movementType: MovementType;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  reason: string;
  orderId?: string; // Relacionado con pedido
  deliveryNoteId?: string; // Relacionado con albarán
  performedBy: string;
  performedAt: string;
  notes?: string;
}

// Proveedor
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  taxId?: string; // CIF/NIF
  paymentTerms?: string; // Condiciones de pago
  isLocal: boolean; // Proveedor local o común
  availableLocations: LocationType[]; // Ubicaciones que puede servir
  categories: ItemCategory[]; // Categorías que suministra
  isActive: boolean;
  rating?: number; // Valoración del proveedor
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pedido entre ubicaciones
export interface InternalOrder {
  id: string;
  orderNumber: string;
  fromLocation: LocationType;
  toLocation: LocationType;
  status: OrderStatus;
  requestedBy: string;
  requestedAt: string;
  processedBy?: string;
  processedAt?: string;
  deliveredAt?: string;
  items: InternalOrderItem[];
  totalAmount: number;
  notes?: string;
  deliveryNoteId?: string;
  paymentStatus: PaymentStatus;
  paymentDueDate?: string;
  paidAt?: string;
}

// Artículo en pedido interno
export interface InternalOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveredQuantity?: number;
  notes?: string;
}

// Albarán de entrega
export interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  orderId: string;
  fromLocation: LocationType;
  toLocation: LocationType;
  deliveredBy: string;
  deliveredAt: string;
  receivedBy?: string;
  receivedAt?: string;
  items: DeliveryNoteItem[];
  totalAmount: number;
  notes?: string;
  isReceived: boolean;
  paymentStatus: PaymentStatus;
}

// Artículo en albarán
export interface DeliveryNoteItem {
  id: string;
  itemId: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  unitPrice: number;
  totalPrice: number;
  condition?: 'perfecto' | 'dañado' | 'incompleto';
  notes?: string;
}

// Alerta de inventario
export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'movement_required';
  itemId: string;
  location: LocationType;
  currentStock: number;
  minStock?: number;
  maxStock?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Métricas del dashboard logístico
export interface LogisticsDashboardMetrics {
  totalItems: number;
  totalValue: number;
  lowStockAlerts: number;
  pendingOrders: number;
  pendingPayments: number;
  recentMovements: number;
  efficiency: {
    deliveryTime: number; // Tiempo promedio de entrega en días
    orderFulfillment: number; // % de pedidos completados a tiempo
    stockAccuracy: number; // % de precisión del inventario
  };
  topMovingItems: Array<{
    itemId: string;
    itemName: string;
    movements: number;
    value: number;
  }>;
  locationMetrics: Record<LocationType, {
    totalItems: number;
    totalValue: number;
    alerts: number;
    lastUpdate: string;
  }>;
}

// Configuración de categorías
export interface CategoryConfig {
  id: ItemCategory;
  name: string;
  icon: string;
  description: string;
  defaultUnit: string;
  requiresSerial?: boolean; // Si requiere número de serie
  hasExpiration?: boolean; // Si tiene fecha de caducidad
}

// Configuración de ubicaciones
export interface LocationConfig {
  id: LocationType;
  name: string;
  address?: string;
  manager: string;
  managerEmail: string;
  isWarehouse: boolean; // Si es almacén principal
  canReceiveOrders: boolean;
  canSendOrders: boolean;
}
