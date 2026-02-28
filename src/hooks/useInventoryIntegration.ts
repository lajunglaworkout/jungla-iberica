// Hook para integrar check-list con inventario
import { useState, useEffect, useCallback } from 'react';
import { LocationType, InventoryAlert, InventoryStock } from '../types/logistics';
import { 
  processChecklistIncident, 
  getStockByLocation, 
  getActiveAlertsByLocation,
  getMovementHistory,
  integrateWithChecklist 
} from '../services/inventoryService';
import { createAutomaticOrder } from '../services/orderService';
import { ui } from '../utils/ui';


interface ChecklistIncident {
  itemName: string;
  quantity: number;
  reason: string;
  reportedBy: string;
}

export const useInventoryIntegration = (userLocation: LocationType, userEmail: string) => {
  const [stock, setStock] = useState<InventoryStock[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Cargar datos iniciales
  useEffect(() => {
    loadInventoryData();
    integrateWithChecklist();
  }, [userLocation]);

  const loadInventoryData = useCallback(() => {
    const locationStock = getStockByLocation(userLocation);
    const locationAlerts = getActiveAlertsByLocation(userLocation);
    
    setStock(locationStock);
    setAlerts(locationAlerts);
    setLastUpdate(new Date().toISOString());
    
    console.log(`📊 Datos de inventario cargados para ${userLocation}:`);
    console.log(`   - ${locationStock.length} artículos en stock`);
    console.log(`   - ${locationAlerts.length} alertas activas`);
  }, [userLocation]);

  // Procesar incidencia del check-list
  const handleChecklistIncident = useCallback(async (incident: ChecklistIncident) => {
    setIsProcessing(true);
    
    try {
      console.log(`📋 Procesando incidencia: ${incident.itemName} (${incident.quantity} unidades)`);
      
      const result = await processChecklistIncident(
        incident.itemName,
        incident.quantity,
        userLocation,
        incident.reason,
        incident.reportedBy
      );

      if (result.success) {
        // Recargar datos después del procesamiento
        loadInventoryData();
        
        if (result.alert) {
          // Mostrar notificación de alerta generada
          showAlertNotification(result.alert);
        }
        
        return { success: true, message: 'Incidencia procesada correctamente' };
      } else {
        console.error('❌ Error procesando incidencia:', result.error);
        return { success: false, message: result.error || 'Error desconocido' };
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      return { success: false, message: 'Error interno del sistema' };
    } finally {
      setIsProcessing(false);
    }
  }, [userLocation, loadInventoryData]);

  // Mostrar notificación de alerta
  const showAlertNotification = (alert: InventoryAlert) => {
    // En una implementación real, esto podría ser un toast notification
    console.log(`🔔 NOTIFICACIÓN: ${alert.message}`);
    
    // Simular notificación visual
    if (typeof window !== 'undefined') {
      const message = alert.severity === 'critical' 
        ? `🚨 STOCK CRÍTICO: ${alert.message}`
        : `⚠️ STOCK BAJO: ${alert.message}`;
      
      // En lugar de alert, en producción usarías una librería como react-toastify
      setTimeout(() => {
        if (await ui.confirm(`${message}\n\n¿Quieres crear un pedido automáticamente?`)) {
          createAutomaticOrderHandler(alert);
        }
      }, 1000);
    }
  };

  // Crear pedido automático cuando hay stock bajo
  const createAutomaticOrderHandler = async (alert: InventoryAlert) => {
    console.log(`📦 Creando pedido automático para: ${alert.itemId}`);
    
    try {
      const result = await createAutomaticOrder(
        alert.itemId,
        'central', // Siempre pedimos al almacén central
        userLocation,
        alert.minStock! * 2, // Pedir el doble del mínimo
        userEmail,
        `Stock crítico: ${alert.currentStock} unidades (mínimo: ${alert.minStock})`
      );

      if (result.success && result.order) {
        console.log(`✅ Pedido automático creado: ${result.order.orderNumber}`);
        
        // Mostrar confirmación al usuario
        if (typeof window !== 'undefined') {
          window.ui.success(`✅ Pedido automático creado exitosamente!\n\nPedido: ${result.order.orderNumber}\nTotal: €${result.order.totalAmount.toFixed(2)}\n\nEl equipo de logística ha sido notificado.`);
        }
      } else {
        console.error('❌ Error creando pedido automático:', result.error);
        if (typeof window !== 'undefined') {
          window.ui.error(`❌ Error creando pedido automático: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Error inesperado creando pedido:', error);
    }
  };

  // Obtener estadísticas del inventario
  const getInventoryStats = useCallback(() => {
    const totalItems = stock.length;
    const lowStockItems = stock.filter(s => s.currentStock <= s.minStock).length;
    const outOfStockItems = stock.filter(s => s.currentStock === 0).length;
    const totalValue = stock.reduce((sum, s) => {
      // Necesitaríamos el precio del artículo aquí
      return sum + (s.currentStock * 15); // Precio promedio estimado
    }, 0);

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      lastUpdate
    };
  }, [stock, alerts, lastUpdate]);

  // Función para refrescar datos manualmente
  const refreshData = useCallback(() => {
    loadInventoryData();
  }, [loadInventoryData]);

  return {
    // Datos
    stock,
    alerts,
    stats: getInventoryStats(),
    
    // Estados
    isProcessing,
    lastUpdate,
    
    // Funciones
    handleChecklistIncident,
    refreshData,
    
    // Utilidades
    getStockByItem: (itemName: string) => 
      stock.find(s => s.itemId === itemName), // Necesitaríamos mapear por nombre
    
    hasLowStock: (itemId: string) => {
      const itemStock = stock.find(s => s.itemId === itemId);
      return itemStock ? itemStock.currentStock <= itemStock.minStock : false;
    },
    
    getMovementHistory: () => getMovementHistory(userLocation)
  };
};
