// src/components/hr/ShiftManagementSystemAdvanced.tsx - Sistema Completo de Gestión de Turnos
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, Users, AlertCircle, ArrowLeftRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';
import { useData } from '../../contexts/DataContext';
import type { Center } from '../../types/database';
import ShiftCalendarClean from './ShiftCalendarClean';
import { holidayService, Holiday } from '../../services/holidayService';
import HolidayList from './HolidayList';
import { type Shift, type Employee, type EmployeeRow } from './shiftAdvanced/ShiftAdvancedTypes';
import { ShiftAdvancedManager } from './shiftAdvanced/ShiftAdvancedManager';
import { ShiftAdvancedAssignments } from './shiftAdvanced/ShiftAdvancedAssignments';
import { ShiftAdvancedSubstitution } from './shiftAdvanced/ShiftAdvancedSubstitution';

interface ShiftManagementSystemAdvancedProps {
  onBack?: () => void;
}

const TabButton: React.FC<{
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
      backgroundColor: isActive ? '#059669' : 'white',
      color: isActive ? 'white' : '#374151',
      border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
      fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease'
    }}
  >
    {icon}
    {label}
  </button>
);

const ShiftManagementSystemAdvanced: React.FC<ShiftManagementSystemAdvancedProps> = ({ onBack }) => {
  const { employee: _employee, userRole: _userRole } = useSession();
  const { centers } = useData();

  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'substitutions' | 'calendar' | 'holidays'>('shifts');
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (centers && centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0].id);
    }
  }, [centers, selectedCenter]);

  const loadData = useCallback(async () => {
    if (!selectedCenter) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('center_id', selectedCenter)
        .order('start_time');
      if (shiftsError) throw shiftsError;
      setShifts(shiftsData || []);

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('center_id', selectedCenter);
      if (employeesError) throw employeesError;

      const mappedEmployees = (employeesData || [] as EmployeeRow[])
        .filter((emp: EmployeeRow) => emp.activo !== false && emp.is_active !== false && emp.active !== false)
        .map((emp: EmployeeRow) => ({
          id: emp.id,
          nombre: emp.nombre || emp.name || emp.first_name || '',
          apellidos: emp.apellidos || emp.last_name || emp.surname || '',
          email: emp.email || '',
          center_id: emp.center_id,
          activo: true
        }));
      setEmployees(mappedEmployees);

      const currentYear = new Date().getFullYear();
      const holidaysData = await holidayService.getHolidaysByDateRange(
        `${currentYear}-01-01`, `${currentYear + 1}-12-31`, selectedCenter.toString()
      );
      setHolidays(holidaysData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [selectedCenter]);

  useEffect(() => { loadData(); }, [loadData]);

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
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}
            >
              <ArrowLeft size={18} />
              Volver a RRHH
            </button>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                Sistema de Gestión de Turnos
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                Gestiona turnos, asignaciones, sustituciones y visualiza el calendario completo
              </p>
            </div>
            <div style={{ minWidth: '250px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Centro de Trabajo
              </label>
              <select
                value={selectedCenter || ''}
                onChange={(e) => setSelectedCenter(Number(e.target.value))}
                style={{ width: '100%', padding: '12px 16px', fontSize: '15px', fontWeight: '500', border: '2px solid #059669', borderRadius: '8px', backgroundColor: 'white', color: '#111827', cursor: 'pointer' }}
              >
                {centers.map((center: Center) => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                {employees.length} empleados • {shifts.length} turnos
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <TabButton id="shifts" label="Gestión de Turnos" icon={<Clock size={16} />} isActive={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')} />
          <TabButton id="assignments" label="Asignaciones" icon={<Users size={16} />} isActive={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} />
          <TabButton id="substitutions" label="Sustituciones" icon={<ArrowLeftRight size={16} />} isActive={activeTab === 'substitutions'} onClick={() => setActiveTab('substitutions')} />
          <TabButton id="calendar" label="Calendario" icon={<Calendar size={16} />} isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <TabButton id="holidays" label="Festivos" icon={<span>🎉</span>} isActive={activeTab === 'holidays'} onClick={() => setActiveTab('holidays')} />
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {activeTab === 'shifts' && <ShiftAdvancedManager shifts={shifts} centers={centers} selectedCenter={selectedCenter} onRefresh={loadData} />}
          {activeTab === 'assignments' && <ShiftAdvancedAssignments shifts={shifts} employees={employees} holidays={holidays} onSaveSuccess={() => setActiveTab('calendar')} />}
          {activeTab === 'substitutions' && <ShiftAdvancedSubstitution employees={employees} />}
          {activeTab === 'calendar' && <ShiftCalendarClean holidays={holidays} selectedCenter={selectedCenter} />}
          {activeTab === 'holidays' && <HolidayList holidays={holidays} selectedCenter={selectedCenter} onRefresh={loadData} />}
        </div>
      </div>
    </div>
  );
};

export default ShiftManagementSystemAdvanced;
