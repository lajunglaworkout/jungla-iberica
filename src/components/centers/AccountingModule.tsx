// src/components/centers/AccountingModule.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { accountingService, type FinancialData as SupabaseFinancialData, type CuotaType } from '../../services/accountingService';
import { ui } from '../../utils/ui';

import {
  FinancialData, GastoExtra, CuotaItem,
  DEFAULT_TPOS_CUOTA, MESES, INITIAL_FINANCIAL_DATA, calcularPrecios,
} from './accounting/AccountingTypes';
import { AccountingIngresosPanel } from './accounting/AccountingIngresosPanel';
import { AccountingGastosPanel } from './accounting/AccountingGastosPanel';
import { AccountingResumenPanel } from './accounting/AccountingResumenPanel';
import { AccountingReportesTab } from './accounting/AccountingReportesTab';
import { AccountingCuotaConfigModal } from './accounting/AccountingCuotaConfigModal';

interface AccountingModuleProps {
  centerName: string;
  centerId: string;
  onBack: () => void;
}

const AccountingModule: React.FC<AccountingModuleProps> = ({ centerName, centerId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'entrada' | 'reportes'>('entrada');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<FinancialData>(INITIAL_FINANCIAL_DATA(centerId, centerName));
  const [tiposCuota, setTiposCuota] = useState<CuotaType[]>([]);
  const [showCuotaConfig, setShowCuotaConfig] = useState(false);
  const [newTipoCuota, setNewTipoCuota] = useState('');
  const [newPrecioCuota, setNewPrecioCuota] = useState<number>(0);
  const [newTipoIva, setNewTipoIva] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => { loadCuotaTypes(); }, [centerId]);
  useEffect(() => { if (tiposCuota.length > 0) loadFinancialData(); }, [centerId, data.mes, data.año, tiposCuota.length]);

  const loadCuotaTypes = async () => {
    try {
      const types = await accountingService.getCuotaTypes(centerId);
      setTiposCuota(types);
    } catch {
      const defaultTypes = DEFAULT_TPOS_CUOTA.map((tipo, index) => ({
        id: `default-${index}`, center_id: centerId, nombre: tipo.nombre, precio: tipo.precio, activo: true, lleva_iva: true,
      }));
      setTiposCuota(defaultTypes);
    }
  };

  const loadFinancialData = async () => {
    setLoading(true);
    const fd = await accountingService.getFinancialData(centerId, centerName, data.mes, data.año);
    setData({
      id: fd.id, center_id: centerId, center_name: centerName,
      cuotas: fd.cuotas.map(c => ({ id: c.id || Math.random().toString(36).substr(2, 9), cuota_type_id: c.cuota_type_id, cantidad: c.cantidad, importe: c.importe, iva: c.iva, tipo: c.tipo || '', precio_total: c.precio_total, lleva_iva: c.lleva_iva !== false })),
      ingresos_con_iva: fd.ingresos_con_iva || 0, ingresos_sin_iva: fd.ingresos_sin_iva || 0,
      nutricion: fd.nutricion || 0, fisioterapia: fd.fisioterapia || 0, entrenamiento_personal: fd.entrenamiento_personal || 0,
      entrenamientos_grupales: fd.entrenamientos_grupales || 0, otros: fd.otros || 0,
      nutricion_iva: fd.nutricion_iva ?? true, fisioterapia_iva: fd.fisioterapia_iva ?? true,
      entrenamiento_personal_iva: fd.entrenamiento_personal_iva ?? true,
      entrenamientos_grupales_iva: fd.entrenamientos_grupales_iva ?? true, otros_iva: fd.otros_iva ?? true,
      alquiler: fd.alquiler || 0, suministros: fd.suministros || 0, nominas: fd.nominas || 0,
      seguridad_social: fd.seguridad_social || 0, marketing: fd.marketing || 0, mantenimiento: fd.mantenimiento || 0,
      royalty: fd.royalty || 0, software_gestion: fd.software_gestion || 0,
      gastos_extras: (fd.gastos_extras ?? []).map(g => ({ ...g, lleva_iva: g.lleva_iva !== false })),
      alquiler_iva: fd.alquiler_iva ?? true, suministros_iva: fd.suministros_iva ?? true,
      nominas_iva: fd.nominas_iva ?? false, seguridad_social_iva: fd.seguridad_social_iva ?? false,
      marketing_iva: fd.marketing_iva ?? true, mantenimiento_iva: fd.mantenimiento_iva ?? true,
      royalty_iva: fd.royalty_iva ?? false, software_gestion_iva: fd.software_gestion_iva ?? true,
      mes: fd.mes || new Date().getMonth() + 1, año: fd.año || new Date().getFullYear(),
    });
    setLoading(false);
  };

  // Financial calculations
  const ivaRepercutidoPrincipales = (data.ingresos_con_iva || 0) - (data.ingresos_con_iva || 0) / 1.21;
  const totalIngresosNetosCuotas = data.cuotas.reduce((s, c) => s + c.cantidad * c.importe, 0);
  const totalIvaCuotas = data.cuotas.reduce((s, c) => s + c.cantidad * c.iva, 0);
  const ivaIngresosExtras = (
    (data.nutricion_iva ? data.nutricion - data.nutricion / 1.21 : 0) +
    (data.fisioterapia_iva ? data.fisioterapia - data.fisioterapia / 1.21 : 0) +
    (data.entrenamiento_personal_iva ? data.entrenamiento_personal - data.entrenamiento_personal / 1.21 : 0) +
    (data.entrenamientos_grupales_iva ? data.entrenamientos_grupales - data.entrenamientos_grupales / 1.21 : 0) +
    (data.otros_iva ? data.otros - data.otros / 1.21 : 0)
  );
  const totalIngresosNetos = (data.ingresos_con_iva || 0) + (data.ingresos_sin_iva || 0) + totalIngresosNetosCuotas +
    data.nutricion + data.fisioterapia + data.entrenamiento_personal + data.entrenamientos_grupales + data.otros;
  const totalIngresos = totalIngresosNetos;

  const gastosExtrasConIva = data.gastos_extras.filter(g => g.lleva_iva).reduce((s, g) => s + g.importe, 0);
  const gastosExtrasSinIva = data.gastos_extras.filter(g => !g.lleva_iva).reduce((s, g) => s + g.importe, 0);
  const gastosFijosConIva =
    (data.alquiler_iva !== false ? data.alquiler : 0) + (data.suministros_iva !== false ? data.suministros : 0) +
    (data.nominas_iva === true ? data.nominas : 0) + (data.seguridad_social_iva === true ? data.seguridad_social : 0) +
    (data.marketing_iva !== false ? data.marketing : 0) + (data.mantenimiento_iva !== false ? data.mantenimiento : 0) +
    (data.royalty_iva === true ? data.royalty : 0) + (data.software_gestion_iva !== false ? data.software_gestion : 0);
  const ivaSoportado = (gastosFijosConIva + gastosExtrasConIva) - (gastosFijosConIva + gastosExtrasConIva) / 1.21;
  const ivaRepercutido = ivaRepercutidoPrincipales + totalIvaCuotas + ivaIngresosExtras;
  const ivaAPagar = ivaRepercutido - ivaSoportado;
  const totalGastos = data.alquiler + data.suministros + data.nominas + data.seguridad_social + data.marketing + data.mantenimiento + data.royalty + (data.software_gestion || 0) + gastosExtrasConIva + gastosExtrasSinIva;
  const beneficioNeto = totalIngresos - totalGastos;
  const margen = totalIngresos > 0 ? (beneficioNeto / totalIngresos) * 100 : 0;
  const totalClientes = data.cuotas.reduce((s, c) => s + c.cantidad, 0);

  const handleChange = (field: keyof FinancialData, value: string | boolean) => {
    if (field === 'cuotas' || field === 'gastos_extras') return;
    if (field.endsWith('_iva') && !field.startsWith('ingresos_')) {
      setData(prev => ({ ...prev, [field]: typeof value === 'string' ? value === 'true' : value }));
      return;
    }
    const numericFields = ['ingresos_con_iva', 'ingresos_sin_iva', 'nutricion', 'fisioterapia', 'entrenamiento_personal', 'entrenamientos_grupales', 'otros', 'alquiler', 'suministros', 'nominas', 'seguridad_social', 'marketing', 'mantenimiento', 'royalty', 'software_gestion', 'mes', 'año'];
    if (numericFields.includes(field)) {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
      setData(prev => ({ ...prev, [field]: (field === 'mes' || field === 'año') ? Math.round(numValue) : Math.round(numValue * 100) / 100 }));
      return;
    }
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addTipoCuota = async () => {
    if (!newTipoCuota.trim() || newPrecioCuota <= 0) return;
    if (tiposCuota.some(t => t.nombre.toLowerCase() === newTipoCuota.trim().toLowerCase())) { ui.warning('Ya existe una cuota con ese nombre'); return; }
    const newType = await accountingService.createCuotaType(centerId, newTipoCuota.trim(), newPrecioCuota, newTipoIva);
    if (newType) { await loadCuotaTypes(); setNewTipoCuota(''); setNewPrecioCuota(0); setNewTipoIva(true); }
  };

  const removeTipoCuota = async (id: string) => {
    const tipo = tiposCuota.find(t => t.id === id);
    if (await ui.confirm(`¿Eliminar el tipo de cuota "${tipo?.nombre}"?`)) {
      const success = await accountingService.deleteCuotaType(id);
      if (success) await loadCuotaTypes();
    }
  };

  const addCuota = () => {
    if (tiposCuota.length === 0) { ui.info('Primero debes configurar tipos de cuotas'); return; }
    const primerTipo = tiposCuota[0];
    const { precioSinIva, iva, precioTotal } = calcularPrecios(primerTipo.precio, primerTipo.lleva_iva, true);
    setData(prev => ({ ...prev, cuotas: [...prev.cuotas, { id: Date.now().toString(), cuota_type_id: primerTipo.id, tipo: primerTipo.nombre, cantidad: 0, importe: precioSinIva, iva, precio_total: precioTotal, lleva_iva: primerTipo.lleva_iva } as CuotaItem] }));
  };

  const updateCuotaTipo = (cuotaId: string, nuevoTipo: string) => {
    const tipoCuota = tiposCuota.find(t => t.nombre === nuevoTipo);
    if (!tipoCuota) return;
    const { precioSinIva, iva, precioTotal } = calcularPrecios(tipoCuota.precio, tipoCuota.lleva_iva, true);
    setData(prev => ({ ...prev, cuotas: prev.cuotas.map(c => c.id === cuotaId ? { ...c, tipo: nuevoTipo, importe: precioSinIva, iva, precio_total: precioTotal, lleva_iva: tipoCuota.lleva_iva } : c) }));
  };

  const removeCuota = async (id: string) => {
    const cuota = data.cuotas.find(c => c.id === id);
    if (await ui.confirm(`¿Eliminar la cuota "${cuota?.tipo}"?`)) {
      try {
        if (cuota?.id && !cuota.id.includes('temp-')) {
          const fd = await accountingService.getFinancialData(centerId, centerName, data.mes, data.año);
          if (fd.id) await accountingService.deleteMonthlyCuota(fd.id, cuota.id);
        }
        setData(prev => ({ ...prev, cuotas: prev.cuotas.filter(c => c.id !== id) }));
      } catch (error) { console.error('Error eliminando cuota:', error); ui.error('Error al eliminar la cuota'); }
    }
  };

  const addGastoExtra = () => setData(prev => ({ ...prev, gastos_extras: [...prev.gastos_extras, { id: Date.now().toString(), concepto: '', importe: 0, categoria: 'Operativo', lleva_iva: true }] }));

  const updateGastoExtra = (id: string, field: keyof GastoExtra, value: string | number | boolean) => {
    setData(prev => ({ ...prev, gastos_extras: prev.gastos_extras.map(g => g.id === id ? { ...g, [field]: field === 'lleva_iva' ? value : (typeof value === 'string' ? (field === 'concepto' || field === 'categoria' ? value : parseFloat(value) || 0) : value) } : g) }));
  };

  const removeGastoExtra = async (id: string) => {
    const gasto = data.gastos_extras.find(g => g.id === id);
    if (await ui.confirm(`¿Eliminar el gasto "${gasto?.concepto}"?`)) {
      try {
        if (gasto?.id && !gasto.id.includes('temp-')) {
          const fd = await accountingService.getFinancialData(centerId, centerName, data.mes, data.año);
          if (fd.id) await accountingService.deleteGastoExtra(fd.id, gasto.id);
        }
        setData(prev => ({ ...prev, gastos_extras: prev.gastos_extras.filter(g => g.id !== id) }));
      } catch (error) { console.error('Error eliminando gasto extra:', error); ui.error('Error al eliminar el gasto'); }
    }
  };

  const forceSaveGastosExtras = async () => {
    setSaving(true);
    try {
      const success = await accountingService.saveFinancialData({ ...data, cuotas: [] } as unknown as SupabaseFinancialData);
      if (success) ui.success('Gastos extras guardados correctamente.');
      else throw new Error('Error al guardar');
    } catch (error) { console.error('Error guardando gastos extras:', error); ui.error('Error al guardar los gastos extras.'); }
    finally { setSaving(false); }
  };

  const syncWithClientsModule = async () => {
    try {
      const { clientsService } = await import('../../services/clientsService');
      await clientsService.syncFromAccounting(centerId, data.mes, data.año, totalClientes, totalIngresos);
    } catch (error) { console.error('Error sincronizando:', error); }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const supabaseData: SupabaseFinancialData = {
        ...data, cuotas: data.cuotas.map(c => ({ cuota_type_id: tiposCuota.find(t => t.nombre === c.tipo)?.id || '', cantidad: c.cantidad, importe: c.importe, iva: c.iva })),
      };
      const success = await accountingService.saveFinancialData(supabaseData);
      if (!success) throw new Error('Save failed');
      await syncWithClientsModule();
      ui.success(`Datos guardados. ${totalClientes} clientes sincronizados.`);
    } catch (error) { console.error('Error al guardar:', error); ui.error('Error al guardar los datos en Supabase'); }
    finally { setLoading(false); }
  };

  // Suppress unused variable warnings for functions defined but not yet wired to JSX
  void addCuota; void updateCuotaTipo; void removeCuota;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', overflowX: 'auto' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '1200px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>💰 Contabilidad - {centerName}</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gestión financiera mensual</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          <select value={data.mes} onChange={(e) => handleChange('mes', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}>
            {MESES.map((mes, i) => <option key={i} value={i + 1}>{mes}</option>)}
          </select>
          <select value={data.año} onChange={(e) => handleChange('año', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '100px' }}>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>📊 Histórico disponible</div>
        </div>
      </div>

      <div style={{ padding: '32px', minWidth: '1200px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <button onClick={() => setActiveTab('entrada')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'entrada' ? '#059669' : '#f3f4f6', color: activeTab === 'entrada' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            📝 Entrada de Datos
          </button>
          <button onClick={() => setActiveTab('reportes')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'reportes' ? '#059669' : '#f3f4f6', color: activeTab === 'reportes' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            📊 Reportes
          </button>
        </div>

        {activeTab === 'entrada' && (
          <>
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '20px' }}>🚀</div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#065f46' }}>Sistema de Registro Incremental</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#047857' }}>Día 5: Añade +200 clientes • Día 15: Añade +150 clientes • Total automático: 350 clientes</p>
              </div>
            </div>
            {loading && <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando datos...</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', minWidth: '1100px' }}>
              <AccountingIngresosPanel data={data} onChange={handleChange} />
              <AccountingGastosPanel
                data={data} saving={saving} onChange={handleChange}
                onAddGastoExtra={addGastoExtra} onUpdateGastoExtra={updateGastoExtra}
                onRemoveGastoExtra={removeGastoExtra} onForceSave={forceSaveGastosExtras}
              />
              <AccountingResumenPanel
                totalIngresosNetos={totalIngresosNetos} totalIngresos={totalIngresos}
                totalGastos={totalGastos} beneficioNeto={beneficioNeto} margen={margen}
                totalClientes={totalClientes} ivaAPagar={ivaAPagar}
                ivaRepercutido={ivaRepercutido} ivaSoportado={ivaSoportado}
                onSave={handleSave}
                onSync={() => { syncWithClientsModule(); ui.info(`${totalClientes} clientes sincronizados para ${MESES[data.mes - 1]} ${data.año}`); }}
              />
            </div>
          </>
        )}

        {activeTab === 'reportes' && (
          <AccountingReportesTab
            selectedYear={selectedYear} ivaAPagar={ivaAPagar}
            ivaRepercutido={ivaRepercutido} ivaSoportado={ivaSoportado}
            onYearChange={setSelectedYear}
          />
        )}
      </div>

      {showCuotaConfig && (
        <AccountingCuotaConfigModal
          tiposCuota={tiposCuota} newTipoCuota={newTipoCuota}
          newPrecioCuota={newPrecioCuota} newTipoIva={newTipoIva}
          onNewTipoCuotaChange={setNewTipoCuota}
          onNewPrecioCuotaChange={setNewPrecioCuota}
          onNewTipoIvaChange={setNewTipoIva}
          onAdd={addTipoCuota} onRemove={removeTipoCuota}
          onClose={() => setShowCuotaConfig(false)}
        />
      )}
    </div>
  );
};

export default AccountingModule;
