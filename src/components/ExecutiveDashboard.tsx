// src/components/ExecutiveDashboard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  Activity, Building2, Target, Award, Loader2,
  Calendar, Clock, BarChart3, PieChart
} from 'lucide-react';

interface DashboardMetrics {
  facturacionMensual: number;
  facturacionAnual: number;
  nuevasAltas: number;
  bajas: number;
  ocupacionMedia: number;
  centrosOperativos: number;
  empleadosActivos: number;
  satisfaccionCliente: number;
}

const ExecutiveDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    facturacionMensual: 45000,
    facturacionAnual: 540000,
    nuevasAltas: 23,
    bajas: 5,
    ocupacionMedia: 78,
    centrosOperativos: 5,
    empleadosActivos: 32,
    satisfaccionCliente: 4.5
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Por ahora usamos datos de ejemplo
      // Cuando tengas las tablas creadas, aquí cargarías los datos reales
      
      // Ejemplo de cómo sería con datos reales:
      /*
      const { data: centros } = await supabase
        .from('centros')
        .select('count')
        .eq('activo', true);
      
      const { data: empleados } = await supabase
        .from('employees')
        .select('count')
        .eq('activo', true);
      */
      
      // Simulamos un delay de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px' 
      }}>
        <Loader2 style={{ 
          height: '48px', 
          width: '48px', 
          animation: 'spin 1s linear infinite',
          color: '#3b82f6' 
        }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header con mensaje de bienvenida */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Dashboard Ejecutivo
        </h1>
        <p style={{ opacity: 0.9 }}>
          Resumen de métricas clave - {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* KPIs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <KPICard
          title="Facturación Mensual"
          value={`€${metrics.facturacionMensual.toLocaleString('es-ES')}`}
          change={12.5}
          icon={<DollarSign />}
          color="#10b981"
        />
        <KPICard
          title="Nuevas Altas"
          value={metrics.nuevasAltas}
          subtitle="Este mes"
          change={8.3}
          icon={<Users />}
          color="#3b82f6"
        />
        <KPICard
          title="Ocupación Media"
          value={`${metrics.ocupacionMedia}%`}
          subtitle="Todos los centros"
          change={-2.1}
          icon={<Activity />}
          color="#f59e0b"
        />
        <KPICard
          title="Satisfacción Cliente"
          value={`${metrics.satisfaccionCliente}/5`}
          subtitle="⭐⭐⭐⭐⭐"
          change={0.3}
          icon={<Award />}
          color="#8b5cf6"
        />
      </div>

      {/* Gráficos simulados */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Gráfico de Facturación */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <BarChart3 style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Evolución Facturación (Últimos 6 meses)
            </h3>
          </div>
          
          {/* Gráfico simulado con divs */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
            {[35000, 38000, 42000, 41000, 43500, 45000].map((value, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  borderRadius: '4px 4px 0 0',
                  height: `${(value / 45000) * 100}%`,
                  minHeight: '20px',
                  transition: 'height 0.3s ease'
                }} />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  {['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Centros */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Building2 style={{ height: '24px', width: '24px', color: '#10b981' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Rendimiento por Centro
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Sevilla', value: 85, color: '#10b981' },
              { name: 'Jerez', value: 78, color: '#3b82f6' },
              { name: 'Puerto', value: 72, color: '#f59e0b' }
            ].map((centro, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{centro.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{centro.value}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${centro.value}%`,
                    height: '100%',
                    backgroundColor: centro.color,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente KPI Card - CORREGIDO
const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subtitle, change, icon, color }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{title}</p>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{value}</p>
        {subtitle && (
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{subtitle}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
          {change > 0 ? (
            <TrendingUp style={{ height: '16px', width: '16px', color: '#10b981' }} />
          ) : (
            <TrendingDown style={{ height: '16px', width: '16px', color: '#ef4444' }} />
          )}
          <span style={{ 
            fontSize: '14px', 
            color: change > 0 ? '#10b981' : '#ef4444',
            fontWeight: '500'
          }}>
            {Math.abs(change)}%
          </span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>vs mes anterior</span>
        </div>
      </div>
      <div style={{
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: `${color}20`,
        color: color
      }}>
        {icon}
      </div>
    </div>
  </div>
);

export default ExecutiveDashboard;