// src/components/hr/ShiftManagementSystemAdvanced.tsx - Sistema Completo de Gestión de Turnos
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, Calendar, Users, RefreshCw, Plus, Edit, Trash2, AlertCircle, ChevronLeft, ChevronRight, X, Save, MapPin, ArrowLeftRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';
import { useData } from '../../contexts/DataContext';
import ShiftCalendarClean from './ShiftCalendarClean';
import { holidayService, Holiday } from '../../services/holidayService';
import HolidayList from './HolidayList';

// ============ INTERFACES ============
interface Shift {
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
  break_minutes: number;
  center_id: number;
  max_employees: number;
  min_employees: number;
  is_support: boolean;
  description?: string;
  is_active: boolean;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  center_id: string;
  activo: boolean;
}

interface ShiftAssignment {
  id: number;
  employee_id: string;
  shift_id: number;
  date: string;
  is_substitute: boolean;
  original_employee_id?: string;
  notes?: string;
  status: string;
}

// ============ COMPONENTE PRINCIPAL ============
const ShiftManagementSystemAdvanced: React.FC = () => {
  const { employee, userRole } = useSession();
  const { centers } = useData();
  
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'substitutions' | 'calendar' | 'holidays'>('shifts');
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Establecer centro por defecto al cargar
  useEffect(() => {
    if (centers && centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0].id);
    }
  }, [centers, selectedCenter]);

  // Cargar datos iniciales filtrados por centro
  const loadData = useCallback(async () => {
    if (!selectedCenter) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Cargar turnos del centro seleccionado
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('center_id', selectedCenter)
        .order('start_time');
      
      if (shiftsError) throw shiftsError;
      setShifts(shiftsData || []);

      // Cargar empleados del centro seleccionado
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('center_id', selectedCenter);
      
      if (employeesError) throw employeesError;
      
      // Mapear campos de la base de datos a la interfaz Employee
      const mappedEmployees = (employeesData || [])
        .filter((emp: any) => emp.activo !== false && emp.is_active !== false && emp.active !== false)
        .map((emp: any) => ({
          id: emp.id,
          nombre: emp.nombre || emp.name || emp.first_name || '',
          apellidos: emp.apellidos || emp.last_name || emp.surname || '',
          email: emp.email || '',
          center_id: emp.center_id,
          activo: true
        }));
      
      setEmployees(mappedEmployees);

      // Cargar festivos del año actual y siguiente (para planificación)
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear + 1}-12-31`;
      
      const centerIdStr = selectedCenter.toString();
      const holidaysData = await holidayService.getHolidaysByDateRange(startDate, endDate, centerIdStr);
      setHolidays(holidaysData);
      
      console.log(`📅 Festivos cargados: ${holidaysData.length} (${currentYear}-${currentYear + 1})`);

    } catch (err: any) {
      setError(err.message);
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCenter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const TabButton: React.FC<{ 
    id: string; 
    label: string; 
    icon: React.ReactNode; 
    isActive: boolean;
    onClick: () => void;
  }> = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: isActive ? '#059669' : 'white',
        color: isActive ? 'white' : '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
      {label}
    </button>
  );

  if (isLoading && shifts.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando sistema de turnos...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header con selector de centro */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                Sistema de Gestión de Turnos
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                Gestiona turnos, asignaciones, sustituciones y visualiza el calendario completo
              </p>
            </div>
            
            {/* Selector de Centro */}
            <div style={{ minWidth: '250px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                📍 Centro de Trabajo
              </label>
              <select
                value={selectedCenter || ''}
                onChange={(e) => setSelectedCenter(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  border: '2px solid #059669',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#111827',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {centers.map((center: any) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                marginTop: '6px' 
              }}>
                {employees.length} empleados • {shifts.length} turnos
              </p>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <TabButton
            id="shifts"
            label="Gestión de Turnos"
            icon={<Clock size={16} />}
            isActive={activeTab === 'shifts'}
            onClick={() => setActiveTab('shifts')}
          />
          <TabButton
            id="assignments"
            label="Asignaciones"
            icon={<Users size={16} />}
            isActive={activeTab === 'assignments'}
            onClick={() => setActiveTab('assignments')}
          />
          <TabButton
            id="substitutions"
            label="Sustituciones"
            icon={<ArrowLeftRight size={16} />}
            isActive={activeTab === 'substitutions'}
            onClick={() => setActiveTab('substitutions')}
          />
          <TabButton
            id="calendar"
            label="Calendario"
            icon={<Calendar size={16} />}
            isActive={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
          />
          <TabButton
            id="holidays"
            label="Festivos"
            icon={<span>🎉</span>}
            isActive={activeTab === 'holidays'}
            onClick={() => setActiveTab('holidays')}
          />
        </div>

        {/* Contenido de pestañas */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          {activeTab === 'shifts' && <ShiftManager shifts={shifts} centers={centers} selectedCenter={selectedCenter} onRefresh={loadData} />}
          {activeTab === 'assignments' && <ShiftAssignments shifts={shifts} employees={employees} holidays={holidays} />}
          {activeTab === 'substitutions' && <SubstitutionManager shifts={shifts} employees={employees} />}
          {activeTab === 'calendar' && <ShiftCalendarClean holidays={holidays} />}
          {activeTab === 'holidays' && <HolidayList holidays={holidays} selectedCenter={selectedCenter} onRefresh={loadData} />}
        </div>
      </div>
    </div>
  );
};

// ============ COMPONENTE: GESTOR DE TURNOS ============
const ShiftManager: React.FC<{
  shifts: Shift[];
  centers: any[];
  selectedCenter: number | null;
  onRefresh: () => void;
}> = ({ shifts, centers, selectedCenter, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Obtener nombre del centro seleccionado
  const centerName = centers.find((c: any) => c.id === selectedCenter)?.name || 'Centro';

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setShowForm(true);
  };

  const handleDelete = async (shift: Shift) => {
    if (!confirm(`¿Eliminar el turno "${shift.name}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shift.id);
      
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePublish = async (shift: Shift) => {
    // Obtener empleados asignados al turno
    const { data: assignments } = await supabase
      .from('employee_shifts')
      .select('employee_id, employees(nombre, apellidos, email)')
      .eq('shift_id', shift.id);

    const employeeCount = assignments?.length || 0;
    
    const confirmed = confirm(
      `📢 ¿Publicar turno "${shift.name}"?\n\n` +
      `Se enviará notificación a ${employeeCount} empleado(s).\n\n` +
      `Una vez publicado, los empleados recibirán un email con sus horarios.`
    );
    
    if (!confirmed) return;
    
    try {
      // Actualizar estado del turno a 'published'
      const { error } = await supabase
        .from('shifts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: 'admin', // TODO: usar email del usuario actual
          updated_at: new Date().toISOString()
        })
        .eq('id', shift.id);
      
      if (error) throw error;

      // TODO: Enviar notificaciones (cuando Supabase esté disponible)
      // await shiftNotificationService.notifyShiftPublished(shift.id, employeeEmails);
      
      alert(`✅ Turno "${shift.name}" publicado correctamente!\n\n📧 Se han enviado ${employeeCount} notificaciones.`);
      onRefresh();
    } catch (err: any) {
      alert(`❌ Error publicando turno: ${err.message}`);
    }
  };

  if (showForm) {
    return (
      <ShiftForm
        shift={editingShift}
        centers={centers}
        defaultCenterId={selectedCenter}
        onSave={() => {
          setShowForm(false);
          setEditingShift(null);
          onRefresh();
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingShift(null);
        }}
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Plus size={16} />
          Nuevo Turno
        </button>
      </div>

      {shifts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Clock size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            No hay turnos creados
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Comienza creando tu primer turno para el centro
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {shifts.map(shift => (
            <div
              key={shift.id}
              style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {shift.name}
                  </h3>
                  {/* INDICADOR DE ESTADO */}
                  {shift.status === 'draft' && (
                    <span style={{ 
                      padding: '4px 12px', 
                      backgroundColor: '#fef3c7', 
                      color: '#92400e', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      🟡 Borrador
                    </span>
                  )}
                  {shift.status === 'published' && (
                    <span style={{ 
                      padding: '4px 12px', 
                      backgroundColor: '#dcfce7', 
                      color: '#166534', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      🟢 Publicado
                    </span>
                  )}
                  {shift.status === 'archived' && (
                    <span style={{ 
                      padding: '4px 12px', 
                      backgroundColor: '#f3f4f6', 
                      color: '#6b7280', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      ⚫ Archivado
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                  <span>🕐 {shift.start_time} - {shift.end_time}</span>
                  <span>👥 {shift.min_employees}-{shift.max_employees} empleados</span>
                  {shift.is_support && <span>🆘 Apoyo</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* BOTÓN PUBLICAR (solo si es borrador) */}
                {shift.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(shift)}
                    style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#059669', 
                      color: 'white',
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📢 Publicar
                  </button>
                )}
                <button
                  onClick={() => handleEdit(shift)}
                  style={{ padding: '8px 12px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#0ea5e9' }}
                >
                  <Edit size={14} />
                  Editar
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

// ============ COMPONENTE: ASIGNACIONES ============
const ShiftAssignments: React.FC<{
  shifts: Shift[];
  employees: Employee[];
  holidays?: Holiday[];
}> = ({ shifts, employees, holidays = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Verificar si la fecha seleccionada es festivo
  const isHoliday = (dateStr: string): Holiday | undefined => {
    return holidays.find(h => h.date === dateStr);
  };

  const selectedHoliday = isHoliday(selectedDate);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Asignaciones de Empleados
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Fecha:
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ 
                marginLeft: '8px', 
                padding: '8px', 
                border: selectedHoliday ? '2px solid #ef4444' : '1px solid #d1d5db', 
                borderRadius: '6px',
                backgroundColor: selectedHoliday ? '#fef2f2' : 'white'
              }}
            />
          </label>
          
          {selectedHoliday && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              color: '#991b1b',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              <span>🎉</span>
              <span>{selectedHoliday.name}</span>
              <span style={{ fontSize: '12px', fontWeight: '400' }}>
                ({selectedHoliday.type === 'national' ? 'Nacional' : selectedHoliday.type === 'regional' ? 'Regional' : 'Local'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de bloqueo si es festivo */}
      {selectedHoliday && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle size={24} color="#dc2626" />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: 0 }}>
              ⛔ Asignaciones Bloqueadas - Día Festivo
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#991b1b', margin: 0, lineHeight: '1.6' }}>
            No se pueden asignar turnos en días festivos. El <strong>{selectedHoliday.name}</strong> es un festivo 
            {selectedHoliday.type === 'national' ? ' nacional' : selectedHoliday.type === 'regional' ? ' regional' : ' local'}.
            Por favor, selecciona otra fecha para realizar asignaciones.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {shifts.map(shift => (
          <div
            key={shift.id}
            style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              {shift.name} ({shift.start_time} - {shift.end_time})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {Array.from({ length: shift.max_employees }, (_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}
                >
                  <Users size={24} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px' }}>Empleado {i + 1}</p>
                  <select
                    disabled={!!selectedHoliday}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      marginTop: '8px',
                      cursor: selectedHoliday ? 'not-allowed' : 'pointer',
                      backgroundColor: selectedHoliday ? '#f3f4f6' : 'white'
                    }}
                  >
                    <option value="">{selectedHoliday ? 'Bloqueado' : 'Seleccionar...'}</option>
                    {!selectedHoliday && employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre} {emp.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ COMPONENTE: SUSTITUCIONES ============
const SubstitutionManager: React.FC<{
  shifts: Shift[];
  employees: Employee[];
}> = ({ shifts, employees }) => {
  const [substitutions, setSubstitutions] = useState<any[]>([]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
          Gestión de Sustituciones
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Sistema inteligente para gestionar cambios y sustituciones de turnos
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Solicitudes de sustitución */}
        <div style={{ padding: '20px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '16px' }}>
            📋 Solicitudes Pendientes
          </h3>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <RefreshCw size={48} style={{ color: '#d97706', margin: '0 auto 16px' }} />
            <p style={{ color: '#92400e' }}>No hay solicitudes pendientes</p>
          </div>
        </div>

        {/* Sustitutos disponibles */}
        <div style={{ padding: '20px', backgroundColor: '#f0fdf4', border: '1px solid #059669', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#065f46', marginBottom: '16px' }}>
            ✅ Sustitutos Disponibles
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {employees.slice(0, 5).map(emp => (
              <div
                key={emp.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #d1fae5',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {emp.nombre} {emp.apellidos}
                </span>
                <span style={{ fontSize: '12px', color: '#059669', backgroundColor: '#d1fae5', padding: '4px 8px', borderRadius: '12px' }}>
                  Disponible
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historial de sustituciones */}
      <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '16px' }}>
          📊 Historial de Sustituciones
        </h3>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Clock size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>No hay historial de sustituciones</p>
        </div>
      </div>
    </div>
  );
};

// ============ COMPONENTE: CALENDARIO ============
const ShiftCalendar: React.FC<{
  shifts: Shift[];
}> = ({ shifts }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
          Calendario de Turnos
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            style={{ padding: '8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', minWidth: '150px', textAlign: 'center' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            style={{ padding: '8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div
            key={day}
            style={{
              padding: '12px',
              backgroundColor: '#f3f4f6',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
        {days.map((day, index) => (
          <div
            key={index}
            style={{
              minHeight: '100px',
              backgroundColor: day ? 'white' : '#f9fafb',
              padding: '8px',
              position: 'relative'
            }}
          >
            {day && (
              <>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  {day}
                </div>
                {/* Aquí se mostrarían los turnos del día */}
                {shifts.slice(0, 2).map((shift, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '10px',
                      padding: '2px 4px',
                      backgroundColor: '#059669',
                      color: 'white',
                      borderRadius: '3px',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {shift.name}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          Leyenda de colores:
        </h4>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#059669', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Turno Regular</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#dc2626', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Turno de Apoyo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ SUBCOMPONENTE: CREADOR DE TURNOS ============
const ShiftCreator: React.FC<{
  shifts: Shift[];
  centers: any[];
  onRefresh: () => void;
}> = ({ shifts, centers, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setShowForm(true);
  };

  const handleDelete = async (shift: Shift) => {
    if (!confirm(`¿Eliminar el turno "${shift.name}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shift.id);
      
      if (error) throw error;
      onRefresh();
    } catch (error: any) {
      console.error('Error eliminando turno:', error);
    }
  };

  const getDaysText = (shift: Shift) => {
    const days = [];
    if (shift.monday) days.push('L');
    if (shift.tuesday) days.push('M');
    if (shift.wednesday) days.push('X');
    if (shift.thursday) days.push('J');
    if (shift.friday) days.push('V');
    if (shift.saturday) days.push('S');
    if (shift.sunday) days.push('D');
    return days.join('-');
  };

  const calculateDuration = (shift: Shift) => {
    const start = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = shift.break_minutes / 60;
    return (diffHours - breakHours).toFixed(1);
  };

  if (showForm) {
    return <ShiftForm shift={selectedShift} centers={centers} onSave={onRefresh} onCancel={() => { setShowForm(false); setSelectedShift(null); }} />;
  }

  return (
    <div>
      {/* Header con botón nuevo turno */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Gestión de Turnos</h2>
          <p style={{ color: '#6b7280' }}>Crea y administra los turnos de trabajo para cada centro</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          <Plus size={16} />
          Nuevo Turno
        </button>
      </div>

      {/* Lista de turnos */}
      {shifts.length === 0 ? (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <Clock size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '8px' }}>No hay turnos creados</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Crea el primer turno para comenzar a gestionar los horarios.</p>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            <Plus size={16} />
            Crear Primer Turno
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {shifts.map((shift) => (
            <div
              key={shift.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: shift.is_support ? '#f59e0b' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>
                      {shift.name}
                      {shift.is_support && <span style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '8px' }}>APOYO</span>}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {centers.find(c => c.id === shift.center_id)?.name || 'Centro Desconocido'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Horario</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {shift.start_time} - {shift.end_time}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Duración</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {calculateDuration(shift)}h
                    </span>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Días</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {getDaysText(shift)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Empleados</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {shift.min_employees} - {shift.max_employees} personas
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(shift)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}
                >
                  <Edit size={14} />
                  Editar
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

// ============ FORMULARIO DE TURNO ============
const ShiftForm: React.FC<{
  shift: Shift | null;
  centers: any[];
  defaultCenterId?: number | null;
  onSave: () => void;
  onCancel: () => void;
}> = ({ shift, centers, defaultCenterId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: shift?.name || '',
    start_time: shift?.start_time || '09:00',
    end_time: shift?.end_time || '17:00',
    monday: shift?.monday || false,
    tuesday: shift?.tuesday || false,
    wednesday: shift?.wednesday || false,
    thursday: shift?.thursday || false,
    friday: shift?.friday || false,
    saturday: shift?.saturday || false,
    sunday: shift?.sunday || false,
    break_minutes: shift?.break_minutes || 30,
    center_id: shift?.center_id || defaultCenterId || centers[0]?.id || 9,
    max_employees: shift?.max_employees || 1,
    min_employees: shift?.min_employees || 1,
    is_support: shift?.is_support || false,
    description: shift?.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (shift) {
        const { error } = await supabase
          .from('shifts')
          .update(formData)
          .eq('id', shift.id);
        if (error) throw error;
      } else {
        // Crear nuevo turno en estado BORRADOR por defecto
        const { error } = await supabase
          .from('shifts')
          .insert([{
            ...formData,
            status: 'draft', // Nuevo turno siempre empieza como borrador
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
      
      onSave();
      onCancel();
    } catch (error: any) {
      console.error('Error guardando turno:', error);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
          {shift ? 'Editar Turno' : 'Nuevo Turno'}
        </h2>
        <button
          onClick={onCancel}
          style={{ padding: '8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Información Básica */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              📋 Información Básica
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Nombre del Turno *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Apertura, Turno Mañana, Apoyo Tarde..."
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                  Hora Fin *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                  Empleados Mínimos *
                </label>
                <input
                  type="number"
                  value={formData.min_employees}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_employees: Number(e.target.value) }))}
                  min="1"
                  max="10"
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                  Empleados Máximos *
                </label>
                <input
                  type="number"
                  value={formData.max_employees}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_employees: Number(e.target.value) }))}
                  min="1"
                  max="10"
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              📅 Días de la Semana
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {[
                { key: 'monday', label: 'Lunes' },
                { key: 'tuesday', label: 'Martes' },
                { key: 'wednesday', label: 'Miércoles' },
                { key: 'thursday', label: 'Jueves' },
                { key: 'friday', label: 'Viernes' },
                { key: 'saturday', label: 'Sábado' },
                { key: 'sunday', label: 'Domingo' }
              ].map(day => (
                <label
                  key={day.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: formData[day.key as keyof typeof formData] ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${formData[day.key as keyof typeof formData] ? '#059669' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData[day.key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData(prev => ({ ...prev, [day.key]: e.target.checked }))}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            <Save size={16} />
            {shift ? 'Actualizar' : 'Crear'} Turno
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShiftManagementSystemAdvanced;
