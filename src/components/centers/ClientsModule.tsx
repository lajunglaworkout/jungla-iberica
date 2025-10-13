import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, UserPlus, UserMinus, Target, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { clientsService, type ClientMetrics as SupabaseClientMetrics } from '../../services/clientsService';
import CancellationAnalysis from './CancellationAnalysis';

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
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [modoEntrada, setModoEntrada] = useState<'manual' | 'automatico'>('manual');
  const [metrics, setMetrics] = useState<SupabaseClientMetrics>({
    center_id: centerId,
    center_name: centerName,
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    objetivo_mensual: 0,
    altas_reales: 0,
    // 🆕 Inicializar nuevos campos desglosados
    altas_fundador: 0,
    altas_normal: 0,
    altas_bonos: 0,
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

  // Evitar actualizaciones innecesarias
  const handleCancellationMetricsChange = useCallback((cancellationMetrics: any) => {
    setMetrics(prev => ({
      ...prev,
      bajas_reales: cancellationMetrics.total_bajas
    }));
  }, []);

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

    try {
      // Verificar si hay datos manuales introducidos
      const hasManualData = (metrics.altas_fundador || 0) > 0 ||
                           (metrics.altas_normal || 0) > 0 ||
                           (metrics.altas_bonos || 0) > 0;

      const dataToSave = {
        center_id: metrics.center_id,
        center_name: metrics.center_name,
        mes: metrics.mes,
        año: metrics.año,
        objetivo_mensual: metrics.objetivo_mensual || 0,

        // Si hay datos manuales, usar esos
        // Si no, intentar sincronizar desde contabilidad
        altas_fundador: metrics.altas_fundador || 0,
        altas_normal: metrics.altas_normal || 0,
        altas_bonos: metrics.altas_bonos || 0,

        bajas_reales: metrics.bajas_reales || 0,
        clientes_activos: metrics.clientes_activos || 0,
        leads: metrics.leads || 0,

        // Datos desde contabilidad (si existen)
        clientes_contabilidad: metrics.clientes_contabilidad || 0,
        facturacion_total: metrics.facturacion_total || 0
      };

      const success = await clientsService.saveClientMetrics(dataToSave);

      if (success) {
        alert('✅ Datos guardados correctamente');
      } else {
        alert('❌ Error al guardar los datos');
      }
    } catch (error) {
      console.error('Error guardando datos:', error);
      alert('❌ Error al guardar los datos');
    }

    setLoading(false);
  };

  const syncFromAccounting = async () => {
    setLoading(true);
    console.log('Iniciando sincronización desde contabilidad...');

    try {
      // Buscar datos sincronizados desde contabilidad
      const syncData = localStorage.getItem(`clients_sync_${centerId}`);
      console.log('Datos encontrados en localStorage:', syncData);

      if (syncData) {
        const accountingData = JSON.parse(syncData);
        console.log('Datos parseados:', accountingData);
        console.log('Comparando fechas:', {
          contabilidad: { mes: accountingData.mes, año: accountingData.año },
          clientes: { mes: metrics.mes, año: metrics.año }
        });

        if (accountingData.mes === metrics.mes && accountingData.año === metrics.año) {
          // Verificar si ya hay datos manuales en el período actual
          const hasExistingManualData = (metrics.altas_fundador || 0) > 0 ||
                                       (metrics.altas_normal || 0) > 0 ||
                                       (metrics.altas_bonos || 0) > 0;

          if (hasExistingManualData) {
            const confirmOverwrite = window.confirm(
              `⚠️ Ya existen datos manuales para ${MESES[metrics.mes - 1]} ${metrics.año}.\n\n` +
              `Altas Fundador: ${metrics.altas_fundador || 0}\n` +
              `Altas Normal: ${metrics.altas_normal || 0}\n` +
              `Altas Bonos: ${metrics.altas_bonos || 0}\n\n` +
              `¿Deseas SOBREESCRIBIR estos datos con los de contabilidad?`
            );

            if (!confirmOverwrite) {
              setLoading(false);
              return;
            }
          }

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

            const modeText = hasExistingManualData ? 'SOBREESCRITOS' : 'SINCRONIZADOS';
            alert(`✅ Datos ${modeText}: ${accountingData.totalClientes} clientes y €${(accountingData.facturacionTotal || 0).toLocaleString('es-ES')} de facturación desde contabilidad`);
          } catch (error) {
            console.error('Error guardando en Supabase:', error);
          }
        } else {
          alert(`❌ No hay datos de contabilidad para ${MESES[metrics.mes - 1]} ${metrics.año}. Datos disponibles para ${MESES[accountingData.mes - 1]} ${accountingData.año}`);
        }
      } else {
        alert('❌ No hay datos de contabilidad para sincronizar. Asegúrate de guardar datos en el módulo de contabilidad primero.');
      }
    } catch (error) {
      console.error('Error parseando datos:', error);
      alert('❌ Error al procesar los datos de sincronización');
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
        
        {/* Selector de Año y Mes Separados */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />

            {/* Selector de Año */}
            <select
              value={metrics.año}
              onChange={(e) => {
                setMetrics(prev => ({
                  ...prev,
                  año: parseInt(e.target.value)
                }));
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {Array.from({ length: 5 }, (_, yearIndex) => {
                const year = new Date().getFullYear() - 2 + yearIndex; // 2023, 2024, 2025, 2026, 2027
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>

            {/* Selector de Mes */}
            <select
              value={metrics.mes}
              onChange={(e) => {
                setMetrics(prev => ({
                  ...prev,
                  mes: parseInt(e.target.value)
                }));
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {MESES.map((nombreMes, index) => (
                <option key={index + 1} value={index + 1}>
                  {nombreMes}
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
        {/* Toggle de Modo de Entrada */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            ⚙️ Modo de Entrada de Datos
          </h3>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setModoEntrada('manual')}
              style={{
                padding: '12px 24px',
                backgroundColor: modoEntrada === 'manual' ? '#059669' : '#f3f4f6',
                color: modoEntrada === 'manual' ? 'white' : '#6b7280',
                border: '2px solid ' + (modoEntrada === 'manual' ? '#059669' : '#d1d5db'),
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>✍️</span>
              Manual
            </button>

            <button
              onClick={() => setModoEntrada('automatico')}
              style={{
                padding: '12px 24px',
                backgroundColor: modoEntrada === 'automatico' ? '#059669' : '#f3f4f6',
                color: modoEntrada === 'automatico' ? 'white' : '#6b7280',
                border: '2px solid ' + (modoEntrada === 'automatico' ? '#059669' : '#d1d5db'),
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>🔄</span>
              Desde Contabilidad
            </button>
          </div>

          <p style={{
            marginTop: '12px',
            fontSize: '14px',
            color: modoEntrada === 'manual' ? '#059669' : '#6b7280',
            fontWeight: '500'
          }}>
            {modoEntrada === 'manual'
              ? '📝 Modo Manual: Introduce los datos directamente en el formulario'
              : '🔄 Modo Automático: Sincroniza datos desde el módulo de contabilidad'
            }
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Entrada de Datos */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>📊 Datos del Mes</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Objetivo Mensual</label>
                <input type="number" value={metrics.objetivo_mensual} onChange={(e) => handleChange('objetivo_mensual', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>

              {/* 🆕 Sección de Altas Desglosadas */}
              <div style={{
                border: '2px solid #3b82f6',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>
                  📊 Altas por Tipo de Cliente
                </h3>

                {/* Altas Fundador */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    👑 Altas Fundador
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metrics.altas_fundador || 0}
                    onChange={(e) => handleChange('altas_fundador', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                {/* Altas Normal */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    👤 Altas Normal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metrics.altas_normal || 0}
                    onChange={(e) => handleChange('altas_normal', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                {/* Altas Bonos */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    🎁 Altas Bonos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metrics.altas_bonos || 0}
                    onChange={(e) => handleChange('altas_bonos', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                {/* Total calculado (solo lectura y visual) */}
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  border: '1px solid #3b82f6'
                }}>
                  <label style={{ display: 'block', fontWeight: 'bold', color: '#1e40af' }}>
                    ✅ Total Altas (calculado automáticamente)
                  </label>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#3b82f6',
                    marginTop: '5px'
                  }}>
                    {(metrics.altas_fundador || 0) + (metrics.altas_normal || 0) + (metrics.altas_bonos || 0)}
                  </div>
                  <small style={{ color: '#64748b', fontSize: '12px' }}>
                    Este valor se guarda automáticamente en la base de datos
                  </small>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Bajas</label>
                <input 
                  type="number" 
                  value={metrics.bajas_reales} 
                  onChange={(e) => handleChange('bajas_reales', e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#ef4444'
                  }} 
                />
                
                {/* Mostrar el desglose de bajas directamente debajo */}
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Distribución de bajas por tiempo</div>
                  <CancellationAnalysis 
                    centerId={centerId}
                    mes={metrics.mes}
                    año={metrics.año}
                    totalBajas={metrics.bajas_reales}
                    onMetricsChange={handleCancellationMetricsChange}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Leads</label>
                <input 
                  type="number" 
                  value={metrics.leads} 
                  onChange={(e) => handleChange('leads', e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3b82f6'
                  }} 
                />
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

            {/* Desglose por tipo */}
            <div style={{
              marginTop: '15px',
              paddingTop: '15px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>👑 Fundadores:</span>
                <strong>{metrics.altas_fundador || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>👤 Normales:</span>
                <strong>{metrics.altas_normal || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎁 Bonos:</span>
                <strong>{metrics.altas_bonos || 0}</strong>
              </div>
            </div>
          </div>
          
          {/* Tarjeta de Bajas */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '20px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
            textAlign: 'center',
            position: 'relative',
            gridColumn: 'span 1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '180px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <UserMinus style={{ width: '24px', height: '24px', color: '#ef4444' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', margin: 0 }}>Bajas Totales</h3>
            </div>
            <p style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#ef4444', 
              margin: '0 0 12px 0',
              lineHeight: '1.2'
            }}>
              {metrics.bajas_reales}
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#9ca3af', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Calendar style={{ width: '14px', height: '14px' }} />
              {MESES[metrics.mes - 1]} {metrics.año}
            </p>
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
