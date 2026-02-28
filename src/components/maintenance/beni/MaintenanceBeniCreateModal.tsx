// src/components/maintenance/beni/MaintenanceBeniCreateModal.tsx
import React from 'react';
import { Wrench } from 'lucide-react';

interface Props {
  currentQuarter: string;
  deadlineDate: string;
  loading: boolean;
  onDeadlineDateChange: (date: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const MaintenanceBeniCreateModal: React.FC<Props> = ({
  currentQuarter, deadlineDate, loading, onDeadlineDateChange, onClose, onConfirm,
}) => (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={24} style={{ color: '#f59e0b' }} />
          Convocar Revisión {currentQuarter}
        </h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '24px' }}>✕</button>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Se creará una revisión trimestral de mantenimiento para todos los centros
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          Fecha límite
        </label>
        <input
          type="date"
          value={deadlineDate}
          onChange={(e) => onDeadlineDateChange(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>Centros incluidos:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
          <li>🏪 Sevilla - Mantenimiento completo</li>
          <li>🏪 Jerez - Mantenimiento completo</li>
          <li>🏪 Puerto - Mantenimiento completo</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={!deadlineDate || loading}
          style={{ padding: '12px 20px', backgroundColor: deadlineDate ? '#10b981' : '#9ca3af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: deadlineDate ? 'pointer' : 'not-allowed' }}
        >
          {loading ? 'Creando...' : 'Crear Revisión'}
        </button>
      </div>
    </div>
  </div>
);
