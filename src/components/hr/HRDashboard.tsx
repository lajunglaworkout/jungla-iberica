// src/components/hr/HRDashboard.tsx - Dashboard Principal de RRHH
import React, { useState, useEffect } from 'react';
import {
  Database, Clock, Calendar, Award, BookOpen, FileText,
  BarChart, Palmtree, ArrowLeft, TrendingUp, UserCheck,
  Users, MapPin, AlertCircle, CheckCircle, Home, Settings
} from 'lucide-react';
import { loadUsers } from '../../services/userService';
import { getVacationRequestsPending } from '../../services/hrService';
import { supabase } from '../../lib/supabase';
import { ui } from '../../utils/ui';


interface DashboardCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  count?: number | string;
  status: 'active' | 'development' | 'coming-soon' | 'separator';
}

interface HRDashboardProps {
  onNavigate: (module: string) => void;
  onBack?: () => void;
  userRole?: string;
  isRegularEmployee?: boolean;
  currentEmployee?: import('../../types/employee').Employee;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingVacations: number;
}

const HRDashboard: React.FC<HRDashboardProps> = ({
  onNavigate,
  onBack,
  userRole,
  isRegularEmployee = false,
  currentEmployee
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    pendingVacations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [usersResult, timeclockResult, vacationsResult] = await Promise.all([
        loadUsers(),
        supabase.from('timeclock_records').select('id', { count: 'exact', head: true }).eq('date', today),
        getVacationRequestsPending(),
      ]);

      const employees = usersResult.success ? usersResult.users : [];

      setStats({
        totalEmployees: employees?.length || 0,
        presentToday: timeclockResult.count ?? 0,
        pendingVacations: vacationsResult.length,
      });
    } catch {
      setStats({ totalEmployees: 0, presentToday: 0, pendingVacations: 0 });
    } finally {
      setLoading(false);
    }
  };

  const dailyOperationsCards: DashboardCard[] = [
    {
      id: 'daily-mobile-timeclock',
      title: 'Fichar',
      icon: <UserCheck size={32} />,
      description: 'Registrar entrada y salida',
      color: '#8b5cf6',
      count: 'QR activo',
      status: 'active'
    },
    {
      id: 'daily-timeclock',
      title: 'Historial de fichajes',
      icon: <Clock size={32} />,
      description: 'Ver fichajes recientes',
      color: '#0ea5e9',
      count: 'Control horario',
      status: 'active'
    },
    {
      id: 'daily-operations-dashboard',
      title: 'Checklist diaria',
      icon: <CheckCircle size={32} />,
      description: 'Completar tareas diarias del centro',
      color: '#10b981',
      count: 'Pendientes',
      status: 'active'
    }
  ];

  const hrCards: DashboardCard[] = [
    {
      id: 'my-profile',
      title: 'Mi perfil',
      icon: <Users size={32} />,
      description: 'Información personal y laboral',
      color: '#059669',
      count: 'Actualizar',
      status: 'active'
    },
    {
      id: 'employee-vacation-request',
      title: 'Solicitar vacaciones',
      icon: <Palmtree size={32} />,
      description: 'Pedir días de vacaciones',
      color: '#10b981',
      count: 'Nuevo',
      status: 'active'
    },
    {
      id: 'employee-vacations',
      title: 'Estado de vacaciones',
      icon: <Calendar size={32} />,
      description: 'Ver solicitudes y estado',
      color: '#0ea5e9',
      count: 'Seguimiento',
      status: 'active'
    },
    {
      id: 'employee-uniform-request',
      title: 'Solicitar vestuario',
      icon: <Award size={32} />,
      description: 'Pedir uniformes y material',
      color: '#ef4444',
      count: 'Vestuario',
      status: 'active'
    },
    {
      id: 'employee-documents',
      title: 'Mis documentos',
      icon: <FileText size={32} />,
      description: 'Contratos y nóminas',
      color: '#84cc16',
      count: 'Descargar',
      status: 'active'
    },
    {
      id: 'employee-hr-contact',
      title: 'Contactar RRHH',
      icon: <Database size={32} />,
      description: 'Solicitar ayuda o soporte',
      color: '#f97316',
      count: 'Ayuda',
      status: 'active'
    }
  ];

  const adminCards: DashboardCard[] = [
    {
      id: 'employees',
      title: 'Gestión de Empleados',
      icon: <Users size={32} />,
      description: 'Administrar empleados, contratos y datos personales',
      color: '#059669',
      count: stats.totalEmployees > 0 ? `${stats.totalEmployees} empleados` : '—',
      status: 'active'
    },
    {
      id: 'shifts',
      title: 'Gestión de Turnos',
      icon: <Clock size={32} />,
      description: 'Crear y asignar turnos de trabajo',
      color: '#0ea5e9',
      count: 'Planificar',
      status: 'active'
    },
    {
      id: 'timeclock',
      title: 'Sistema de Fichajes',
      icon: <UserCheck size={32} />,
      description: 'Fichajes con QR dinámico y control horario',
      color: '#8b5cf6',
      count: stats.presentToday > 0 ? `${stats.presentToday} hoy` : 'Ver fichajes',
      status: 'active'
    },
    {
      id: 'attendance',
      title: 'Asistencia',
      icon: <Calendar size={32} />,
      description: 'Registro de retrasos, ausencias y bajas médicas',
      color: '#f59e0b',
      count: 'Gestionar',
      status: 'active'
    },
    {
      id: 'admin-vacations',
      title: 'Gestión de Vacaciones',
      icon: <Palmtree size={32} />,
      description: 'Gestión de vacaciones y permisos',
      color: '#10b981',
      count: stats.pendingVacations > 0 ? `${stats.pendingVacations} pendientes` : 'Sin pendientes',
      status: 'active'
    },
    {
      id: 'documents',
      title: 'Documentos',
      icon: <FileText size={32} />,
      description: 'Contratos, nóminas, certificados y bajas médicas',
      color: '#84cc16',
      count: 'Gestionar',
      status: 'active'
    },
    {
      id: 'hr-reports',
      title: 'Reportes y Analíticas',
      icon: <BarChart size={32} />,
      description: 'Ausencias, incidencias, peticiones y costes por centro',
      color: '#8b5cf6',
      count: 'Ver Dashboard',
      status: 'active'
    },
    {
      id: 'training',
      title: 'Formación',
      icon: <BookOpen size={32} />,
      description: 'Cursos y formación del personal',
      color: '#6366f1',
      count: 'Próximamente',
      status: 'coming-soon'
    },
    {
      id: 'evaluations',
      title: 'Evaluaciones',
      icon: <Award size={32} />,
      description: 'Evaluaciones de desempeño',
      color: '#ef4444',
      count: 'Próximamente',
      status: 'coming-soon'
    }
  ];

  const isManager = userRole?.includes('manager') || userRole?.includes('encargado') || userRole === 'center_manager';
  const isCEO = userRole === 'superadmin' || userRole === 'ceo';
  const isAdmin = userRole === 'admin' || userRole === 'hr_admin';

  const dashboardCards = isCEO || isAdmin
    ? adminCards
    : isManager
      ? adminCards  // managers see both sections rendered separately below
      : isRegularEmployee
        ? [...dailyOperationsCards, ...hrCards]
        : adminCards;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: '#10b98120',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#10b981'
          }}>
            <CheckCircle style={{ height: '12px', width: '12px' }} />
            Funcional
          </div>
        );
      case 'coming-soon':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: '#6b728020',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#6b7280'
          }}>
            <Clock style={{ height: '12px', width: '12px' }} />
            Próximamente
          </div>
        );
      case 'development':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: '#f59e0b20',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#f59e0b'
          }}>
            <AlertCircle style={{ height: '12px', width: '12px' }} />
            En desarrollo
          </div>
        );
      default:
        return null;
    }
  };

  const handleCardClick = (cardId: string, status: string) => {
    if (status === 'coming-soon') {
      ui.info('Próximamente\n\nEste módulo será implementado en futuras versiones del sistema.');
      return;
    }
    if (status === 'development') {
      ui.info('Módulo en desarrollo\n\nEste módulo está siendo implementado y estará disponible próximamente.');
      return;
    }
    if (status === 'separator') return;
    onNavigate(cardId);
  };

  const renderCard = (card: DashboardCard) => (
    <div
      key={card.id}
      onClick={() => handleCardClick(card.id, card.status)}
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '28px',
        cursor: card.status === 'coming-soon' ? 'default' : 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        border: `2px solid ${card.color}20`,
        transition: 'all 0.2s ease',
        position: 'relative',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: card.status === 'coming-soon' ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        if (card.status !== 'coming-soon') {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
          e.currentTarget.style.borderColor = `${card.color}50`;
        }
      }}
      onMouseLeave={(e) => {
        if (card.status !== 'coming-soon') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = `${card.color}20`;
        }
      }}
    >
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        {getStatusBadge(card.status)}
      </div>

      <div style={{
        padding: '16px',
        borderRadius: '14px',
        backgroundColor: `${card.color}12`,
        color: card.color,
        alignSelf: 'flex-start',
        marginBottom: '16px'
      }}>
        {card.icon}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#111827',
          margin: '0 0 8px 0',
          paddingRight: '80px'
        }}>
          {card.title}
        </h3>

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 16px 0',
          lineHeight: '1.5'
        }}>
          {card.description}
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 14px',
          backgroundColor: `${card.color}10`,
          color: card.color,
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          border: `1.5px solid ${card.color}25`
        }}>
          {card.count}
        </div>
      </div>
    </div>
  );

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 0 4px',
      borderBottom: '2px solid #f1f5f9',
      marginBottom: '4px'
    }}>
      <div style={{ color: '#6b7280' }}>{icon}</div>
      <span style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }}>
        {title}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Clock style={{
            height: '48px',
            width: '48px',
            animation: 'spin 1s linear infinite',
            color: '#059669',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            fontSize: '13px',
            color: '#9ca3af'
          }}>
            <Home style={{ height: '14px', width: '14px' }} />
            <span>RRHH</span>
            <span>›</span>
            <span style={{ color: '#059669', fontWeight: '500' }}>Dashboard</span>
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 6px 0'
          }}>
            {isManager
              ? 'Portal de Encargado'
              : isRegularEmployee
                ? 'Mi Portal de Empleado'
                : 'Recursos Humanos'
            }
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
            {isManager
              ? `Bienvenido, ${currentEmployee?.nombre || 'Encargado'}`
              : isRegularEmployee
                ? `Bienvenido, ${currentEmployee?.nombre || 'Empleado'}`
                : 'Sistema integral de gestión de personal — La Jungla Ibérica'
            }
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: 'white',
              border: '1.5px solid #e5e7eb',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.color = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <ArrowLeft style={{ height: '16px', width: '16px' }} />
            Volver
          </button>
        )}
      </div>

      {/* Quick Stats — solo para admin/CEO/encargado */}
      {!isRegularEmployee && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '14px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            border: '1.5px solid #05966915'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#05966915' }}>
                <Users style={{ height: '20px', width: '20px', color: '#059669' }} />
              </div>
              <div>
                <p style={{ fontSize: '26px', fontWeight: '700', margin: 0, color: '#111827', lineHeight: 1 }}>
                  {stats.totalEmployees}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                  Empleados
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '14px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            border: '1.5px solid #8b5cf615'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#8b5cf615' }}>
                <UserCheck style={{ height: '20px', width: '20px', color: '#8b5cf6' }} />
              </div>
              <div>
                <p style={{ fontSize: '26px', fontWeight: '700', margin: 0, color: '#111827', lineHeight: 1 }}>
                  {stats.presentToday}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                  Fichajes hoy
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '14px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            border: `1.5px solid ${stats.pendingVacations > 0 ? '#f59e0b15' : '#10b98115'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: stats.pendingVacations > 0 ? '#f59e0b15' : '#10b98115' }}>
                <Palmtree style={{ height: '20px', width: '20px', color: stats.pendingVacations > 0 ? '#f59e0b' : '#10b981' }} />
              </div>
              <div>
                <p style={{ fontSize: '26px', fontWeight: '700', margin: 0, color: '#111827', lineHeight: 1 }}>
                  {stats.pendingVacations}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                  Vacaciones pendientes
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '14px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            border: '1.5px solid #2563eb15'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#2563eb15' }}>
                <MapPin style={{ height: '20px', width: '20px', color: '#2563eb' }} />
              </div>
              <div>
                <p style={{ fontSize: '26px', fontWeight: '700', margin: 0, color: '#111827', lineHeight: 1 }}>
                  3
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                  Centros activos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {isManager ? (
        // Manager: dos secciones separadas con header visual
        <div>
          {/* Operaciones diarias */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {renderSectionHeader('Operaciones diarias', <CheckCircle size={14} />)}
            {dailyOperationsCards.map(renderCard)}
          </div>

          {/* Portal de empleado */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {renderSectionHeader('Mi portal', <Users size={14} />)}
            {hrCards.map(renderCard)}
          </div>

          {/* Gestión */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {renderSectionHeader('Gestión del equipo', <Settings size={14} />)}
            {adminCards.map(renderCard)}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {dashboardCards.map(renderCard)}
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
