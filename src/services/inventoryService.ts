/**
 * @deprecated MOCK SERVICE — NO usa Supabase. Datos en memoria que se pierden al recargar.
 *
 * Este servicio es un prototipo que simula operaciones de inventario.
 * Para operaciones REALES de inventario, usar logisticsService.ts que SÍ conecta con Supabase.
 *
 * Consumidores actuales:
 *   - hooks/useInventoryIntegration.ts
 *   - services/orderService.ts (también mock)
 *   - components/logistics/InventoryChecklistIntegration.tsx (via hook)
 *   - components/logistics/LogisticsMetrics.tsx (via hook)
 *
 * TODO: Migrar processChecklistIncident y getStockByLocation a logisticsService.ts
 *       con queries reales a Supabase, y eliminar este archivo.
 */
import { InventoryItem, InventoryStock, InventoryMovement, InventoryAlert, LocationType, MovementType } from '../types/logistics';

// MOCK: Simulación de base de datos en memoria (NO persiste datos)
let inventoryItems: InventoryItem[] = [
  {
    id: 'item-001',
    name: 'Goma Elástica 3cm',
    description: 'Goma elástica de resistencia media',
    category: 'material_deportivo',
    sku: 'GE-3CM-001',
    brand: 'TheraBand',
    unit: 'unidad',
    purchasePrice: 8.50,
    salePrice: 15.00,
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'item-004',
    name: 'Desinfectante Multiusos',
    description: 'Desinfectante para equipos y superficies',
    category: 'consumibles',
    sku: 'DES-MU-001',
    brand: 'Sanytol',
    unit: 'litro',
    purchasePrice: 3.50,
    salePrice: 0,
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'admin'
  }
];

let inventoryStock: InventoryStock[] = [
  {
    id: 'stock-002',
    itemId: 'item-001',
    location: 'sevilla',
    currentStock: 5,
    minStock: 5,
    maxStock: 15,
    reservedStock: 0,
    availableStock: 5,
    lastMovementDate: '2025-01-19T15:30:00Z',
    updatedAt: '2025-01-19T15:30:00Z'
  },
  {
    id: 'stock-010',
    itemId: 'item-004',
    location: 'sevilla',
    currentStock: 4,
    minStock: 5,
    maxStock: 20,
    reservedStock: 0,
    availableStock: 4,
    lastMovementDate: '2025-01-18T10:00:00Z',
    updatedAt: '2025-01-18T10:00:00Z'
  }
];

let inventoryMovements: InventoryMovement[] = [];
let inventoryAlerts: InventoryAlert[] = [];

// Función principal: procesar incidencia del check-list
export const processChecklistIncident = async (
  itemName: string,
  quantity: number,
  location: LocationType,
  reason: string,
  reportedBy: string
): Promise<{ success: boolean; alert?: InventoryAlert; error?: string }> => {
  try {
    // 1. Buscar el artículo por nombre
    const item = inventoryItems.find(i => i.nombre_item === itemName);
    if (!item) {
      return { success: false, error: `Artículo "${itemName}" no encontrado en inventario` };
    }

    // 2. Buscar el stock en la ubicación
    const stockIndex = inventoryStock.findIndex(s => s.itemId === item.id && s.location === location);
    if (stockIndex === -1) {
      return { success: false, error: `No hay stock de "${itemName}" en ${location}` };
    }

    const currentStock = inventoryStock[stockIndex];

    // 3. Verificar que hay suficiente stock
    if (currentStock.currentStock < quantity) {
      return { 
        success: false, 
        error: `Stock insuficiente. Disponible: ${currentStock.currentStock}, Solicitado: ${quantity}` 
      };
    }

    // 4. Crear movimiento de inventario
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      itemId: item.id,
      fromLocation: location,
      toLocation: undefined,
      movementType: 'merma',
      quantity: quantity,
      reason: `Check-list: ${reason}`,
      performedBy: reportedBy,
      performedAt: new Date().toISOString(),
      notes: `Incidencia reportada desde check-list del centro`
    };

    inventoryMovements.push(movement);

    // 5. Actualizar stock
    inventoryStock[stockIndex] = {
      ...currentStock,
      currentStock: currentStock.currentStock - quantity,
      availableStock: currentStock.availableStock - quantity,
      lastMovementDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedStock = inventoryStock[stockIndex];

    console.log(`✅ Stock actualizado: ${item.nombre_item || item.name} en ${location}`);
    console.log(`   Anterior: ${currentStock.currentStock} → Nuevo: ${updatedStock.currentStock}`);

    // 6. Verificar si necesita generar alerta
    let alert: InventoryAlert | undefined;
    
    if (updatedStock.currentStock <= updatedStock.minStock) {
      const alertType = updatedStock.currentStock === 0 ? 'out_of_stock' : 'low_stock';
      const severity = updatedStock.currentStock === 0 ? 'critical' : 
                      updatedStock.currentStock <= updatedStock.minStock / 2 ? 'high' : 'medium';

      alert = {
        id: `alert-${Date.now()}`,
        type: alertType,
        itemId: item.id,
        location: location,
        currentStock: updatedStock.currentStock,
        minStock: updatedStock.minStock,
        severity: severity,
        message: updatedStock.currentStock === 0 
          ? `¡SIN STOCK! ${item.nombre_item || item.name} en ${location}. Pedido urgente necesario.`
          : `Stock bajo: ${item.nombre_item || item.name} en ${location}. Quedan ${updatedStock.currentStock} unidades (mínimo: ${updatedStock.minStock})`,
        isRead: false,
        isResolved: false,
        createdAt: new Date().toISOString()
      };

      inventoryAlerts.push(alert);

      console.log(`🚨 ALERTA GENERADA: ${alert.message}`);
      
      // Aquí se enviaría notificación al equipo de logística
      await sendLowStockNotification(alert, item);
    }

    return { success: true, alert };

  } catch (error) {
    console.error('Error procesando incidencia:', error);
    return { success: false, error: 'Error interno del sistema' };
  }
};

