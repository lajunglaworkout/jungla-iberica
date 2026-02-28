// src/components/hr/shiftAdvanced/ShiftAdvancedAssignments.tsx
import React, { useState } from 'react';
import { AlertCircle, Users, Save } from 'lucide-react';
import { getShiftsByIds, insertEmployeeShiftAssignments } from '../../../services/hrService';
import { ui } from '../../../utils/ui';
import { type Holiday } from '../../../services/holidayService';
import { type Shift, type Employee } from './ShiftAdvancedTypes';

interface Props {
  shifts: Shift[];
  employees: Employee[];
  holidays?: Holiday[];
  onSaveSuccess?: () => void;
}

export const ShiftAdvancedAssignments: React.FC<Props> = ({ shifts, employees, holidays = [], onSaveSuccess }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [pendingAssignments, setPendingAssignments] = useState<Record<string, { shiftId: number; employeeId: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isHoliday = (dateStr: string): Holiday | undefined => holidays.find(h => h.date === dateStr);
  const selectedHoliday = isHoliday(startDate);

  const handleEmployeeChange = (shiftId: number, slotIndex: number, employeeId: string) => {
    const key = `${shiftId}-${slotIndex}`;
    setPendingAssignments(prev => ({ ...prev, [key]: { shiftId, employeeId } }));
  };

  const handleSaveAssignments = async () => {
    if (Object.keys(pendingAssignments).length === 0) {
      ui.warning('No hay asignaciones para guardar');
      return;
    }

    setIsSaving(true);
    try {
      const shiftIds = [...new Set(Object.values(pendingAssignments).map(a => a.shiftId))];
      const shiftsData = await getShiftsByIds(shiftIds);
      const shiftsMap = new Map(shiftsData.map(s => [s.id as number, s]));
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const assignmentsToInsert = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (isHoliday(dateStr)) continue;
        const dayName = dayNames[d.getDay()];

        for (const assignment of Object.values(pendingAssignments)) {
          if (assignment.employeeId) {
            const shift = shiftsMap.get(assignment.shiftId);
            if (shift && shift[dayName] === true) {
              assignmentsToInsert.push({
                employee_id: Number(assignment.employeeId),
                shift_id: Number(assignment.shiftId),
                date: dateStr
              });
            }
          }
        }
      }

      const { success, count, error: insertErr } = await insertEmployeeShiftAssignments(assignmentsToInsert);
      if (!success) throw new Error(insertErr);

      ui.success(`${count} asignaciones guardadas correctamente. Redirigiendo al calendario...`);
      setPendingAssignments({});
      if (onSaveSuccess) setTimeout(() => onSaveSuccess(), 500);
    } catch (error: unknown) {
      ui.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Asignaciones de Empleados
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '10px', border: selectedHoliday ? '2px solid #ef4444' : '1px solid #d1d5db', borderRadius: '6px', backgroundColor: selectedHoliday ? '#fef2f2' : 'white', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px', fontSize: '14px', color: '#1e40af', marginBottom: '16px' }}>
          <strong>Tip:</strong> Selecciona empleados para cada turno y haz click en GUARDAR. Las asignaciones se aplicarán a todo el periodo seleccionado.
        </div>
        {selectedHoliday && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fee2e2', border: '2px solid #ef4444', borderRadius: '8px', color: '#991b1b', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>
            <span>{selectedHoliday.name}</span>
            <span style={{ fontSize: '12px', fontWeight: '400' }}>
              ({selectedHoliday.type === 'national' ? 'Nacional' : selectedHoliday.type === 'regional' ? 'Regional' : 'Local'})
            </span>
          </div>
        )}
      </div>

      {selectedHoliday && (
        <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle size={24} color="#dc2626" />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: 0 }}>Asignaciones Bloqueadas - Día Festivo</h3>
          </div>
          <p style={{ fontSize: '14px', color: '#991b1b', margin: 0, lineHeight: '1.6' }}>
            No se pueden asignar turnos en días festivos. El <strong>{selectedHoliday.name}</strong> es un festivo
            {selectedHoliday.type === 'national' ? ' nacional' : selectedHoliday.type === 'regional' ? ' regional' : ' local'}.
            Por favor, selecciona otra fecha.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {shifts.map(shift => (
          <div key={shift.id} style={{ padding: '20px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              {shift.name} ({shift.start_time} - {shift.end_time})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {Array.from({ length: shift.max_employees }, (_, i) => (
                <div key={i} style={{ padding: '12px', backgroundColor: 'white', border: '2px dashed #d1d5db', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
                  <Users size={24} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px' }}>Empleado {i + 1}</p>
                  <select
                    disabled={!!selectedHoliday}
                    value={pendingAssignments[`${shift.id}-${i}`]?.employeeId || ''}
                    onChange={(e) => handleEmployeeChange(shift.id, i, e.target.value)}
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '8px', cursor: selectedHoliday ? 'not-allowed' : 'pointer', backgroundColor: selectedHoliday ? '#f3f4f6' : 'white' }}
                  >
                    <option value="">{selectedHoliday ? 'Bloqueado' : 'Seleccionar...'}</option>
                    {!selectedHoliday && employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellidos}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleSaveAssignments}
          disabled={isSaving || Object.keys(pendingAssignments).length === 0}
          style={{
            padding: '16px 48px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
            cursor: (isSaving || Object.keys(pendingAssignments).length === 0) ? 'not-allowed' : 'pointer',
            opacity: (isSaving || Object.keys(pendingAssignments).length === 0) ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '12px'
          }}
        >
          <Save size={20} />
          {isSaving ? 'GUARDANDO...' : 'GUARDAR ASIGNACIONES DE TURNOS'}
        </button>
      </div>

      {Object.keys(pendingAssignments).length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px', textAlign: 'center', color: '#065f46', fontSize: '14px' }}>
          {Object.keys(pendingAssignments).length} empleado(s) seleccionado(s). Haz click en GUARDAR para aplicar las asignaciones.
        </div>
      )}
    </div>
  );
};
