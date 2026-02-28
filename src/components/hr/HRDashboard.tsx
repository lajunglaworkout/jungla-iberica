// src/components/hr/HRDashboard.tsx - Dashboard Principal de RRHH
import React, { useState, useEffect } from 'react';
import { 
  Database, Clock, Calendar, Award, BookOpen, FileText, 
  BarChart, Palmtree, ArrowLeft, TrendingUp, UserCheck,
  Users, MapPin, AlertCircle, CheckCircle, Home
} from 'lucide-react';
import { loadUsers } from '../../services/userService';
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
  activeShifts: number;
  pendingDocuments: number;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ 
  onNavigate, 
  onBack, 
  userRole, 
  isRegularEmployee = false, 
  currentEmployee 
}) => {
  // Sistema de solicitud de vacaciones implementado
  console.log('🚨 HRDashboard CARGADO - userRole:', userRole);
  console.log('🚨 HRDashboard CARGADO - isRegularEmployee:', isRegularEmployee);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    activeShifts: 0,
    pendingDocuments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Cargar estadísticas reales (migrated to userService)
      const result = await loadUsers();
      const employees = result.success ? result.users : [];

      const totalEmployees = employees?.length || 24;
      const presentToday = Math.floor(totalEmployees * 0.75); // 75% presente (simulado)

      setStats({
        totalEmployees,
        presentToday,
        activeShifts: 12, // Simulado por ahora
        pendingDocuments: 3 // Simulado por ahora
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Usar datos por defecto en caso de error
      setStats({
        totalEmployees: 24,
        presentToday: 18,
        activeShifts: 12,
        pendingDocuments: 3
      });
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

  // Tarjetas para CEO/Director de RRHH - Orden específico
  const adminCards: DashboardCard[] = [
    // 1. Gestión de Empleados (COMPLETO)
    {
      id: 'employees',
      title: '1. Gestión de Empleados',
      icon: <Users size={32} />,
      description: 'Administrar empleados, contratos y datos personales',
      color: '#059669',
      count: stats.totalEmployees,
      status: 'active'
    },
    // 2. Gestión de Turnos (COMPLETO)
    {
      id: 'shifts',
      title: '2. Gestión de Turnos',
      icon: <Clock size={32} />,
      description: 'Crear y asignar turnos de trabajo',
      color: '#0ea5e9',
      count: stats.activeShifts,
      status: 'active'
    },
    // 3. Sistema de Fichajes (COMPLETO)
    {
      id: 'timeclock',
      title: '3. Sistema de Fichajes',
      icon: <UserCheck size={32} />,
      description: 'Fichajes con QR dinámico y control horario',
      color: '#8b5cf6',
      count: stats.presentToday,
      status: 'active'
    },
    // 4. Asistencia (COMPLETO)
    {
      id: 'attendance',
      title: '4. Asistencia',
      icon: <Calendar size={32} />,
      description: 'Registro de retrasos, ausencias y bajas médicas',
      color: '#f59e0b',
      count: 'Gestionar',
      status: 'active'
    },
    // 5. Gestión de Vacaciones (COMPLETO)
    {
      id: 'admin-vacations',
      title: '5. Gestión de Vacaciones',
      icon: <Palmtree size={32} />,
      description: 'Gestión de vacaciones y permisos',
      color: '#10b981',
      count: '12 pendientes',
      status: 'active'
    },
    // 6. Documentos (COMPLETO)
    {
      id: 'documents',
      title: '6. Documentos',
      icon: <FileText size={32} />,
      description: 'Contratos, nóminas, certificados y bajas médicas',
      color: '#84cc16',
      count: 'Gestionar',
      status: 'active'
    },
    // 7. Reportes y Analíticas (COMPLETO)
    {
      id: 'hr-reports',
      title: '7. Reportes y Analíticas',
      icon: <BarChart size={32} />,
      description: 'Ausencias, incidencias, peticiones y costes por centro',
      color: '#8b5cf6',
      count: 'Ver Dashboard',
      status: 'active'
    },
    // 8. Formación (MÁS ADELANTE)
    {
      id: 'training',
      title: '8. Formación',
      icon: <BookOpen size={32} />,
      description: 'Cursos y formación del personal',
      color: '#6366f1',
      count: 'Próximamente',
      status: 'coming-soon'
    },
    // 9. Evaluaciones (MÁS ADELANTE)
    {
      id: 'evaluations',
      title: '9. Evaluaciones',
      icon: <Award size={32} />,
      description: 'Evaluaciones de desempeño',
      color: '#ef4444',
      count: 'Próximamente',
      status: 'coming-soon'
    }
  ];

  // Combinar tarjetas para encargados (empleado + admin)
  const managerCards = [
    ...dailyOperationsCards,
    ...hrCards,
    {
      id: 'separator',
      title: '--- FUNCIONES DE GESTIÓN ---',
      icon: <div style={{ fontSize: '16px' }}>⚙️</div>,
      description: 'Funciones administrativas',
      color: '#6b7280',
      count: '',
      status: 'separator' as const
    },
    ...adminCards
  ];

  // Seleccionar tarjetas según el rol
  const isManager = userRole?.includes('manager') || userRole?.includes('encargado') || userRole === 'center_manager';
  const isCEO = userRole === 'superadmin' || userRole === 'ceo';
  const isAdmin = userRole === 'admin' || userRole === 'hr_admin';
  
  // Seleccionar tarjetas según el rol del usuario
  const dashboardCards = isCEO || isAdmin
    ? adminCards // CEO/Admin solo ven tarjetas de gestión
    : isManager 
      ? managerCards 
      : isRegularEmployee 
        ? [...dailyOperationsCards, ...hrCards]
        : adminCards;
      
  console.log('🚨 isManager:', isManager);
  console.log('🚨 dashboardCards:', dashboardCards.map(c => ({ id: c.id, title: c.title, status: c.status })));
  console.log('🚨 Tarjeta vacation-request:', dashboardCards.find(c => c.id === 'vacation-request'));
      

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
      default:
        return null;
    }
  };

  const handleCardClick = (cardId: string, status: string) => {
    console.log('🚨 CLICK EN TARJETA HRDashboard:', { cardId, status });
    
    if (status === 'coming-soon' || status === 'development' || status === 'separator') {
      if (status === 'coming-soon') {
        ui.info('⏳ Próximamente\n\nEste módulo será implementado en futuras versiones del sistema.');
      } else if (status === 'development') {
        ui.info('🚧 Módulo en desarrollo\n\nEste módulo está siendo implementado y estará disponible próximamente.');
      }
      return;
    }
    
    console.log('🚨 NAVEGANDO A:', cardId);
    onNavigate(cardId);
  };

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
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando dashboard...</p>
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
      {/* Breadcrumbs y Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <div>
          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <Home style={{ height: '16px', width: '16px' }} />
            <span>RRHH</span>
            <span>›</span>
            <span style={{ color: '#059669', fontWeight: '500' }}>Dashboard</span>
          </div>

          {/* Título */}
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: 0,
            marginBottom: '8px'
          }}>
            {userRole?.includes('manager') || userRole?.includes('encargado') || userRole === 'center_manager'
              ? '👨‍💼 Portal de Encargado' 
              : isRegularEmployee 
                ? '👤 Mi Portal de Empleado' 
                : '👥 Portal de Recursos Humanos'
            }
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            margin: 0
          }}>
            {userRole?.includes('manager') || userRole?.includes('encargado') || userRole === 'center_manager'
              ? `Bienvenido ${currentEmployee?.nombre || 'Encargado'} - Gestiona tu información personal y tu equipo`
              : isRegularEmployee 
                ? `Bienvenido ${currentEmployee?.nombre || 'Empleado'} - Gestiona tu información personal y laboral`
                : 'Sistema integral de gestión de personal - La Jungla Ibérica'
            }
          </p>
        </div>

        {/* Botón volver (si se proporciona) */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.backgroundColor = '#05966905';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <ArrowLeft style={{ height: '16px', width: '16px' }} />
            Volver
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #05966920'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserCheck style={{ height: '24px', width: '24px', color: '#059669' }} />
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                {stats.presentToday}/{stats.totalEmployees}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Presentes hoy
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #dc262620'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp style={{ height: '24px', width: '24px', color: '#dc2626' }} />
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                {Math.round((stats.presentToday / stats.totalEmployees) * 100)}%
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Asistencia
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #2563eb20'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin style={{ height: '24px', width: '24px', color: '#2563eb' }} />
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                3
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Centros activos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {dashboardCards.map((card: DashboardCard) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id, card.status)}
            style={{
              backgroundColor: card.status === 'separator' ? '#f8fafc' : 'white',
              borderRadius: card.status === 'separator' ? '10px' : '20px',
              padding: card.status === 'separator' ? '16px' : '32px',
              cursor: card.status === 'separator' ? 'default' : 'pointer',
              boxShadow: card.status === 'separator' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: card.status === 'separator' ? '2px dashed #cbd5e1' : `3px solid ${card.color}20`,
              transition: 'all 0.3s ease',
              position: 'relative',
              minHeight: card.status === 'separator' ? '60px' : '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: card.status === 'separator' ? 'center' : 'space-between',
              gridColumn: card.status === 'separator' ? '1 / -1' : 'auto'
            }}
            onMouseEnter={(e) => {
              if (card.status !== 'separator') {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = `${card.color}60`;
              }
            }}
            onMouseLeave={(e) => {
              if (card.status !== 'separator') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = `${card.color}20`;
              }
            }}
          >
            {/* Status badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px'
            }}>
              {getStatusBadge(card.status)}
            </div>

            {/* Icon */}
            <div style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: `${card.color}15`,
              color: card.color,
              alignSelf: 'flex-start',
              marginBottom: '20px'
            }}>
              {card.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 12px 0'
              }}>
                {card.title}
              </h3>
              
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 20px 0',
                lineHeight: '1.5'
              }}>
                {card.description}
              </p>

              {/* Count */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: `${card.color}10`,
                color: card.color,
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                border: `2px solid ${card.color}30`
              }}>
                {card.count}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div style={{
        marginTop: '48px',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0,
          lineHeight: '1.6'
        }}>
          💡 <strong style={{ color: '#111827' }}>Tip:</strong> Los módulos marcados como 
          <span style={{ color: '#10b981', fontWeight: '500' }}> "Funcional" </span>
          están completamente operativos. Los marcados como 
          <span style={{ color: '#f59e0b', fontWeight: '500' }}> "En desarrollo" </span>
          están siendo implementados.
        </p>
      </div>
    </div>
  );
};

export default HRDashboard;
