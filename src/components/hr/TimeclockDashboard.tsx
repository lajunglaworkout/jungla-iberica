// src/components/hr/TimeclockDashboard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';
import QRGenerator from './QRGenerator';
import {
  Clock,
  Users,
  Calendar,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  MapPin,
  Timer,
  Eye,
  Edit3,
  ArrowLeft
} from 'lucide-react';

interface TimeclockRecord {
  id: number;
  employee_id: number;
  center_id: number;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number | null;
  date: string;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
  employee_name?: string;
  center_name?: string;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  totalHoursToday: number;
  lateArrivals: number;
}

interface TimeclockDashboardProps {
  onBack?: () => void;
}

const TimeclockDashboard: React.FC<TimeclockDashboardProps> = ({ onBack }) => {
  const { centers, employees } = useData();
  const [selectedCenter, setSelectedCenter] = useState<number>(9); // Sevilla por defecto
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<TimeclockRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    totalHoursToday: 0,
    lateArrivals: 0
  });
  const [loading, setLoading] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'incomplete'>('all');

  useEffect(() => {
    loadTimeclockData();
  }, [selectedCenter, selectedDate]);

  const loadTimeclockData = async () => {
    setLoading(true);
    try {
      // Cargar registros de fichaje
      const { data: timeclockData, error: timeclockError } = await supabase
        .from('employee_timeclock')
        .select(`
          *,
          employees!inner(nombre, apellidos, center_id),
          centers!inner(name)
        `)
        .eq('date', selectedDate)
        .eq('centers.id', selectedCenter)
        .order('clock_in', { ascending: true });

      if (timeclockError) throw timeclockError;

      // Mapear datos con nombres
      const mappedRecords: TimeclockRecord[] = (timeclockData || []).map((record: any) => ({
        ...record,
        employee_name: `${record.employees.nombre} ${record.employees.apellidos}`,
        center_name: record.centers.name
      }));

      setRecords(mappedRecords);

      // Calcular estadísticas
      const centerEmployees = employees.filter(emp => emp.center_id === selectedCenter && emp.is_active);
      const presentEmployees = mappedRecords.filter(r => r.clock_in);
      const totalHours = mappedRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0);

      // Calcular llegadas tarde (después de las 9:15 AM)
      const lateArrivals = mappedRecords.filter(r => {
        if (!r.clock_in) return false;
        const clockInTime = new Date(r.clock_in);
        const lateThreshold = new Date(clockInTime);
        lateThreshold.setHours(9, 15, 0, 0); // 9:15 AM
        return clockInTime > lateThreshold;
      }).length;

      setStats({
        totalEmployees: centerEmployees.length,
        presentToday: presentEmployees.length,
        totalHoursToday: totalHours,
        lateArrivals
      });

    } catch (error: any) {
      console.error('Error cargando datos de fichaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRecords = () => {
    const centerEmployees = employees.filter(emp => emp.center_id === selectedCenter && emp.is_active);

    switch (filterStatus) {
      case 'present':
        return records.filter(r => r.clock_in);
      case 'absent':
        // Empleados que no han fichado
        const recordedEmployeeIds = records.map(r => r.employee_id);
        const absentEmployees = centerEmployees.filter(emp => !recordedEmployeeIds.includes(emp.id));
        return absentEmployees.map(emp => ({
          id: 0,
          employee_id: emp.id,
          center_id: selectedCenter,
          clock_in: null,
          clock_out: null,
          total_hours: null,
          date: selectedDate,
          location_lat: null,
          location_lng: null,
          status: 'absent',
          employee_name: emp.name,
          center_name: centers.find(c => c.id === selectedCenter)?.name
        }));
      case 'incomplete':
        return records.filter(r => r.clock_in && !r.clock_out);
      default:
        // Combinar presentes y ausentes
        const recordedIds = records.map(r => r.employee_id);
        const absentList = centerEmployees
          .filter(emp => !recordedIds.includes(emp.id))
          .map(emp => ({
            id: 0,
            employee_id: emp.id,
            center_id: selectedCenter,
            clock_in: null,
            clock_out: null,
            total_hours: null,
            date: selectedDate,
            location_lat: null,
            location_lng: null,
            status: 'absent',
            employee_name: emp.name,
            center_name: centers.find(c => c.id === selectedCenter)?.name
          }));
        return [...records, ...absentList];
    }
  };

  const getStatusIcon = (record: TimeclockRecord) => {
    if (!record.clock_in) {
      return <XCircle size={20} style={{ color: '#ef4444' }} />;
    } else if (record.clock_in && !record.clock_out) {
      return <Timer size={20} style={{ color: '#f59e0b' }} />;
    } else {
      return <CheckCircle size={20} style={{ color: '#10b981' }} />;
    }
  };

  const getStatusText = (record: TimeclockRecord) => {
    if (!record.clock_in) return 'Ausente';
    if (record.clock_in && !record.clock_out) return 'Presente';
    return 'Completo';
  };

  const getStatusColor = (record: TimeclockRecord) => {
    if (!record.clock_in) return '#fee2e2';
    if (record.clock_in && !record.clock_out) return '#fef3c7';
    return '#d1fae5';
  };

  const exportToCSV = () => {
    const csvData = getFilteredRecords().map(record => ({
      Empleado: record.employee_name,
      Fecha: record.date,
      Entrada: record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : 'No fichó',
      Salida: record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : 'No fichó',
      'Horas Totales': record.total_hours?.toFixed(2) || '0',
      Estado: getStatusText(record)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fichajes_${selectedDate}_${centers.find(c => c.id === selectedCenter)?.name}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedCenterName = centers.find(c => c.id === selectedCenter)?.name || 'Centro';
  const filteredRecords = getFilteredRecords();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Botón Volver */}
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

      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Clock size={28} style={{ color: '#059669' }} />
            Control de Fichajes
          </h1>

          <button
            onClick={() => setShowQRGenerator(!showQRGenerator)}
            style={{
              padding: '12px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Eye size={16} />
            {showQRGenerator ? 'Ocultar QR' : 'Mostrar QR'}
          </button>
        </div>

        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
              Centro
            </label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
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

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#374151' }}>
              Filtro
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos</option>
              <option value="present">Solo Presentes</option>
              <option value="absent">Solo Ausentes</option>
              <option value="incomplete">Fichaje Incompleto</option>
            </select>
          </div>
        </div>

        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Users size={24} style={{ color: '#059669', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.presentToday}/{stats.totalEmployees}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Empleados Presentes</div>
          </div>

          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <BarChart3 size={24} style={{ color: '#059669', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalHoursToday.toFixed(1)}h
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Horas Trabajadas</div>
          </div>

          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <AlertTriangle size={24} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.lateArrivals}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Llegadas Tarde</div>
          </div>

          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Calendar size={24} style={{ color: '#059669', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {new Date(selectedDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Fecha Seleccionada</div>
          </div>
        </div>
      </div>

      {/* QR Generator */}
      {showQRGenerator && (
        <div style={{ marginBottom: '24px' }}>
          <QRGenerator
            centerId={selectedCenter}
            centerName={selectedCenterName}
          />
        </div>
      )}

      {/* Tabla de Registros */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Registros de {selectedCenterName} - {new Date(selectedDate).toLocaleDateString()}
          </h3>

          <button
            onClick={exportToCSV}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  Estado
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  Empleado
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  Nombre
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  Entrada
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  Salida
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  Horas
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  Ubicación
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Cargando registros...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No hay registros para mostrar
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr
                    key={`${record.employee_id}-${index}`}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: getStatusColor(record)
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {getStatusIcon(record)}
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          {getStatusText(record)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1f2937' }}>
                      {record.employee_name}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      {employees.find(e => e.id === record.employee_id)?.name}
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>
                      {record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>
                      {record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#374151', fontWeight: 'bold' }}>
                      {record.total_hours ? `${record.total_hours.toFixed(2)}h` : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {record.location_lat && record.location_lng ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#059669'
                        }}>
                          <MapPin size={16} />
                          <span style={{ fontSize: '12px' }}>Verificada</span>
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando registros...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay registros para mostrar</div>
          ) : (
            filteredRecords.map((record, index) => (
              <div
                key={`${record.employee_id}-${index}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="p-3 border-b border-gray-100 flex justify-between items-center"
                  style={{ backgroundColor: getStatusColor(record) }}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record)}
                    <span className="font-bold text-gray-800 text-sm">
                      {record.employee_name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-white/50 rounded-lg text-gray-700">
                    {getStatusText(record)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Entrada</span>
                    <span className="text-sm font-bold text-gray-800">
                      {record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Salida</span>
                    <span className="text-sm font-bold text-gray-800">
                      {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {record.total_hours ? `${record.total_hours.toFixed(1)}h` : '-'}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                {record.location_lat && record.location_lng && (
                  <div className="px-3 pb-3 pt-0 flex justify-end">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <MapPin size={12} />
                      Ubicación Verificada
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeclockDashboard;
