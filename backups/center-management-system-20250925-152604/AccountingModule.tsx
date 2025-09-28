import React, { useState } from 'react';
import { ArrowLeft, Calculator, Euro, TrendingUp, TrendingDown, Save, Download } from 'lucide-react';

interface AccountingModuleProps {
  centerName: string;
  centerId: string;
  onBack: () => void;
}

interface FinancialData {
  numeroQuotas: number;
  importeQuotaPromedio: number;
  iva: number;
  entrenamiento_personal: number;
  fisioterapia: number;
  nutricion: number;
  vending: number;
  alquiler: number;
  suministros: number;
  nominas: number;
  seguridad_social: number;
  marketing: number;
  mantenimiento: number;
  otros_gastos: number;
  mes: number;
  año: number;
}

const AccountingModule: React.FC<AccountingModuleProps> = ({ centerName, centerId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'entrada' | 'reportes'>('entrada');
  const [data, setData] = useState<FinancialData>({
    numeroQuotas: 0, importeQuotaPromedio: 0, iva: 0, entrenamiento_personal: 0,
    fisioterapia: 0, nutricion: 0, vending: 0, alquiler: 0, suministros: 0,
    nominas: 0, seguridad_social: 0, marketing: 0, mantenimiento: 0, otros_gastos: 0,
    mes: new Date().getMonth() + 1, año: new Date().getFullYear()
  });

  const totalIngresos = (data.numeroQuotas * data.importeQuotaPromedio) + data.iva + 
    data.entrenamiento_personal + data.fisioterapia + data.nutricion + data.vending;
  const totalGastos = data.alquiler + data.suministros + data.nominas + data.seguridad_social + 
    data.marketing + data.mantenimiento + data.otros_gastos;
  const beneficioNeto = totalIngresos - totalGastos;
  const margen = totalIngresos > 0 ? (beneficioNeto / totalIngresos) * 100 : 0;

  const handleChange = (field: keyof FinancialData, value: string) => {
    setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    localStorage.setItem(`accounting_${centerId}`, JSON.stringify(data));
    alert('Datos guardados correctamente');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>💰 Contabilidad - {centerName}</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gestión financiera mensual</p>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <button onClick={() => setActiveTab('entrada')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'entrada' ? '#059669' : '#f3f4f6', color: activeTab === 'entrada' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            📝 Entrada de Datos
          </button>
          <button onClick={() => setActiveTab('reportes')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'reportes' ? '#059669' : '#f3f4f6', color: activeTab === 'reportes' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            📊 Reportes
          </button>
        </div>

        {activeTab === 'entrada' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            {/* Ingresos */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #10b981' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp style={{ width: '20px', height: '20px' }} />
                Ingresos
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Nº Cuotas</label>
                  <input type="number" value={data.numeroQuotas} onChange={(e) => handleChange('numeroQuotas', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Cuota Promedio (€)</label>
                  <input type="number" step="0.01" value={data.importeQuotaPromedio} onChange={(e) => handleChange('importeQuotaPromedio', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>IVA (€)</label>
                  <input type="number" step="0.01" value={data.iva} onChange={(e) => handleChange('iva', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Entrenamiento Personal (€)</label>
                  <input type="number" step="0.01" value={data.entrenamiento_personal} onChange={(e) => handleChange('entrenamiento_personal', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Fisioterapia (€)</label>
                  <input type="number" step="0.01" value={data.fisioterapia} onChange={(e) => handleChange('fisioterapia', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Nutrición (€)</label>
                  <input type="number" step="0.01" value={data.nutricion} onChange={(e) => handleChange('nutricion', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Vending (€)</label>
                  <input type="number" step="0.01" value={data.vending} onChange={(e) => handleChange('vending', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
              </div>
            </div>

            {/* Gastos */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #ef4444' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown style={{ width: '20px', height: '20px' }} />
                Gastos
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Alquiler (€)</label>
                  <input type="number" step="0.01" value={data.alquiler} onChange={(e) => handleChange('alquiler', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Suministros (€)</label>
                  <input type="number" step="0.01" value={data.suministros} onChange={(e) => handleChange('suministros', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Nóminas (€)</label>
                  <input type="number" step="0.01" value={data.nominas} onChange={(e) => handleChange('nominas', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Seguridad Social (€)</label>
                  <input type="number" step="0.01" value={data.seguridad_social} onChange={(e) => handleChange('seguridad_social', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Marketing (€)</label>
                  <input type="number" step="0.01" value={data.marketing} onChange={(e) => handleChange('marketing', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Mantenimiento (€)</label>
                  <input type="number" step="0.01" value={data.mantenimiento} onChange={(e) => handleChange('mantenimiento', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Otros Gastos (€)</label>
                  <input type="number" step="0.01" value={data.otros_gastos} onChange={(e) => handleChange('otros_gastos', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator style={{ width: '20px', height: '20px' }} />
                Resumen Financiero
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: '14px', color: '#166534', margin: '0 0 4px 0' }}>Total Ingresos</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>€{totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: '14px', color: '#991b1b', margin: '0 0 4px 0' }}>Total Gastos</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>€{totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: beneficioNeto >= 0 ? '#eff6ff' : '#fef2f2', borderRadius: '8px', border: `1px solid ${beneficioNeto >= 0 ? '#bfdbfe' : '#fecaca'}` }}>
                  <p style={{ fontSize: '14px', color: beneficioNeto >= 0 ? '#1e40af' : '#991b1b', margin: '0 0 4px 0' }}>Beneficio Neto</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: beneficioNeto >= 0 ? '#2563eb' : '#dc2626', margin: 0 }}>€{beneficioNeto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px 0' }}>Margen Beneficio</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b', margin: 0 }}>{margen.toFixed(1)}%</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fde047' }}>
                  <p style={{ fontSize: '14px', color: '#a16207', margin: '0 0 4px 0' }}>Cuota Promedio</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ca8a04', margin: 0 }}>€{data.importeQuotaPromedio.toFixed(2)}</p>
                </div>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button onClick={handleSave} style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save style={{ width: '16px', height: '16px' }} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '48px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>📊 Reportes Avanzados</h2>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Los reportes detallados estarán disponibles próximamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountingModule;
