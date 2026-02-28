// src/components/centers/accounting/AccountingGastosPanel.tsx
import React from 'react';
import { TrendingDown, Plus, Save, Trash2, Home, Zap, Users, Shield, Megaphone, Wrench, Building2, Monitor } from 'lucide-react';
import { FinancialData, GastoExtra, CATEGORIAS_GASTOS } from './AccountingTypes';

interface Props {
  data: FinancialData;
  saving: boolean;
  onChange: (field: keyof FinancialData, value: string | boolean) => void;
  onAddGastoExtra: () => void;
  onUpdateGastoExtra: (id: string, field: keyof GastoExtra, value: string | number | boolean) => void;
  onRemoveGastoExtra: (id: string) => void;
  onForceSave: () => void;
}

const GASTO_FIELDS = [
  { label: 'Alquiler (€)', field: 'alquiler' as const, ivaField: 'alquiler_iva' as const, Icon: Home },
  { label: 'Suministros (€)', field: 'suministros' as const, ivaField: 'suministros_iva' as const, Icon: Zap },
  { label: 'Nóminas (€)', field: 'nominas' as const, ivaField: 'nominas_iva' as const, Icon: Users },
  { label: 'Seguridad Social (€)', field: 'seguridad_social' as const, ivaField: 'seguridad_social_iva' as const, Icon: Shield },
  { label: 'Marketing (€)', field: 'marketing' as const, ivaField: 'marketing_iva' as const, Icon: Megaphone },
  { label: 'Mantenimiento (€)', field: 'mantenimiento' as const, ivaField: 'mantenimiento_iva' as const, Icon: Wrench },
  { label: 'Royalty a la Marca (€)', field: 'royalty' as const, ivaField: 'royalty_iva' as const, Icon: Building2 },
  { label: 'Software de Gestión (€)', field: 'software_gestion' as const, ivaField: 'software_gestion_iva' as const, Icon: Monitor },
] as const;

export const AccountingGastosPanel: React.FC<Props> = ({
  data, saving, onChange, onAddGastoExtra, onUpdateGastoExtra, onRemoveGastoExtra, onForceSave,
}) => (
  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '2px solid #ef4444' }}>
    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <TrendingDown style={{ width: '20px', height: '20px' }} />
      Gastos
    </h3>

    <div style={{ display: 'grid', gap: '16px' }}>
      {GASTO_FIELDS.map(({ label, field, ivaField, Icon }) => (
        <div key={field}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            <Icon style={{ width: '16px', height: '16px', marginRight: '6px', color: '#6b7280' }} />
            {label}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
            <input
              type="number" step="0.01"
              value={data[field] || 0}
              onChange={(e) => onChange(field, e.target.value)}
              style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
            />
            <select
              value={(data[ivaField] ?? true).toString()}
              onChange={(e) => onChange(ivaField, e.target.value === 'true')}
              style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="true">Con IVA</option>
              <option value="false">Sin IVA</option>
            </select>
          </div>
        </div>
      ))}

      {/* Gastos Extras */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>💸 Gastos Extras</label>
          <button
            onClick={onAddGastoExtra}
            style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            Añadir
          </button>
        </div>

        <div style={{
          border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', backgroundColor: '#f9fafb',
          minHeight: '80px', maxHeight: data.gastos_extras.length > 3 ? '300px' : 'auto',
          overflowY: data.gastos_extras.length > 3 ? 'auto' : 'visible', position: 'relative',
        }}>
          {data.gastos_extras.length > 0 && (
            <button
              onClick={onForceSave} disabled={saving}
              style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10 }}
            >
              <Save style={{ width: '12px', height: '12px' }} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          )}
          {data.gastos_extras.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', padding: '20px' }}>
              No hay gastos extras. Usa "Añadir" para crear el primero.
            </div>
          )}
          {data.gastos_extras.map((gasto) => (
            <div key={gasto.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr auto', gap: '6px', marginBottom: '8px', alignItems: 'end' }}>
              <input
                type="text" placeholder="Concepto del gasto"
                value={gasto.concepto}
                onChange={(e) => onUpdateGastoExtra(gasto.id, 'concepto', e.target.value)}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }}
              />
              <select
                value={gasto.categoria}
                onChange={(e) => onUpdateGastoExtra(gasto.id, 'categoria', e.target.value)}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }}
              >
                {CATEGORIAS_GASTOS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input
                type="number" placeholder="€"
                value={gasto.importe}
                onChange={(e) => onUpdateGastoExtra(gasto.id, 'importe', e.target.value)}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }}
              />
              <select
                value={(gasto.lleva_iva ?? true).toString()}
                onChange={(e) => onUpdateGastoExtra(gasto.id, 'lleva_iva', e.target.value === 'true')}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px' }}
              >
                <option value="true">Con IVA</option>
                <option value="false">Sin IVA</option>
              </select>
              <button
                onClick={() => onRemoveGastoExtra(gasto.id)}
                style={{ padding: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <Trash2 style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
