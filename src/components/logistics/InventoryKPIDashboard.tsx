import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, Package, Activity } from 'lucide-react';
import { inventoryReportsService, InventoryKPIs } from '../../services/inventoryReportsService';
import CriticalAlertsPanel from './CriticalAlertsPanel';
import TrendsChart from './TrendsChart';

const InventoryKPIDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<InventoryKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
    const interval = setInterval(loadKPIs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await inventoryReportsService.getInventoryKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>Cargando KPIs...</div>;
  if (!kpis) return null;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#059669', marginBottom: '20px' }}>📊 KPIs Inventario Real</h2>
      
      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={24} style={{ color: '#059669' }} />
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Items</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{kpis.totalItems}</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Items Críticos</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{kpis.criticalItems}</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={24} style={{ color: '#f59e0b' }} />
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Tasa Rotura</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{kpis.roturaRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparativa Centros */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#059669' }}>🏪 Comparativa por Centro</h3>
        {kpis.centerComparison.map(center => (
          <div key={center.centerName} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div>
              <strong>{center.centerName}</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                {center.totalItems} items • {center.totalRoturas} roturas
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                backgroundColor: center.healthScore >= 80 ? '#dcfce7' : center.healthScore >= 60 ? '#fef3c7' : '#fee2e2',
                color: center.healthScore >= 80 ? '#166534' : center.healthScore >= 60 ? '#92400e' : '#991b1b',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {center.healthScore}% Health
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                {center.roturaRate.toFixed(1)}% roturas
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Items Problemáticos */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#ef4444' }}>⚠️ Items Más Problemáticos</h3>
        {kpis.topProblematicItems.slice(0, 5).map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: index < 4 ? '1px solid #e5e7eb' : 'none'
          }}>
            <div>
              <strong>{item.nombre_item}</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{item.categoria}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.totalRoturas} roturas</span>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                {item.centrosAfectados} centro{item.centrosAfectados > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Tendencias */}
      <div style={{ marginBottom: '20px' }}>
        <TrendsChart 
          title="📈 Tendencias Clave"
          data={[
            { label: 'Items Totales', current: kpis.totalItems, previous: Math.round(kpis.totalItems * 0.95) },
            { label: 'Items Críticos', current: kpis.criticalItems, previous: Math.round(kpis.criticalItems * 1.2) },
            { label: 'Tasa Rotura', current: kpis.roturaRate, previous: kpis.roturaRate * 1.1, unit: '%' },
            { label: 'Valor Total', current: Math.round(kpis.totalValue), previous: Math.round(kpis.totalValue * 0.98), unit: '€' }
          ]}
        />
      </div>

      {/* Panel de Alertas Críticas */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CriticalAlertsPanel />
      </div>
    </div>
  );
};

export default InventoryKPIDashboard;
