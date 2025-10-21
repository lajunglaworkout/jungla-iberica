import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Holiday } from '../../services/holidayService';

interface ShiftAssignment {
  id: number;
  employee_id: number;
  shift_id: number;
  date: string;
  employee?: { name: string };
  shift?: { name: string; start_time: string; end_time: string };
}

interface Employee {
  id: number;
  nombre: string;
  apellidos: string;
  avatar?: string;
}

interface ShiftCalendarCleanProps {
  holidays?: Holiday[];
}

const ShiftCalendarClean: React.FC<ShiftCalendarCleanProps> = ({ holidays = [] }) => {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  // Verificar si una fecha es festivo
  const isHoliday = (dateStr: string): Holiday | undefined => {
    return holidays.find(h => h.date === dateStr);
  };

  // SOLO cargar desde BD - NADA hardcodeado
  const loadAssignments = async () => {
    console.log('🔄 Cargando SOLO desde base de datos...');
    setLoading(true);
    try {
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('employee_shifts')
        .select(`
          *,
          employee:employees(name),
          shift:shifts(name, start_time, end_time)
        `)
        .gte('date', fmt(startDate))
        .lte('date', fmt(endDate))
        .order('date', { ascending: true });

      if (error) {
        console.error('❌ Error cargando:', error);
        setAssignments([]);
      } else {
        console.log('✅ Datos reales cargados:', data);
        setAssignments((data as any) || []);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar empleados
  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, nombre, apellidos')
        .eq('activo', true)
        .order('nombre');

      if (!error && data) {
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  // Obtener semana actual
  const getWeekDates = () => {
    const start = new Date(selectedMonth);
    start.setDate(start.getDate() - start.getDay() + 1); // Lunes
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  // Obtener asignaciones de un empleado en una fecha
  const getEmployeeShifts = (employeeId: number, date: Date) => {
    const dateStr = fmt(date);
    return assignments.filter(a => a.employee_id === employeeId && a.date === dateStr);
  };

  // Limpiar TODO
  const clearEverything = async () => {
    console.log('🗑️ Limpiando TODO...');

    // Limpiar estado
    setAssignments([]);

    // Limpiar localStorage / sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    // Limpiar caches del navegador si existen
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
    } catch {}

    // Recargar datos
    await loadAssignments();

    alert('✅ Limpieza completa realizada');
  };

  useEffect(() => {
    loadAssignments();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  // Generar días del mes
  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [] as Array<{ date: string; day: number; dayOfWeek: number; assignments: ShiftAssignment[] }>;

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = fmt(date);
      const dayAssignments = assignments.filter(a => a.date === dateStr);
      days.push({ date: dateStr, day: i, dayOfWeek: date.getDay(), assignments: dayAssignments });
    }
    return days;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando calendario LIMPIO...</h2>
        <p>Solo datos de la base de datos, sin información hardcodeada</p>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '0' }}>
      {/* Header estilo Factorial */}
      <div style={{ backgroundColor: 'white', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', marginBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#111827' }}>
              📅 Turnos
            </h2>
            
            {/* Toggle Vista */}
            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
              <button
                onClick={() => setViewMode('week')}
                style={{
                  padding: '6px 16px',
                  backgroundColor: viewMode === 'week' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: viewMode === 'week' ? '600' : '400',
                  color: viewMode === 'week' ? '#059669' : '#6b7280',
                  boxShadow: viewMode === 'week' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  padding: '6px 16px',
                  backgroundColor: viewMode === 'month' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: viewMode === 'month' ? '600' : '400',
                  color: viewMode === 'month' ? '#059669' : '#6b7280',
                  boxShadow: viewMode === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Mes
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={loadAssignments}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} /> Recargar
          </button>

          <button
            onClick={clearEverything}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={16} /> Limpiar TODO
          </button>
          </div>
        </div>
      </div>

      {/* Navegación de mes estilo Factorial */}
      <div style={{ backgroundColor: 'white', padding: '16px 24px', marginBottom: '0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => { const m = new Date(selectedMonth); m.setMonth(m.getMonth() - 1); setSelectedMonth(m); }}
          style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', minWidth: '200px', textAlign: 'center' }}>
          {selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
        </span>
        <button 
          onClick={() => { const m = new Date(selectedMonth); m.setMonth(m.getMonth() + 1); setSelectedMonth(m); }}
          style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* VISTA SEMANAL TIPO FACTORIAL */}
      {viewMode === 'week' ? (
        <div style={{ backgroundColor: 'white', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
            {/* Header de días */}
            <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: '600', fontSize: '12px', color: '#6b7280' }}>
              EMPLEADO
            </div>
            {getWeekDates().map((date, i) => (
              <div key={i} style={{ backgroundColor: '#f9fafb', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginTop: '4px' }}>
                  {date.getDate()}
                </div>
              </div>
            ))}

            {/* Filas de empleados */}
            {employees.map(employee => (
              <React.Fragment key={employee.id}>
                {/* Columna empleado */}
                <div style={{ backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: '#059669', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {employee.nombre.charAt(0)}{employee.apellidos.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      {employee.nombre} {employee.apellidos}
                    </div>
                  </div>
                </div>

                {/* Celdas de turnos por día */}
                {getWeekDates().map((date, dayIndex) => {
                  const shifts = getEmployeeShifts(employee.id, date);
                  const dateStr = fmt(date);
                  const holiday = isHoliday(dateStr);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      style={{ 
                        backgroundColor: holiday ? '#fef2f2' : 'white', 
                        padding: '8px',
                        minHeight: '80px'
                      }}
                    >
                      {shifts.map((shift, idx) => (
                        <div 
                          key={idx}
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            marginBottom: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ fontWeight: '600' }}>{shift.shift?.name}</div>
                          <div style={{ fontSize: '11px', opacity: 0.9 }}>
                            {shift.shift?.start_time} - {shift.shift?.end_time}
                          </div>
                        </div>
                      ))}
                      {holiday && shifts.length === 0 && (
                        <div style={{ fontSize: '11px', color: '#dc2626', textAlign: 'center', padding: '8px' }}>
                          🎉 {holiday.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        /* VISTA MENSUAL */
        assignments.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '10px' }}>
          <h3 style={{ color: '#10b981' }}>✅ CALENDARIO LIMPIO</h3>
          <p>No hay turnos asignados en la base de datos para este mes</p>
          <p>NO hay datos hardcodeados ni información fantasma</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', backgroundColor: '#e5e7eb' }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} style={{ padding: '10px', backgroundColor: '#374151', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              {day}
            </div>
          ))}

          {Array.from({ length: calendarDays[0]?.dayOfWeek || 0 }).map((_, i) => (
            <div key={`empty-${i}`} style={{ backgroundColor: '#f9fafb' }} />
          ))}

          {calendarDays.map(({ date, day, assignments }) => {
            const holiday = isHoliday(date);
            const isHolidayDay = !!holiday;
            
            return (
              <div 
                key={date} 
                style={{ 
                  backgroundColor: isHolidayDay ? '#fef2f2' : 'white', 
                  minHeight: '100px', 
                  padding: '5px', 
                  border: isHolidayDay ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  position: 'relative'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: isHolidayDay ? '#dc2626' : '#111827' }}>
                  {day}
                  {isHolidayDay && <span style={{ marginLeft: '4px' }}>🎉</span>}
                </div>
                
                {isHolidayDay && (
                  <div style={{ 
                    fontSize: '10px', 
                    padding: '4px', 
                    marginBottom: '4px', 
                    backgroundColor: '#fee2e2', 
                    borderRadius: '4px',
                    color: '#991b1b',
                    fontWeight: '600',
                    border: '1px solid #fca5a5'
                  }}>
                    {holiday.name}
                  </div>
                )}
                
                {assignments.map((assignment, idx) => (
                  <div key={idx} style={{ 
                    fontSize: '11px', 
                    padding: '2px', 
                    marginBottom: '2px', 
                    backgroundColor: isHolidayDay ? '#fecaca' : '#dbeafe', 
                    borderRadius: '2px',
                    opacity: isHolidayDay ? 0.6 : 1
                  }}>
                    <strong>{assignment.shift?.name}</strong><br />
                    {assignment.employee?.name}<br />
                    {assignment.shift?.start_time} - {assignment.shift?.end_time}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '5px' }}>
        <strong>ℹ️ Estado del calendario:</strong>
        <ul>
          <li>Total asignaciones este mes: {assignments.length}</li>
          <li>Datos cargados desde: Supabase (base de datos)</li>
          <li>Datos hardcodeados: NINGUNO</li>
          <li>Última actualización: {new Date().toLocaleTimeString()}</li>
        </ul>
      </div>
    </div>
  );
};

export default ShiftCalendarClean;
