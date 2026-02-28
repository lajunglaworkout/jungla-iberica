// src/components/hr/shiftAdvanced/ShiftAdvancedManager.tsx
import React, { useState } from 'react';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { deleteShift, getShiftAssignments, publishShift } from '../../../services/hrService';
import { ui } from '../../../utils/ui';
import type { Center } from '../../../types/database';
import { type Shift } from './ShiftAdvancedTypes';
import { ShiftAdvancedForm } from './ShiftAdvancedForm';

interface Props {
  shifts: Shift[];
  centers: Center[];
  selectedCenter: number | null;
  onRefresh: () => void;
}

export const ShiftAdvancedManager: React.FC<Props> = ({ shifts, centers, selectedCenter, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const centerName = centers.find((c: Center) => c.id === selectedCenter)?.name || 'Centro';

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setShowForm(true);
  };

  const handleDelete = async (shift: Shift) => {
    if (!await ui.confirm(`¿Eliminar el turno "${shift.name}"?`)) return;
    const result = await deleteShift(shift.id);
    if (!result.success) {
      ui.error(`Error: ${result.error}`);
      return;
    }
    onRefresh();
  };

  const handlePublish = async (shift: Shift) => {
    const assignments = await getShiftAssignments(shift.id);
    const employeeCount = assignments.length;
    const confirmed = await ui.confirm(
      `¿Publicar turno "${shift.name}"?\n\nSe enviará notificación a ${employeeCount} empleado(s).\n\nUna vez publicado, los empleados recibirán un email con sus horarios.`
    );
    if (!confirmed) return;

    const result = await publishShift(shift.id, 'admin');
    if (!result.success) {
      ui.error(`Error publicando turno: ${result.error}`);
      return;
    }
    ui.success(`Turno "${shift.name}" publicado correctamente. Se han enviado ${employeeCount} notificaciones.`);
    onRefresh();
  };

  if (showForm) {
    return (
      <ShiftAdvancedForm
        shift={editingShift}
        centers={centers}
        defaultCenterId={selectedCenter}
        onSave={() => { setShowForm(false); setEditingShift(null); onRefresh(); }}
        onCancel={() => { setShowForm(false); setEditingShift(null); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
          Gestión de Turnos - {centerName} ({shifts.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          <Plus size={16} />
          Nuevo Turno
        </button>
      </div>

      {shifts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Clock size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No hay turnos creados</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Comienza creando tu primer turno para el centro</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {shifts.map(shift => (
            <div
              key={shift.id}
              style={{ padding: '20px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>{shift.name}</h3>
                  {shift.status === 'draft' && (
                    <span style={{ padding: '4px 12px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      Borrador
                    </span>
                  )}
                  {shift.status === 'published' && (
                    <span style={{ padding: '4px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      Publicado
                    </span>
                  )}
                  {shift.status === 'archived' && (
                    <span style={{ padding: '4px 12px', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      Archivado
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                  <span>{shift.start_time} - {shift.end_time}</span>
                  <span>{shift.min_employees}-{shift.max_employees} empleados</span>
                  {shift.is_support && <span>Apoyo</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {shift.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(shift)}
                    style={{ padding: '8px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Publicar
                  </button>
                )}
                <button
                  onClick={() => handleEdit(shift)}
                  style={{ padding: '8px 12px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#0ea5e9' }}
                >
                  <Edit size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(shift)}
                  style={{ padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#dc2626' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
