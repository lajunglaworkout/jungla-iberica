import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserPlus, UserMinus, Target, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { clientsService, type ClientMetrics as SupabaseClientMetrics } from '../../services/clientsService';

interface ClientsModuleProps {
  centerName: string;
  centerId: string;
  onBack: () => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const ClientsModule: React.FC<ClientsModuleProps> = ({ centerName, centerId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<SupabaseClientMetrics>({
    center_id: centerId,
    center_name: centerName,
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    objetivo_mensual: 0,
    altas_reales: 0,
    bajas_reales: 0,
    clientes_activos: 0,
    leads: 0,
    clientes_contabilidad: 0,
    facturacion_total: 0
  });

  // Cargar datos desde Supabase
  useEffect(() => {
    loadClientMetrics();
  }, [centerId, metrics.mes, metrics.año]);

  const loadClientMetrics = async () => {
    setLoading(true);
    const data = await clientsService.getClientMetrics(centerId, centerName, metrics.mes, metrics.año);
    setMetrics(data);
    setLoading(false);
  };

  const handleChange = (field: keyof SupabaseClientMetrics, value: string) => {
    setMetrics(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const cumplimiento = metrics.objetivo_mensual > 0 ? (metrics.altas_reales / metrics.objetivo_mensual) * 100 : 0;
  const conversion = metrics.leads > 0 ? (metrics.altas_reales / metrics.leads) * 100 : 0;
  const crecimiento = metrics.altas_reales - metrics.bajas_reales;

  const handleSave = async () => {
    setLoading(true);
    const success = await clientsService.saveClientMetrics(metrics);
    setLoading(false);
    
    if (success) {
      alert('Datos guardados correctamente en Supabase');
    } else {
      alert('Error al guardar los datos');
    }
  };

  const syncFromAccounting = async () => {
    setLoading(true);
    console.log('Iniciando sincronización desde contabilidad...');
    
    // Buscar datos sincronizados desde contabilidad
    const syncData = localStorage.getItem(`clients_sync_${centerId}`);
    console.log('Datos encontrados en localStorage:', syncData);
    
    if (syncData) {
      try {
        const accountingData = JSON.parse(syncData);
        console.log('Datos parseados:', accountingData);
        console.log('Comparando fechas:', { 
          contabilidad: { mes: accountingData.mes, año: accountingData.año },
          clientes: { mes: metrics.mes, año: metrics.año }
        });
        
        if (accountingData.mes === metrics.mes && accountingData.año === metrics.año) {
          const updatedMetrics = {
            ...metrics,
            clientes_contabilidad: accountingData.totalClientes,
            facturacion_total: accountingData.facturacionTotal || 0
          };
          
          console.log('Actualizando métricas:', updatedMetrics);
          setMetrics(updatedMetrics);
          
          // También guardar en Supabase
          try {
            await clientsService.saveClientMetrics(updatedMetrics);
            console.log('Datos guardados en Supabase exitosamente');
          } catch (error) {
            console.error('Error guardando en Supabase:', error);
          }
          
          alert(`✅ Sincronizado: ${accountingData.totalClientes} clientes y €${(accountingData.facturacionTotal || 0).toLocaleString('es-ES')} de facturación desde contabilidad`);
        } else {
          alert(`❌ No hay datos de contabilidad para ${metrics.mes}/${metrics.año}. Datos disponibles para ${accountingData.mes}/${accountingData.año}`);
        }
      } catch (error) {
        console.error('Error parseando datos:', error);
        alert('❌ Error al procesar los datos de sincronización');
      }
    } else {
      alert('❌ No hay datos de contabilidad para sincronizar. Asegúrate de guardar datos en el módulo de contabilidad primero.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>👥 Gestión de Clientes - {centerName}</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Métricas y sincronización con contabilidad</p>
        </div>
        
        {/* Selector de Mes Global */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />
            <select 
              value={`${metrics.año}-${metrics.mes.toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [año, mes] = e.target.value.split('-');
                setMetrics(prev => ({ 
                  ...prev, 
                  año: parseInt(año), 
                  mes: parseInt(mes) 
                }));
              }}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {MESES.map((nombreMes, index) => (
                <option key={`${metrics.año}-${index + 1}`} value={`${metrics.año}-${(index + 1).toString().padStart(2, '0')}`}>
                  {nombreMes} {metrics.año}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={syncFromAccounting}
            disabled={loading}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#059669', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Sincronizar
          </button>
          
          <button 
            onClick={async () => {
              setLoading(true);
              const syncData = localStorage.getItem(`clients_sync_${centerId}`);
              if (syncData) {
                try {
                  const accountingData = JSON.parse(syncData);
                  console.log('🔄 FORZAR - Datos completos:', accountingData);
                  
                  const updatedMetrics = {
                    ...metrics,
                    clientes_contabilidad: accountingData.totalClientes,
                    facturacion_total: accountingData.facturacionTotal || 0
                  };
                  
                  console.log('🔄 FORZAR - Métricas actualizadas:', updatedMetrics);
                  setMetrics(updatedMetrics);
                  
                  const saveResult = await clientsService.saveClientMetrics(updatedMetrics);
                  console.log('🔄 FORZAR - Resultado guardado:', saveResult);
                  
                  // Forzar recarga de datos desde Supabase
                  await loadClientMetrics();
                  
                  alert(`🔄 Forzado: ${accountingData.totalClientes} clientes y €${(accountingData.facturacionTotal || 0).toLocaleString('es-ES')} sincronizados`);
                } catch (error) {
                  console.error('Error en forzar:', error);
                  alert('❌ Error en sincronización forzada');
                }
              } else {
                alert('❌ No hay datos para sincronizar');
              }
              setLoading(false);
            }}
            disabled={loading}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            🔄 Forzar
          </button>
          
          <button 
            onClick={() => {
              const syncData = localStorage.getItem(`clients_sync_${centerId}`);
              console.log('🔍 DEBUG - localStorage key:', `clients_sync_${centerId}`);
              console.log('🔍 DEBUG - Raw data:', syncData);
              console.log('🔍 DEBUG - Current metrics:', metrics);
              if (syncData) {
                const parsed = JSON.parse(syncData);
                console.log('🔍 DEBUG - Parsed data:', parsed);
                alert(`Debug: ${parsed.totalClientes} clientes, facturación: ${parsed.facturacionTotal || 'NO DEFINIDA'}`);
              } else {
                alert('Debug: No hay datos en localStorage');
              }
            }}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#6b7280', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            🔍 Debug
          </button>
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
                <input type="number" value={metrics.objetivo_mensual} onChange={(e) => handleChange('objetivo_mensual', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Altas Reales</label>
                <input type="number" value={metrics.altas_reales} onChange={(e) => handleChange('altas_reales', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Bajas</label>
                <input type="number" value={metrics.bajas_reales} onChange={(e) => handleChange('bajas_reales', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Leads</label>
                <input type="number" value={metrics.leads} onChange={(e) => handleChange('leads', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Clientes Activos</label>
                <input type="number" value={metrics.clientes_activos} onChange={(e) => handleChange('clientes_activos', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
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

        {/* Datos Sincronizados desde Contabilidad */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '24px', border: '2px solid #059669' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw style={{ width: '20px', height: '20px' }} />
            Datos Sincronizados desde Contabilidad
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
              <p style={{ fontSize: '14px', color: '#065f46', margin: '0 0 4px 0', fontWeight: '500' }}>👥 Clientes desde Contabilidad</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669', margin: 0 }}>{metrics.clientes_contabilidad || 0}</p>
              <p style={{ fontSize: '12px', color: '#047857', margin: '4px 0 0 0' }}>
                {metrics.mes}/{metrics.año} • Sincronizado automáticamente
              </p>
            </div>
            
            <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
              <p style={{ fontSize: '14px', color: '#1e40af', margin: '0 0 4px 0', fontWeight: '500' }}>💰 Facturación Total</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>€{(metrics.facturacion_total || 0).toLocaleString('es-ES')}</p>
              <p style={{ fontSize: '12px', color: '#1d4ed8', margin: '4px 0 0 0' }}>
                Desde módulo de contabilidad
              </p>
            </div>
          </div>
          
          {(!metrics.clientes_contabilidad || metrics.clientes_contabilidad === 0) && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
              <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                ⚠️ No hay datos sincronizados. Usa el botón "Sincronizar" para obtener datos del módulo de contabilidad.
              </p>
            </div>
          )}
        </div>

        {/* KPIs Visuales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <UserPlus style={{ width: '32px', height: '32px', color: '#10b981', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.altas_reales}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Altas</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <UserMinus style={{ width: '32px', height: '32px', color: '#ef4444', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.bajas_reales}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Bajas</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <Users style={{ width: '32px', height: '32px', color: '#3b82f6', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.clientes_activos}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Activos</p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <Target style={{ width: '32px', height: '32px', color: '#8b5cf6', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{metrics.objetivo_mensual}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Objetivo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsModule;
