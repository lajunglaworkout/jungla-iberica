import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { ShiftLocal, EmployeeLocal, CenterLocal, QuickAssignData } from './ShiftTypes';
import CreateShiftModal from './CreateShiftModal';

interface QuickAssignmentProps {
  shifts: ShiftLocal[];
  employees: EmployeeLocal[];
  centers: CenterLocal[];
  selectedCenter: number;
  selectedEmployeeIds: number[];
  setSelectedEmployeeIds: React.Dispatch<React.SetStateAction<number[]>>;
  quickAssignData: QuickAssignData;
  setQuickAssignData: React.Dispatch<React.SetStateAction<QuickAssignData>>;
  loading: boolean;
  onQuickAssign: () => void;
  onCreateShift: (shiftData: Record<string, unknown>) => void;
  onClearCache: () => void;
  onOpenBulkAssignment: () => void;
}

const QuickAssignment: React.FC<QuickAssignmentProps> = ({
  shifts,
  employees,
  centers,
  selectedCenter,
  selectedEmployeeIds,
  setSelectedEmployeeIds,
  quickAssignData,
  setQuickAssignData,
  loading,
  onQuickAssign,
  onCreateShift,
  onClearCache,
  onOpenBulkAssignment
}) => {
  const [showCreateShift, setShowCreateShift] = useState(false);

  const centerShifts = shifts.filter(s => s.center_id === selectedCenter);
  const centerEmployees = employees.filter(e => e.center_id === selectedCenter && e.activo);

  const handleCreateShift = async (shiftData: Partial<ShiftLocal>) => {
    await onCreateShift(shiftData);
    setShowCreateShift(false);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#059669' }}>⚡ Asignación Rápida de Turnos</h3>

      {/* LISTA DE TURNOS DISPONIBLES */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ color: '#374151', margin: 0 }}>1. Selecciona un Turno:</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowCreateShift(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ Crear Turno
            </button>
            <button
              onClick={onClearCache}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ LIMPIAR CACHÉ
            </button>
            <button
              onClick={onOpenBulkAssignment}
              style={{
                padding: '8px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📅 Programar por Fechas
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          {centerShifts.map(shift => (
            <div
              key={shift.id}
              onClick={() => {
                if (loading) return;
                console.log('🖱️ SELECCIONANDO TURNO:', shift.id);
                setQuickAssignData(prev => ({
                  ...prev,
                  shift_id: shift.id
                }));
                console.log('✅ Estado actualizado - Turno seleccionado:', shift.id);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: quickAssignData.shift_id === shift.id ? '#059669' : '#f9fafb',
                color: quickAssignData.shift_id === shift.id ? 'white' : '#374151',
                border: quickAssignData.shift_id === shift.id ? '3px solid #059669' : '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1,
                position: 'relative',
                zIndex: 999,
                userSelect: 'none',
                pointerEvents: 'auto'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                <Clock size={16} style={{ marginRight: '8px', display: 'inline' }} />
                {shift.name}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {shift.start_time} - {shift.end_time} | Necesita: {shift.min_employees}-{shift.max_employees} empleados
              </div>
              {shift.description && (
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                  {shift.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LISTA DE EMPLEADOS */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#374151', marginBottom: '10px' }}>2. Selecciona Empleados:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px' }}>
          {centerEmployees.map(employee => (
            <label
              key={employee.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={selectedEmployeeIds.includes(employee.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedEmployeeIds((prev: number[]) => [...prev, employee.id]);
                  } else {
                    setSelectedEmployeeIds((prev: number[]) => prev.filter((id: number) => id !== employee.id));
                  }
                }}
                style={{ marginRight: '8px' }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {employee.nombre} {employee.apellidos}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {employee.cargo || 'Empleado'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* MODAL CREAR TURNO */}
      {showCreateShift && (
        <CreateShiftModal
          onClose={() => setShowCreateShift(false)}
          onSave={handleCreateShift}
          centerName={centers.find(c => c.id === selectedCenter)?.name || ''}
        />
      )}

      {/* SELECTOR DE RANGO DE FECHAS */}
      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <h4 style={{ color: '#374151', marginBottom: '10px' }}>3. Selecciona el Periodo:</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '8px',
          border: '2px solid #e5e7eb'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151' }}>
              📅 Fecha Inicio
            </label>
            <input
              type="date"
              value={quickAssignData.start_date}
              onChange={(e) => setQuickAssignData({ ...quickAssignData, start_date: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151' }}>
              📅 Fecha Fin
            </label>
            <input
              type="date"
              value={quickAssignData.end_date}
              onChange={(e) => setQuickAssignData({ ...quickAssignData, end_date: e.target.value })}
              min={quickAssignData.start_date}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#dbeafe',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          💡 <strong>Tip:</strong> Selecciona todo el mes para asignar turnos de una vez. Por ejemplo: 01/11/2025 - 30/11/2025
        </div>
      </div>

      <button
        onClick={onQuickAssign}
        disabled={!quickAssignData.shift_id || selectedEmployeeIds.length === 0 || loading}
        style={{
          padding: '16px 32px',
          backgroundColor: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          opacity: (!quickAssignData.shift_id || selectedEmployeeIds.length === 0 || loading) ? 0.5 : 1,
          fontWeight: 'bold',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (!loading && quickAssignData.shift_id && selectedEmployeeIds.length > 0) {
            e.currentTarget.style.backgroundColor = '#047857';
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#059669';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '20px' }}>💾</span>
        {loading ? 'Guardando Asignaciones...' : 'GUARDAR ASIGNACIONES DE TURNOS'}
      </button>
    </div>
  );
};

export default QuickAssignment;
