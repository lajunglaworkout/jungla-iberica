import React from 'react';
import { Bell } from 'lucide-react';
import { InventoryItem, Order, Tool, ToolLocation, Notification } from './types';

interface ReportsTabProps {
  inventoryItems: InventoryItem[];
  orders: Order[];
  tools: Tool[];
  toolLocations: ToolLocation[];
  notifications: Notification[];
  setShowNotifications: (v: boolean) => void;
  getUnreadNotifications: () => Notification[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  inventoryItems,
  orders,
  tools,
  toolLocations,
  notifications,
  setShowNotifications,
  getUnreadNotifications,
}) => {
  const getInventoryMetrics = () => {
    const totalProducts = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.purchase_price * item.quantity), 0);
    const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = inventoryItems.filter(item => item.status === 'out_of_stock').length;

    const byCenter = inventoryItems.reduce((acc, item) => {
      if (!acc[item.center]) {
        acc[item.center] = { count: 0, value: 0 };
      }
      acc[item.center].count += 1;
      acc[item.center].value += item.purchase_price * item.quantity;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return { totalProducts, totalValue, lowStockItems, outOfStockItems, byCenter };
  };

  const getOrdersMetrics = () => {
    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, order) => {
      const orderTotal = order.items?.reduce((itemSum, item) => itemSum + (item.quantity * item.unit_price), 0) || 0;
      return sum + orderTotal;
    }, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = orders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalOrders, totalValue, pendingOrders, completedOrders, byStatus, byType };
  };

  const getToolsMetrics = () => {
    const totalTools = tools.length;
    const totalValue = tools.reduce((sum, tool) => sum + tool.purchase_price, 0);
    const availableTools = tools.filter(tool => tool.status === 'available').length;
    const inUseTools = tools.filter(tool => tool.status === 'in_use').length;
    const lostTools = tools.filter(tool => tool.status === 'lost').length;

    const byLocation = tools.reduce((acc, tool) => {
      const locationName = toolLocations.find(loc => loc.id === tool.current_location)?.name || 'Desconocida';
      acc[locationName] = (acc[locationName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = tools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalTools, totalValue, availableTools, inUseTools, lostTools, byLocation, byCategory };
  };

  const inventoryMetrics = getInventoryMetrics();
  const ordersMetrics = getOrdersMetrics();
  const toolsMetrics = getToolsMetrics();
  const unreadNotifications = getUnreadNotifications();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>📊 Reportes y Análisis</h1>

        {unreadNotifications.length > 0 && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Bell size={20} style={{ color: '#dc2626' }} />
              <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1rem' }}>
                {unreadNotifications.length} Notificación{unreadNotifications.length > 1 ? 'es' : ''} Pendiente{unreadNotifications.length > 1 ? 's' : ''}
              </h3>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '0.75rem' }}>
              {unreadNotifications.filter(n => n.priority === 'high').length > 0 &&
                `${unreadNotifications.filter(n => n.priority === 'high').length} crítica${unreadNotifications.filter(n => n.priority === 'high').length > 1 ? 's' : ''}`
              }
            </div>
            <button
              onClick={() => setShowNotifications(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Ver Notificaciones
            </button>
          </div>
        )}
      </div>

      {/* Métricas Principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2563eb' }}>📦 Inventario</h3>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{inventoryMetrics.totalProducts}</div>
          <div style={{ color: '#6b7280' }}>Productos totales</div>
          <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: '600' }}>
            €{inventoryMetrics.totalValue.toLocaleString('es-ES')}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#d97706' }}>🛒 Pedidos</h3>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{ordersMetrics.totalOrders}</div>
          <div style={{ color: '#6b7280' }}>Pedidos totales</div>
          <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: '600' }}>
            €{ordersMetrics.totalValue.toLocaleString('es-ES')}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#7c3aed' }}>🔧 Herramientas</h3>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{toolsMetrics.totalTools}</div>
          <div style={{ color: '#6b7280' }}>Herramientas totales</div>
          <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: '600' }}>
            €{toolsMetrics.totalValue.toLocaleString('es-ES')}
          </div>
        </div>
      </div>

      {/* Reportes Detallados */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>📍 Inventario por Centro</h3>
          {Object.entries(inventoryMetrics.byCenter).map(([center, data]) => (
            <div key={center} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span>{center === 'central' ? '🏢 Central' : `🏪 ${center}`}</span>
              <span>{data.count} productos - €{data.value.toFixed(0)}</span>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🔧 Herramientas por Ubicación</h3>
          {Object.entries(toolsMetrics.byLocation).map(([location, count]) => (
            <div key={location} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span>{location}</span>
              <span>{count} herramientas</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas y Estados */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>⚠️ Alertas de Stock</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#dc2626' }}>❌ Sin Stock</span>
              <span style={{ fontWeight: '600' }}>{inventoryMetrics.outOfStockItems} productos</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#d97706' }}>⚠️ Stock Bajo</span>
              <span style={{ fontWeight: '600' }}>{inventoryMetrics.lowStockItems} productos</span>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Productos que requieren reposición inmediata
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#7c3aed' }}>📊 Estado de Pedidos</h3>
          <div style={{ marginBottom: '1rem' }}>
            {Object.entries(ordersMetrics.byStatus).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span>
                  {status === 'pending' ? '⏳ Pendiente' :
                    status === 'processing' ? '🔄 En Proceso' :
                      status === 'sent' ? '🚚 Enviado' :
                        status === 'delivered' ? '✅ Entregado' :
                          status === 'cancelled' ? '❌ Cancelado' : status}
                </span>
                <span style={{ fontWeight: '600' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
