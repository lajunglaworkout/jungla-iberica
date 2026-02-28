// src/components/logistics/LogisticsOrdersTab.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { ui } from '../../utils/ui';
import SmartOrderGenerator from './SmartOrderGenerator';
import UniformRequestsPanel from './UniformRequestsPanel';
import { type Order, type LogisticsUser } from './LogisticsTypes';

interface OrderStats {
  pendingOrders: number;
  sentOrders: number;
  pendingAmount: number;
}

interface Props {
  ordersSubTab: 'smart' | 'manual' | 'review';
  setOrdersSubTab: (tab: 'smart' | 'manual' | 'review') => void;
  filteredOrders: Order[];
  orders: Order[];
  selectedCenterForInventory: number | 'all';
  currentUser: LogisticsUser;
  getOrderStats: () => OrderStats;
  onMarkOrderSent: (orderId: string) => void;
  onPrintOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onShowNewOrderModal: () => void;
  onShowOrderDetail: (order: Order) => void;
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = { delivered: '✅ Entregado', sent: '🚚 Enviado', processing: '🔄 En Proceso', pending: '⏳ Pendiente', cancelled: '❌ Cancelado' };
  return map[status] || '❓';
};

const statusColors = (status: string): { bg: string; color: string } => {
  const map: Record<string, { bg: string; color: string }> = { delivered: { bg: '#dcfce7', color: '#166534' }, sent: { bg: '#dbeafe', color: '#1e40af' }, pending: { bg: '#fef3c7', color: '#92400e' }, cancelled: { bg: '#fee2e2', color: '#dc2626' } };
  return map[status] || { bg: '#f3f4f6', color: '#6b7280' };
};

export const LogisticsOrdersTab: React.FC<Props> = ({
  ordersSubTab, setOrdersSubTab, filteredOrders, orders, selectedCenterForInventory,
  currentUser, getOrderStats, onMarkOrderSent, onPrintOrder, onDeleteOrder, onShowNewOrderModal, onShowOrderDetail,
}) => {
  void currentUser; // used for permission checks if needed

  const stats = getOrderStats();

  return (
    <div>
      {/* Sub-tab navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        {([
          { key: 'smart' as const, label: '🤖 Pedidos Inteligentes' },
          { key: 'manual' as const, label: '✋ Pedidos Manuales' },
          { key: 'review' as const, label: '📋 Post-Revisión' },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setOrdersSubTab(tab.key)}
            style={{ padding: '10px 20px', backgroundColor: ordersSubTab === tab.key ? '#059669' : 'transparent', color: ordersSubTab === tab.key ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: ordersSubTab === tab.key ? 700 : 500, fontSize: '0.875rem', whiteSpace: 'nowrap' as const }}>
            {tab.label}
          </button>
        ))}
      </div>

      {ordersSubTab === 'smart' && <SmartOrderGenerator initialCenterId={selectedCenterForInventory} />}

      {ordersSubTab === 'manual' && (
        <div>
          <div style={{ marginBottom: '2rem' }}><UniformRequestsPanel /></div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem' }}>
            {/* Stats */}
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
              <button onClick={onShowNewOrderModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                <Plus size={16} /> Nuevo Pedido
              </button>
            </div>

            {/* Orders table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr 80px', padding: '1rem', backgroundColor: '#f9fafb', fontWeight: '600', fontSize: '0.875rem', borderBottom: '2px solid #e5e7eb' }}>
              <div>Nº Pedido</div><div>Tipo</div><div>De → Para</div><div>Fecha</div><div>Entrega</div><div>Importe</div><div>Estado</div><div>Acciones</div>
            </div>

            {filteredOrders.filter(o => o.type !== 'review_order').map(order => {
              const sc = statusColors(order.status);
              return (
                <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr 80px', padding: '1rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => onShowOrderDetail(order)}>
                  <div><div style={{ fontWeight: '600' }}>{order.id}</div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.items.length} artículo(s)</div></div>
                  <div><span style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', backgroundColor: order.type === 'center_to_brand' ? '#e0f2fe' : '#f3e8ff', color: order.type === 'center_to_brand' ? '#0277bd' : '#7c3aed' }}>{order.type === 'center_to_brand' ? '📥 C→M' : '📤 M→P'}</span></div>
                  <div><div style={{ fontSize: '0.875rem' }}>{order.from}</div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>→ {order.to}</div></div>
                  <div>{new Date(order.date).toLocaleDateString('es-ES')}</div>
                  <div>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('es-ES') : '-'}</div>
                  <div style={{ fontWeight: '600', color: '#059669' }}>€{order.amount.toFixed(2)}</div>
                  <div><span style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', backgroundColor: sc.bg, color: sc.color }}>{statusLabel(order.status)}</span></div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <button onClick={async (e) => { e.stopPropagation(); if (await ui.confirm(`¿Eliminar pedido "${order.id}"?`)) onDeleteOrder(order.id); }}
                      style={{ padding: '4px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {ordersSubTab === 'review' && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>📋 Pedidos Post-Revisión</h2>
          {orders.filter(o => o.type === 'review_order').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>No hay pedidos post-revisión</p>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>Los pedidos se generarán automáticamente al procesar revisiones trimestrales</p>
            </div>
          ) : (() => {
            const reviewOrders = orders.filter(o => o.type === 'review_order');
            const byCenter: Record<string, Order[]> = {};
            reviewOrders.forEach(o => { const c = o.from || 'Sin centro'; if (!byCenter[c]) byCenter[c] = []; byCenter[c].push(o); });
            return Object.entries(byCenter).map(([center, centerOrders]) => (
              <div key={center} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>🏢 {center}</h3>
                {centerOrders.map(order => (
                  <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem', backgroundColor: '#fafbfc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ fontWeight: '700' }}>{order.id}</div><div style={{ fontSize: '0.8rem', color: '#6b7280' }}>📅 {new Date(order.date).toLocaleDateString('es-ES')}</div></div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {order.status === 'pending' && <button onClick={() => onMarkOrderSent(order.id)} style={{ padding: '4px 8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🚚 Marcar enviado</button>}
                        <button onClick={() => onPrintOrder(order)} style={{ padding: '4px 8px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🖨️ PDF</button>
                        <button onClick={async () => { if (await ui.confirm(`¿Eliminar pedido "${order.id}"?`)) onDeleteOrder(order.id); }} style={{ padding: '4px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    </div>
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
