// src/components/hr/attendance/AttendanceCreateForm.tsx
import React from 'react';
import { ArrowLeft, X, Save } from 'lucide-react';
import { type AttendanceRecord } from './AttendanceTypes';

interface Center { id: number; name: string; }
interface Employee { id: number; name: string; center_id?: number; }

interface Props {
  formData: AttendanceRecord;
  employees: Employee[];
  centers: Center[];
  selectedCenter: number | null;
  onFormChange: (data: AttendanceRecord) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AttendanceCreateForm: React.FC<Props> = ({
  formData, employees, centers, selectedCenter, onFormChange, onSubmit, onClose,
}) => {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>📝 Registrar Incidencia de Asistencia</h1>
      </div>

      <form onSubmit={onSubmit} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {/* Empleado */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Empleado *</label>
          <select value={formData.employee_id} onChange={(e) => onFormChange({ ...formData, employee_id: Number(e.target.value) })} required style={inputStyle}>
            <option value={0}>Seleccionar empleado</option>
            {employees
              .filter(e => !selectedCenter || e.center_id === selectedCenter)
              .map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {centers.find(c => c.id === emp.center_id)?.name}
                </option>
              ))}
          </select>
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Fecha *</label>
          <input type="date" value={formData.date} onChange={(e) => onFormChange({ ...formData, date: e.target.value })} required style={inputStyle} />
        </div>

        {/* Tipo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Tipo de incidencia *</label>
          <select value={formData.type} onChange={(e) => onFormChange({ ...formData, type: e.target.value as AttendanceRecord['type'] })} required style={inputStyle}>
            <option value="late">⏰ Retraso</option>
            <option value="sick_leave">🤒 Baja médica</option>
            <option value="absence">❌ Ausencia injustificada</option>
            <option value="personal">👤 Asunto personal</option>
            <option value="early_departure">🚪 Salida temprana</option>
            <option value="other">📋 Otro</option>
          </select>
        </div>

        {/* Horas de retraso */}
        {formData.type === 'late' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Horas de retraso</label>
            <input
              type="number" step="0.5" min="0" value={formData.hours_late || ''}
              onChange={(e) => onFormChange({ ...formData, hours_late: Number(e.target.value) })}
              placeholder="Ej: 1.5" style={inputStyle}
            />
          </div>
        )}

        {/* Motivo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Motivo *</label>
          <input
            type="text" value={formData.reason} required
            onChange={(e) => onFormChange({ ...formData, reason: e.target.value })}
            placeholder="Ej: Enfermedad, Tráfico, etc." style={inputStyle}
          />
        </div>

        {/* Notas */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Notas adicionales</label>
          <textarea
            value={formData.notes} rows={3}
            onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
            placeholder="Información adicional..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <X size={16} /> Cancelar
          </button>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
};
