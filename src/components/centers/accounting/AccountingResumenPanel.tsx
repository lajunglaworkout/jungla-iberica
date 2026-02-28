// src/components/centers/accounting/AccountingResumenPanel.tsx
import React from 'react';
import { Calculator, Save } from 'lucide-react';

interface Props {
  totalIngresosNetos: number;
  totalIngresos: number;
  totalGastos: number;
  beneficioNeto: number;
  margen: number;
  totalClientes: number;
  ivaAPagar: number;
  ivaRepercutido: number;
  ivaSoportado: number;
  onSave: () => void;
  onSync: () => void;
}

export const AccountingResumenPanel: React.FC<Props> = ({
  totalIngresosNetos, totalIngresos, totalGastos, beneficioNeto, margen,
  totalClientes, ivaAPagar, ivaRepercutido, ivaSoportado, onSave, onSync,
}) => (
  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Calculator style={{ width: '20px', height: '20px' }} />
      Resumen Financiero
    </h3>

    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
        <p style={{ fontSize: '14px', color: '#166534', margin: '0 0 4px 0' }}>Ingresos Netos (sin IVA)</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>
          €{totalIngresosNetos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
        <p style={{ fontSize: '14px', color: '#0c4a6e', margin: '0 0 4px 0' }}>IVA a Pagar (Modelo 303)</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: ivaAPagar >= 0 ? '#0284c7' : '#059669', margin: 0 }}>
          €{ivaAPagar.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </p>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
          IVA repercutido: €{ivaRepercutido.toFixed(2)} | IVA soportado: €{ivaSoportado.toFixed(2)}
        </p>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px 0' }}>Total Ingresos (con IVA)</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b', margin: 0 }}>
          €{totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
        <p style={{ fontSize: '14px', color: '#991b1b', margin: '0 0 4px 0' }}>Total Gastos</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>
          €{totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div style={{ padding: '16px', backgroundColor: beneficioNeto >= 0 ? '#eff6ff' : '#fef2f2', borderRadius: '8px', border: `1px solid ${beneficioNeto >= 0 ? '#bfdbfe' : '#fecaca'}` }}>
        <p style={{ fontSize: '14px', color: beneficioNeto >= 0 ? '#1e40af' : '#991b1b', margin: '0 0 4px 0' }}>Beneficio Neto</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: beneficioNeto >= 0 ? '#2563eb' : '#dc2626', margin: 0 }}>
          €{beneficioNeto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px 0' }}>Margen Beneficio</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b', margin: 0 }}>{margen.toFixed(1)}%</p>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
        <p style={{ fontSize: '14px', color: '#0c4a6e', margin: '0 0 4px 0' }}>Total Clientes</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7', margin: 0 }}>{totalClientes}</p>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
        <p style={{ fontSize: '14px', color: '#92400e', margin: '0 0 4px 0' }}>IVA a Pagar</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>
          €{ivaAPagar.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </p>
        <p style={{ fontSize: '10px', color: '#92400e', margin: '4px 0 0 0', fontStyle: 'italic' }}>
          IVA repercutido (€{ivaRepercutido.toFixed(2)}) - IVA soportado (€{ivaSoportado.toFixed(2)})
        </p>
      </div>
    </div>

    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
      <button
        onClick={onSave}
        style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Save style={{ width: '16px', height: '16px' }} />
        Guardar & Sincronizar
      </button>
      <button
        onClick={onSync}
        style={{ padding: '12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        👥 Sync
      </button>
    </div>
  </div>
);
