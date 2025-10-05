import React, { useState, useEffect } from 'react';
import { Package, BarChart3, ShoppingCart, Settings, Building, Activity, FileText } from 'lucide-react';
import InventoryKPIDashboard from './logistics/InventoryKPIDashboard';
import RealInventoryTable from './logistics/RealInventoryTable';
import QuarterlyReviewSystem from './logistics/QuarterlyReviewSystem';

const LogisticsManagementSystemFixed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('kpis');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedCenterForInventory, setSelectedCenterForInventory] = useState<number | 'all'>('all');

  // Usuario actual simulado
  const currentUser = {
    name: 'Benito Morales',
    role: 'logistics_director' as const,
    permissions: {
      canViewReports: true,
      canManageInventory: true,
      canCreateOrders: true,
      canProcessOrders: true,
      canManageSuppliers: true,
      canManageTools: true
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
        padding: '2rem', 
        borderRadius: '0 0 24px 24px', 
        marginBottom: '2rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Package size={32} style={{ color: 'white' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0 }}>
              Centro Logístico
            </h1>
          </div>
          <div style={{ color: 'white', textAlign: 'right' }}>
            <div style={{ fontWeight: '600' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>📊 Director de Logística</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 2rem' }}>
        {/* Navegación por pestañas */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
          {[
            { id: 'kpis', label: '📊 KPIs Real Time', icon: Activity },
            { id: 'inventory', label: '📦 Inventario', icon: Package },
            { id: 'quarterly', label: '📋 Revisión Trimestral', icon: FileText },
            { id: 'orders', label: '🛒 Pedidos', icon: ShoppingCart },
            { id: 'tools', label: '🔧 Herramientas', icon: Settings },
            { id: 'suppliers', label: '🏪 Proveedores', icon: Building }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#059669' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de las pestañas */}
        
        {/* Pestaña KPIs Real Time */}
        {activeTab === 'kpis' && (
          <InventoryKPIDashboard />
        )}

        {/* Pestaña Inventario */}
        {activeTab === 'inventory' && (
          <div>
            {/* Filtro por centro */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#374151' }}>Filtrar por centro:</span>
              {[
                { id: 'all', name: 'Todos los Centros' },
                { id: 9, name: '🏪 Sevilla' },
                { id: 10, name: '🏪 Jerez' },
                { id: 11, name: '🏪 Puerto' }
              ].map(center => (
                <button
                  key={center.id}
                  onClick={() => setSelectedCenterForInventory(center.id as number | 'all')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedCenterForInventory === center.id ? '#059669' : '#f3f4f6',
                    color: selectedCenterForInventory === center.id ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {center.name}
                </button>
              ))}
            </div>
            <RealInventoryTable selectedCenter={selectedCenterForInventory} />
          </div>
        )}

        {/* Pestaña Revisión Trimestral */}
        {activeTab === 'quarterly' && (
          <QuarterlyReviewSystem />
        )}

        {/* Otras pestañas - contenido básico */}
        {activeTab === 'orders' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#374151' }}>🛒 Gestión de Pedidos</h3>
              <button style={{
                padding: '10px 16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                + Nuevo Pedido
              </button>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <select style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                <option>Todos los estados</option>
                <option>⏳ Pendiente</option>
                <option>🚚 Enviado</option>
                <option>✅ Entregado</option>
                <option>❌ Cancelado</option>
              </select>
              <select style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                <option>Todos los tipos</option>
                <option>📥 Centro → Marca</option>
                <option>📤 Marca → Proveedor</option>
              </select>
            </div>

            {/* Tabla de pedidos */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Nº Pedido</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>De → Para</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Importe</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'PED-2025-001', type: '📤 M→P', from: 'La Jungla', to: 'Textiles SL', date: '15/01/2025', amount: '€465.00', status: '🚚 Enviado' },
                    { id: 'REQ-2025-001', type: '📥 C→M', from: 'Centro Sevilla', to: 'La Jungla', date: '16/01/2025', amount: '€250.00', status: '⏳ Pendiente' },
                    { id: 'PED-2025-002', type: '📤 M→P', from: 'La Jungla', to: 'FitEquip', date: '14/01/2025', amount: '€875.00', status: '✅ Entregado' }
                  ].map(order => (
                    <tr key={order.id}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontWeight: '600' }}>{order.id}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: order.type.includes('M→P') ? '#dbeafe' : '#dcfce7',
                          color: order.type.includes('M→P') ? '#1e40af' : '#166534'
                        }}>
                          {order.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{order.from} → {order.to}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{order.date}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontWeight: '600' }}>{order.amount}</td>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '2rem', 
            textAlign: 'center' 
          }}>
            <Settings size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Gestión de Herramientas</h3>
            <p style={{ color: '#6b7280' }}>Funcionalidad en desarrollo</p>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '2rem', 
            textAlign: 'center' 
          }}>
            <Building size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Gestión de Proveedores</h3>
            <p style={{ color: '#6b7280' }}>Funcionalidad en desarrollo</p>
          </div>
        )}

        {/* Modal de Revisión Trimestral */}
        {showReviewModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '80%',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#059669' }}>📋 Revisión Trimestral Q{Math.ceil((new Date().getMonth() + 1) / 3)} {new Date().getFullYear()}</h2>
                <button onClick={() => setShowReviewModal(false)} style={{
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  ✕
                </button>
              </div>
              
              <div style={{ 
                backgroundColor: '#f0f9ff', 
                border: '1px solid #0ea5e9', 
                borderRadius: '8px', 
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <Package size={48} style={{ color: '#0ea5e9', marginBottom: '1rem' }} />
                <h3 style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>Modal de Revisión en Desarrollo</h3>
                <p style={{ color: '#075985', marginBottom: '1rem' }}>
                  Próximamente: Interfaz completa para que Beni revise el inventario por centro, 
                  actualice cantidades manualmente y clasifique cada item por estado.
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '1rem',
                  marginTop: '1.5rem'
                }}>
                  <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#059669' }}>🏪 Por Centro</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Sevilla, Jerez, Puerto</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#059669' }}>📝 Actualización Manual</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Stock real por item</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#059669' }}>🔄 Estados</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Uso/Deteriorado/Roto</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsManagementSystemFixed;
