import React, { useState } from 'react';
import { Package, BarChart3, ShoppingCart, Settings, Building, Activity } from 'lucide-react';
import InventoryKPIDashboard from './logistics/InventoryKPIDashboard';
import RealInventoryTable from './logistics/RealInventoryTable';

const LogisticsManagementSystemFixed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('kpis');

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
          <RealInventoryTable />
        )}

        {/* Otras pestañas - contenido básico */}
        {activeTab === 'orders' && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '2rem', 
            textAlign: 'center' 
          }}>
            <ShoppingCart size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Módulo de Pedidos</h3>
            <p style={{ color: '#6b7280' }}>Funcionalidad en desarrollo</p>
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
      </div>
    </div>
  );
};

export default LogisticsManagementSystemFixed;
