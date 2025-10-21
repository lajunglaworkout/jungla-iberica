// src/components/hr/AttendanceManagement.tsx - Gestión de Asistencia y Ausencias
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, AlertCircle, Clock, UserX, Plus, Filter, MapPin, 
  Calendar, Save, X, FileText, TrendingUp, Users, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';

interface AttendanceManagementProps {
  onBack?: () => void;
}

interface AttendanceRecord {
  id?: number;
  employee_id: number;
  employee_name?: string;
  center_id?: number;
  center_name?: string;
  date: string;
  type: 'late' | 'sick_leave' | 'absence' | 'personal' | 'other';
  hours_late?: number;
  reason: string;
  notes?: string;
  created_at?: string;
  created_by?: string;
}

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ onBack }) => {
  const { centers, employees } = useData();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState<AttendanceRecord>({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'late',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, [selectedCenter, selectedDate]);

  useEffect(() => {
    if (centers && centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0].id);
    }
  }, [centers]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      
      // Cargar registros de asistencia
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', getMonthStart())
        .lte('date', getMonthEnd())
        .order('date', { ascending: false });

      if (!attendanceData) {
        setRecords([]);
        setLoading(false);
        return;
      }

      // Obtener IDs únicos de empleados
      const employeeIds = [...new Set(attendanceData.map(r => r.employee_id))];
      
      // Cargar datos de empleados
      const { data: employeesData } = await supabase
        .from('employees')
        .select('id, name, center_id')
        .in('id', employeeIds);

      // Enriquecer registros con datos de empleados
      const enrichedRecords = attendanceData.map(record => {
        const employee = employeesData?.find(e => e.id === record.employee_id);
        const center = centers.find(c => c.id === employee?.center_id);
        return {
          ...record,
          employee_name: employee?.name || 'Desconocido',
          center_id: employee?.center_id,
          center_name: center?.name
        };
      });

      setRecords(enrichedRecords);
    } catch (error) {
      console.error('Error cargando registros:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthStart = () => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };

  const getMonthEnd = () => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.reason) {
      alert('⚠️ Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const { error } = await supabase
        .from('attendance_records')
        .insert([{
          employee_id: formData.employee_id,
          date: formData.date,
          type: formData.type,
          hours_late: formData.hours_late || null,
          reason: formData.reason,
          notes: formData.notes || null,
          created_by: 'RRHH'
        }]);

      if (error) throw error;

      alert('✅ Registro de asistencia guardado correctamente');
      setShowForm(false);
      setFormData({
        employee_id: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'late',
        reason: '',
        notes: ''
      });
      loadRecords();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro de asistencia?')) return;

    try {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Registro eliminado');
      loadRecords();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      late: '⏰ Retraso',
      sick_leave: '🤒 Baja médica',
      absence: '❌ Ausencia',
      personal: '👤 Asunto personal',
      other: '📋 Otro'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      late: { bg: '#fef3c7', color: '#92400e' },
      sick_leave: { bg: '#fee2e2', color: '#991b1b' },
      absence: { bg: '#fecaca', color: '#7f1d1d' },
      personal: { bg: '#dbeafe', color: '#1e40af' },
      other: { bg: '#e5e7eb', color: '#374151' }
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  // Filtrar registros
  const filteredRecords = records.filter(r => {
    const centerMatch = !selectedCenter || r.center_id === selectedCenter;
    const typeMatch = selectedType === 'all' || r.type === selectedType;
    return centerMatch && typeMatch;
  });

  // Calcular estadísticas
  const stats = {
    total: filteredRecords.length,
    late: filteredRecords.filter(r => r.type === 'late').length,
    sickLeave: filteredRecords.filter(r => r.type === 'sick_leave').length,
    absence: filteredRecords.filter(r => r.type === 'absence').length
  };

  if (showForm) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => setShowForm(false)} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f3f4f6', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            📝 Registrar Incidencia de Asistencia
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Empleado */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Empleado *
            </label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: Number(e.target.value) })}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value={0}>Seleccionar empleado</option>
              {employees
                .filter(e => !selectedCenter || e.center_id === selectedCenter)
                .map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {centers.find(c => c.id === emp.center_id)?.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Fecha *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Tipo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Tipo de incidencia *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="late">⏰ Retraso</option>
              <option value="sick_leave">🤒 Baja médica</option>
              <option value="absence">❌ Ausencia injustificada</option>
              <option value="personal">👤 Asunto personal</option>
              <option value="other">📋 Otro</option>
            </select>
          </div>

          {/* Horas de retraso (solo si es retraso) */}
          {formData.type === 'late' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Horas de retraso
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.hours_late || ''}
                onChange={(e) => setFormData({ ...formData, hours_late: Number(e.target.value) })}
                placeholder="Ej: 1.5"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          {/* Motivo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Motivo *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              placeholder="Ej: Enfermedad, Tráfico, etc."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Notas */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Información adicional..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              Guardar Registro
            </button>
          </div>
        </form>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '16px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <ArrowLeft size={18} />
              Volver a RRHH
            </button>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                📊 Gestión de Asistencia
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                Registro de retrasos, ausencias y bajas médicas
              </p>
            </div>

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
              <Plus size={18} />
              Registrar Incidencia
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <AlertCircle size={24} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Total Incidencias</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.total}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Clock size={24} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Retrasos</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.late}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <UserX size={24} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Bajas Médicas</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.sickLeave}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <UserX size={24} style={{ color: '#dc2626' }} />
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Ausencias</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.absence}</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>Filtros:</span>
            </div>

            {/* Centro */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Centro
              </label>
              <select
                value={selectedCenter || ''}
                onChange={(e) => setSelectedCenter(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos los centros</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Tipo
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Todos</option>
                <option value="late">Retrasos</option>
                <option value="sick_leave">Bajas médicas</option>
                <option value="absence">Ausencias</option>
                <option value="personal">Asuntos personales</option>
                <option value="other">Otros</option>
              </select>
            </div>

            {/* Mes */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Mes
              </label>
              <input
                type="month"
                value={selectedDate.substring(0, 7)}
                onChange={(e) => setSelectedDate(e.target.value + '-01')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {/* Lista de registros */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
            Registros de Asistencia ({filteredRecords.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Cargando registros...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>No hay incidencias registradas para este periodo</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredRecords.map(record => {
                const typeStyle = getTypeColor(record.type);
                return (
                  <div
                    key={record.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>
                          {record.employee_name}
                        </span>
                        <span
                          style={{
                            padding: '4px 8px',
                            backgroundColor: typeStyle.bg,
                            color: typeStyle.color,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {getTypeLabel(record.type)}
                        </span>
                        {record.center_name && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            • {record.center_name}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                        📅 {new Date(record.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {record.hours_late && ` • ⏰ ${record.hours_late}h de retraso`}
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        <strong>Motivo:</strong> {record.reason}
                      </div>
                      {record.notes && (
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                          📝 {record.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(record.id!)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
