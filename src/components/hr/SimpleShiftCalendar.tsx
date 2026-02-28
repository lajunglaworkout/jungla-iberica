import React, { useState, useEffect } from 'react';
import { getAllShifts, getAllEmployeeShiftAssignmentsWithDetails } from '../../services/hrService';

interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  center_id: number;
}

interface Assignment {
  id: number;
  employee_id: number;
  shift_id: number;
  date: string;
  employees?: { name: string };
  shifts?: { name: string; start_time: string; end_time: string };
}

const SimpleShiftCalendar = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    console.log('🔍 COMPONENTE LIMPIO - Cargando SOLO desde BD...');

    try {
      // Cargar turnos
      const { data: shiftsData, error: shiftsError } = await getAllShifts();

      if (shiftsError) throw new Error(shiftsError);

      // Cargar asignaciones
      const assignmentsData = await getAllEmployeeShiftAssignmentsWithDetails();

      console.log('📊 Datos REALES de BD:');
      console.log('  Turnos:', shiftsData?.length || 0);
      console.log('  Asignaciones:', assignmentsData?.length || 0);

      setShifts((shiftsData || []) as Shift[]);
      setAssignments((assignmentsData || []) as Assignment[]);

    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    console.log('🗑️ Limpiando estado local...');
    setShifts([]);
    setAssignments([]);
    // SEC-04: Only remove shift-related keys, never clear all (destroys Supabase auth session)
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('shift_') || k.startsWith('hr_'));
    keysToRemove.forEach(k => localStorage.removeItem(k));
    const sessionKeysToRemove = Object.keys(sessionStorage).filter(k => k.startsWith('shift_') || k.startsWith('hr_'));
    sessionKeysToRemove.forEach(k => sessionStorage.removeItem(k));
    window.location.reload();
  };

  if (loading) return <div>Cargando datos REALES desde BD...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2 style={{ color: '#059669' }}>🧪 Calendario LIMPIO - Solo BD</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={loadData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          🔄 Recargar desde BD
        </button>

        <button
          onClick={clearAll}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpiar Estado
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Total turnos en BD:</strong> {shifts.length}</p>
        <p><strong>Total asignaciones en BD:</strong> {assignments.length}</p>

        {shifts.length === 0 && assignments.length === 0 && (
          <p style={{ color: 'green', fontWeight: 'bold' }}>
            ✅ BD COMPLETAMENTE LIMPIA - No hay datos
          </p>
        )}
      </div>

      {shifts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>📋 Turnos encontrados:</h3>
          <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(shifts, null, 2)}
          </pre>
        </div>
      )}

      {assignments.length > 0 && (
        <div>
          <h3>👥 Asignaciones encontradas:</h3>
          <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(assignments, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SimpleShiftCalendar;
