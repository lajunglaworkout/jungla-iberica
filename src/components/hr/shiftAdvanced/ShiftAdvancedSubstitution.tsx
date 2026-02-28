// src/components/hr/shiftAdvanced/ShiftAdvancedSubstitution.tsx
import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { type Employee } from './ShiftAdvancedTypes';

interface Props {
  employees: Employee[];
}

export const ShiftAdvancedSubstitution: React.FC<Props> = ({ employees }) => (
  <div>
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
        Gestión de Sustituciones
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        Sistema inteligente para gestionar cambios y sustituciones de turnos
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={{ padding: '20px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '16px' }}>Solicitudes Pendientes</h3>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <RefreshCw size={48} style={{ color: '#d97706', margin: '0 auto 16px' }} />
          <p style={{ color: '#92400e' }}>No hay solicitudes pendientes</p>
        </div>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f0fdf4', border: '1px solid #059669', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#065f46', marginBottom: '16px' }}>Sustitutos Disponibles</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {employees.slice(0, 5).map(emp => (
            <div
              key={emp.id}
              style={{ padding: '12px', backgroundColor: 'white', border: '1px solid #d1fae5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{emp.nombre} {emp.apellidos}</span>
              <span style={{ fontSize: '12px', color: '#059669', backgroundColor: '#d1fae5', padding: '4px 8px', borderRadius: '12px' }}>
                Disponible
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '16px' }}>Historial de Sustituciones</h3>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Clock size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b' }}>No hay historial de sustituciones</p>
      </div>
    </div>
  </div>
);
