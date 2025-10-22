// src/components/hr/HRReports.tsx - Sistema de Reportes de RRHH
import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, TrendingDown, Clock, Calendar, AlertCircle, 
  DollarSign, FileText, Award, Activity, BarChart3, PieChart,
  Download, Filter, RefreshCw, ArrowLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

  useEffect(() => {
    loadDashboardMetrics();
  }, [selectedPeriod]);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    try {
      const periodStart = getPeriodStart(selectedPeriod);
      const now = new Date().toISOString().split('T')[0];

      // 1. EMPLEADOS
      const { data: employees } = await supabase
        .from('employees')
        .select('*');

      const activeEmployees = employees?.filter(e => e.is_active) || [];
      const totalEmployees = employees?.length || 0;
      const activeCount = activeEmployees.length;

      // 2. AUSENCIAS E INCIDENCIAS DE ASISTENCIA
      const { data: attendanceRecords } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', periodStart)
        .lte('date', now);

      const totalAbsences = attendanceRecords?.filter(r => r.type === 'absence').length || 0;
      const totalLateArrivals = attendanceRecords?.filter(r => r.type === 'late').length || 0;
      const totalSickLeaves = attendanceRecords?.filter(r => r.type === 'sick_leave').length || 0;
      
      // Calcular tasa de absentismo
      const workingDays = Math.max(1, Math.ceil((new Date(now).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24)));
      const expectedAttendance = activeCount * workingDays;
      const absenteeismRate = expectedAttendance > 0 ? ((totalAbsences / expectedAttendance) * 100) : 0;

      // 3. INCIDENCIAS DEL SISTEMA
      const { data: incidents } = await supabase
        .from('checklist_incidents')
        .select('*')
        .gte('created_at', periodStart);

      const totalIncidents = incidents?.length || 0;
      const incidentsUnanswered = incidents?.filter(i => 
        !i.rrhh_response || i.rrhh_response === ''
      ).length || 0;
      
      const incidentsOverdue = incidents?.filter(i => 
        i.due_date && new Date(i.due_date) < new Date() && i.status !== 'resolved'
      ).length || 0;

      // 4. VACACIONES
      const { data: vacations } = await supabase
        .from('vacation_requests')
        .select('*')
        .eq('status', 'pending');

      const pendingVacations = vacations?.length || 0;

      // 5. TURNOS
      const { data: shifts } = await supabase
        .from('employee_shifts')
        .select('*')
        .gte('date', periodStart);

      setMetrics({
        totalEmployees,
        activeEmployees: activeCount,
        newHires: 0,
        terminations: totalEmployees - activeCount,
        turnoverRate: totalEmployees > 0 ? ((totalEmployees - activeCount) / totalEmployees * 100) : 0,
        avgTenure: 0,
        absenteeismRate,
        shiftCoverage: shifts?.length || 0,
        pendingVacations,
        expiredDocuments: 0,
        totalAbsences,
        totalLateArrivals,
        totalSickLeaves,
        totalIncidents,
        incidentsUnanswered,
        incidentsOverdue
      });

      console.log('📊 Métricas cargadas:', {
        ausencias: totalAbsences,
        retrasos: totalLateArrivals,
        bajas: totalSickLeaves,
        incidencias: totalIncidents,
        sinRespuesta: incidentsUnanswered,
        vencidas: incidentsOverdue,
        vacacionesPendientes: pendingVacations
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
                📊 Reportes y Analíticas de RRHH
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                Dashboard ejecutivo con métricas clave y reportes detallados
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Selector de periodo */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
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
              onClick={() => setActiveTab(tab.id as any)}
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
                title="Nuevas Altas"
                value={metrics.newHires}
                icon={<TrendingUp size={24} />}
                color="#10b981"
                trend={15}
                subtitle="Este periodo"
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
                  {metrics.expiredDocuments > 0 && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fee2e2',
                      borderLeft: '4px solid #ef4444',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                        {metrics.expiredDocuments} documentos vencidos
                      </div>
                      <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                        Renovar certificados y formaciones
                      </div>
                    </div>
                  )}
                  {metrics.pendingVacations === 0 && metrics.expiredDocuments === 0 && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#d1fae5',
                      borderLeft: '4px solid #10b981',
                      borderRadius: '6px',
                      textAlign: 'center',
                      color: '#065f46',
                      fontWeight: '600'
                    }}>
                      ✅ No hay alertas pendientes
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones rápidas */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  ⚡ Acciones Rápidas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Download size={16} />
                    Exportar nómina
                  </button>
                  <button style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileText size={16} />
                    Generar informe
                  </button>
                  <button style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Award size={16} />
                    Ver evaluaciones
                  </button>
                </div>
              </div>
            </div>

            {/* Próximamente: Gráficos */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <PieChart size={64} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Gráficos y Tendencias
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Visualizaciones de datos próximamente
              </p>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                • Evolución de plantilla • Distribución por centros • Costes laborales • Absentismo
              </div>
            </div>
          </div>
        )}

        {/* Otros tabs - Próximamente */}
        {activeTab !== 'dashboard' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <Activity size={64} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Reporte de {activeTab === 'staff' ? 'Plantilla' : activeTab === 'shifts' ? 'Turnos' : activeTab === 'vacations' ? 'Vacaciones' : 'Costes'}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Este reporte detallado estará disponible próximamente
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRReports;
