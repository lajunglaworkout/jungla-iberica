// Servicio para gestión de pedidos automáticos
import { InternalOrder, InternalOrderItem, OrderStatus, PaymentStatus, LocationType } from '../types/logistics';
import { getInventoryData, getItemById } from './inventoryService';

let orders: InternalOrder[] = [];
let orderCounter = 1;

// Crear pedido automático cuando hay stock bajo
export const createAutomaticOrder = async (
  itemId: string,
  fromLocation: LocationType,
  toLocation: LocationType,
  quantity: number,
  requestedBy: string,
  reason: string
): Promise<{ success: boolean; order?: InternalOrder; error?: string }> => {
  try {
    const item = getItemById(itemId);
    if (!item) {
      return { success: false, error: 'Artículo no encontrado' };
    }

    const orderItem: InternalOrderItem = {
      id: `oi-${Date.now()}`,
      itemId: itemId,
      quantity: quantity,
      unitPrice: item.purchasePrice,
      totalPrice: item.purchasePrice * quantity
    };

    const order: InternalOrder = {
      id: `order-auto-${Date.now()}`,
      orderNumber: `PED-AUTO-${String(orderCounter++).padStart(3, '0')}`,
      fromLocation: fromLocation,
      toLocation: toLocation,
      status: 'pendiente',
      requestedBy: requestedBy,
      requestedAt: new Date().toISOString(),
      items: [orderItem],
      totalAmount: orderItem.totalPrice,
      notes: `Pedido automático: ${reason}`,
      paymentStatus: 'pendiente'
    };

    orders.push(order);

    console.log(`📦 Pedido automático creado: ${order.orderNumber}`);
    console.log(`   Artículo: ${item.name}`);
    console.log(`   Cantidad: ${quantity}`);
    console.log(`   Total: €${order.totalAmount.toFixed(2)}`);

    // Simular notificación al equipo de logística
    await notifyLogisticsTeam(order, item.name);

    return { success: true, order };

  } catch (error) {
    console.error('Error creando pedido automático:', error);
    return { success: false, error: 'Error interno del sistema' };
  }
};

// Notificar al equipo de logística sobre nuevo pedido
const notifyLogisticsTeam = async (order: InternalOrder, itemName: string) => {
  console.log(`📧 Notificando pedido automático a logística:`);
  console.log(`   Para: pedidoslajungla@gmail.com`);
  console.log(`   Asunto: 🚨 Pedido Automático Urgente - ${itemName}`);
  console.log(`   Pedido: ${order.orderNumber}`);
  console.log(`   Ubicación: ${order.toLocation}`);
  console.log(`   Motivo: ${order.notes}`);
  
  return true;
};

// Obtener pedidos por ubicación
export const getOrdersByLocation = (location: LocationType): InternalOrder[] => {
  return orders.filter(order => order.toLocation === location || order.fromLocation === location);
};

// Obtener pedidos pendientes
export const getPendingOrders = (): InternalOrder[] => {
  return orders.filter(order => ['pendiente', 'procesando'].includes(order.status));
};

// Procesar pedido (cambiar estado)
export const processOrder = (orderId: string, processedBy: string): boolean => {
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return false;

  orders[orderIndex] = {
    ...orders[orderIndex],
    status: 'procesando',
    processedBy: processedBy,
    processedAt: new Date().toISOString()
  };

  console.log(`✅ Pedido ${orders[orderIndex].orderNumber} procesado por ${processedBy}`);
  return true;
};

// Marcar pedido como enviado
export const markOrderAsShipped = (orderId: string): boolean => {
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return false;

  orders[orderIndex] = {
    ...orders[orderIndex],
    status: 'enviado'
  };

  return true;
};

// Obtener estadísticas de pedidos
export const getOrderStats = () => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
  const processingOrders = orders.filter(o => o.status === 'procesando').length;
  const completedOrders = orders.filter(o => o.status === 'entregado').length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    totalValue
  };
};

// Exportar datos para uso en componentes
export const getOrdersData = () => orders;
