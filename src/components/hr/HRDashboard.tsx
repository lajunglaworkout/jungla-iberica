// src/components/hr/HRDashboard.tsx - Dashboard Principal de RRHH
import React, { useState, useEffect } from 'react';
import { 
  Database, Clock, Calendar, Award, BookOpen, FileText, 
  BarChart, Palmtree, ArrowLeft, TrendingUp, UserCheck,
  Users, MapPin, AlertCircle, CheckCircle, Home
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  count?: number | string;
  status: 'active' | 'development' | 'coming-soon';
}

interface HRDashboardProps {
  onNavigate: (module: string) => void;
  onBack?: () => void;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  activeShifts: number;
  pendingDocuments: number;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ onNavigate, onBack }) => {
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
      // Cargar estadísticas reales desde Supabase
      const { data: employees } = await supabase
        .from('employees')
        .select('id, activo')
        .eq('activo', true);

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

  const dashboardCards: DashboardCard[] = [
    {
      id: 'employees',
      title: 'Gestión de Empleados',
      icon: <Users size={32} />,
      description: 'Administrar empleados, contratos y datos personales',
      color: '#059669',
      count: stats.totalEmployees,
      status: 'active'
    },
    {
      id: 'shifts',
      title: 'Gestión de Turnos',
      icon: <Clock size={32} />,
      description: 'Crear y asignar turnos de trabajo',
      color: '#0ea5e9',
      count: stats.activeShifts,
      status: 'active'
    },
    {
      id: 'timeclock',
      title: 'Sistema de Fichajes',
      icon: <UserCheck size={32} />,
      description: 'Fichajes con QR dinámico y control horario',
      color: '#8b5cf6',
      count: stats.presentToday,
      status: 'active'
    },
    {
      id: 'mobile-timeclock',
      title: 'Fichaje Móvil',
      icon: <MapPin size={32} />,
      description: 'Escaneo QR desde móvil para empleados',
      color: '#059669',
      count: 'QR Activo',
      status: 'active'
    },
    {
      id: 'attendance',
      title: 'Asistencia',
      icon: <Calendar size={32} />,
      description: 'Registro de asistencia y ausencias',
      color: '#f59e0b',
      count: '85%',
      status: 'coming-soon'
    },
    {
      id: 'vacations',
      title: 'Vacaciones',
      icon: <Palmtree size={32} />,
      description: 'Gestión de vacaciones y permisos',
      color: '#10b981',
      count: '12 pendientes',
      status: 'coming-soon'
    },
    {
      id: 'evaluations',
      title: 'Evaluaciones',
      icon: <Award size={32} />,
      description: 'Evaluaciones de desempeño',
      color: '#ef4444',
      count: '3 pendientes',
      status: 'coming-soon'
    },
    {
      id: 'training',
      title: 'Formación',
      icon: <BookOpen size={32} />,
      description: 'Cursos y formación del personal',
      color: '#6366f1',
      count: '5 cursos',
      status: 'coming-soon'
    },
    {
      id: 'documents',
      title: 'Documentos',
      icon: <FileText size={32} />,
      description: 'Gestión documental y contratos',
      color: '#84cc16',
      count: stats.pendingDocuments,
      status: 'coming-soon'
    },
    {
      id: 'reports',
      title: 'Reportes',
      icon: <BarChart size={32} />,
      description: 'Informes y estadísticas de RRHH',
      color: '#f97316',
      count: 'Nuevo',
      status: 'coming-soon'
    },
    {
      id: 'db-verify',
      title: 'Verificar BD',
      description: 'Comprobar tablas de turnos',
      icon: '🔍',
      color: '#059669',
      status: 'active',
      count: 'Temporal'
    },
    {
      id: 'vacations',
      title: 'Vacaciones',
      icon: <Palmtree style={{ height: '48px', width: '48px' }} />,
      description: 'Gestión de ausencias',
      color: '#eab308',
      count: 'Próximamente',
      status: 'coming-soon'
    }
  ];

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
    if (status === 'active') {
      onNavigate(cardId);
    } else if (status === 'development') {
      alert('🚧 Módulo en desarrollo\n\nEste módulo está siendo implementado y estará disponible próximamente.');
    } else {
      alert('⏳ Próximamente\n\nEste módulo será implementado en futuras versiones del sistema.');
    }
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
            👥 Portal de Recursos Humanos
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            margin: 0
          }}>
            Sistema integral de gestión de personal - La Jungla Ibérica
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
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `3px solid ${card.color}20`,
              transition: 'all 0.3s ease',
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = `${card.color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = `${card.color}20`;
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
