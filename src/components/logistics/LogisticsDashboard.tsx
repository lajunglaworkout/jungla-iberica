import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { LocationType, LogisticsDashboardMetrics } from '../../types/logistics';
import { getLocationName } from '../../config/logistics';
import { InventoryChecklistIntegration } from './InventoryChecklistIntegration';
import { DeliveryNoteManagement } from './DeliveryNoteManagement';
import { SupplierDirectory } from './SupplierDirectory';

interface LogisticsDashboardProps {
  userLocation?: LocationType;
  userEmail?: string;
}

export const LogisticsDashboard: React.FC<LogisticsDashboardProps> = ({
  userLocation = 'central',
  userEmail = 'francisco.giraldez@lajungla.com'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'checklist' | 'delivery' | 'suppliers'>('overview');

  const mockMetrics: LogisticsDashboardMetrics = {
    totalItems: 156,
    totalValue: 45230.50,
    lowStockAlerts: 8,
    pendingOrders: 3,
    pendingPayments: 2,
    recentMovements: 24,
    efficiency: {
      deliveryTime: 2.3,
      orderFulfillment: 94.5,
      stockAccuracy: 98.2
    },
    topMovingItems: [
      { itemId: 'item-001', itemName: 'Goma Elástica 3cm', movements: 15, value: 127.50 }
    ],
    locationMetrics: {
      central: { totalItems: 89, totalValue: 28450.00, alerts: 2, lastUpdate: '2025-01-20T14:30:00Z' },
      sevilla: { totalItems: 34, totalValue: 8920.50, alerts: 4, lastUpdate: '2025-01-20T14:25:00Z' },
      jerez: { totalItems: 18, totalValue: 4560.00, alerts: 1, lastUpdate: '2025-01-20T14:20:00Z' },
      puerto: { totalItems: 15, totalValue: 3300.00, alerts: 1, lastUpdate: '2025-01-20T14:15:00Z' }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header moderno */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        padding: '2rem',
        borderRadius: '0 0 24px 24px',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px rgba(5, 150, 105, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.75rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <Package size={28} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2.25rem', 
              fontWeight: '700', 
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Centro Logístico
            </h1>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
              {getLocationName(userLocation)} • Gestión Inteligente de Inventario
            </p>
          </div>
        </div>
        
        {/* Métricas rápidas en header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '1rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Total Artículos
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
              {mockMetrics.totalItems}
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '1rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Valor Total
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
              €{mockMetrics.totalValue.toLocaleString()}
            </div>
          </div>
          <div style={{
            backgroundColor: mockMetrics.lowStockAlerts > 0 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(255, 255, 255, 0.15)',
            padding: '1rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${mockMetrics.lowStockAlerts > 0 ? 'rgba(248, 113, 113, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Alertas Activas
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
              {mockMetrics.lowStockAlerts}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs modernos */}
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          backgroundColor: 'white',
          padding: '0.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          overflowX: 'auto'
        }}>
          {[
            { key: 'overview', label: 'Resumen', icon: '📊' },
            { key: 'inventory', label: 'Inventario', icon: '📦' },
            { key: 'orders', label: 'Pedidos', icon: '🛒' },
            { key: 'checklist', label: 'Check-list', icon: '✅' },
            { key: 'delivery', label: 'Albaranes', icon: '📄' },
            { key: 'suppliers', label: 'Proveedores', icon: '🏪' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'overview' | 'inventory' | 'orders' | 'checklist' | 'delivery' | 'suppliers')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#059669' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#6b7280',
                fontWeight: activeTab === tab.key ? '600' : '500',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 2rem' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Métricas principales */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem', 
              borderRadius: '20px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  backgroundColor: '#dcfce7',
                  padding: '0.75rem',
                  borderRadius: '12px'
                }}>
                  <BarChart3 size={24} style={{ color: '#059669' }} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                  Métricas Principales
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#059669', marginBottom: '0.25rem' }}>
                    {mockMetrics.totalItems}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Total Artículos</div>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#059669', marginBottom: '0.25rem' }}>
                    €{(mockMetrics.totalValue / 1000).toFixed(0)}K
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Valor Total</div>
                </div>
              </div>
            </div>

            {/* Alertas */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem', 
              borderRadius: '20px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fef7f7 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  backgroundColor: '#fee2e2',
                  padding: '0.75rem',
                  borderRadius: '12px'
                }}>
                  <AlertTriangle size={24} style={{ color: '#dc2626' }} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                  Alertas Activas
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  border: '1px solid #fde68a'
                }}>
                  <span style={{ fontWeight: '500', color: '#92400e' }}>Stock bajo</span>
                  <span style={{ 
                    backgroundColor: '#d97706', 
                    color: 'white', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {mockMetrics.lowStockAlerts}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#dbeafe',
                  borderRadius: '12px',
                  border: '1px solid #93c5fd'
                }}>
                  <span style={{ fontWeight: '500', color: '#1e40af' }}>Pedidos pendientes</span>
                  <span style={{ 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {mockMetrics.pendingOrders}
                  </span>
                </div>
              </div>
            </div>

            {/* Eficiencia */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem', 
              borderRadius: '20px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  backgroundColor: '#dbeafe',
                  padding: '0.75rem',
                  borderRadius: '12px'
                }}>
                  <TrendingUp size={24} style={{ color: '#2563eb' }} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                  Eficiencia
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginBottom: '0.25rem' }}>
                    {mockMetrics.efficiency.deliveryTime}d
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Tiempo Entrega</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb', marginBottom: '0.25rem' }}>
                    {mockMetrics.efficiency.orderFulfillment}%
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Cumplimiento</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'inventory' && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Gestión de Inventario</h3>
          <p style={{ color: '#6b7280' }}>Funcionalidad en desarrollo...</p>
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>Gestión de Pedidos</h3>
          <p style={{ color: '#6b7280' }}>Funcionalidad en desarrollo...</p>
        </div>
      )}

      {activeTab === 'checklist' && (
        <InventoryChecklistIntegration 
          userLocation={userLocation}
          userEmail={userEmail}
        />
      )}

      {activeTab === 'delivery' && (
        <DeliveryNoteManagement 
          userLocation={userLocation}
          userRole={userLocation === 'central' ? 'admin' : 'manager'}
        />
      )}

      {activeTab === 'suppliers' && (
        <SupplierDirectory 
          userLocation={userLocation}
          canEdit={userLocation === 'central'}
        />
      )}
    </div>
  );
};
