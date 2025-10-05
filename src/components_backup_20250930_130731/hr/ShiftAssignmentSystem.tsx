import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';
import { X, Clock, Users, AlertCircle } from 'lucide-react';

interface ShiftLocal {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  min_employees: number;
  max_employees: number;
  center_id: number;
  description?: string;
}

interface EmployeeLocal {
  id: number;
  nombre: string;
  apellidos: string;
  center_id: number;
  activo: boolean;
  cargo?: string;
}

interface CenterLocal {
  id: number;
  name: string;
}

interface ShiftAssignmentLocal {
  id?: number;
  employee_id: number;
  shift_id: number;
  date: string;
}

interface AssignmentWithDetails extends ShiftAssignmentLocal {
  employee_name: string;
  shift_name: string;
  shift_start_time: string;
  shift_end_time: string;
  shift_center_id?: number;
}

// Util: fecha local YYYY-MM-DD (evita desfases por huso horario)
const toLocalYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// MODAL CREAR TURNO
const CreateShiftModal: React.FC<{
  onClose: () => void;
  onSave: (data: any) => void;
  centerName: string;
}> = ({ onClose, onSave, centerName }) => {
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    min_employees: 1,
    max_employees: 3,
    description: '',
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
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
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#059669' }}>🕐 Crear Nuevo Turno - {centerName}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre del Turno *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Ej: Mañana, Tarde, Noche"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Inicio *</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Fin *</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Empleados Mínimos</label>
              <input
                type="number"
                min="1"
                value={formData.min_employees}
                onChange={(e) => setFormData({...formData, min_employees: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Empleados Máximos</label>
              <input
                type="number"
                min="1"
                value={formData.max_employees}
                onChange={(e) => setFormData({...formData, max_employees: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Días de la Semana</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { key: 'monday', label: 'Lun' },
                { key: 'tuesday', label: 'Mar' },
                { key: 'wednesday', label: 'Mié' },
                { key: 'thursday', label: 'Jue' },
                { key: 'friday', label: 'Vie' },
                { key: 'saturday', label: 'Sáb' },
                { key: 'sunday', label: 'Dom' }
              ].map(day => (
                <label key={day.key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={formData[day.key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData({...formData, [day.key]: e.target.checked})}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '60px' }}
              placeholder="Descripción opcional del turno"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Crear Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShiftAssignmentSystem: React.FC = () => {
  const { centers: dataCenters, employees: dataEmployees } = useData();
  const [selectedCenter, setSelectedCenter] = useState<number>(9); // Sevilla por defecto
  const [centers, setCenters] = useState<CenterLocal[]>([]);
  const [shifts, setShifts] = useState<ShiftLocal[]>([]);
  const [employees, setEmployees] = useState<EmployeeLocal[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showQuickAssign, setShowQuickAssign] = useState(false);
  const [quickAssignData, setQuickAssignData] = useState({
    shift_id: null as number | null,
    employee_id: null as number | null,
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, assignment: AssignmentWithDetails | null}>({show: false, assignment: null});
  const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkAssignmentData, setBulkAssignmentData] = useState({
    shift_id: null as number | null,
    employee_id: null as number | null,
    start_date: new Date().toISOString().split('T')[0] as string,
    end_date: new Date().toISOString().split('T')[0] as string,
    exclude_weekends: true,
    exclude_dates: [] as string[]
  });
  const [selectedDays, setSelectedDays] = useState<{
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });

  // PASO 1: Selector de Centro
  const CenterSelector = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#059669' }}>📍 Seleccionar Centro</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {centers.map(center => (
          <button 
            key={center.id}
            onClick={() => setSelectedCenter(center.id)}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedCenter === center.id ? '#059669' : '#f3f4f6',
              color: selectedCenter === center.id ? 'white' : '#374151',
              border: selectedCenter === center.id ? '2px solid #059669' : '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: selectedCenter === center.id ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ marginRight: '8px', display: 'inline' }}>📍</span>
            {center.name}
          </button>
        ))}
      </div>
    </div>
  );

  // PASO 2: Panel de Asignación Rápida
  const QuickAssignment = () => {
    // Usar estados globales en lugar de locales
    const [showCreateShift, setShowCreateShift] = useState(false);

    const handleQuickAssign = async () => {
      // Validar con los estados globales
      if (!quickAssignData.shift_id || selectedEmployeeIds.length === 0) {
        alert('Por favor selecciona un turno y al menos un empleado');
        return;
      }

      setLoading(true);
      try {
        // Verificar autenticación
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        const assignmentDate = toLocalYMD(new Date(quickAssignData.date ? new Date(quickAssignData.date) : new Date()));
        
        console.log('🚀 Creando asignaciones:', {
          user: user.email,
          selectedShift: quickAssignData.shift_id,
          selectedEmployees: selectedEmployeeIds,
          assignmentDate,
          quickAssignData
        });

        // Crear asignaciones una por una para mejor control de errores
        const results = [];
        for (const empId of selectedEmployeeIds) {
          try {
            const payload = {
              employee_id: Number(empId),
              shift_id: Number(quickAssignData.shift_id),
              date: assignmentDate
            };

            console.log('📦 Insertando:', payload);

            const { data, error } = await supabase
              .from('employee_shifts')
              .insert([payload])
              .select();

            if (error) {
              console.error('❌ Error en inserción:', error);
              throw error;
            }

            console.log('✅ Inserción exitosa:', data);
            results.push(data);
          } catch (empError: any) {
            console.error(`❌ Error asignando empleado ${empId}:`, empError);
            throw new Error(`Error asignando empleado ${empId}: ${empError.message}`);
          }
        }

        alert(`✅ ${results.length} asignación(es) creada(s) correctamente`);
        setSelectedEmployeeIds([]);
        setQuickAssignData({ shift_id: null, employee_id: null, date: toLocalYMD(new Date()) });
        await loadAssignments();
      } catch (error: any) {
        const extra = [
          error?.code ? `\nCódigo: ${error.code}` : '',
          error?.details ? `\nDetalles: ${error.details}` : '',
          error?.hint ? `\nPista: ${error.hint}` : '',
          `\nTurno: ${quickAssignData.shift_id}`,
          `\nEmpleados: ${selectedEmployeeIds.join(', ')}`
        ].join('');
        
        console.error('❌ Error completo:', error);
        const errorMsg = `Error al asignar turnos: ${error.message || 'desconocido'}${extra}`;
        setError(errorMsg);
        alert(`❌ ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    const centerShifts = shifts.filter(s => s.center_id === selectedCenter);
    const centerEmployees = employees.filter(e => e.center_id === selectedCenter && e.activo);

    const handleCreateShift = async (shiftData: Partial<ShiftLocal>) => {
      setLoading(true);
      try {
        const { error } = await supabase.from('shifts').insert({
          ...shiftData,
          center_id: selectedCenter
        });
        
        if (error) throw error;
        
        alert('✅ Turno creado correctamente');
        setShowCreateShift(false);
        loadShifts(); // Recargar turnos
      } catch (error: any) {
        alert(`❌ Error al crear turno: ${error.message}`);
      } finally {
        setLoading(false);
      }
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
                onClick={() => {
                  console.log('🗑️ LIMPIEZA FORZADA DE ESTADO');
                  setShifts([]);
                  setAssignments([]);
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
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
                onClick={() => setShowBulkAssignment(true)}
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

        <button 
          onClick={handleQuickAssign}
          disabled={!quickAssignData.shift_id || selectedEmployeeIds.length === 0 || loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            opacity: (!quickAssignData.shift_id || selectedEmployeeIds.length === 0 || loading) ? 0.5 : 1,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>💾</span>
          {loading ? 'Asignando...' : 'Asignar Turnos'}
        </button>
      </div>
    );
  };

  // PASO 3: Calendario Visual
  const STRICT_DB_MODE = true; // Modo estricto: mostrar SOLO asignaciones reales desde BD

  const ShiftCalendar = () => {
    const getDaysInMonth = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days = [];
      
      // Agregar días vacíos al inicio para alinear con lunes
      const startDay = firstDay.getDay();
      const mondayStart = startDay === 0 ? 6 : startDay - 1;
      for (let i = 0; i < mondayStart; i++) {
        days.push(null);
      }
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push(new Date(year, month, day));
      }
      return days;
    };

    // En modo estricto, solo usamos asignaciones reales. En modo normal, se mantiene la lógica previa.
    const getShiftsForDay = (date: Date) => {
      const dayOfWeek = date.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek] as keyof ShiftLocal;
      if (STRICT_DB_MODE) {
        // No generamos turnos desde plantillas cuando es estricto
        return [] as ShiftLocal[];
      }
      return shifts.filter(shift => 
        shift.center_id === selectedCenter && 
        shift[dayName] === true
      );
    };

    const getAssignmentsForDate = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] === INICIO getAssignmentsForDate ===`);
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Fecha solicitada: ${dateStr}`);
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Estado assignments:`, {
        length: assignments.length,
        isArray: Array.isArray(assignments),
        sample: assignments.slice(0, 3).map(a => ({ id: a.id, date: a.date, employee: a.employee_name, shift: a.shift_name }))
      });
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Centro seleccionado: ${selectedCenter}`);
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Estado shifts:`, {
        length: shifts.length,
        sample: shifts.slice(0, 2).map(s => ({ id: s.id, name: s.name, center_id: s.center_id }))
      });
      
      const byDate = assignments.filter(a => a.date === dateStr);
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Asignaciones para ${dateStr}:`, byDate.length);
      if (byDate.length > 0) {
        console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Detalle asignaciones por fecha:`, byDate.map(a => ({
          id: a.id,
          employee: a.employee_name,
          shift: a.shift_name,
          shift_center_id: a.shift_center_id,
          shift_id: a.shift_id
        })));
      }
      
      const filtered = byDate.filter(a => {
        if (a.shift_center_id !== undefined) return a.shift_center_id === selectedCenter;
        const sh = shifts.find(s => s.id === a.shift_id);
        return sh?.center_id === selectedCenter;
      });
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Asignaciones filtradas por centro ${selectedCenter}:`, filtered.length);
      if (filtered.length > 0) {
        console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] Detalle asignaciones filtradas:`, filtered.map(a => `${a.employee_name} - ${a.shift_name}`));
      }
      console.log(`[CALENDAR_ASSIGNMENTS_DEBUG] === FIN getAssignmentsForDate ===`);
      return filtered;
    };

    const getEmployeesForShift = (shiftId: number, date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const filtered = assignments.filter(a => 
        a.shift_id === shiftId &&
        a.date === dateStr
      );
      console.log(`[CALENDAR_DEBUG] Fecha ${dateStr}, Turno ${shiftId}: ${filtered.length} empleados`, filtered.map(a => a.employee_name));
      return filtered;
    };
    
    // Función para generar color único por empleado
    const getEmployeeColor = (employeeId: number) => {
      const colors = [
        '#3B82F6', // Azul
        '#10B981', // Verde
        '#F59E0B', // Amarillo
        '#EF4444', // Rojo
        '#8B5CF6', // Púrpura
        '#06B6D4', // Cian
        '#F97316', // Naranja
        '#84CC16', // Lima
        '#EC4899', // Rosa
        '#6B7280'  // Gris
      ];
      return colors[employeeId % colors.length];
    };
    
    const getEmployeeColorLight = (employeeId: number) => {
      const lightColors = [
        '#DBEAFE', // Azul claro
        '#D1FAE5', // Verde claro
        '#FEF3C7', // Amarillo claro
        '#FEE2E2', // Rojo claro
        '#EDE9FE', // Púrpura claro
        '#CFFAFE', // Cian claro
        '#FED7AA', // Naranja claro
        '#ECFCCB', // Lima claro
        '#FCE7F3', // Rosa claro
        '#F3F4F6'  // Gris claro
      ];
      return lightColors[employeeId % lightColors.length];
    };

    // Debug del estado actual del calendario
    console.log(`[CALENDAR_COMPONENT_DEBUG] === RENDERIZADO CALENDARIO ===`);
    console.log(`[CALENDAR_COMPONENT_DEBUG] Estado actual:`, {
      assignmentsLength: assignments.length,
      shiftsLength: shifts.length,
      employeesLength: employees.length,
      selectedCenter,
      currentMonth: currentMonth.toISOString().split('T')[0],
      assignmentsSample: assignments.slice(0, 3).map(a => ({ 
        id: a.id, 
        date: a.date, 
        employee: a.employee_name, 
        shift: a.shift_name,
        center: a.shift_center_id 
      }))
    });

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Estado de datos para debugging */}
        {assignments.length === 0 && employees.length > 0 && shifts.length > 0 && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            color: '#92400e',
            fontSize: '14px'
          }}>
            ⏳ <strong>Debug:</strong> Empleados cargados ({employees.length}), Turnos cargados ({shifts.length}), pero Asignaciones vacías ({assignments.length})
            <br />
            💡 <strong>Sugerencia:</strong> Usa "Asignación Rápida" para crear asignaciones de prueba y verificar si el calendario funciona correctamente.
          </div>
        )}
        
        {assignments.length > 0 && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            color: '#065f46',
            fontSize: '14px'
          }}>
            ✅ <strong>Debug:</strong> {assignments.length} asignaciones cargadas correctamente
          </div>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <span>◀️</span> Anterior
          </button>
          <h3 style={{ margin: 0, color: '#059669' }}>
            📅 {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Siguiente <span>▶️</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          marginBottom: '20px'
        }}>
          {/* Cabeceras de días */}
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} style={{ 
              fontWeight: 'bold', 
              textAlign: 'center', 
              padding: '10px',
              backgroundColor: '#f3f4f6',
              color: '#374151'
            }}>
              {day}
            </div>
          ))}
          {getDaysInMonth().map((date, index) => {
            if (!date) {
              return <div key={index} style={{ minHeight: '100px' }}></div>;
            }

            const isToday = date && date.toDateString() === new Date().toDateString();
            
            if (date) {
              console.log(`[CALENDAR_RENDER_DEBUG] Renderizando día ${date.getDate()}: ${date.toISOString().split('T')[0]}`);
              console.log(`[CALENDAR_RENDER_DEBUG] Estado global assignments.length: ${assignments.length}`);
            }
            
            const assignmentsForDate = date ? getAssignmentsForDate(date) : [];
            const shiftsForDay = date ? getShiftsForDay(date) : [];
            
            if (date && assignmentsForDate.length > 0) {
              console.log(`[CALENDAR_RENDER_DEBUG] Día ${date.getDate()} tiene ${assignmentsForDate.length} asignaciones`);
            }

            const dateStr = date.toISOString().split('T')[0];
            if (STRICT_DB_MODE) {
              // Logs de depuración por día
              if (assignmentsForDate.length > 0) {
                console.debug(`[STRICT_DB_MODE] ${dateStr}: ${assignmentsForDate.length} asignaciones reales`);
              }
            }
            
            return (
              <div 
                key={date.toISOString()} 
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  padding: '8px',
                  minHeight: '120px',
                  backgroundColor: isToday ? '#fef3c7' : 'white',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: isToday ? '#92400e' : '#374151'
                }}>
                  {date.getDate()}
                </div>
                
                {STRICT_DB_MODE ? (
                  // Renderizar SOLO tarjetas basadas en asignaciones reales agrupadas por turno
                  (() => {
                    if (assignmentsForDate.length === 0) return null;
                    const groups = assignmentsForDate.reduce((acc: Record<number, AssignmentWithDetails[]>, a) => {
                      if (!acc[a.shift_id]) acc[a.shift_id] = [];
                      acc[a.shift_id].push(a);
                      return acc;
                    }, {});
                    return Object.entries(groups).map(([shiftIdStr, items]) => {
                      const shiftId = Number(shiftIdStr);
                      const any = items[0];
                      const shiftMeta = shifts.find(s => s.id === shiftId);
                      const min = shiftMeta?.min_employees ?? items.length; // si no tenemos meta, asumimos cubierto por asignaciones
                      const isCovered = items.length >= min;
                      const start = any.shift_start_time;
                      const end = any.shift_end_time;
                      const name = any.shift_name;
                      return (
                        <div 
                          key={shiftId}
                          style={{
                            fontSize: '10px',
                            padding: '4px',
                            marginBottom: '4px',
                            borderRadius: '3px',
                            backgroundColor: isCovered ? '#d1fae5' : '#fee2e2',
                            color: isCovered ? '#065f46' : '#991b1b',
                            border: `1px solid ${isCovered ? '#10b981' : '#ef4444'}`
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>{name}</div>
                          <div>{items.length}/{min} empleados</div>
                          <div style={{ fontSize: '9px' }}>
                            {start}-{end}
                          </div>
                          {items.map((assignment, idx) => (
                            <div 
                              key={idx}
                              style={{
                                fontSize: '8px',
                                marginTop: '2px',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                backgroundColor: getEmployeeColorLight(assignment.employee_id),
                                color: getEmployeeColor(assignment.employee_id),
                                border: `1px solid ${getEmployeeColor(assignment.employee_id)}`,
                                fontWeight: 'bold'
                              }}
                            >
                              {assignment.employee_name}
                            </div>
                          ))}
                        </div>
                      );
                    });
                  })()
                ) : (
                  // Lógica previa (proyecciones desde plantilla de turnos)
                  shiftsForDay.map(shift => {
                    const employeesAssigned = getEmployeesForShift(shift.id, date);
                    const isCovered = employeesAssigned.length >= shift.min_employees;
                    return (
                      <div 
                        key={shift.id}
                        style={{
                          fontSize: '10px',
                          padding: '4px',
                          marginBottom: '4px',
                          borderRadius: '3px',
                          backgroundColor: isCovered ? '#d1fae5' : '#fee2e2',
                          color: isCovered ? '#065f46' : '#991b1b',
                          border: `1px solid ${isCovered ? '#10b981' : '#ef4444'}`
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>{shift.name}</div>
                        <div>{employeesAssigned.length}/{shift.min_employees} empleados</div>
                        <div style={{ fontSize: '9px' }}>
                          {shift.start_time}-{shift.end_time}
                        </div>
                        {employeesAssigned.map((assignment, idx) => (
                          <div 
                            key={idx}
                            style={{
                              fontSize: '8px',
                              marginTop: '2px',
                              padding: '2px 4px',
                              borderRadius: '2px',
                              backgroundColor: getEmployeeColorLight(assignment.employee_id),
                              color: getEmployeeColor(assignment.employee_id),
                              border: `1px solid ${getEmployeeColor(assignment.employee_id)}`,
                              fontWeight: 'bold'
                            }}
                          >
                            {assignment.employee_name}
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>

        {/* LEYENDA */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          fontSize: '14px',
          flexWrap: 'wrap'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: '2px' }}></div>
            Turno cubierto
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '2px' }}></div>
            Falta personal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '2px' }}></div>
            Hoy
          </span>
        </div>
        
        {/* LEYENDA DE EMPLEADOS */}
        {employees.filter(emp => emp.center_id === selectedCenter).length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ color: '#374151', marginBottom: '10px', fontSize: '14px' }}>👥 Empleados del Centro:</h4>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap',
              fontSize: '12px'
            }}>
              {employees.filter(emp => emp.center_id === selectedCenter).map(employee => (
                <span 
                  key={employee.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getEmployeeColorLight(employee.id),
                    color: getEmployeeColor(employee.id),
                    border: `1px solid ${getEmployeeColor(employee.id)}`,
                    fontWeight: 'bold'
                  }}
                >
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: getEmployeeColor(employee.id), 
                    borderRadius: '50%' 
                  }}></div>
                  {employee.nombre} {employee.apellidos}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // PASO 4: Vista de Asignaciones Actuales
  const CurrentAssignments = () => {
    const handleRemoveAssignment = async (assignment: AssignmentWithDetails) => {
      console.log('🖱️ Click en Eliminar', { assignment });
      setShowDeleteConfirm({show: true, assignment});
    };

    const confirmDelete = async () => {
      const assignment = showDeleteConfirm.assignment;
      if (!assignment) return;
      
      setShowDeleteConfirm({show: false, assignment: null});
      setLoading(true);
      
      try {
        console.log('✅ Confirmación de eliminación aceptada para:', assignment.id);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        
        console.log('🗑️ Eliminando asignación:', {
          user: user.email,
          assignmentId: assignment.id,
          employee: assignment.employee_name,
          shift: assignment.shift_name
        });
        
        const { data, error } = await supabase
          .from('employee_shifts')
          .delete()
          .eq('id', assignment.id)
          .select();
        
        if (error) throw error;
        
        console.log('✅ Eliminación exitosa:', data);
        await loadAssignments();
        
      } catch (error: any) {
        console.error('❌ Error eliminando asignación:', error);
        setError(`Error eliminando asignación: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const confirmBulkDelete = async () => {
      if (selectedAssignments.size === 0) return;
      
      setShowBulkDeleteConfirm(false);
      setLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        
        console.log('🗑️ Eliminación múltiple:', {
          user: user.email,
          assignmentIds: Array.from(selectedAssignments),
          count: selectedAssignments.size
        });
        
        const { data, error } = await supabase
          .from('employee_shifts')
          .delete()
          .in('id', Array.from(selectedAssignments))
          .select();
        
        if (error) throw error;
        
        console.log('✅ Eliminación múltiple exitosa:', data);
        setSelectedAssignments(new Set());
        await loadAssignments();
        
      } catch (error: any) {
        console.error('❌ Error en eliminación múltiple:', error);
        setError(`Error eliminando asignaciones: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const centerAssignments = assignments.filter(a => {
      const shift = shifts.find(s => s.id === a.shift_id);
      return shift?.center_id === selectedCenter;
    });
    
    // Debug para centerAssignments
    console.log(`[CENTER_ASSIGNMENTS_DEBUG] Filtrando asignaciones para centro ${selectedCenter}:`);
    console.log(`[CENTER_ASSIGNMENTS_DEBUG] Total assignments: ${assignments.length}`);
    console.log(`[CENTER_ASSIGNMENTS_DEBUG] Total shifts: ${shifts.length}`);
    console.log(`[CENTER_ASSIGNMENTS_DEBUG] Center assignments filtradas: ${centerAssignments.length}`);
    if (assignments.length > 0 && centerAssignments.length === 0) {
      console.log(`[CENTER_ASSIGNMENTS_DEBUG] ⚠️ PROBLEMA: Hay assignments (${assignments.length}) pero ninguna para centro ${selectedCenter}`);
      console.log(`[CENTER_ASSIGNMENTS_DEBUG] Shifts disponibles:`, shifts.map(s => ({ id: s.id, name: s.name, center_id: s.center_id })));
      console.log(`[CENTER_ASSIGNMENTS_DEBUG] Assignments sample:`, assignments.slice(0, 3).map(a => ({ 
        shift_id: a.shift_id, 
        shift_center_id: a.shift_center_id,
        employee: a.employee_name 
      })));
    }

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: '0', color: '#059669' }}>
            📋 Asignaciones Actuales - {centers.find(c => c.id === selectedCenter)?.name || 'Centro'}
          </h3>
          {selectedAssignments.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Eliminar Seleccionadas ({selectedAssignments.size})
            </button>
          )}
        </div>
        
        {centerAssignments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280',
            borderRadius: '8px'
          }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No hay asignaciones para este centro</p>
            <p style={{ fontSize: '14px' }}>Usa el panel de asignación rápida para comenzar</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedAssignments.size === centerAssignments.length && centerAssignments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssignments(new Set(centerAssignments.map(a => a.id).filter((id): id is number => id !== undefined)));
                        } else {
                          setSelectedAssignments(new Set());
                        }
                      }}
                    />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Empleado</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Turno</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Horario</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Desde</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Hasta</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {centerAssignments.map((assignment, index) => (
                  <tr key={`${assignment.employee_id}-${assignment.shift_id}-${index}`} style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: assignment.id && selectedAssignments.has(assignment.id) ? '#f0f9ff' : 'transparent'
                  }}>
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={assignment.id ? selectedAssignments.has(assignment.id) : false}
                        onChange={(e) => {
                          const newSelected = new Set(selectedAssignments);
                          if (e.target.checked && assignment.id) {
                            newSelected.add(assignment.id);
                          } else if (assignment.id) {
                            newSelected.delete(assignment.id);
                          }
                          setSelectedAssignments(newSelected);
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>{assignment.employee_name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>{assignment.shift_name}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {assignment.shift_start_time} - {assignment.shift_end_time}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(assignment.date).toLocaleDateString('es-ES')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      Indefinido
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div
                        onClick={() => {
                          console.log('🖱️ CLICK DETECTADO en Eliminar', { 
                            assignment_id: assignment.id,
                            loading
                          });
                          if (loading) {
                            console.log('⚠️ Click ignorado: loading=true');
                            return;
                          }
                          handleRemoveAssignment(assignment);
                        }}
                        style={{
                          display: 'inline-block',
                          padding: '8px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          opacity: loading ? 0.5 : 1,
                          position: 'relative',
                          zIndex: 999,
                          userSelect: 'none',
                          pointerEvents: loading ? 'none' : 'auto'
                        }}
                      >
                        Eliminar
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm.show && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>⚠️ Confirmar Eliminación</h3>
              <p style={{ margin: '0 0 16px 0' }}>
                ¿Estás seguro de que quieres eliminar esta asignación?
              </p>
              <div style={{ 
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                <strong>Empleado:</strong> {showDeleteConfirm.assignment?.employee_name}<br/>
                <strong>Turno:</strong> {showDeleteConfirm.assignment?.shift_name}<br/>
                <strong>Fecha:</strong> {showDeleteConfirm.assignment ? new Date(showDeleteConfirm.assignment.date).toLocaleDateString('es-ES') : ''}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteConfirm({show: false, assignment: null})}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación múltiple */}
        {showBulkDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>⚠️ Confirmar Eliminación Múltiple</h3>
              <p style={{ margin: '0 0 16px 0' }}>
                ¿Estás seguro de que quieres eliminar <strong>{selectedAssignments.size}</strong> asignaciones seleccionadas?
              </p>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBulkDelete}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Eliminar {selectedAssignments.size} Asignaciones
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // CARGAR DATOS
  const loadCenters = useCallback(async () => {
    try {
      // Usar centros del DataContext y mapear a formato esperado
      const mappedCenters = dataCenters.map((center: any) => ({
        id: parseInt(center.id) || center.center_id || 9,
        name: center.name || center.nombre || center.center_name || 'Centro'
      }));
      
      // Si no hay centros del contexto, usar los por defecto
      if (mappedCenters.length === 0) {
        const defaultCenters = [
          { id: 9, name: 'Sevilla' },
          { id: 10, name: 'Jerez' },
          { id: 11, name: 'Puerto' }
        ];
        setCenters(defaultCenters);
      } else {
        setCenters(mappedCenters);
      }
      
      console.log('✅ Centros cargados para turnos:', mappedCenters.length || 3);
    } catch (error: any) {
      setError(`Error al cargar centros: ${error.message}`);
    }
  }, [dataCenters]);

  const loadEmployees = useCallback(async () => {
    try {
      console.log('🔄 Cargando empleados desde contexto...');
      console.log('Empleados disponibles:', dataEmployees?.length || 0);
      console.log('Centro seleccionado:', selectedCenter);
      
      if (!dataEmployees || dataEmployees.length === 0) {
        console.log('⚠️ No hay empleados en el contexto');
        setEmployees([]);
        return;
      }
      
      // Normalizar y filtrar empleados activos del centro seleccionado
      const employeesArr = (dataEmployees as any[]);
      const activeEmployees = employeesArr.filter((emp: any) => {
        const centerIdNum = Number(emp.center_id);
        const isActive = emp?.activo === true || emp?.is_active === true;
        const matchesCenter = centerIdNum === selectedCenter;
        console.log(`Empleado ${emp?.name || emp?.nombre}: activo=${isActive}, centro=${emp?.center_id}, coincide=${matchesCenter}`);
        return matchesCenter && isActive;
      });
      
      console.log('Empleados filtrados:', activeEmployees.length);
      
      // Mapear a la estructura que necesitamos
      const mappedEmployees: EmployeeLocal[] = activeEmployees.map((emp: any) => ({
        id: Number(emp.id),
        nombre: emp?.nombre || emp?.name || 'Sin nombre',
        apellidos: emp?.apellidos || '',
        center_id: Number(emp?.center_id) || selectedCenter,
        activo: Boolean(emp?.activo || emp?.is_active),
        cargo: emp?.cargo || emp?.role || ''
      }));
      
      setEmployees(mappedEmployees);
      console.log('✅ Empleados cargados para turnos:', mappedEmployees.length);
    } catch (error: any) {
      console.error('❌ Error cargando empleados:', error);
      setError(`Error al cargar empleados: ${error.message}`);
      setEmployees([]);
    }
  }, [dataEmployees, selectedCenter]);

  const loadShifts = useCallback(async () => {
    try {
      console.log('🔄 Cargando turnos para centro:', selectedCenter);
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('center_id', selectedCenter);
      
      if (error) throw error;
      
      console.log('📋 Turnos encontrados en BD:', data?.length || 0);
      
      setShifts(data || []);
      
      if (!data || data.length === 0) {
        console.log('⚠️ No hay turnos para el centro', selectedCenter);
      }
      
    } catch (error: any) {
      console.error('❌ Error cargando turnos:', error);
      setError(`Error al cargar turnos: ${error.message}`);
      setShifts([]); // Limpiar en caso de error
    }
  }, [selectedCenter]);

  const loadAssignments = useCallback(async () => {
    console.log(`[LOAD_ASSIGNMENTS_DEBUG] === INICIO loadAssignments ===`);
    console.log(`[LOAD_ASSIGNMENTS_DEBUG] Estado inicial:`, {
      selectedCenter,
      currentMonth: currentMonth.toISOString().split('T')[0],
      employeesCount: employees.length,
      shiftsCount: shifts.length,
      assignmentsCount: assignments.length
    });
    
    try {
      // Limitar por mes actual y por centro seleccionado directamente en la consulta
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const monthStart = toLocalYMD(new Date(year, month, 1));
      const monthEnd = toLocalYMD(new Date(year, month + 1, 0));

      console.log(`[LOAD_ASSIGNMENTS_DEBUG] Parámetros consulta:`, {
        monthStart,
        monthEnd,
        selectedCenter,
        dateRange: `${monthStart} to ${monthEnd}`
      });

      const { data, error } = await supabase
        .from('employee_shifts')
        .select(`
          *,
          shifts!inner(name, start_time, end_time, center_id)
        `)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .eq('shifts.center_id', selectedCenter)
        .order('date', { ascending: true })
        .order('shift_id', { ascending: true });
      
      console.log(`[LOAD_ASSIGNMENTS_DEBUG] Respuesta Supabase:`, {
        error: error?.message,
        dataLength: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });
      
      // Log específico para verificar si hay datos en la tabla
      if (!data || data.length === 0) {
        console.log(`[LOAD_ASSIGNMENTS_DEBUG] ⚠️ NO SE ENCONTRARON ASIGNACIONES en la consulta`);
        console.log(`[LOAD_ASSIGNMENTS_DEBUG] Verificando si hay datos en la tabla employee_shifts...`);
        
        // Consulta simple para verificar si hay datos en la tabla
        const { data: allData, error: allError } = await supabase
          .from('employee_shifts')
          .select('*')
          .limit(5);
          
        console.log(`[LOAD_ASSIGNMENTS_DEBUG] Consulta general employee_shifts:`, {
          error: allError?.message,
          totalRecords: allData?.length || 0,
          sample: allData?.slice(0, 2)
        });
        
        // Si no hay datos en absoluto, mostrar sugerencia
        if (!allData || allData.length === 0) {
          console.log(`[LOAD_ASSIGNMENTS_DEBUG] 💡 TABLA VACÍA: No hay asignaciones en employee_shifts`);
          console.log(`[LOAD_ASSIGNMENTS_DEBUG] 💡 SUGERENCIA: Usar "Asignación Rápida" para crear algunas asignaciones de prueba`);
        }
      }
      
      if (error) throw error;
      
      // Eliminar duplicados basados en employee_id, shift_id y date
      const uniqueData = (data || []).filter((item, index, arr) => 
        arr.findIndex(other => 
          other.employee_id === item.employee_id && 
          other.shift_id === item.shift_id && 
          other.date === item.date
        ) === index
      );
      
      console.log('🧭 Asignaciones crudas recibidas:', data?.length || 0, `rango ${monthStart}..${monthEnd} centro ${selectedCenter}`);
      console.log('🧹 Asignaciones únicas tras filtrado:', uniqueData.length);

      const mappedAssignments: AssignmentWithDetails[] = uniqueData.map((item: any) => {
        // Buscar el empleado real por ID (para nombre). Si no está cargado aún, dejar fallback.
        const employee = employees.find(emp => emp.id === item.employee_id);
        const employeeName = employee ? `${employee.nombre} ${employee.apellidos}`.trim() : `Empleado ${item.employee_id}`;
        
        const shiftJoined = (item as any).shifts || {};
        return {
          id: item.id,
          employee_id: item.employee_id,
          shift_id: item.shift_id,
          date: item.date,
          employee_name: employeeName,
          shift_name: shiftJoined.name || 'Turno',
          shift_start_time: shiftJoined.start_time || '',
          shift_end_time: shiftJoined.end_time || '',
          shift_center_id: shiftJoined.center_id
        };
      });
      
      setAssignments(mappedAssignments);
      console.log('✅ Asignaciones cargadas (sin duplicados):', mappedAssignments.length);
      const forSelectedCenter = mappedAssignments.filter(a => a.shift_center_id === selectedCenter).length;
      console.log(`🏷️ Para centro ${selectedCenter}:`, forSelectedCenter);
      const sample = mappedAssignments.slice(0, 5).map(a => ({ id: a.id, emp: a.employee_id, shift: a.shift_id, date: a.date, center: a.shift_center_id }));
      if (sample.length) console.log('📄 Muestra asignaciones:', sample);
      
      // Log duplicados encontrados
      const duplicatesCount = (data || []).length - uniqueData.length;
      if (duplicatesCount > 0) {
        console.log(`⚠️ Se eliminaron ${duplicatesCount} duplicados`);
      }
      
      console.log(`[LOAD_ASSIGNMENTS_DEBUG] === FIN loadAssignments ===`);
      console.log(`[LOAD_ASSIGNMENTS_DEBUG] Estado final assignments:`, {
        length: mappedAssignments.length,
        dates: [...new Set(mappedAssignments.map(a => a.date))].sort(),
        employees: [...new Set(mappedAssignments.map(a => a.employee_name))],
        shifts: [...new Set(mappedAssignments.map(a => a.shift_name))]
      });
      
    } catch (error: any) {
      console.error(`[LOAD_ASSIGNMENTS_DEBUG] ❌ Error en loadAssignments:`, error);
      setError(`Error al cargar asignaciones: ${error.message}`);
    }
  }, [employees, selectedCenter, currentMonth]);

  useEffect(() => {
    loadCenters();
    loadEmployees();
  }, [loadCenters, loadEmployees]);
  
  useEffect(() => {
    if (selectedCenter) {
      console.log('🔍 DEPURACIÓN TURNOS - useEffect disparado');
      console.log('Centro seleccionado:', selectedCenter);
      console.log('Turnos en estado antes de cargar:', shifts);
      loadShifts();
    }
  }, [selectedCenter, loadShifts]);

  useEffect(() => {
    if (employees.length > 0) {
      loadAssignments();
    }
  }, [employees, loadAssignments]);

  // Recargar asignaciones cuando cambie el mes del calendario
  useEffect(() => {
    if (employees.length > 0 && shifts.length > 0) {
      console.log(`[CALENDAR_MONTH_DEBUG] Mes cambiado a: ${currentMonth.toISOString().split('T')[0]}`);
      loadAssignments();
    }
  }, [currentMonth, employees, shifts, loadAssignments]);


  // Función para crear asignaciones en lote por rango de fechas
  const createBulkAssignments = async () => {
    try {
      setLoading(true);
      
      if (!bulkAssignmentData.shift_id || !bulkAssignmentData.employee_id || !bulkAssignmentData.start_date || !bulkAssignmentData.end_date) {
        alert('❌ Por favor completa todos los campos obligatorios');
        return;
      }
      
      const startDate = new Date(bulkAssignmentData.start_date);
      const endDate = new Date(bulkAssignmentData.end_date);
      
      if (startDate > endDate) {
        alert('❌ La fecha de inicio debe ser anterior a la fecha de fin');
        return;
      }
      
      // Obtener el turno para verificar días de la semana
      const shift = shifts.find(s => s.id === bulkAssignmentData.shift_id);
      if (!shift) {
        alert('❌ Turno no encontrado');
        return;
      }
      
      const assignmentsToCreate = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek] as keyof ShiftLocal;

        // Determinar si aplicar por días seleccionados manualmente o por configuración del turno
        const hasSelectedDays = Object.values(selectedDays).some(v => v);
        const manualSelected = hasSelectedDays
          ? (selectedDays as any)[dayName] === true
          : false;

        // Verificar si el turno aplica para este día (automático si no hay selección manual)
        const shouldAssign = hasSelectedDays ? manualSelected : (shift[dayName] === true);
        
        // Excluir fines de semana si está marcado
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const skipWeekend = bulkAssignmentData.exclude_weekends && isWeekend;
        
        // Excluir fechas específicas
        const dateStr = toLocalYMD(currentDate);
        const isExcluded = bulkAssignmentData.exclude_dates.includes(dateStr);
        
        if (shouldAssign && !skipWeekend && !isExcluded) {
          assignmentsToCreate.push({
            employee_id: bulkAssignmentData.employee_id,
            shift_id: bulkAssignmentData.shift_id,
            date: dateStr
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`📋 Preparando creación para ${assignmentsToCreate.length} asignaciones...`);

      // Evitar duplicados sin depender de ON CONFLICT: consultar existentes y filtrar
      let existingDatesSet = new Set<string>();
      const allDates = assignmentsToCreate.map(a => a.date);
      const checkBatchSize = 200;
      for (let i = 0; i < allDates.length; i += checkBatchSize) {
        const dateBatch = allDates.slice(i, i + checkBatchSize);
        const { data: existingBatch, error: existingErr } = await supabase
          .from('employee_shifts')
          .select('date')
          .eq('employee_id', bulkAssignmentData.employee_id as number)
          .eq('shift_id', bulkAssignmentData.shift_id as number)
          .in('date', dateBatch);
        if (existingErr) throw existingErr;
        (existingBatch || []).forEach((row: any) => existingDatesSet.add(row.date));
      }

      const toInsert = assignmentsToCreate.filter(a => !existingDatesSet.has(a.date));
      console.log(`🧹 Filtrado: ${assignmentsToCreate.length - toInsert.length} duplicados; ${toInsert.length} por insertar`);

      // Insertar en lotes
      const batchSize = 50;
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        if (batch.length === 0) continue;
        const { error } = await supabase
          .from('employee_shifts')
          .insert(batch);
        if (error) throw error;
      }
      
      // Recargar datos
      loadAssignments();
      setShowBulkAssignment(false);
      setBulkAssignmentData({
        shift_id: null,
        employee_id: null,
        start_date: toLocalYMD(new Date()),
        end_date: toLocalYMD(new Date()),
        exclude_weekends: true,
        exclude_dates: []
      });
      setSelectedDays({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      });
      
      alert(`✅ ${toInsert.length} asignaciones creadas correctamente${existingDatesSet.size ? ` (omitidas ${existingDatesSet.size} existentes)` : ''}`);
      
    } catch (error: any) {
      console.error('❌ Error creando asignaciones en lote:', error);
      setError(`Error creando asignaciones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          color: '#059669', 
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          🎯 Sistema de Asignación de Turnos
        </h2>
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
            <button 
              onClick={() => setError(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}
        
        <CenterSelector />
        <QuickAssignment />
        
        {/* Modal de Programación por Fechas */}
        {showBulkAssignment && (
          <div onClick={() => setShowBulkAssignment(false)} style={{
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
                onClick={() => setShowBulkAssignment(false)}
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
                    onChange={(e) => setBulkAssignmentData({...bulkAssignmentData, shift_id: Number(e.target.value) || null})}
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
                    onChange={(e) => setBulkAssignmentData({...bulkAssignmentData, employee_id: Number(e.target.value) || null})}
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
                      onChange={(e) => setBulkAssignmentData({...bulkAssignmentData, start_date: e.target.value})}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha Fin *</label>
                    <input
                      type="date"
                      value={bulkAssignmentData.end_date}
                      onChange={(e) => setBulkAssignmentData({...bulkAssignmentData, end_date: e.target.value})}
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
                      onChange={(e) => setBulkAssignmentData({...bulkAssignmentData, exclude_weekends: e.target.checked})}
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
                    ].map((day: any) => (
                      <label key={day.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          checked={(selectedDays as any)[day.key]}
                          onChange={(e) => setSelectedDays({
                            ...(selectedDays as any),
                            [day.key]: e.target.checked
                          } as any)}
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
                  onClick={() => {
                    setShowBulkAssignment(false);
                    setBulkAssignmentData({
                      shift_id: null,
                      employee_id: null,
                      start_date: toLocalYMD(new Date()),
                      end_date: toLocalYMD(new Date()),
                      exclude_weekends: true,
                      exclude_dates: []
                    });
                    setSelectedDays({
                      monday: false,
                      tuesday: false,
                      wednesday: false,
                      thursday: false,
                      friday: false,
                      saturday: false,
                      sunday: false
                    });
                  }}
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
                  onClick={createBulkAssignments}
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
        )}
        
        <ShiftCalendar />
        <CurrentAssignments />
      </div>
    </div>
  );
};

export default ShiftAssignmentSystem;
