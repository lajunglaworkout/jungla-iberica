import React, { useState, useEffect } from 'react';
import { getTimeclockRecords } from '../../services/hrService';
import { useData } from '../../contexts/DataContext';
import { useSession } from '../../contexts/SessionContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import QRGenerator from './QRGenerator';
import { ui } from '../../utils/ui';

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

interface TimeclockRawRecord {
  employees: { nombre: string; apellidos: string };
  centers: { name: string };
  [key: string]: unknown;
}

const TimeclockDashboard: React.FC<TimeclockDashboardProps> = ({ onBack }) => {
  const { centers, employees } = useData();
  const { employee: currentUser, userRole } = useSession();
  const isMobile = useIsMobile();

  // Determinar si puede ver todos los registros
  const canViewAllRecords = ['superadmin', 'admin', 'center_manager', 'Encargado'].includes(currentUser?.role || '');
  // Superadmin/admin pueden cambiar de centro; encargados solo ven el suyo
  const isAdmin = ['superadmin', 'admin'].includes(userRole || '') || ['superadmin', 'admin'].includes(currentUser?.role || '');
  const availableCenters = isAdmin ? centers : centers.filter(c => Number(c.id) === Number(currentUser?.center_id));

  const [selectedCenter, setSelectedCenter] = useState<number>(currentUser?.center_id || 9);
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
      const timeclockData = await getTimeclockRecords({
        date: selectedDate,
        centerId: selectedCenter,
        employeeId: currentUser?.id,
        onlyForEmployee: !canViewAllRecords
      });

      // Mapear datos enriqueciendo con nombres desde contexto (sin depender de JOINs)
      const mappedRecords: TimeclockRecord[] = (timeclockData as Record<string, unknown>[]).map((record) => {
        const emp = employees.find(e => Number(e.id) === Number(record.employee_id));
        const center = centers.find(c => Number(c.id) === Number(record.center_id));
        return {
          ...record,
          employee_name: emp?.name || `Empleado ${record.employee_id}`,
          center_name: center?.name || `Centro ${record.center_id}`,
        };
      }) as unknown as TimeclockRecord[];

      setRecords(mappedRecords);

      // Calcular estadísticas
      const centerEmployees = employees.filter(emp => Number(emp.center_id) === Number(selectedCenter) && emp.is_active);
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

    } catch (error: unknown) {
      console.error('Error cargando datos de fichaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRecords = () => {
    const centerEmployees = employees.filter(emp => Number(emp.center_id) === Number(selectedCenter) && emp.is_active);

    switch (filterStatus) {
      case 'present':
        return records.filter(r => r.clock_in);
      case 'absent':
        // Empleados que no han fichado
        const recordedEmployeeIds = records.map(r => Number(r.employee_id));
        const absentEmployees = centerEmployees.filter(emp => !recordedEmployeeIds.includes(Number(emp.id)));
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
          center_name: centers.find(c => Number(c.id) === Number(selectedCenter))?.name
        }));
      case 'incomplete':
        return records.filter(r => r.clock_in && !r.clock_out);
      default:
        // Combinar presentes y ausentes
        const recordedIds = records.map(r => Number(r.employee_id));
        const absentList = centerEmployees
          .filter(emp => !recordedIds.includes(Number(emp.id)))
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
            center_name: centers.find(c => Number(c.id) === Number(selectedCenter))?.name
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

    if (csvData.length === 0) {
      ui.info('No hay registros para exportar');
      return;
    }

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fichajes_${selectedDate}_${centers.find(c => Number(c.id) === Number(selectedCenter))?.name}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedCenterName = centers.find(c => Number(c.id) === Number(selectedCenter))?.name || 'Centro';
  const filteredRecords = getFilteredRecords();

  return (
    <div style={{ padding: isMobile ? '8px' : '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
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
        padding: isMobile ? '16px' : '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '0',
          marginBottom: '20px'
        }}>
          <h1 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Clock size={isMobile ? 22 : 28} style={{ color: '#059669' }} />
            Control de Fichajes
          </h1>

          {/* Mostrar botón QR solo si tiene permisos */}
          {canViewAllRecords && (
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
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Eye size={16} />
              {showQRGenerator ? 'Ocultar QR' : 'Mostrar QR'}
            </button>
          )}
        </div>

        {/* Filtros - Solo mostrar si puede ver todos los registros */}
        {canViewAllRecords && (
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
                {availableCenters.map(center => (
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
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'present' | 'absent' | 'incomplete')}
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
        )}

        {!canViewAllRecords && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
              <strong>📅 Fecha:</strong> {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '12px' : '16px'
        }}>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: isMobile ? '12px 8px' : '16px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <Users size={isMobile ? 20 : 24} style={{ color: '#059669', margin: '0 auto 6px' }} />
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#1f2937', lineHeight: 1.2 }}>
              {stats.presentToday}/{stats.totalEmployees}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Presentes hoy</div>
          </div>

          <div style={{
            backgroundColor: '#f3f4f6',
            padding: isMobile ? '12px 8px' : '16px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <BarChart3 size={isMobile ? 20 : 24} style={{ color: '#059669', margin: '0 auto 6px' }} />
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#1f2937', lineHeight: 1.2 }}>
              {stats.totalHoursToday.toFixed(1)}h
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Horas trabajadas</div>
          </div>

          <div style={{
            backgroundColor: '#f3f4f6',
            padding: isMobile ? '12px 8px' : '16px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <AlertTriangle size={isMobile ? 20 : 24} style={{ color: '#f59e0b', margin: '0 auto 6px' }} />
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#1f2937', lineHeight: 1.2 }}>
              {stats.lateArrivals}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Llegadas tarde</div>
          </div>

          <div style={{
            backgroundColor: '#f3f4f6',
            padding: isMobile ? '12px 8px' : '16px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <Calendar size={isMobile ? 20 : 24} style={{ color: '#059669', margin: '0 auto 6px' }} />
            <div style={{ fontSize: isMobile ? '14px' : '24px', fontWeight: 'bold', color: '#1f2937', lineHeight: 1.3 }}>
              {isMobile
                ? new Date(selectedDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                : new Date(selectedDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Fecha seleccionada</div>
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
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '0'
        }}>
          <h3 style={{
            margin: 0,
            color: '#1f2937',
            fontSize: isMobile ? '15px' : '18px',
            fontWeight: 'bold',
            lineHeight: 1.3
          }}>
            {isMobile ? (
              <>
                <span style={{ display: 'block' }}>{selectedCenterName}</span>
                <span style={{ display: 'block', fontWeight: 'normal', fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                  {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
                </span>
              </>
            ) : (
              `Registros de ${selectedCenterName} - ${new Date(selectedDate).toLocaleDateString()}`
            )}
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
              justifyContent: 'center',
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
        <div className="md:hidden flex flex-col gap-3 p-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Cargando registros...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No hay registros para mostrar</div>
          ) : (
            filteredRecords.map((record, index) => (
              <div
                key={`${record.employee_id}-${index}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="px-4 py-3 border-b border-gray-100 flex justify-between items-center"
                  style={{ backgroundColor: getStatusColor(record) }}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record)}
                    <span className="font-bold text-gray-800 text-base">
                      {record.employee_name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-white/60 rounded-full text-gray-700">
                    {getStatusText(record)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-4 py-3 grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center py-2 px-1 bg-gray-50 rounded-xl">
                    <span className="text-xs font-semibold text-gray-400 mb-1">Entrada</span>
                    <span className="text-sm font-bold text-gray-800">
                      {record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-2 px-1 bg-gray-50 rounded-xl">
                    <span className="text-xs font-semibold text-gray-400 mb-1">Salida</span>
                    <span className="text-sm font-bold text-gray-800">
                      {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-2 px-1 bg-emerald-50 rounded-xl">
                    <span className="text-xs font-semibold text-emerald-500 mb-1">Total</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {record.total_hours ? `${record.total_hours.toFixed(1)}h` : '—'}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                {record.location_lat && record.location_lng && (
                  <div className="px-4 pb-3 pt-0 flex justify-end">
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      <MapPin size={12} />
                      Ubicación verificada
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
