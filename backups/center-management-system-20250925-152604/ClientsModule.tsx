import React, { useState } from 'react';
import { ArrowLeft, Users, UserPlus, UserMinus, Target, TrendingUp } from 'lucide-react';

interface ClientsModuleProps {
  centerName: string;
  centerId: string;
  onBack: () => void;
}

interface ClientMetrics {
  objetivoMensual: number;
  altasReales: number;
  bajasReales: number;
  clientesActivos: number;
  leads: number;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ centerName, centerId, onBack }) => {
  const [metrics, setMetrics] = useState<ClientMetrics>({
    objetivoMensual: 0,
    altasReales: 0,
    bajasReales: 0,
    clientesActivos: 0,
    leads: 0
  });

  const handleChange = (field: keyof ClientMetrics, value: string) => {
    setMetrics(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const cumplimiento = metrics.objetivoMensual > 0 ? (metrics.altasReales / metrics.objetivoMensual) * 100 : 0;
  const conversion = metrics.leads > 0 ? (metrics.altasReales / metrics.leads) * 100 : 0;
  const crecimiento = metrics.altasReales - metrics.bajasReales;

  const handleSave = () => {
    localStorage.setItem(`clients_${centerId}`, JSON.stringify(metrics));
    alert('Datos guardados correctamente');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>👥 Gestión de Clientes - {centerName}</h1>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Entrada de Datos */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>📊 Datos del Mes</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Objetivo Mensual</label>
                <input type="number" value={metrics.objetivoMensual} onChange={(e) => handleChange('objetivoMensual', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Altas Reales</label>
                <input type="number" value={metrics.altasReales} onChange={(e) => handleChange('altasReales', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Bajas</label>
                <input type="number" value={metrics.bajasReales} onChange={(e) => handleChange('bajasReales', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Leads</label>
                <input type="number" value={metrics.leads} onChange={(e) => handleChange('leads', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Clientes Activos</label>
                <input type="number" value={metrics.clientesActivos} onChange={(e) => handleChange('clientesActivos', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <button onClick={handleSave} style={{ padding: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Guardar</button>
            </div>
          </div>

          {/* Métricas */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>📈 Métricas Clave</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#166534', margin: '0 0 4px 0' }}>Cumplimiento Objetivo</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>{cumplimiento.toFixed(1)}%</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#1e40af', margin: '0 0 4px 0' }}>Conversión Leads</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{conversion.toFixed(1)}%</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#92400e', margin: '0 0 4px 0' }}>Crecimiento Neto</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>{crecimiento >= 0 ? '+' : ''}{crecimiento}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Visuales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <UserPlus style={{ width: '32px', height: '32px', color: '#10b981', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.altasReales}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Altas</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <UserMinus style={{ width: '32px', height: '32px', color: '#ef4444', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.bajasReales}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Bajas</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <Users style={{ width: '32px', height: '32px', color: '#3b82f6', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.clientesActivos}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Activos</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <Target style={{ width: '32px', height: '32px', color: '#8b5cf6', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.objetivoMensual}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Objetivo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsModule;
