// src/components/hr/AttendanceManagement.tsx - Gestión de Asistencia y Ausencias
import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, UserX, Plus, Filter, MapPin, Calendar, FileText, CheckCircle, Zap } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { ui } from '../../utils/ui';
import { detectDailyAttendanceIncidents, processTodayAttendance, autoProcessIfNeeded, getProcessingLog, getAttendanceRecordsEnriched, getEmployeeAttendanceHistory, createAttendanceRecord, deleteAttendanceRecord, updateAttendanceRecord } from '../../services/attendanceService';
import { type AttendanceRecord, type EmployeeHistory } from './attendance/AttendanceTypes';
import { AttendanceJustifyModal } from './attendance/AttendanceJustifyModal';
import { AttendanceCreateForm } from './attendance/AttendanceCreateForm';
import { AttendanceRecordCard } from './attendance/AttendanceRecordCard';

interface AttendanceManagementProps { onBack?: () => void; }

const INITIAL_FORM: AttendanceRecord = {
  employee_id: 0,
  date: new Date().toISOString().split('T')[0],
  type: 'late', reason: '', notes: '',
};

const INITIAL_HISTORY: EmployeeHistory = { thisMonth: 0, thisMonthByType: {}, last3Months: 0, totalRecords: [] };

const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ onBack }) => {
  const { centers, employees } = useData();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [processingLog, setProcessingLog] = useState<Record<string, unknown>[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [employeeHistory, setEmployeeHistory] = useState<EmployeeHistory>(INITIAL_HISTORY);
  const [formData, setFormData] = useState<AttendanceRecord>(INITIAL_FORM);

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
      const log = await getProcessingLog(getMonthStart(), getMonthEnd(), selectedCenter || undefined);
      setProcessingLog(log);
    } catch (error) { console.error('Error cargando log:', error); }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const enrichedData = await getAttendanceRecordsEnriched(getMonthStart(), getMonthEnd());
      const withCenterName = enrichedData.map((record: Record<string, unknown>) => {
        const center = centers.find((c: Record<string, unknown>) => c.id === record.center_id);
        return { ...record, center_name: (center as Record<string, unknown>)?.name };
      });
      setRecords(withCenterName);
    } catch (error) { console.error('Error cargando registros:', error); setRecords([]); }
    finally { setLoading(false); }
  };

  const loadEmployeeHistory = async (employeeId: number) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
      const allRecords = await getEmployeeAttendanceHistory(employeeId);
      if (!allRecords.length) { setEmployeeHistory(INITIAL_HISTORY); return; }
      const thisMonthRecords = allRecords.filter((r: Record<string, unknown>) => (r.date as string) >= monthStart);
      const last3MonthsRecords = allRecords.filter((r: Record<string, unknown>) => (r.date as string) >= threeMonthsAgo);
      const byType: { [key: string]: number } = {};
      thisMonthRecords.forEach((r: Record<string, unknown>) => { byType[r.type as string] = (byType[r.type as string] || 0) + 1; });
      setEmployeeHistory({ thisMonth: thisMonthRecords.length, thisMonthByType: byType, last3Months: last3MonthsRecords.length, totalRecords: allRecords });
    } catch (error) { console.error('Error cargando historial:', error); setEmployeeHistory(INITIAL_HISTORY); }
  };

  useEffect(() => { loadRecords(); loadProcessingLog(); }, [selectedCenter, selectedDate]);
  useEffect(() => { if (centers?.length > 0 && !selectedCenter) setSelectedCenter(centers[0].id); }, [centers]);
  useEffect(() => {
    autoProcessIfNeeded().then(result => {
      if (result.processed) { setTimeout(() => { loadRecords(); loadProcessingLog(); }, 1000); }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.reason) { ui.warning('⚠️ Por favor completa todos los campos obligatorios'); return; }
    try {
      const result = await createAttendanceRecord({ employee_id: formData.employee_id, date: formData.date, type: formData.type, hours_late: formData.hours_late || null, reason: formData.reason, notes: formData.notes || null, created_by: 'RRHH' });
      if (!result.success) throw new Error(result.error);
      ui.success('✅ Registro de asistencia guardado correctamente');
      setShowForm(false); setFormData(INITIAL_FORM); loadRecords();
    } catch (error: unknown) { ui.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`); }
  };

  const handleDelete = async (id: number) => {
    if (!await ui.confirm('¿Eliminar este registro de asistencia?')) return;
    try {
      const result = await deleteAttendanceRecord(id);
      if (!result.success) throw new Error(result.error);
      ui.success('✅ Registro eliminado'); loadRecords();
    } catch (error: unknown) { ui.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`); }
  };

  const handleJustify = async (record: AttendanceRecord) => {
    await loadEmployeeHistory(record.employee_id);
    setEditingRecord(record); setShowJustifyModal(true);
  };

  const handleSaveJustification = async () => {
    if (!editingRecord?.id) return;
    try {
      const result = await updateAttendanceRecord(editingRecord.id!, { reason: editingRecord.reason, notes: editingRecord.notes, type: editingRecord.type });
      if (!result.success) throw new Error(result.error);
      ui.success('✅ Justificación guardada correctamente');
      setShowJustifyModal(false); setEditingRecord(null); loadRecords();
    } catch (error: unknown) { ui.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`); }
  };

  const handleAutoDetect = async () => {
    if (!await ui.confirm('¿Procesar incidencias automáticamente desde los fichajes de hoy?')) return;
    try {
      const count = await processTodayAttendance(selectedCenter || undefined);
      ui.success(`✅ Proceso completado: ${count} incidencias detectadas y registradas`); loadRecords();
    } catch (error: unknown) { ui.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`); }
  };

  // Detect unused import
  void detectDailyAttendanceIncidents;

  const filteredRecords = records.filter(r => (!selectedCenter || r.center_id === selectedCenter) && (selectedType === 'all' || r.type === selectedType));
  const stats = { total: filteredRecords.length, late: filteredRecords.filter(r => r.type === 'late').length, sickLeave: filteredRecords.filter(r => r.type === 'sick_leave').length, absence: filteredRecords.filter(r => r.type === 'absence').length };

  // Render paths
  if (showJustifyModal && editingRecord) {
    return <AttendanceJustifyModal record={editingRecord} employeeHistory={employeeHistory} onClose={() => { setShowJustifyModal(false); setEditingRecord(null); }} onSave={handleSaveJustification} onChange={setEditingRecord} />;
  }

  if (showForm) {
    return <AttendanceCreateForm formData={formData} employees={employees as { id: number; name: string; center_id?: number }[]} centers={centers as { id: number; name: string }[]} selectedCenter={selectedCenter} onFormChange={setFormData} onSubmit={handleSubmit} onClose={() => setShowForm(false)} />;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          {onBack && (
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
              Volver a RRHH
            </button>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>📊 Gestión de Asistencia</h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>Registro de retrasos, ausencias y bajas médicas</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowLog(!showLog)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: showLog ? '#6366f1' : '#e0e7ff', color: showLog ? 'white' : '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                <FileText size={18} /> {showLog ? 'Ver Incidencias' : 'Ver Historial'}
              </button>
              <button onClick={handleAutoDetect} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                <Zap size={18} /> Detectar Automático
              </button>
              <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                <Plus size={18} /> Registrar Manual
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {[
            { icon: <AlertCircle size={24} style={{ color: '#f59e0b' }} />, label: 'Total Incidencias', value: stats.total },
            { icon: <Clock size={24} style={{ color: '#f59e0b' }} />, label: 'Retrasos', value: stats.late },
            { icon: <UserX size={24} style={{ color: '#ef4444' }} />, label: 'Bajas Médicas', value: stats.sickLeave },
            { icon: <UserX size={24} style={{ color: '#dc2626' }} />, label: 'Ausencias', value: stats.absence },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>{icon}<span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{label}</span></div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={20} style={{ color: '#6b7280' }} /><span style={{ fontWeight: '600', color: '#374151' }}>Filtros:</span>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />Centro</label>
              <select value={selectedCenter || ''} onChange={(e) => setSelectedCenter(Number(e.target.value))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <option value="">Todos los centros</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Tipo</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <option value="all">Todos</option>
                <option value="late">Retrasos</option>
                <option value="sick_leave">Bajas médicas</option>
                <option value="absence">Ausencias</option>
                <option value="personal">Asuntos personales</option>
                <option value="early_departure">Salidas tempranas</option>
                <option value="other">Otros</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Mes</label>
              <input type="month" value={selectedDate.substring(0, 7)} onChange={(e) => setSelectedDate(e.target.value + '-01')} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        {/* Contenido */}
        {showLog ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>📅 Historial de Procesamientos ({processingLog.length})</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Resumen de procesamientos automáticos diarios. Cada día se procesa una vez automáticamente.</p>
            {processingLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}><Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} /><p>No hay procesamientos registrados para este periodo</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {processingLog.map((log) => (
                  <div key={String(log.id)} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: log.status === 'completed' ? '#f9fafb' : '#fef2f2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>📅 {new Date(String(log.process_date)).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          {log.center_id && <span style={{ fontSize: '14px', color: '#6b7280' }}>• {centers.find(c => c.id === log.center_id)?.name}</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Procesado: {new Date(String(log.processed_at)).toLocaleString('es-ES')}</div>
                      </div>
                      <div style={{ padding: '6px 12px', backgroundColor: log.status === 'completed' ? '#dcfce7' : '#fee2e2', color: log.status === 'completed' ? '#166534' : '#991b1b', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {log.status === 'completed' ? '✅ Completado' : '❌ Error'}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                      {[
                        { label: 'Total Incidencias', value: log.incidents_detected, bg: 'white', color: '#111827', border: '#e5e7eb' },
                        { label: '⏰ Retrasos', value: log.late_count, bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
                        { label: '❌ Ausencias', value: log.absence_count, bg: '#fecaca', color: '#7f1d1d', border: '#fca5a5' },
                        { label: '🚪 Salidas Tempranas', value: log.early_departure_count, bg: '#fed7aa', color: '#9a3412', border: '#fdba74' },
                      ].map(({ label, value, bg, color, border }) => (
                        <div key={label} style={{ padding: '12px', backgroundColor: bg, borderRadius: '8px', border: `1px solid ${border}` }}>
                          <div style={{ fontSize: '12px', color, marginBottom: '4px' }}>{label}</div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{String(value ?? 0)}</div>
                        </div>
                      ))}
                    </div>
                    {log.error_message && <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '13px', color: '#991b1b' }}>⚠️ Error: {String(log.error_message)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>Registros de Asistencia ({filteredRecords.length})</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Cargando registros...</div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} /><p>No hay incidencias registradas para este periodo</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredRecords.map(record => <AttendanceRecordCard key={record.id} record={record} onJustify={handleJustify} onDelete={handleDelete} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
