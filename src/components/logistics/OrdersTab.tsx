import React from 'react';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Order, InventoryItem } from './types';
import { ui } from '../../utils/ui';
import SmartOrderGenerator from './SmartOrderGenerator';
import UniformRequestsPanel from './UniformRequestsPanel';

interface OrdersTabProps {
  ordersSubTab: 'smart' | 'manual' | 'review';
  setOrdersSubTab: (tab: 'smart' | 'manual' | 'review') => void;
  orders: Order[];
  filteredOrders: Order[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  selectedCenterForInventory: number | 'all';
  onDeleteOrder: (orderId: string) => void;
  onMarkOrderSent: (orderId: string) => void;
  onPrintOrder: (order: Order) => void;
  onOrderClick: (order: Order) => void;
  setShowNewOrderModal: (v: boolean) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({
  ordersSubTab,
  setOrdersSubTab,
  orders,
  filteredOrders,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  selectedCenterForInventory,
  onDeleteOrder,
  onMarkOrderSent,
  onPrintOrder,
  onOrderClick,
  setShowNewOrderModal,
}) => {
  const getOrderStats = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const sentOrders = orders.filter(order => order.status === 'sent').length;
    const pendingAmount = orders
      .filter(order => order.status === 'pending' && order.type === 'center_to_brand')
      .reduce((sum, order) => sum + order.amount, 0);
    return { pendingOrders, sentOrders, pendingAmount };
  };

  const stats = getOrderStats();

  return (
    <div>
      {/* Sub-pestañas de Pedidos */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        {[
          { key: 'smart' as const, label: '🤖 Pedidos Inteligentes', desc: 'Stock bajo mínimos' },
          { key: 'manual' as const, label: '✋ Pedidos Manuales', desc: 'Uniformes y material' },
          { key: 'review' as const, label: '📋 Post-Revisión', desc: 'Revisiones trimestrales' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setOrdersSubTab(tab.key)}
            style={{
              padding: '10px 20px',
              backgroundColor: ordersSubTab === tab.key ? '#059669' : 'transparent',
              color: ordersSubTab === tab.key ? 'white' : '#4b5563',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: ordersSubTab === tab.key ? '700' : '500',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB: PEDIDOS INTELIGENTES */}
      {ordersSubTab === 'smart' && (
        <SmartOrderGenerator initialCenterId={selectedCenterForInventory} />
      )}

      {/* SUB-TAB: PEDIDOS MANUALES */}
      {ordersSubTab === 'manual' && (
        <div>
          {/* Panel de Solicitudes de Uniformes */}
          <div style={{ marginBottom: '2rem' }}>
            <UniformRequestsPanel />
          </div>

          {/* Panel de Pedidos Tradicionales */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem' }}>
            {/* Resumen de Pedidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#fef3c7', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>{stats.pendingOrders}</div>
                <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>⏳ Pedidos Pendientes</div>
              </div>
              <div style={{ backgroundColor: '#dbeafe', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>{stats.sentOrders}</div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>🚚 Pedidos Enviados</div>
              </div>
              <div style={{ backgroundColor: '#dcfce7', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534' }}>€{stats.pendingAmount.toFixed(2)}</div>
                <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '600' }}>💰 Pendiente de Cobro</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Gestión de Pedidos</h2>
              <button
                onClick={() => setShowNewOrderModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={16} />
                Nuevo Pedido
              </button>
            </div>

            {/* Filtros de Pedidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">⏳ Pendiente</option>
                <option value="processing">🔄 En Proceso</option>
                <option value="sent">🚚 Enviado</option>
                <option value="delivered">✅ Entregado</option>
                <option value="cancelled">❌ Cancelado</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="all">Todos los tipos</option>
                <option value="center_to_brand">📥 Centro → Marca</option>
                <option value="brand_to_supplier">📤 Marca → Proveedor</option>
              </select>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr 80px',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              fontWeight: '600',
              fontSize: '0.875rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div>Nº Pedido</div>
              <div>Tipo</div>
              <div>De → Para</div>
              <div>Fecha</div>
              <div>Entrega</div>
              <div>Importe</div>
              <div>Estado</div>
              <div>Acciones</div>
            </div>

            {filteredOrders.filter((o: Order) => o.type !== 'review_order').map((order: Order) => (
              <div
                key={order.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr 80px',
                  padding: '1rem',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>{order.id}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.items.length} artículo(s)</div>
                </div>
                <div>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    backgroundColor: order.type === 'center_to_brand' ? '#e0f2fe' : '#f3e8ff',
                    color: order.type === 'center_to_brand' ? '#0277bd' : '#7c3aed'
                  }}>
                    {order.type === 'center_to_brand' ? '📥 C→M' : '📤 M→P'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem' }}>{order.from}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>→ {order.to}</div>
                </div>
                <div>{new Date(order.date).toLocaleDateString('es-ES')}</div>
                <div>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('es-ES') : '-'}</div>
                <div style={{ fontWeight: '600', color: '#059669' }}>€{order.amount.toFixed(2)}</div>
                <div>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    backgroundColor: order.status === 'delivered' ? '#dcfce7' :
                      order.status === 'sent' ? '#dbeafe' :
                        order.status === 'processing' ? '#e0f2fe' :
                          order.status === 'pending' ? '#fef3c7' :
                            order.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                    color: order.status === 'delivered' ? '#166534' :
                      order.status === 'sent' ? '#1e40af' :
                        order.status === 'processing' ? '#0277bd' :
                          order.status === 'pending' ? '#92400e' :
                            order.status === 'cancelled' ? '#dc2626' : '#6b7280'
                  }}>
                    {order.status === 'delivered' ? '✅ Entregado' :
                      order.status === 'sent' ? '🚚 Enviado' :
                        order.status === 'processing' ? '🔄 En Proceso' :
                          order.status === 'pending' ? '⏳ Pendiente' :
                            order.status === 'cancelled' ? '❌ Cancelado' : '❓ Desconocido'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const confirmDelete = await ui.confirm(
                        `¿Estás seguro de que quieres eliminar el pedido "${order.id}"?\n\nEsta acción no se puede deshacer.`
                      );
                      if (confirmDelete) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    style={{
                      padding: '4px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Eliminar pedido"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: PEDIDOS POST-REVISIÓN */}
      {ordersSubTab === 'review' && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>📋 Pedidos Post-Revisión</h2>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Pedidos generados automáticamente tras revisiones trimestrales, agrupados por centro</p>
            </div>
          </div>

          {(() => {
            const reviewOrders = orders.filter((o: Order) => o.type === 'review_order');
            if (reviewOrders.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#9ca3af',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '2px dashed #e5e7eb'
                }}>
                  <ShoppingCart size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>No hay pedidos post-revisión</p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>Los pedidos se generarán automáticamente al procesar revisiones trimestrales con items que necesiten reposición</p>
                </div>
              );
            }

            const byCenter: Record<string, Order[]> = {};
            reviewOrders.forEach((order: Order) => {
              const center = order.from || 'Sin centro';
              if (!byCenter[center]) byCenter[center] = [];
              byCenter[center].push(order);
            });

            return Object.entries(byCenter).map(([center, centerOrders]) => (
              <div key={center} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏢 {center}
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0277bd', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>
                    {centerOrders.length} pedido(s)
                  </span>
                </h3>

                {centerOrders.map((order: Order) => (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '0.75rem',
                      backgroundColor: '#fafbfc',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1f2937' }}>{order.id}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                          📅 {new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {order.created_by && <span> · 👤 {order.created_by}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: order.status === 'delivered' ? '#dcfce7' :
                            order.status === 'sent' ? '#dbeafe' :
                              order.status === 'pending' ? '#fef3c7' :
                                order.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                          color: order.status === 'delivered' ? '#166534' :
                            order.status === 'sent' ? '#1e40af' :
                              order.status === 'pending' ? '#92400e' :
                                order.status === 'cancelled' ? '#dc2626' : '#6b7280'
                        }}>
                          {order.status === 'delivered' ? '✅ Entregado' :
                            order.status === 'sent' ? '🚚 Enviado' :
                              order.status === 'pending' ? '⏳ Pendiente' :
                                order.status === 'cancelled' ? '❌ Cancelado' : order.status}
                        </span>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => onMarkOrderSent(order.id)}
                            style={{ padding: '4px 8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
                            title="Marcar como enviado al proveedor"
                          >
                            🚚 Marcar enviado
                          </button>
                        )}
                        <button
                          onClick={() => onPrintOrder(order)}
                          style={{ padding: '4px 8px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
                          title="Imprimir / Generar PDF"
                        >
                          🖨️ PDF
                        </button>
                        <button
                          onClick={async () => {
                            if (await ui.confirm(`¿Eliminar pedido "${order.id}"?`)) onDeleteOrder(order.id);
                          }}
                          style={{ padding: '4px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Eliminar pedido"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {order.notes && (
                      <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.6', borderLeft: '3px solid #059669' }}>
                        {order.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
