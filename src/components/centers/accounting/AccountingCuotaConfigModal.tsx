// src/components/centers/accounting/AccountingCuotaConfigModal.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { type CuotaType } from '../../../services/accountingService';

interface Props {
  tiposCuota: CuotaType[];
  newTipoCuota: string;
  newPrecioCuota: number;
  newTipoIva: boolean;
  onNewTipoCuotaChange: (value: string) => void;
  onNewPrecioCuotaChange: (value: number) => void;
  onNewTipoIvaChange: (value: boolean) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const AccountingCuotaConfigModal: React.FC<Props> = ({
  tiposCuota, newTipoCuota, newPrecioCuota, newTipoIva,
  onNewTipoCuotaChange, onNewPrecioCuotaChange, onNewTipoIvaChange,
  onAdd, onRemove, onClose,
}) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' }}>
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', margin: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>⚙️ Configurar Tipos de Cuotas</h3>
        <button onClick={onClose} style={{ padding: '4px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
          Añadir nuevo tipo de cuota:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '6px', marginBottom: '6px' }}>
          <input
            type="text"
            value={newTipoCuota}
            onChange={(e) => onNewTipoCuotaChange(e.target.value)}
            placeholder="Ej: Cuota Senior, Cuota VIP..."
            style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
          />
          <input
            type="number"
            value={newPrecioCuota || ''}
            onChange={(e) => onNewPrecioCuotaChange(parseFloat(e.target.value) || 0)}
            placeholder="Precio €"
            style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
          />
          <select
            value={newTipoIva.toString()}
            onChange={(e) => onNewTipoIvaChange(e.target.value === 'true')}
            style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
          >
            <option value="true">CON IVA</option>
            <option value="false">SIN IVA</option>
          </select>
          <button
            onClick={onAdd}
            disabled={!newTipoCuota.trim() || newPrecioCuota <= 0}
            style={{
              padding: '6px 12px', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px',
              backgroundColor: (!newTipoCuota.trim() || newPrecioCuota <= 0) ? '#9ca3af' : '#10b981',
              cursor: (!newTipoCuota.trim() || newPrecioCuota <= 0) ? 'not-allowed' : 'pointer',
            }}
          >
            Añadir
          </button>
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#f0f9ff', padding: '8px', borderRadius: '4px', border: '1px solid #0ea5e9' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>💡 Configuración de IVA</p>
          <p style={{ margin: 0 }}>• <strong>CON IVA:</strong> Cuotas comerciales • <strong>SIN IVA:</strong> Cuotas subvencionadas/gratuitas</p>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
          Tipos de cuotas actuales:
        </label>
        <div style={{ display: 'grid', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
          {tiposCuota.map((tipo) => (
            <div key={tipo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
              <span style={{ fontSize: '12px' }}>
                {tipo.nombre} - €{tipo.precio}
                <span style={{
                  marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500',
                  backgroundColor: tipo.lleva_iva ? '#dcfce7' : '#fef3c7',
                  color: tipo.lleva_iva ? '#166534' : '#92400e',
                }}>
                  {tipo.lleva_iva ? 'CON IVA' : 'SIN IVA'}
                </span>
              </span>
              <button
                onClick={() => onRemove(tipo.id)}
                style={{ padding: '3px 6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}
              >
                <Trash2 style={{ width: '10px', height: '10px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          onClick={onClose}
          style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
        >
          Guardar y Cerrar
        </button>
      </div>
    </div>
  </div>
);
