// src/components/centers/accounting/AccountingIngresosPanel.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { FinancialData } from './AccountingTypes';

interface Props {
  data: FinancialData;
  onChange: (field: keyof FinancialData, value: string | boolean) => void;
}

const ivaLabel = (value: boolean, amount: number) =>
  `IVA: €${(value ? amount - amount / 1.21 : 0).toFixed(2)}`;

export const AccountingIngresosPanel: React.FC<Props> = ({ data, onChange }) => (
  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '2px solid #10b981' }}>
    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <TrendingUp style={{ width: '20px', height: '20px' }} />
      Ingresos
    </h3>

    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Ingresos Principales */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>💰 Ingresos Principales</label>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>
              💰 Ingresos CON IVA (€)
            </label>
            <input
              type="number" step="0.01" placeholder="0.00 €"
              value={data.ingresos_con_iva || ''}
              onChange={(e) => onChange('ingresos_con_iva', e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
            />
            <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px', fontStyle: 'italic' }}>
              IVA repercutido: €{((data.ingresos_con_iva || 0) - ((data.ingresos_con_iva || 0) / 1.21)).toFixed(2)}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>
              💰 Ingresos SIN IVA (€)
            </label>
            <input
              type="number" step="0.01" placeholder="0.00 €"
              value={data.ingresos_sin_iva || ''}
              onChange={(e) => onChange('ingresos_sin_iva', e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
            />
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', fontStyle: 'italic' }}>Exento de IVA: €0.00</div>
          </div>
        </div>
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
          <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600', textAlign: 'center' }}>
            Total Ingresos Principales: €{((data.ingresos_con_iva || 0) + (data.ingresos_sin_iva || 0)).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Servicios Adicionales */}
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
          🏋️ Servicios Adicionales
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: '🥗 Nutrición', field: 'nutricion' as const, ivaField: 'nutricion_iva' as const },
            { label: '🩺 Fisioterapia', field: 'fisioterapia' as const, ivaField: 'fisioterapia_iva' as const },
            { label: '💪 Entrenamientos Personales', field: 'entrenamiento_personal' as const, ivaField: 'entrenamiento_personal_iva' as const },
            { label: '🏃 Entrenamientos Grupales', field: 'entrenamientos_grupales' as const, ivaField: 'entrenamientos_grupales_iva' as const },
          ].map(({ label, field, ivaField }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>{label}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <input
                  type="number" step="0.01" placeholder="0.00 €"
                  value={data[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }}
                />
                <select
                  value={data[ivaField].toString()}
                  onChange={(e) => onChange(ivaField, e.target.value === 'true')}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
                >
                  <option value="true">Con IVA</option>
                  <option value="false">Sin IVA</option>
                </select>
              </div>
              <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px', fontStyle: 'italic' }}>
                {ivaLabel(data[ivaField], data[field] || 0)}
              </div>
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>📋 Otros Ingresos</label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
              <input
                type="number" step="0.01" placeholder="0.00 €"
                value={data.otros || ''}
                onChange={(e) => onChange('otros', e.target.value)}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }}
              />
              <select
                value={data.otros_iva.toString()}
                onChange={(e) => onChange('otros_iva', e.target.value === 'true')}
                style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="true">Con IVA</option>
                <option value="false">Sin IVA</option>
              </select>
            </div>
            <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px', fontStyle: 'italic' }}>
              {ivaLabel(data.otros_iva, data.otros || 0)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
          💡 Incluye todos los ingresos adicionales a las cuotas mensuales
        </div>
      </div>
    </div>
  </div>
);
