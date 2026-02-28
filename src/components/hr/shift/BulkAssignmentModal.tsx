import React from 'react';
import { ShiftLocal, EmployeeLocal, BulkAssignmentData, SelectedDays, toLocalYMD } from './ShiftTypes';

interface BulkAssignmentModalProps {
  shifts: ShiftLocal[];
  employees: EmployeeLocal[];
  selectedCenter: number;
  loading: boolean;
  bulkAssignmentData: BulkAssignmentData;
  setBulkAssignmentData: React.Dispatch<React.SetStateAction<BulkAssignmentData>>;
  selectedDays: SelectedDays;
  setSelectedDays: React.Dispatch<React.SetStateAction<SelectedDays>>;
  onClose: () => void;
  onReset: () => void;
  onCreateBulk: () => void;
}

const BulkAssignmentModal: React.FC<BulkAssignmentModalProps> = ({
  shifts,
  employees,
  selectedCenter,
  loading,
  bulkAssignmentData,
  setBulkAssignmentData,
  selectedDays,
  setSelectedDays,
  onClose,
  onReset,
  onCreateBulk
}) => {
  return (
    <div onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ✕
        </button>
        <h3 style={{ margin: '0 0 20px 0', color: '#059669' }}>📅 Programar Turnos por Rango de Fechas</h3>

        <div style={{ display: 'grid', gap: '15px' }}>
          {/* Selección de Turno */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Turno *</label>
            <select
              value={bulkAssignmentData.shift_id || ''}
              onChange={(e) => setBulkAssignmentData({ ...bulkAssignmentData, shift_id: Number(e.target.value) || null })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Selecciona un turno...</option>
              {shifts.filter(s => s.center_id === selectedCenter).map(shift => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.start_time} - {shift.end_time})
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Empleado */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Empleado *</label>
            <select
              value={bulkAssignmentData.employee_id || ''}
              onChange={(e) => setBulkAssignmentData({ ...bulkAssignmentData, employee_id: Number(e.target.value) || null })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Selecciona un empleado...</option>
              {employees.filter(e => e.center_id === selectedCenter && e.activo).map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.nombre} {employee.apellidos}
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha Inicio *</label>
              <input
                type="date"
                value={bulkAssignmentData.start_date}
                onChange={(e) => setBulkAssignmentData({ ...bulkAssignmentData, start_date: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha Fin *</label>
              <input
                type="date"
                value={bulkAssignmentData.end_date}
                onChange={(e) => setBulkAssignmentData({ ...bulkAssignmentData, end_date: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          {/* Opciones adicionales */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={bulkAssignmentData.exclude_weekends}
                onChange={(e) => setBulkAssignmentData({ ...bulkAssignmentData, exclude_weekends: e.target.checked })}
              />
              Excluir fines de semana
            </label>
          </div>

          {/* Selector de días específicos */}
          <div className="days-selector">
            <h4 style={{ margin: '10px 0 6px 0', color: '#374151' }}>Días específicos (opcional):</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { key: 'monday', label: 'L' },
                { key: 'tuesday', label: 'M' },
                { key: 'wednesday', label: 'X' },
                { key: 'thursday', label: 'J' },
                { key: 'friday', label: 'V' },
                { key: 'saturday', label: 'S' },
                { key: 'sunday', label: 'D' }
              ].map((day: { key: keyof SelectedDays; label: string }) => (
                <label key={day.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={selectedDays[day.key]}
                    onChange={(e) => setSelectedDays({
                      ...selectedDays,
                      [day.key]: e.target.checked
                    })}
                  />
                  {day.label}
                </label>
              ))}
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              Si seleccionas alguno, se ignorará la configuración de días del turno y se usarán solo los marcados.
            </p>
          </div>

          <div style={{ padding: '8px 10px', background: '#ecfeff', borderRadius: '6px', border: '1px solid #0ea5e9' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e' }}>
              ℹ️ Por defecto se usan los días configurados del turno. Si marcas días específicos arriba, se usarán solo esos.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onReset}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onCreateBulk}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creando...' : 'Crear Asignaciones'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignmentModal;
