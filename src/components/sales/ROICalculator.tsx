import React, { useState, useEffect } from 'react';
import { Calculator, Building2, Users, Euro, TrendingUp, Save, Download } from 'lucide-react';

interface ROICalculatorProps {
  projectName?: string;
}

interface ProjectData {
  // Datos básicos del proyecto
  nombre: string;
  ubicacion: string;
  metrosCuadrados: number;
  alquilerMensual: number;
  
  // Datos demográficos
  poblacionInfluencia: number;
  penetracionMercado: number; // %
  
  // Costes calculados automáticamente
  costeMateriales: number;
  costeBanos: number;
  costeManoObra: number;
  costeEquipamiento: number;
  
  // Otros costes
  costeFormacion: number;
  gastosLicencias: number;
  gastosMarketing: number;
  
  // Ingresos
  cuotaPromedio: number;
  sociosObjetivo: number;
  
  // Participaciones
  inversionTotal: number;
  participacionesVendidas: number; // %
}

const ROICalculator: React.FC<ROICalculatorProps> = ({ projectName = "Nuevo Proyecto" }) => {
  const [data, setData] = useState<ProjectData>({
    nombre: projectName,
    ubicacion: '',
    metrosCuadrados: 500,
    alquilerMensual: 0,
    poblacionInfluencia: 0,
    penetracionMercado: 0.275, // Base Sevilla
    costeMateriales: 0,
    costeBanos: 20000,
    costeManoObra: 0,
    costeEquipamiento: 0,
    costeFormacion: 5000,
    gastosLicencias: 8000,
    gastosMarketing: 15000,
    cuotaPromedio: 39.90,
    sociosObjetivo: 0,
    inversionTotal: 0,
    participacionesVendidas: 0
  });

  // Cálculos automáticos basados en tus parámetros
  useEffect(() => {
    const metros = data.metrosCuadrados;
    
    // Costes automáticos basados en m²
    const costeMateriales = metros * 90; // €90/m²
    const costeManoObra = metros * 80; // €80/m²
    const costeEquipamiento = metros * 80; // €80/m²
    
    // Capacidad máxima (70% área útil para entrenamiento)
    const areaEntrenamiento = metros * 0.7;
    const capacidadMaxima = Math.floor(areaEntrenamiento * 1.57); // 1.57 socios/m²
    
    // Socios objetivo basado en penetración de mercado
    const sociosObjetivo = data.poblacionInfluencia > 0 
      ? Math.min(Math.floor(data.poblacionInfluencia * (data.penetracionMercado / 100)), capacidadMaxima)
      : capacidadMaxima;
    
    // Inversión total
    const inversionTotal = costeMateriales + data.costeBanos + costeManoObra + costeEquipamiento + 
                          data.costeFormacion + data.gastosLicencias + data.gastosMarketing;
    
    setData(prev => ({
      ...prev,
      costeMateriales,
      costeManoObra,
      costeEquipamiento,
      sociosObjetivo,
      inversionTotal
    }));
  }, [data.metrosCuadrados, data.poblacionInfluencia, data.penetracionMercado, data.costeBanos, data.costeFormacion, data.gastosLicencias, data.gastosMarketing]);

  // Cálculos de rentabilidad
  const ingresosAnuales = data.sociosObjetivo * data.cuotaPromedio * 12;
  const gastosAnuales = data.alquilerMensual * 12 + (data.inversionTotal * 0.1); // 10% depreciación
  const beneficioAnual = ingresosAnuales - gastosAnuales;
  const roi = data.inversionTotal > 0 ? (beneficioAnual / data.inversionTotal) * 100 : 0;
  const payback = beneficioAnual > 0 ? data.inversionTotal / beneficioAnual : 0;

  const handleInputChange = (field: keyof ProjectData, value: number | string) => {
    setData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value)
    }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', minWidth: '1100px' }}>
      {/* Datos del Proyecto */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #3b82f6' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 style={{ width: '20px', height: '20px' }} />
          Datos del Proyecto
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Nombre del Proyecto
            </label>
            <input
              type="text"
              value={data.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Ubicación
            </label>
            <input
              type="text"
              value={data.ubicacion}
              onChange={(e) => handleInputChange('ubicacion', e.target.value)}
              placeholder="Ciudad, Código Postal"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Metros Cuadrados
            </label>
            <input
              type="number"
              value={data.metrosCuadrados}
              onChange={(e) => handleInputChange('metrosCuadrados', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              Área entrenamiento: {Math.floor(data.metrosCuadrados * 0.7)}m² | Servicios: {Math.floor(data.metrosCuadrados * 0.3)}m²
            </div>
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Alquiler Mensual (€)
            </label>
            <input
              type="number"
              value={data.alquilerMensual}
              onChange={(e) => handleInputChange('alquilerMensual', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Población Área Influencia
            </label>
            <input
              type="number"
              value={data.poblacionInfluencia}
              onChange={(e) => handleInputChange('poblacionInfluencia', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Penetración Mercado (%)
            </label>
            <input
              type="number"
              step="0.001"
              value={data.penetracionMercado}
              onChange={(e) => handleInputChange('penetracionMercado', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              Referencia Sevilla: 0.275%
            </div>
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Cuota Promedio (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={data.cuotaPromedio}
              onChange={(e) => handleInputChange('cuotaPromedio', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
        </div>
      </div>

      {/* Costes de Inversión */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #ef4444' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Euro style={{ width: '20px', height: '20px' }} />
          Costes de Inversión
        </h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Costes automáticos */}
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#dc2626' }}>Costes Automáticos</div>
            
            <div style={{ display: 'grid', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Materiales ({data.metrosCuadrados}m² × €90):</span>
                <span style={{ fontWeight: '500' }}>€{data.costeMateriales.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mano de obra ({data.metrosCuadrados}m² × €80):</span>
                <span style={{ fontWeight: '500' }}>€{data.costeManoObra.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Equipamiento ({data.metrosCuadrados}m² × €80):</span>
                <span style={{ fontWeight: '500' }}>€{data.costeEquipamiento.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Costes fijos y variables */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Baños y Vestuarios (€)
            </label>
            <input
              type="number"
              value={data.costeBanos}
              onChange={(e) => handleInputChange('costeBanos', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Formación Empleados (€)
            </label>
            <input
              type="number"
              value={data.costeFormacion}
              onChange={(e) => handleInputChange('costeFormacion', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Licencias y Permisos (€)
            </label>
            <input
              type="number"
              value={data.gastosLicencias}
              onChange={(e) => handleInputChange('gastosLicencias', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Marketing Inicial (€)
            </label>
            <input
              type="number"
              value={data.gastosMarketing}
              onChange={(e) => handleInputChange('gastosMarketing', parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          {/* Total inversión */}
          <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '2px solid #ef4444', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>INVERSIÓN TOTAL:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                €{data.inversionTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de Rentabilidad */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #10b981' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp style={{ width: '20px', height: '20px' }} />
          Análisis de Rentabilidad
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Capacidad y socios */}
          <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#047857' }}>Capacidad del Centro</div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Capacidad máxima:</span>
                <span style={{ fontWeight: '500' }}>{Math.floor(data.metrosCuadrados * 0.7 * 1.57)} socios</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Socios objetivo:</span>
                <span style={{ fontWeight: '500', color: '#059669' }}>{data.sociosObjetivo} socios</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ocupación:</span>
                <span style={{ fontWeight: '500' }}>
                  {data.metrosCuadrados > 0 ? ((data.sociosObjetivo / (data.metrosCuadrados * 0.7 * 1.57)) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Ingresos y gastos */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
              <span style={{ fontSize: '12px', color: '#1e40af' }}>Ingresos anuales:</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e40af' }}>€{ingresosAnuales.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
              <span style={{ fontSize: '12px', color: '#dc2626' }}>Gastos anuales:</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#dc2626' }}>€{gastosAnuales.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: beneficioAnual >= 0 ? '#ecfdf5' : '#fef2f2', borderRadius: '6px' }}>
              <span style={{ fontSize: '12px', color: beneficioAnual >= 0 ? '#047857' : '#dc2626' }}>Beneficio anual:</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: beneficioAnual >= 0 ? '#047857' : '#dc2626' }}>
                €{beneficioAnual.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Métricas clave */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: roi >= 15 ? '#059669' : roi >= 10 ? '#f59e0b' : '#ef4444' }}>
                {roi.toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>ROI Anual</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: payback <= 5 ? '#059669' : payback <= 8 ? '#f59e0b' : '#ef4444' }}>
                {payback > 0 ? payback.toFixed(1) : '∞'}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Años Payback</div>
            </div>
          </div>
          
          {/* Participaciones */}
          <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Gestión de Participaciones</div>
            
            <div>
              <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                Participaciones vendidas (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={data.participacionesVendidas}
                onChange={(e) => handleInputChange('participacionesVendidas', parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>
            
            <div style={{ marginTop: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Capital recaudado:</span>
                <span style={{ fontWeight: '500', color: '#059669' }}>
                  €{((data.inversionTotal * data.participacionesVendidas) / 100).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pendiente de vender:</span>
                <span style={{ fontWeight: '500', color: '#ef4444' }}>
                  €{((data.inversionTotal * (100 - data.participacionesVendidas)) / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '4px',
              padding: '8px', 
              backgroundColor: '#059669', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              <Save style={{ width: '14px', height: '14px' }} />
              Guardar
            </button>
            
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '4px',
              padding: '8px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              <Download style={{ width: '14px', height: '14px' }} />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