// Función para enviar notificación de stock bajo
const sendLowStockNotification = async (alert: InventoryAlert, item: InventoryItem) => {
  // Simular envío de notificación (en producción sería email/webhook)
  console.log(`📧 Enviando notificación a logística:`);
  console.log(`   Para: pedidoslajungla@gmail.com`);
  console.log(`   Asunto: ${alert.severity === 'critical' ? '🚨 STOCK CRÍTICO' : '⚠️ Stock Bajo'} - ${item.nombre_item || item.name}`);
  console.log(`   Mensaje: ${alert.message}`);
  
  // Aquí iría la integración con servicio de email
  return true;
};

// Obtener stock por ubicación
export const getStockByLocation = (location: LocationType): InventoryStock[] => {
  return inventoryStock.filter(stock => stock.location === location);
};

// Obtener alertas activas por ubicación
export const getActiveAlertsByLocation = (location: LocationType): InventoryAlert[] => {
  return inventoryAlerts.filter(alert => 
    alert.location === location && !alert.isResolved
  );
};

// Obtener historial de movimientos
export const getMovementHistory = (location?: LocationType, itemId?: string): InventoryMovement[] => {
  let movements = inventoryMovements;
  
  if (location) {
    movements = movements.filter(m => m.fromLocation === location || m.toLocation === location);
  }
  
  if (itemId) {
    movements = movements.filter(m => m.itemId === itemId);
  }
  
  return movements.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
};

// Obtener artículo por ID
export const getItemById = (itemId: string): InventoryItem | undefined => {
  return inventoryItems.find(item => item.id === itemId);
};

// Obtener stock específico
export const getStockByItemAndLocation = (itemId: string, location: LocationType): InventoryStock | undefined => {
  return inventoryStock.find(stock => stock.itemId === itemId && stock.location === location);
};

// Marcar alerta como resuelta
export const resolveAlert = (alertId: string, resolvedBy: string): boolean => {
  const alertIndex = inventoryAlerts.findIndex(alert => alert.id === alertId);
  if (alertIndex === -1) return false;
  
  inventoryAlerts[alertIndex] = {
    ...inventoryAlerts[alertIndex],
    isResolved: true,
    resolvedAt: new Date().toISOString(),
    resolvedBy: resolvedBy
  };
  
  return true;
};

// Función para simular integración con check-list existente
export const integrateWithChecklist = () => {
  console.log('🔗 Integración con sistema de check-list activada');
  console.log('   - Escuchando incidencias del check-list');
  console.log('   - Descuento automático de inventario habilitado');
  console.log('   - Alertas de stock bajo configuradas');
  
  // Simular algunas incidencias para demostrar el funcionamiento
  setTimeout(async () => {
    console.log('\n📋 Simulando incidencia desde check-list...');
    const result = await processChecklistIncident(
      'Goma Elástica 3cm',
      1,
      'sevilla',
      'Se rompió durante entrenamiento matutino',
      'francisco.giraldez@lajungla.com'
    );
    
    if (result.success && result.alert) {
      console.log('✅ Incidencia procesada correctamente');
      console.log('🚨 Alerta generada automáticamente');
    }
  }, 2000);
};

// Exportar datos para uso en componentes
export const getInventoryData = () => ({
  items: inventoryItems,
  stock: inventoryStock,
  movements: inventoryMovements,
  alerts: inventoryAlerts
});
