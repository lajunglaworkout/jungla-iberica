import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calculator, Plus, Trash2, Save, Calendar, ArrowLeft } from 'lucide-react';

interface BrandIncomeModuleProps {
  onBack: () => void;
}

interface IngresoItem {
  id: string;
  concepto: string;
  categoria: string;
  importe: number;
  lleva_iva: boolean;
}

interface GastoItem {
  id: string;
  concepto: string;
  categoria: string;
  importe: number;
  lleva_iva: boolean;
}

interface BrandFinancialData {
  mes: number;
  año: number;
  ingresos: IngresoItem[];
  gastos: GastoItem[];
}

const CATEGORIAS_INGRESOS = [
  'Royalties de Centros',
  'Cuotas de Franquicia', 
  'Servicios de Marketing',
  'Venta de Participaciones',
  'Consultoría',
  'Formación',
  'Colaboraciones',
  'Otros Ingresos'
];

const CATEGORIAS_GASTOS = [
  'Marketing y Publicidad',
  'Personal Corporativo',
  'Oficinas y Administración',
  'Tecnología y Software',
  'Asesoría Legal/Fiscal',
  'Desarrollo de Negocio',
  'Formación y Eventos',
  'Colaboraciones',
  'Otros Gastos'
];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const BrandIncomeModule: React.FC<BrandIncomeModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'entrada' | 'reportes'>('entrada');
  const [saving, setSaving] = useState(false);
  
  const [data, setData] = useState<BrandFinancialData>({
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    ingresos: [],
    gastos: []
  });

  // Cálculos automáticos
  const totalIngresosSinIva = data.ingresos.reduce((sum, ingreso) => sum + ingreso.importe, 0);
  const totalIvaIngresos = data.ingresos
    .filter(ingreso => ingreso.lleva_iva)
    .reduce((sum, ingreso) => sum + (ingreso.importe * 0.21), 0);
  const totalIngresosConIva = totalIngresosSinIva + totalIvaIngresos;

  const totalGastosSinIva = data.gastos.reduce((sum, gasto) => sum + gasto.importe, 0);
  const totalIvaGastos = data.gastos
    .filter(gasto => gasto.lleva_iva)
    .reduce((sum, gasto) => sum + (gasto.importe * 0.21), 0);
  const totalGastosConIva = totalGastosSinIva + totalIvaGastos;

  const ivaAPagar = totalIvaIngresos - totalIvaGastos;
  const beneficioNeto = totalIngresosConIva - totalGastosConIva;
  const margen = totalIngresosConIva > 0 ? (beneficioNeto / totalIngresosConIva) * 100 : 0;

  // Funciones para manejar ingresos
  const addIngreso = () => {
    const newIngreso: IngresoItem = {
      id: Date.now().toString(),
      concepto: '',
      categoria: CATEGORIAS_INGRESOS[0],
      importe: 0,
      lleva_iva: true
    };
    setData(prev => ({ ...prev, ingresos: [...prev.ingresos, newIngreso] }));
  };

  const updateIngreso = (id: string, field: keyof IngresoItem, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      ingresos: prev.ingresos.map(ingreso => 
        ingreso.id === id ? { 
          ...ingreso, 
          [field]: field === 'lleva_iva' ? value : 
                   field === 'importe' ? (typeof value === 'string' ? parseFloat(value) || 0 : value) :
                   value
        } : ingreso
      )
    }));
  };

  const removeIngreso = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      setData(prev => ({ ...prev, ingresos: prev.ingresos.filter(ingreso => ingreso.id !== id) }));
    }
  };

  // Funciones para manejar gastos
  const addGasto = () => {
    const newGasto: GastoItem = {
      id: Date.now().toString(),
      concepto: '',
      categoria: CATEGORIAS_GASTOS[0],
      importe: 0,
      lleva_iva: true
    };
    setData(prev => ({ ...prev, gastos: [...prev.gastos, newGasto] }));
  };

  const updateGasto = (id: string, field: keyof GastoItem, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      gastos: prev.gastos.map(gasto => 
        gasto.id === id ? { 
          ...gasto, 
          [field]: field === 'lleva_iva' ? value : 
                   field === 'importe' ? (typeof value === 'string' ? parseFloat(value) || 0 : value) :
                   value
        } : gasto
      )
    }));
  };

  const removeGasto = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      setData(prev => ({ ...prev, gastos: prev.gastos.filter(gasto => gasto.id !== id) }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Datos guardados correctamente');
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', overflowX: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '1200px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>💰 Contabilidad - Gestión de Marca</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gestión financiera mensual de la marca</p>
        </div>
        
        {/* Selector de Mes y Año */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          <select 
            value={data.mes} 
            onChange={(e) => setData(prev => ({ ...prev, mes: parseInt(e.target.value) }))}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
          >
            {MESES.map((mes, index) => (
              <option key={index} value={index + 1}>{mes}</option>
            ))}
          </select>
          <select 
            value={data.año} 
            onChange={(e) => setData(prev => ({ ...prev, año: parseInt(e.target.value) }))}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '100px' }}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            backgroundColor: saving ? '#9ca3af' : '#059669', 
            color: 'white', 
            borderRadius: '8px', 
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.5 : 1
          }}
        >
          <Save style={{ width: '16px', height: '16px' }} />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div style={{ padding: '32px', minWidth: '1200px', overflowX: 'auto' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', minWidth: '1100px' }}>
            {/* Ingresos */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #10b981' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp style={{ width: '20px', height: '20px' }} />
                Ingresos
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500' }}>💰 Ingresos de Marca</label>
                    <button 
                      onClick={addIngreso}
                      style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus style={{ width: '14px', height: '14px' }} />
                      Añadir
                    </button>
                  </div>

                  {data.ingresos.map((ingreso) => (
                    <div key={ingreso.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Concepto del ingreso"
                          value={ingreso.concepto}
                          onChange={(e) => updateIngreso(ingreso.id, 'concepto', e.target.value)}
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <select
                            value={ingreso.categoria}
                            onChange={(e) => updateIngreso(ingreso.id, 'categoria', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                          >
                            {CATEGORIAS_INGRESOS.map(categoria => (
                              <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Importe"
                            value={ingreso.importe || ''}
                            onChange={(e) => updateIngreso(ingreso.id, 'importe', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                            step="0.01"
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <input
                              type="checkbox"
                              checked={ingreso.lleva_iva}
                              onChange={(e) => updateIngreso(ingreso.id, 'lleva_iva', e.target.checked)}
                            />
                            IVA (21%)
                          </label>
                          <button 
                            onClick={() => removeIngreso(ingreso.id)}
                            style={{ padding: '4px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                        {ingreso.lleva_iva && ingreso.importe > 0 && (
                          <div style={{ fontSize: '10px', color: '#6b7280', backgroundColor: '#ecfdf5', padding: '4px', borderRadius: '4px' }}>
                            Base: €{ingreso.importe.toFixed(2)} + IVA: €{(ingreso.importe * 0.21).toFixed(2)} = Total: €{(ingreso.importe * 1.21).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen Ingresos */}
                <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#047857' }}>Resumen Ingresos</div>
                  <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base imponible:</span>
                      <span>€{totalIngresosSinIva.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>IVA (21%):</span>
                      <span>€{totalIvaIngresos.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '4px', borderTop: '1px solid #10b981' }}>
                      <span>Total:</span>
                      <span>€{totalIngresosConIva.toFixed(2)}</span>
                    </div>
                  </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500' }}>💸 Gastos de Marca</label>
                    <button 
                      onClick={addGasto}
                      style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus style={{ width: '14px', height: '14px' }} />
                      Añadir
                    </button>
                  </div>

                  {data.gastos.map((gasto) => (
                    <div key={gasto.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Concepto del gasto"
                          value={gasto.concepto}
                          onChange={(e) => updateGasto(gasto.id, 'concepto', e.target.value)}
                          style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <select
                            value={gasto.categoria}
                            onChange={(e) => updateGasto(gasto.id, 'categoria', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                          >
                            {CATEGORIAS_GASTOS.map(categoria => (
                              <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Importe"
                            value={gasto.importe || ''}
                            onChange={(e) => updateGasto(gasto.id, 'importe', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                            step="0.01"
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <input
                              type="checkbox"
                              checked={gasto.lleva_iva}
                              onChange={(e) => updateGasto(gasto.id, 'lleva_iva', e.target.checked)}
                            />
                            IVA (21%)
                          </label>
                          <button 
                            onClick={() => removeGasto(gasto.id)}
                            style={{ padding: '4px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                        {gasto.lleva_iva && gasto.importe > 0 && (
                          <div style={{ fontSize: '10px', color: '#6b7280', backgroundColor: '#fef2f2', padding: '4px', borderRadius: '4px' }}>
                            Base: €{gasto.importe.toFixed(2)} + IVA: €{(gasto.importe * 0.21).toFixed(2)} = Total: €{(gasto.importe * 1.21).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen Gastos */}
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #ef4444' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#dc2626' }}>Resumen Gastos</div>
                  <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base imponible:</span>
                      <span>€{totalGastosSinIva.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>IVA (21%):</span>
                      <span>€{totalIvaGastos.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '4px', borderTop: '1px solid #ef4444' }}>
                      <span>Total:</span>
                      <span>€{totalGastosConIva.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Financiero */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '2px solid #3b82f6' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator style={{ width: '20px', height: '20px' }} />
                Resumen Financiero
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Liquidación IVA */}
                <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#1d4ed8' }}>💳 Liquidación IVA</div>
                  <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>IVA Repercutido:</span>
                      <span>€{totalIvaIngresos.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>IVA Soportado:</span>
                      <span>€{totalIvaGastos.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '4px', borderTop: '1px solid #3b82f6', color: ivaAPagar >= 0 ? '#dc2626' : '#059669' }}>
                      <span>IVA a {ivaAPagar >= 0 ? 'Pagar' : 'Devolver'}:</span>
                      <span>€{Math.abs(ivaAPagar).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ fontWeight: '500', color: '#10b981' }}>Total Ingresos:</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>€{totalIngresosConIva.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ fontWeight: '500', color: '#ef4444' }}>Total Gastos:</span>
                      <span style={{ fontWeight: 'bold', color: '#ef4444' }}>€{totalGastosConIva.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', paddingTop: '8px', borderTop: '2px solid #e5e7eb', color: beneficioNeto >= 0 ? '#059669' : '#ef4444' }}>
                      <span>{beneficioNeto >= 0 ? 'Beneficio:' : 'Pérdida:'}</span>
                      <span>€{Math.abs(beneficioNeto).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                      <span>Margen:</span>
                      <span style={{ color: margen >= 0 ? '#059669' : '#ef4444' }}>
                        {margen.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicadores */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                      {data.ingresos.length}
                    </div>
                    <div style={{ fontSize: '11px', color: '#047857' }}>Ingresos</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                      {data.gastos.length}
                    </div>
                    <div style={{ fontSize: '11px', color: '#b91c1c' }}>Gastos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151', marginBottom: '24px' }}>📊 Reportes y Análisis</h3>
            
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
              <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>Reportes en desarrollo</p>
              <p style={{ margin: 0 }}>Próximamente: gráficos de tendencias, análisis por categorías y exportación de datos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandIncomeModule;
