// src/components/hr/ShiftManagementSystem.tsx - Sistema de Gestión de Turnos
import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Plus, Edit, Trash2, Users, Calendar, Save, X, 
  AlertCircle, CheckCircle, MapPin, RotateCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';
import { useData } from '../../contexts/DataContext';

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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ShiftFormData {
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
}

// ============ SUB-COMPONENTES ============

const ShiftHeader: React.FC<{ shiftCount: number; activeCount: number }> = ({ shiftCount, activeCount }) => (
  <div style={{ marginBottom: '24px' }}>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>Gestión de Turnos</h1>
    <p style={{ fontSize: '16px', color: '#6b7280' }}>Crea y administra los turnos de trabajo para cada centro.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={24} color="#059669" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{shiftCount}</div>
            <div style={{ color: '#6b7280' }}>Turnos Totales</div>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle size={24} color="#10b981" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{activeCount}</div>
            <div style={{ color: '#6b7280' }}>Turnos Activos</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ShiftForm: React.FC<{
  shift: Shift | null;
  onSave: (shiftData: ShiftFormData) => void;
  onCancel: () => void;
  centers: any[];
}> = ({ shift, onSave, onCancel, centers }) => {
  const [formData, setFormData] = useState<ShiftFormData>({
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
    center_id: shift?.center_id || (centers[0]?.id || 9)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDayChange = (day: keyof ShiftFormData, value: boolean) => {
    setFormData(prev => ({ ...prev, [day]: value }));
  };

  const toggleAllDays = () => {
    const allSelected = formData.monday && formData.tuesday && formData.wednesday && 
                       formData.thursday && formData.friday && formData.saturday && formData.sunday;
    const newValue = !allSelected;
    setFormData(prev => ({
      ...prev,
      monday: newValue,
      tuesday: newValue,
      wednesday: newValue,
      thursday: newValue,
      friday: newValue,
      saturday: newValue,
      sunday: newValue
    }));
  };

  const toggleWeekdays = () => {
    const weekdaysSelected = formData.monday && formData.tuesday && formData.wednesday && 
                            formData.thursday && formData.friday;
    const newValue = !weekdaysSelected;
    setFormData(prev => ({
      ...prev,
      monday: newValue,
      tuesday: newValue,
      wednesday: newValue,
      thursday: newValue,
      friday: newValue
    }));
  };

  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
          {shift ? 'Editar Turno' : 'Nuevo Turno'}
        </h2>
        <button
          onClick={onCancel}
          style={{
            padding: '8px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
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
                placeholder="Ej: Turno Mañana, Apertura, Cierre..."
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Centro
              </label>
              <select
                value={formData.center_id}
                onChange={(e) => setFormData(prev => ({ ...prev, center_id: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
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
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
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
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Descanso (minutos)
              </label>
              <input
                type="number"
                value={formData.break_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, break_minutes: Number(e.target.value) }))}
                min="0"
                max="120"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Días de la Semana */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              📅 Días de la Semana
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={toggleWeekdays}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Lun-Vie
              </button>
              <button
                type="button"
                onClick={toggleAllDays}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Todos
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {days.map(day => (
                <label
                  key={day.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: formData[day.key as keyof ShiftFormData] ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${formData[day.key as keyof ShiftFormData] ? '#059669' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData[day.key as keyof ShiftFormData] as boolean}
                    onChange={(e) => handleDayChange(day.key as keyof ShiftFormData, e.target.checked)}
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
            style={{
              padding: '12px 20px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
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
            <Save size={16} />
            {shift ? 'Actualizar' : 'Crear'} Turno
          </button>
        </div>
      </form>
    </div>
  );
};

const ShiftCard: React.FC<{
  shift: Shift;
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
  centerName: string;
}> = ({ shift, onEdit, onDelete, centerName }) => {
  const getDaysText = () => {
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

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = shift.break_minutes / 60;
    return (diffHours - breakHours).toFixed(1);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#059669',
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
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {centerName}
            </p>
          </div>
        </div>
        <div style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: shift.is_active ? '#10b98120' : '#ef444420',
          color: shift.is_active ? '#10b981' : '#ef4444'
        }}>
          {shift.is_active ? '✅ Activo' : '❌ Inactivo'}
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
              {calculateDuration()}h
            </span>
          </div>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Días</span>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>
            {getDaysText()}
          </span>
        </div>
        {shift.break_minutes > 0 && (
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Descanso</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {shift.break_minutes} min
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onEdit(shift)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151'
          }}
        >
          <Edit size={14} />
          Editar
        </button>
        <button
          onClick={() => onDelete(shift)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#dc2626'
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ============ COMPONENTE PRINCIPAL ============
const ShiftManagementSystem: React.FC = () => {
  const { employee, userRole } = useSession();
  const { centers } = useData();
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [filterCenter, setFilterCenter] = useState<string>('all');

  const loadShifts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔍 Cargando turnos...');
      
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .order('center_id', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (shiftsError) {
        console.error('❌ Error cargando turnos:', shiftsError);
        setError(`Error al cargar turnos: ${shiftsError.message}`);
        return;
      }
      
      console.log('📊 Turnos cargados:', shiftsData?.length || 0);
      setShifts(shiftsData || []);
      
    } catch (error: any) {
      console.error('❌ Error general en loadShifts:', error);
      setError(`Error al cargar los datos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleSaveShift = async (shiftData: ShiftFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedShift) {
        console.log(`💾 Actualizando turno con ID: ${selectedShift.id}`);
        const { error } = await supabase
          .from('shifts')
          .update({ ...shiftData, updated_at: new Date().toISOString() })
          .eq('id', selectedShift.id);
        if (error) throw error;
        console.log('✅ Turno actualizado');
      } else {
        console.log('➕ Creando nuevo turno...');
        const { error } = await supabase
          .from('shifts')
          .insert([shiftData]);
        if (error) throw error;
        console.log('✅ Turno creado');
      }
      
      setShowForm(false);
      setSelectedShift(null);
      await loadShifts();
    } catch (err: any) {
      setError(err.message);
      console.error("Error guardando turno:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setShowForm(true);
  };

  const handleDeleteShift = async (shift: Shift) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el turno "${shift.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shift.id);
      
      if (error) throw error;
      
      console.log('✅ Turno eliminado');
      await loadShifts();
    } catch (err: any) {
      setError(err.message);
      console.error("Error eliminando turno:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewShift = () => {
    setSelectedShift(null);
    setShowForm(true);
  };

  const centerOptions = [
    { id: 'all', name: 'Todos los Centros' },
    ...centers.map(center => ({ id: center.id.toString(), name: center.name }))
  ];

  const filteredShifts = shifts.filter(shift => {
    return filterCenter === 'all' || shift.center_id.toString() === filterCenter;
  });

  if (isLoading && shifts.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Cargando turnos...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
        <AlertCircle style={{ marginBottom: '10px', margin: 'auto' }}/>
        <p style={{ fontWeight: 'bold' }}>Error al cargar los datos</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {showForm ? (
          <ShiftForm
            shift={selectedShift}
            onSave={handleSaveShift}
            onCancel={() => {
              setShowForm(false);
              setSelectedShift(null);
            }}
            centers={centers}
          />
        ) : (
          <>
            <ShiftHeader 
              shiftCount={shifts.length} 
              activeCount={shifts.filter(s => s.is_active).length} 
            />
            
            {/* Filtros y Acciones */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={filterCenter}
                  onChange={(e) => setFilterCenter(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minWidth: '150px'
                  }}
                >
                  {centerOptions.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                  ))}
                </select>

                <button
                  onClick={async () => {
                    console.log('🔍 Verificando conexión con tablas...');
                    try {
                      const { data, error } = await supabase.from('shifts').select('*').limit(1);
                      if (error) {
                        alert(`❌ Error: ${error.message}`);
                        console.error('Error tabla shifts:', error);
                      } else {
                        alert('✅ ¡Tablas funcionando correctamente! Puedes crear turnos.');
                        console.log('✅ Tabla shifts accesible:', data);
                      }
                    } catch (err: any) {
                      alert(`❌ Error de conexión: ${err.message}`);
                      console.error('Error verificación:', err);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginRight: '12px'
                  }}
                >
                  🔍 Verificar BD
                </button>

                <button
                  onClick={handleNewShift}
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
            </div>

            {/* Lista de Turnos */}
            {filteredShifts.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Clock size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '8px' }}>
                  No hay turnos creados
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  Crea el primer turno para comenzar a gestionar los horarios.
                </p>
                <button
                  onClick={handleNewShift}
                  style={{
                    display: 'inline-flex',
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
                  Crear Primer Turno
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {filteredShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onEdit={handleEditShift}
                    onDelete={handleDeleteShift}
                    centerName={centers.find(c => c.id === shift.center_id)?.name || 'Centro Desconocido'}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShiftManagementSystem;
