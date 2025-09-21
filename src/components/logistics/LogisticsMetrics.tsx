import React from 'react';
import { Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react';
import { LocationType } from '../../types/logistics';
import { useInventoryIntegration } from '../../hooks/useInventoryIntegration';

interface LogisticsMetricsProps {
  userLocation: LocationType;
  userEmail: string;
  compact?: boolean;
}

export const LogisticsMetrics: React.FC<LogisticsMetricsProps> = ({
  userLocation,
  userEmail,
  compact = false
}) => {
  const { stats } = useInventoryIntegration(userLocation, userEmail);

  if (compact) {
    // Versión compacta para el dashboard principal
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Package size={18} style={{ color: '#059669' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            Logística - {userLocation === 'central' ? 'Central' : 'Centro'}
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: '#6b7280' }}>Artículos</div>
            <div style={{ fontWeight: '600', color: '#059669' }}>{stats.totalItems}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280' }}>Stock Bajo</div>
            <div style={{ fontWeight: '600', color: stats.lowStockItems > 0 ? '#dc2626' : '#059669' }}>
              {stats.lowStockItems}
            </div>
          </div>
        </div>

        {stats.criticalAlerts > 0 && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem',
            backgroundColor: '#fef2f2',
            borderRadius: '4px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={14} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
              {stats.criticalAlerts} alertas críticas
            </span>
          </div>
        )}
      </div>
    );
  }

  // Versión completa para el dashboard logístico
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Package size={20} style={{ color: '#059669' }} />
          <span style={{ fontWeight: '600' }}>Total Artículos</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
          {stats.totalItems}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Valor: €{stats.totalValue.toLocaleString()}
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AlertTriangle size={20} style={{ color: '#d97706' }} />
          <span style={{ fontWeight: '600' }}>Stock Bajo</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>
          {stats.lowStockItems}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Requieren reposición
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShoppingCart size={20} style={{ color: '#dc2626' }} />
          <span style={{ fontWeight: '600' }}>Sin Stock</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
          {stats.outOfStockItems}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Pedido urgente
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <TrendingUp size={20} style={{ color: '#0ea5e9' }} />
          <span style={{ fontWeight: '600' }}>Alertas Críticas</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stats.criticalAlerts > 0 ? '#dc2626' : '#059669' }}>
          {stats.criticalAlerts}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Última actualización: {new Date(stats.lastUpdate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
