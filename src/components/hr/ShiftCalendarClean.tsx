import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, RefreshCw, Trash2, ChevronLeft, ChevronRight, Filter, Download, X } from 'lucide-react';
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
  selectedCenter?: number | null;
}

const ShiftCalendarClean: React.FC<ShiftCalendarCleanProps> = ({ holidays = [], selectedCenter = null }) => {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [showQuickAssign, setShowQuickAssign] = useState(false);
  const [quickAssignData, setQuickAssignData] = useState<{employeeId: number; date: Date} | null>(null);
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  const [filterEmployee, setFilterEmployee] = useState<number | null>(null);
  const [filterShiftType, setFilterShiftType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // Para navegar entre semanas
  const [draggedAssignment, setDraggedAssignment] = useState<ShiftAssignment | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(new Set());

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
      // Cargar un rango más amplio para incluir semanas completas
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 15);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 2, 15);

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
      console.log('🔄 Cargando empleados del centro:', selectedCenter);
      
      let query = supabase
        .from('employees')
        .select('id, nombre, apellidos, center_id')
        .eq('is_active', true)
        .order('nombre');
      
      // Filtrar por centro si está seleccionado
      if (selectedCenter) {
        query = query.eq('center_id', selectedCenter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error cargando empleados:', error);
      } else if (data) {
        console.log('✅ Empleados cargados:', data.length, 'del centro', selectedCenter);
        console.log('📋 Datos de empleados:', data);
        setEmployees(data);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  // Cargar turnos disponibles
  const loadAvailableShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('is_active', true)
        .order('start_time');

      if (!error && data) {
        setAvailableShifts(data);
      }
    } catch (error) {
      console.error('Error cargando turnos:', error);
    }
  };

  // Abrir modal de asignación rápida
  const handleCellClick = (employeeId: number, date: Date) => {
    const holiday = isHoliday(fmt(date));
    if (holiday) {
      alert('⚠️ No se pueden asignar turnos en días festivos');
      return;
    }
    setQuickAssignData({ employeeId, date });
    setShowQuickAssign(true);
  };

  // Asignar turno rápido
  const handleQuickAssign = async (shiftId: number) => {
    if (!quickAssignData) return;

    try {
      const { error } = await supabase
        .from('employee_shifts')
        .insert({
          employee_id: quickAssignData.employeeId,
          shift_id: shiftId,
          date: fmt(quickAssignData.date)
        });

      if (!error) {
        alert('✅ Turno asignado correctamente');
        setShowQuickAssign(false);
        setQuickAssignData(null);
        loadAssignments();
      } else {
        alert('❌ Error al asignar turno');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al asignar turno');
    }
  };

  // Obtener semana actual (con navegación)
  const getWeekDates = () => {
    // Usar la fecha actual si estamos en el mes actual, sino el primer día del mes
    const today = new Date();
    const isCurrentMonth = selectedMonth.getMonth() === today.getMonth() && 
                          selectedMonth.getFullYear() === today.getFullYear();
    
    const start = isCurrentMonth ? new Date(today) : new Date(selectedMonth);
    
    // Ajustar al lunes de esa semana
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo, retroceder 6 días
    start.setDate(start.getDate() + diff);
    
    // Aplicar offset de semanas
    start.setDate(start.getDate() + (weekOffset * 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  // Navegar semanas
  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, assignment: ShiftAssignment) => {
    setDraggedAssignment(assignment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newDate: string) => {
    e.preventDefault();
    
    if (!draggedAssignment) return;

    // Verificar si es festivo
    const holiday = isHoliday(newDate);
    if (holiday) {
      alert('⚠️ No se pueden mover turnos a días festivos');
      setDraggedAssignment(null);
      return;
    }

    // Verificar si es la misma fecha
    if (draggedAssignment.date === newDate) {
      setDraggedAssignment(null);
      return;
    }

    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('employee_shifts')
        .update({ date: newDate })
        .eq('id', draggedAssignment.id);

      if (!error) {
        alert('✅ Turno movido correctamente');
        loadAssignments();
      } else {
        alert('❌ Error al mover turno');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al mover turno');
    } finally {
      setDraggedAssignment(null);
    }
  };

  // Manejar selección de turnos
  const toggleAssignmentSelection = (assignmentId: number) => {
    setSelectedAssignments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  };

  // Eliminar turnos seleccionados
  const handleDeleteSelected = async () => {
    if (selectedAssignments.size === 0) return;
    
    if (!confirm(`¿Eliminar ${selectedAssignments.size} turno(s) seleccionado(s)?`)) return;
    
    try {
      const { error } = await supabase
        .from('employee_shifts')
        .delete()
        .in('id', Array.from(selectedAssignments));
      
      if (error) throw error;
      
      alert(`✅ ${selectedAssignments.size} turno(s) eliminado(s)`);
      setSelectedAssignments(new Set());
      loadAssignments();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Obtener asignaciones de un empleado en una fecha
  const getEmployeeShifts = (employeeId: number, date: Date) => {
    const dateStr = fmt(date);
    const filtered = assignments.filter(a => a.employee_id === employeeId && a.date === dateStr);
    
    if (filtered.length > 0) {
      console.log(`📅 ${dateStr} - Empleado ${employeeId}: ${filtered.length} turnos`, filtered);
    }
    
    return filtered;
  };

  // Obtener color según tipo de turno
  const getShiftColor = (shiftName: string) => {
    const name = shiftName?.toLowerCase() || '';
    if (name.includes('mañana') || name.includes('morning')) return '#10b981'; // Verde
    if (name.includes('tarde') || name.includes('afternoon')) return '#3b82f6'; // Azul
    if (name.includes('noche') || name.includes('night')) return '#8b5cf6'; // Morado
    if (name.includes('partido') || name.includes('split')) return '#f59e0b'; // Naranja
    if (name.includes('completo') || name.includes('full')) return '#ec4899'; // Rosa
    if (name.includes('apoyo') || name.includes('support')) return '#06b6d4'; // Cyan
    return '#6b7280'; // Gris por defecto
  };

  // Filtrar empleados
  const getFilteredEmployees = () => {
    if (filterEmployee) {
      return employees.filter(e => e.id === filterEmployee);
    }
    return employees;
  };

  // Filtrar turnos por tipo
  const filterShiftsByType = (shifts: ShiftAssignment[]) => {
    if (filterShiftType === 'all') return shifts;
    return shifts.filter(s => {
      const name = s.shift?.name?.toLowerCase() || '';
      return name.includes(filterShiftType.toLowerCase());
    });
  };

  // Exportar a CSV (compatible con Excel)
  const exportToExcel = () => {
    const weekDates = getWeekDates();
    const filteredEmployees = getFilteredEmployees();
    
    // Header
    let csv = 'Empleado,' + weekDates.map(d => 
      d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    ).join(',') + '\n';

    // Filas de empleados
    filteredEmployees.forEach(employee => {
      const row = [`"${employee.nombre} ${employee.apellidos}"`];
      
      weekDates.forEach(date => {
        const shifts = filterShiftsByType(getEmployeeShifts(employee.id, date));
        const shiftNames = shifts.map(s => `${s.shift?.name} (${s.shift?.start_time}-${s.shift?.end_time})`).join('; ');
        row.push(`"${shiftNames || '-'}"`);
      });
      
      csv += row.join(',') + '\n';
    });

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `turnos_${fmt(weekDates[0])}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✅ Calendario exportado correctamente');
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
    loadAvailableShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedCenter]);

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
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '10px 20px',
              backgroundColor: showFilters ? '#059669' : '#f3f4f6',
              color: showFilters ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Filter size={16} /> Filtros
          </button>

          <button
            onClick={exportToExcel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Download size={16} /> Exportar
          </button>

          <button
            onClick={loadAssignments}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <RefreshCw size={16} /> Recargar
          </button>
          </div>
        </div>

        {/* Panel de Filtros */}
        {showFilters && (
          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            backgroundColor: '#f9fafb', 
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Empleado
              </label>
              <select
                value={filterEmployee || ''}
                onChange={(e) => setFilterEmployee(e.target.value ? Number(e.target.value) : null)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Todos los empleados</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} {emp.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Tipo de Turno
              </label>
              <select
                value={filterShiftType}
                onChange={(e) => setFilterShiftType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="all">Todos los turnos</option>
                <option value="mañana">🌅 Mañana</option>
                <option value="tarde">🌆 Tarde</option>
                <option value="noche">🌙 Noche</option>
                <option value="partido">⏰ Partido</option>
                <option value="completo">📅 Completo</option>
                <option value="apoyo">🤝 Apoyo</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setFilterEmployee(null);
                  setFilterShiftType('all');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <X size={16} /> Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navegación estilo Factorial */}
      <div style={{ backgroundColor: 'white', padding: '16px 24px', marginBottom: '0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => {
            if (viewMode === 'week') {
              navigateWeek('prev');
            } else {
              const m = new Date(selectedMonth);
              m.setMonth(m.getMonth() - 1);
              setSelectedMonth(m);
              setWeekOffset(0);
            }
          }}
          style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', minWidth: '250px', textAlign: 'center' }}>
          {viewMode === 'week' ? (
            (() => {
              const weekDates = getWeekDates();
              const firstDate = weekDates[0];
              const lastDate = weekDates[6];
              const sameMonth = firstDate.getMonth() === lastDate.getMonth();
              
              if (sameMonth) {
                return `Semana del ${firstDate.getDate()} al ${lastDate.getDate()} de ${firstDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
              } else {
                return `Semana del ${firstDate.getDate()} de ${firstDate.toLocaleDateString('es-ES', { month: 'long' })} al ${lastDate.getDate()} de ${lastDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
              }
            })()
          ) : (
            selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()
          )}
        </span>
        <button 
          onClick={() => {
            if (viewMode === 'week') {
              navigateWeek('next');
            } else {
              const m = new Date(selectedMonth);
              m.setMonth(m.getMonth() + 1);
              setSelectedMonth(m);
              setWeekOffset(0);
            }
          }}
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
            {getFilteredEmployees().map(employee => (
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
                    {(employee.nombre || 'N').charAt(0)}{(employee.apellidos || 'A').charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      {employee.nombre || 'Sin nombre'} {employee.apellidos || ''}
                    </div>
                  </div>
                </div>

                {/* Celdas de turnos por día */}
                {getWeekDates().map((date, dayIndex) => {
                  const shifts = filterShiftsByType(getEmployeeShifts(employee.id, date));
                  const dateStr = fmt(date);
                  const holiday = isHoliday(dateStr);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      onClick={() => handleCellClick(employee.id, date)}
                      style={{ 
                        backgroundColor: holiday ? '#fef2f2' : 'white', 
                        padding: '8px',
                        minHeight: '80px',
                        cursor: holiday ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!holiday) e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseOut={(e) => {
                        if (!holiday) e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      {shifts.map((shift, idx) => (
                        <div 
                          key={idx}
                          style={{
                            backgroundColor: getShiftColor(shift.shift?.name || ''),
                            color: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            marginBottom: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
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
        <div style={{ backgroundColor: 'white', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} style={{ padding: '12px', backgroundColor: '#f9fafb', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
              {day.toUpperCase()}
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
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
                style={{ 
                  backgroundColor: isHolidayDay ? '#fef2f2' : (draggedAssignment ? '#f0fdf4' : 'white'), 
                  minHeight: '100px', 
                  padding: '5px', 
                  border: isHolidayDay ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  position: 'relative',
                  transition: 'background-color 0.2s'
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
                  <div 
                    key={idx}
                    draggable={!isHolidayDay}
                    onDragStart={(e) => handleDragStart(e, assignment)}
                    style={{
                      fontSize: '10px',
                      padding: '6px',
                      marginBottom: '4px',
                      backgroundColor: getShiftColor(assignment.shift?.name || ''),
                      color: 'white',
                      borderRadius: '4px',
                      opacity: isHolidayDay ? 0.6 : (draggedAssignment?.id === assignment.id ? 0.5 : 1),
                      cursor: isHolidayDay ? 'not-allowed' : 'grab',
                      transition: 'transform 0.2s, opacity 0.2s',
                      border: selectedAssignments.has(assignment.id) ? '3px solid #fbbf24' : (draggedAssignment?.id === assignment.id ? '2px dashed white' : 'none'),
                      position: 'relative',
                      boxShadow: selectedAssignments.has(assignment.id) ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!isHolidayDay) e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignments.has(assignment.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleAssignmentSelection(assignment.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        cursor: 'pointer',
                        width: '14px',
                        height: '14px'
                      }}
                    />
                    <div style={{ fontWeight: '600', marginBottom: '2px', marginLeft: '18px' }}>
                      🔄 {assignment.shift?.name}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.9 }}>{assignment.employee?.name}</div>
                    <div style={{ fontSize: '9px', opacity: 0.9 }}>
                      {assignment.shift?.start_time} - {assignment.shift?.end_time}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          </div>
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

      {/* Modal de Asignación Rápida */}
      {showQuickAssign && quickAssignData && (
        <div 
          style={{ 
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
          }}
          onClick={() => setShowQuickAssign(false)}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              maxWidth: '500px', 
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
              ⚡ Asignación Rápida
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Fecha: {quickAssignData.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
              {availableShifts.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#92400e' }}>
                    ⚠️ No hay turnos disponibles.<br/>
                    <small>Crea turnos en la pestaña "Gestión de Turnos"</small>
                  </p>
                </div>
              ) : (
                availableShifts.map(shift => (
                  <button
                    key={shift.id}
                    onClick={() => handleQuickAssign(shift.id)}
                    style={{
                      padding: '16px',
                      backgroundColor: getShiftColor(shift.name),
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'transform 0.2s',
                      fontSize: '14px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{shift.name}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>
                      {shift.start_time} - {shift.end_time}
                    </div>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setShowQuickAssign(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE PARA ELIMINAR SELECCIONADOS */}
      {selectedAssignments.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <div style={{
            backgroundColor: '#fbbf24',
            color: '#78350f',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {selectedAssignments.size} turno(s) seleccionado(s)
          </div>
          <button
            onClick={handleDeleteSelected}
            style={{
              padding: '14px 28px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Trash2 size={20} />
            Eliminar Seleccionados
          </button>
        </div>
      )}
    </div>
  );
};

export default ShiftCalendarClean;
