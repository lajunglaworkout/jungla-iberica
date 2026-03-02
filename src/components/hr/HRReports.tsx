// src/components/hr/HRReports.tsx - Sistema de Reportes de RRHH
import React, { useState, useEffect } from 'react';
import {
  Users, TrendingDown, Clock, Calendar, AlertCircle,
  DollarSign, FileText, Activity, BarChart3,
  Filter, RefreshCw, ArrowLeft
} from 'lucide-react';
import { getFinancialDataByMonthYear } from '../../services/franquiciadoService';
import { getAllEmployees } from '../../services/userService';
import { getAttendanceRecordsInRange, getVacationRequestsPending, getEmployeeShiftsSince } from '../../services/hrService';
import { getChecklistIncidentsSince } from '../../services/incidentService';
import { useData } from '../../contexts/DataContext';

interface HRReportsProps {
  onBack?: () => void;
}

interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
  avgTenure: number;
  absenteeismRate: number;
  shiftCoverage: number;
  pendingVacations: number;
  expiredDocuments: number;
  // Nuevas métricas
  totalAbsences: number;
  totalLateArrivals: number;
  totalSickLeaves: number;
  totalIncidents: number;
  incidentsUnanswered: number;
  incidentsOverdue: number;
}

const HRReports: React.FC<HRReportsProps> = ({ onBack }) => {
  const { employees, centers } = useData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'shifts' | 'vacations' | 'costs'>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    terminations: 0,
    turnoverRate: 0,
    avgTenure: 0,
    absenteeismRate: 0,
    shiftCoverage: 0,
    pendingVacations: 0,
    expiredDocuments: 0,
    totalAbsences: 0,
    totalLateArrivals: 0,
    totalSickLeaves: 0,
    totalIncidents: 0,
    incidentsUnanswered: 0,
    incidentsOverdue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCenter, setSelectedCenter] = useState<number | 'all'>('all');
  const [accountingData, setAccountingData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    loadDashboardMetrics();
    loadAccountingData();
  }, [selectedPeriod]);

  const loadAccountingData = async () => {
    try {
      // Obtener datos de contabilidad del mes actual
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const data = await getFinancialDataByMonthYear(currentMonth, currentYear);
      setAccountingData(data);
    } catch {
      // non-critical: costes section shows 0 if unavailable
    }
  };

  const loadDashboardMetrics = async () => {
    setLoading(true);
    try {
      const periodStart = getPeriodStart(selectedPeriod);
      const now = new Date().toISOString().split('T')[0];

      // 1. EMPLEADOS
      const employees = await getAllEmployees();

      const activeEmployees = employees.filter((e: any) => e.is_active);
      const totalEmployees = employees.length;
      const activeCount = activeEmployees.length;

      // 2. AUSENCIAS E INCIDENCIAS DE ASISTENCIA
      const attendanceRecords = await getAttendanceRecordsInRange(periodStart, now);

      const totalAbsences = attendanceRecords.filter((r: any) => r.type === 'absence').length;
      const totalLateArrivals = attendanceRecords.filter((r: any) => r.type === 'late').length;
      const totalSickLeaves = attendanceRecords.filter((r: any) => r.type === 'sick_leave').length;

      // Calcular tasa de absentismo
      const workingDays = Math.max(1, Math.ceil((new Date(now).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24)));
      const expectedAttendance = activeCount * workingDays;
      const absenteeismRate = expectedAttendance > 0 ? ((totalAbsences / expectedAttendance) * 100) : 0;

      // 3. INCIDENCIAS DEL SISTEMA
      const incidents = await getChecklistIncidentsSince(periodStart);

      const totalIncidents = incidents.length;
      const incidentsUnanswered = incidents.filter((i: any) =>
        !i.rrhh_response || i.rrhh_response === ''
      ).length;

      const incidentsOverdue = incidents.filter((i: any) =>
        i.due_date && new Date(i.due_date) < new Date() && i.status !== 'resolved'
      ).length;

      // 4. VACACIONES
      const vacations = await getVacationRequestsPending();

      const pendingVacations = vacations.length;

      // 5. TURNOS
      const shifts = await getEmployeeShiftsSince(periodStart);

      setMetrics({
        totalEmployees,
        activeEmployees: activeCount,
        newHires: 0,
        terminations: totalEmployees - activeCount,
        turnoverRate: totalEmployees > 0 ? ((totalEmployees - activeCount) / totalEmployees * 100) : 0,
        avgTenure: 0,
        absenteeismRate,
        shiftCoverage: shifts.length,
        pendingVacations,
        expiredDocuments: 0,
        totalAbsences,
        totalLateArrivals,
        totalSickLeaves,
        totalIncidents,
        incidentsUnanswered,
        incidentsOverdue
      });

    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodStart = (period: string): string => {
    const now = new Date();
    switch (period) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo.toISOString().split('T')[0];
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
      case 'year':
        return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: trend >= 0 ? '#10b981' : '#ef4444',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

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
                Reportes y Analíticas de RRHH
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                Dashboard ejecutivo con métricas clave y reportes detallados
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Selector de periodo */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <option value="week">Última semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
              </select>

              <button
                onClick={loadDashboardMetrics}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
            { id: 'staff', label: 'Plantilla', icon: <Users size={18} /> },
            { id: 'shifts', label: 'Turnos', icon: <Clock size={18} /> },
            { id: 'vacations', label: 'Vacaciones', icon: <Calendar size={18} /> },
            { id: 'costs', label: 'Costes', icon: <DollarSign size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'staff' | 'shifts' | 'vacations' | 'costs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #059669' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                color: activeTab === tab.id ? '#059669' : '#6b7280',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Métricas principales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <MetricCard
                title="Empleados Activos"
                value={metrics.activeEmployees}
                icon={<Users size={24} />}
                color="#059669"
                subtitle={`de ${metrics.totalEmployees} totales`}
              />
              <MetricCard
                title="Bajas del periodo"
                value={metrics.terminations}
                icon={<TrendingDown size={24} />}
                color="#ef4444"
                subtitle={`de ${metrics.totalEmployees} totales`}
              />
              <MetricCard
                title="Cobertura de Turnos"
                value={`${metrics.shiftCoverage}`}
                icon={<Clock size={24} />}
                color="#3b82f6"
                subtitle="Turnos asignados"
              />
              <MetricCard
                title="Vacaciones Pendientes"
                value={metrics.pendingVacations}
                icon={<Calendar size={24} />}
                color="#f59e0b"
                subtitle="Por aprobar"
              />
            </div>

            {/* Métricas de Asistencia */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <MetricCard
                title="Ausencias"
                value={metrics.totalAbsences}
                icon={<AlertCircle size={24} />}
                color="#ef4444"
                subtitle={`Tasa: ${metrics.absenteeismRate.toFixed(1)}%`}
              />
              <MetricCard
                title="Retrasos"
                value={metrics.totalLateArrivals}
                icon={<Clock size={24} />}
                color="#f59e0b"
                subtitle="Este periodo"
              />
              <MetricCard
                title="Bajas Médicas"
                value={metrics.totalSickLeaves}
                icon={<Activity size={24} />}
                color="#8b5cf6"
                subtitle="Registradas"
              />
            </div>

            {/* Métricas de Incidencias */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <MetricCard
                title="Incidencias Totales"
                value={metrics.totalIncidents}
                icon={<AlertCircle size={24} />}
                color="#3b82f6"
                subtitle="Creadas este periodo"
              />
              <MetricCard
                title="Sin Respuesta RRHH"
                value={metrics.incidentsUnanswered}
                icon={<FileText size={24} />}
                color="#ef4444"
                subtitle="Requieren atención"
              />
              <MetricCard
                title="Incidencias Vencidas"
                value={metrics.incidentsOverdue}
                icon={<Calendar size={24} />}
                color="#dc2626"
                subtitle="Fuera de plazo"
              />
            </div>

            {/* Alertas y acciones rápidas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {/* Alertas */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  🚨 Alertas y Acciones Requeridas
                </h3>
                {(() => {
                  const hasAlerts = metrics.pendingVacations > 0 || metrics.incidentsUnanswered > 0 || metrics.incidentsOverdue > 0;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {metrics.pendingVacations > 0 && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#fef3c7',
                          borderLeft: '4px solid #f59e0b',
                          borderRadius: '6px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                            {metrics.pendingVacations} solicitudes de vacaciones pendientes
                          </div>
                          <div style={{ fontSize: '14px', color: '#78350f' }}>
                            Requieren aprobación o rechazo
                          </div>
                        </div>
                      )}
                      {metrics.incidentsUnanswered > 0 && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#fee2e2',
                          borderLeft: '4px solid #ef4444',
                          borderRadius: '6px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                            {metrics.incidentsUnanswered} incidencias sin respuesta de RRHH
                          </div>
                          <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                            Requieren atención inmediata
                          </div>
                        </div>
                      )}
                      {metrics.incidentsOverdue > 0 && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#fee2e2',
                          borderLeft: '4px solid #dc2626',
                          borderRadius: '6px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                            {metrics.incidentsOverdue} incidencias fuera de plazo
                          </div>
                          <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                            El plazo de resolución ha vencido
                          </div>
                        </div>
                      )}
                      {!hasAlerts && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#d1fae5',
                          borderLeft: '4px solid #10b981',
                          borderRadius: '6px',
                          textAlign: 'center',
                          color: '#065f46',
                          fontWeight: '600'
                        }}>
                          Sin alertas pendientes
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Resumen de asistencia */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Resumen del periodo
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Ausencias', value: metrics.totalAbsences, color: '#ef4444' },
                    { label: 'Retrasos', value: metrics.totalLateArrivals, color: '#f59e0b' },
                    { label: 'Bajas médicas', value: metrics.totalSickLeaves, color: '#8b5cf6' },
                    { label: 'Incidencias totales', value: metrics.totalIncidents, color: '#3b82f6' },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: `${item.color}08`,
                      borderRadius: '8px',
                      borderLeft: `3px solid ${item.color}`
                    }}>
                      <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: item.color }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB PLANTILLA */}
        {activeTab === 'staff' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                👥 Resumen de Plantilla
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#065f46' }}>
                    {metrics.activeEmployees}
                  </div>
                  <div style={{ fontSize: '14px', color: '#064e3b' }}>Empleados Activos</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>
                    {metrics.totalEmployees}
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e3a8a' }}>Total Empleados</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e' }}>
                    {metrics.turnoverRate.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#78350f' }}>Tasa de Rotación</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB TURNOS */}
        {activeTab === 'shifts' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                🕐 Cobertura de Turnos
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px' }}>
                    {metrics.shiftCoverage}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                    Turnos Asignados
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e40af' }}>
                    En el periodo seleccionado
                  </div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#065f46', marginBottom: '8px' }}>
                    {metrics.activeEmployees}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#064e3b', marginBottom: '4px' }}>
                    Empleados Disponibles
                  </div>
                  <div style={{ fontSize: '13px', color: '#065f46' }}>
                    Para asignación de turnos
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB VACACIONES */}
        {activeTab === 'vacations' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                🏖️ Estado de Vacaciones
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>
                    {metrics.pendingVacations}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#78350f', marginBottom: '4px' }}>
                    Solicitudes Pendientes
                  </div>
                  <div style={{ fontSize: '13px', color: '#92400e' }}>
                    Requieren aprobación o rechazo
                  </div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#065f46', marginBottom: '8px' }}>
                    {metrics.activeEmployees}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#064e3b', marginBottom: '4px' }}>
                    Empleados Activos
                  </div>
                  <div style={{ fontSize: '13px', color: '#065f46' }}>
                    Con derecho a vacaciones
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB COSTES */}
        {activeTab === 'costs' && (() => {
          // Obtener datos reales de contabilidad según centro seleccionado
          const filteredAccountingData = selectedCenter === 'all'
            ? accountingData
            : accountingData.filter(d => d.center_id === selectedCenter.toString());
          
          // Sumar nóminas y seguridad social de los datos de contabilidad
          const payrollCost = filteredAccountingData.reduce((sum, d) => sum + (d.nominas || 0), 0);
          const socialSecurityCost = filteredAccountingData.reduce((sum, d) => sum + (d.seguridad_social || 0), 0);
          const totalCost = payrollCost + socialSecurityCost;
          
          // Contar empleados para referencia
          const filteredEmployees = selectedCenter === 'all' 
            ? employees.filter(e => e.is_active)
            : employees.filter(e => e.is_active && e.center_id === selectedCenter);
          const employeeCount = filteredEmployees.length;

          return (
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                    💰 Costes Laborales Estimados
                  </h2>
                  
                  <select
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    style={{
                      padding: '10px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">🌍 Global (Todos)</option>
                    {centers.map(center => (
                      <option key={center.id} value={center.id}>
                        {center.name.includes('Tablet') ? center.name.replace('Tablet', '🏋️') : center.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#064e3b', marginBottom: '8px' }}>
                    Coste Nóminas Mensual
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#065f46' }}>
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(payrollCost)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#065f46', marginTop: '4px' }}>
                    {employeeCount} empleado{employeeCount !== 1 ? 's' : ''} activo{employeeCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#1e3a8a', marginBottom: '8px' }}>
                    Seguridad Social (30%)
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af' }}>
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(socialSecurityCost)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#1e40af', marginTop: '4px' }}>
                    Datos de contabilidad
                  </div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#312e81', marginBottom: '8px' }}>
                    Coste Total Mensual
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3730a3' }}>
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalCost)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#3730a3', marginTop: '4px' }}>
                    Nóminas + Seguridad Social
                  </div>
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#d1fae5',
                borderRadius: '8px',
                border: '1px solid #10b981'
              }}>
                <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                  ✅ Datos reales de Contabilidad
                </div>
                <div style={{ fontSize: '13px', color: '#064e3b' }}>
                  Costes obtenidos del módulo de Contabilidad ({new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}).
                </div>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
};

export default HRReports;
