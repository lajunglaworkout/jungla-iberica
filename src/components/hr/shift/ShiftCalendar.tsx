import React from 'react';
import { ShiftLocal, EmployeeLocal, AssignmentWithDetails } from './ShiftTypes';

const STRICT_DB_MODE = true; // Modo estricto: mostrar SOLO asignaciones reales desde BD

interface ShiftCalendarProps {
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  assignments: AssignmentWithDetails[];
  shifts: ShiftLocal[];
  employees: EmployeeLocal[];
  selectedCenter: number;
}

const getEmployeeColor = (employeeId: number): string => {
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

const getEmployeeColorLight = (employeeId: number): string => {
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

const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  currentMonth,
  setCurrentMonth,
  assignments,
  shifts,
  employees,
  selectedCenter
}) => {
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

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

  const getShiftsForDay = (date: Date): ShiftLocal[] => {
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek] as keyof ShiftLocal;
    if (STRICT_DB_MODE) {
      return [] as ShiftLocal[];
    }
    return shifts.filter(shift =>
      shift.center_id === selectedCenter &&
      shift[dayName] === true
    );
  };

  const getAssignmentsForDate = (date: Date): AssignmentWithDetails[] => {
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

  const getEmployeesForShift = (shiftId: number, date: Date): AssignmentWithDetails[] => {
    const dateStr = date.toISOString().split('T')[0];
    const filtered = assignments.filter(a =>
      a.shift_id === shiftId &&
      a.date === dateStr
    );
    console.log(`[CALENDAR_DEBUG] Fecha ${dateStr}, Turno ${shiftId}: ${filtered.length} empleados`, filtered.map(a => a.employee_name));
    return filtered;
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
                    const min = shiftMeta?.min_employees ?? items.length;
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

export default ShiftCalendar;
