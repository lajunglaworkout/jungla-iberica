import React, { useState } from 'react';
import { ShoppingCart, Plus, Clock, CheckCircle, Truck } from 'lucide-react';
import { InternalOrder, OrderStatus, LocationType } from '../../types/logistics';
import { getLocationName } from '../../config/logistics';

interface OrderManagementProps {
  userLocation?: LocationType;
  canCreateOrders?: boolean;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  userLocation = 'sevilla',
  canCreateOrders = true
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const mockOrders: InternalOrder[] = [
    {
      id: 'order-001',
      orderNumber: 'PED-2025-001',
      fromLocation: 'central',
      toLocation: 'sevilla',
      status: 'pendiente',
      requestedBy: 'francisco.giraldez@lajungla.com',
      requestedAt: '2025-01-20T10:30:00Z',
      items: [],
      totalAmount: 102.50,
      notes: 'Pedido urgente - stock bajo en gomas elásticas',
      paymentStatus: 'pendiente'
    }
  ];

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente': return <Clock size={16} style={{ color: '#d97706' }} />;
      case 'procesando': return <Truck size={16} style={{ color: '#0ea5e9' }} />;
      case 'entregado': return <CheckCircle size={16} style={{ color: '#059669' }} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold' }}>
          Gestión de Pedidos
        </h1>
        {canCreateOrders && (
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <Plus size={16} />
            Nuevo Pedido
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          {[
            { key: 'pending', label: 'Pendientes' },
            { key: 'completed', label: 'Completados' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab.key ? '2px solid #059669' : '2px solid transparent',
                color: activeTab === tab.key ? '#059669' : '#6b7280',
                fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de pedidos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockOrders.map(order => (
          <div key={order.id} style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                    {order.orderNumber}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {getStatusIcon(order.status)}
                    <span style={{ fontSize: '0.875rem', color: '#d97706', textTransform: 'capitalize' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  De: <strong>{getLocationName(order.fromLocation)}</strong> → 
                  A: <strong>{getLocationName(order.toLocation)}</strong>
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>
                €{order.totalAmount.toFixed(2)}
              </div>
            </div>
            {order.notes && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem' }}>
                {order.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
