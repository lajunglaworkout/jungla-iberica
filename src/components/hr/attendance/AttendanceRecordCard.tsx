// src/components/hr/attendance/AttendanceRecordCard.tsx
import React from 'react';
import { FileText } from 'lucide-react';
import { type AttendanceRecord, getTypeLabel, getTypeColor } from './AttendanceTypes';

interface Props {
  record: AttendanceRecord;
  onJustify: (record: AttendanceRecord) => void;
  onDelete: (id: number) => void;
}

export const AttendanceRecordCard: React.FC<Props> = ({ record, onJustify, onDelete }) => {
  const typeStyle = getTypeColor(record.type);

  return (
    <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>{record.employee_name}</span>
          <span style={{ padding: '4px 8px', backgroundColor: typeStyle.bg, color: typeStyle.color, borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
            {getTypeLabel(record.type)}
          </span>
          {record.center_name && <span style={{ fontSize: '12px', color: '#6b7280' }}>• {record.center_name}</span>}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
          📅 {new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {record.hours_late && ` • ⏰ ${record.hours_late}h de retraso`}
        </div>
        <div style={{ fontSize: '14px', color: '#374151' }}><strong>Motivo:</strong> {record.reason}</div>
        {record.notes && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>📝 {record.notes}</div>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onJustify(record)}
          style={{ padding: '8px 16px', backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={14} /> Justificar
        </button>
        <button
          onClick={() => onDelete(record.id!)}
          style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};
