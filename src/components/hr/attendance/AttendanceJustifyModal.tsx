// src/components/hr/attendance/AttendanceJustifyModal.tsx
import React from 'react';
import { AlertCircle, ArrowLeft, X, Save } from 'lucide-react';
import { type AttendanceRecord, type EmployeeHistory, getTypeLabel } from './AttendanceTypes';

interface Props {
  record: AttendanceRecord;
  employeeHistory: EmployeeHistory;
  onClose: () => void;
  onSave: () => void;
  onChange: (record: AttendanceRecord) => void;
}

export const AttendanceJustifyModal: React.FC<Props> = ({ record, employeeHistory, onClose, onSave, onChange }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', border: '1px solid #d1d5db',
    borderRadius: '6px', fontSize: '14px',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>✏️ Justificar/Editar Incidencia</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {/* Info empleado */}
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{record.employee_name}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            📅 {new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {record.center_name && ` • ${record.center_name}`}
          </div>
        </div>

        {/* Historial */}
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> Historial de Incidencias del Empleado
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Este mes</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: employeeHistory.thisMonth > 3 ? '#dc2626' : '#111827' }}>
                {employeeHistory.thisMonth}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Últimos 3 meses</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: employeeHistory.last3Months > 10 ? '#dc2626' : '#111827' }}>
                {employeeHistory.last3Months}
              </div>
            </div>
          </div>
          {Object.keys(employeeHistory.thisMonthByType).length > 0 && (
            <div style={{ fontSize: '13px', color: '#92400e', marginTop: '8px' }}>
              <strong>Este mes:</strong>{' '}
              {Object.entries(employeeHistory.thisMonthByType).map(([type, count]) => (
                <span key={type} style={{ marginRight: '12px' }}>{getTypeLabel(type)}: {count}</span>
              ))}
            </div>
          )}
          {employeeHistory.thisMonth > 3 && (
            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '12px', color: '#991b1b' }}>
              ⚠️ <strong>Alerta:</strong> Más de 3 incidencias este mes. Considerar reunión de seguimiento.
            </div>
          )}
          {employeeHistory.thisMonthByType['late'] >= 3 && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '12px', color: '#991b1b' }}>
              ⚠️ <strong>Reincidente:</strong> {employeeHistory.thisMonthByType['late']} retrasos este mes.
            </div>
          )}
        </div>

        {/* Tipo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Tipo de incidencia *</label>
          <select value={record.type} onChange={(e) => onChange({ ...record, type: e.target.value as AttendanceRecord['type'] })} style={inputStyle}>
            <option value="late">⏰ Retraso</option>
            <option value="sick_leave">🤒 Baja médica</option>
            <option value="absence">❌ Ausencia injustificada</option>
            <option value="personal">👤 Asunto personal</option>
            <option value="early_departure">🚪 Salida temprana</option>
            <option value="other">📋 Otro</option>
          </select>
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Motivo *</label>
          <input
            type="text" value={record.reason}
            onChange={(e) => onChange({ ...record, reason: e.target.value })}
            placeholder="Ej: Cita médica, Tráfico, etc." style={inputStyle}
          />
        </div>

        {/* Notas */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Justificación / Notas de RRHH</label>
          <textarea
            value={record.notes || ''} rows={4}
            onChange={(e) => onChange({ ...record, notes: e.target.value })}
            placeholder="Añade aquí la justificación del empleado o notas de seguimiento..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            💡 Ejemplo: "Presentó justificante médico", "Avisó con antelación", "Reincidente - 3ª vez este mes"
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <X size={16} /> Cancelar
          </button>
          <button onClick={onSave} style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> Guardar Justificación
          </button>
        </div>
      </div>
    </div>
  );
};
