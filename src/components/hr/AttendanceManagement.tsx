// src/components/hr/AttendanceManagement.tsx - Gestión de Asistencia y Ausencias
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, AlertCircle, Clock, UserX, Plus, Filter, MapPin, 
  Calendar, Save, X, FileText, TrendingUp, Users, CheckCircle, Zap, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';
import { 
  detectDailyAttendanceIncidents, 
  processTodayAttendance, 
  autoProcessIfNeeded,
  getProcessingLog 
} from '../../services/attendanceService';

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
  type: 'late' | 'sick_leave' | 'absence' | 'personal' | 'other' | 'early_departure';
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
  const [processingLog, setProcessingLog] = useState<any[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [autoProcessed, setAutoProcessed] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  
  const [formData, setFormData] = useState<AttendanceRecord>({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'late',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
    loadProcessingLog();
  }, [selectedCenter, selectedDate]);

  useEffect(() => {
    if (centers && centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0].id);
    }
  }, [centers]);

  // Auto-procesamiento al cargar el componente
  useEffect(() => {
    const runAutoProcess = async () => {
      const result = await autoProcessIfNeeded();
      if (result.processed) {
        setAutoProcessed(true);
        console.log(`🤖 Auto-procesamiento ejecutado: ${result.count} incidencias`);
        // Recargar datos después del auto-procesamiento
        setTimeout(() => {
          loadRecords();
          loadProcessingLog();
        }, 1000);
      }
    };
    
    runAutoProcess();
  }, []);

  const getMonthStart = () => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };

  const getMonthEnd = () => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const loadProcessingLog = async () => {
    try {
      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();
      const log = await getProcessingLog(monthStart, monthEnd, selectedCenter || undefined);
      setProcessingLog(log);
    } catch (error) {
      console.error('Error cargando log:', error);
    }
  };

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

  const handleJustify = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setShowJustifyModal(true);
  };

  const handleSaveJustification = async () => {
    if (!editingRecord || !editingRecord.id) return;

    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          reason: editingRecord.reason,
          notes: editingRecord.notes,
          type: editingRecord.type
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      alert('✅ Justificación guardada correctamente');
      setShowJustifyModal(false);
      setEditingRecord(null);
      loadRecords();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleAutoDetect = async () => {
    if (!confirm('¿Procesar incidencias automáticamente desde los fichajes de hoy?')) return;

    try {
      const incidentsCount = await processTodayAttendance(selectedCenter || undefined);
      alert(`✅ Proceso completado: ${incidentsCount} incidencias detectadas y registradas`);
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
      early_departure: '🚪 Salida temprana',
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
      early_departure: { bg: '#fed7aa', color: '#9a3412' },
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

  // Modal de justificación
  if (showJustifyModal && editingRecord) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => {
              setShowJustifyModal(false);
              setEditingRecord(null);
            }} 
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
            ✏️ Justificar/Editar Incidencia
          </h1>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Info del empleado */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              {editingRecord.employee_name}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              📅 {new Date(editingRecord.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {editingRecord.center_name && ` • ${editingRecord.center_name}`}
            </div>
          </div>

          {/* Tipo de incidencia */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Tipo de incidencia *
            </label>
            <select
              value={editingRecord.type}
              onChange={(e) => setEditingRecord({ ...editingRecord, type: e.target.value as any })}
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
              <option value="early_departure">🚪 Salida temprana</option>
              <option value="other">📋 Otro</option>
            </select>
          </div>

          {/* Motivo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Motivo *
            </label>
            <input
              type="text"
              value={editingRecord.reason}
              onChange={(e) => setEditingRecord({ ...editingRecord, reason: e.target.value })}
              placeholder="Ej: Cita médica, Tráfico, etc."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Justificación/Notas */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Justificación / Notas de RRHH
            </label>
            <textarea
              value={editingRecord.notes || ''}
              onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
              rows={4}
              placeholder="Añade aquí la justificación del empleado o notas de seguimiento..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              💡 Ejemplo: "Presentó justificante médico", "Avisó con antelación", "Reincidente - 3ª vez este mes"
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowJustifyModal(false);
                setEditingRecord(null);
              }}
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
              onClick={handleSaveJustification}
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
              Guardar Justificación
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <option value="early_departure">🚪 Salida temprana</option>
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

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowLog(!showLog)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: showLog ? '#6366f1' : '#e0e7ff',
                  color: showLog ? 'white' : '#4f46e5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <FileText size={18} />
                {showLog ? 'Ver Incidencias' : 'Ver Historial'}
              </button>
              <button
                onClick={handleAutoDetect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Zap size={18} />
                Detectar Automático
              </button>
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
                Registrar Manual
              </button>
            </div>
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
                <option value="early_departure">Salidas tempranas</option>
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

        {/* Historial de Procesamientos o Lista de Registros */}
        {showLog ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
              📅 Historial de Procesamientos ({processingLog.length})
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Resumen de procesamientos automáticos diarios. Cada día se procesa una vez automáticamente.
            </p>

            {processingLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>No hay procesamientos registrados para este periodo</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {processingLog.map(log => (
                  <div
                    key={log.id}
                    style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: log.status === 'completed' ? '#f9fafb' : '#fef2f2'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                            📅 {new Date(log.process_date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          {log.center_id && (
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              • {centers.find(c => c.id === log.center_id)?.name}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          Procesado: {new Date(log.processed_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '6px 12px',
                          backgroundColor: log.status === 'completed' ? '#dcfce7' : '#fee2e2',
                          color: log.status === 'completed' ? '#166534' : '#991b1b',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {log.status === 'completed' ? '✅ Completado' : '❌ Error'}
                      </div>
                    </div>

                    {/* Resumen de incidencias */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                      <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Incidencias</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{log.incidents_detected}</div>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                        <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>⏰ Retrasos</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{log.late_count}</div>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: '#fecaca', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '12px', color: '#7f1d1d', marginBottom: '4px' }}>❌ Ausencias</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7f1d1d' }}>{log.absence_count}</div>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: '#fed7aa', borderRadius: '8px', border: '1px solid #fdba74' }}>
                        <div style={{ fontSize: '12px', color: '#9a3412', marginBottom: '4px' }}>🚪 Salidas Tempranas</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9a3412' }}>{log.early_departure_count}</div>
                      </div>
                    </div>

                    {log.error_message && (
                      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '13px', color: '#991b1b' }}>
                        ⚠️ Error: {log.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleJustify(record)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
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
                        <FileText size={14} />
                        Justificar
                      </button>
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
                  </div>
                );
              })}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
