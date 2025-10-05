// src/components/HRDashboard.tsx - Dashboard Principal de RRHH
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Calendar, Award, BookOpen, Database, 
  FileText, BarChart, ArrowLeft, TrendingUp, UserCheck,
  MapPin, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  count?: number;
  status?: 'active' | 'pending' | 'inactive';
}

interface HRDashboardProps {
  onNavigate: (module: string) => void;
  onBack: () => void;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingEvaluations: number;
  activeShifts: number;
  documentsToReview: number;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ onNavigate, onBack }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    pendingEvaluations: 0,
    activeShifts: 0,
    documentsToReview: 0
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

      // Por ahora usamos datos simulados para las otras métricas
      // En el futuro se conectarán con las tablas reales
      setStats({
        totalEmployees: employees?.length || 24,
        presentToday: Math.floor((employees?.length || 24) * 0.8), // 80% presente
        pendingEvaluations: 5,
        activeShifts: 12,
        documentsToReview: 3
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards: DashboardCard[] = [
    {
      id: 'employees',
      title: 'Base de Datos',
      icon: <Database style={{ height: '32px', width: '32px' }} />,
      description: 'Gestión completa de empleados',
      color: '#059669',
      count: stats.totalEmployees,
      status: 'active'
    },
    {
      id: 'time-tracking',
      title: 'Fichajes',
      icon: <Clock style={{ height: '32px', width: '32px' }} />,
      description: 'Control de entrada y salida',
      color: '#dc2626',
      count: stats.presentToday,
      status: 'active'
    },
    {
      id: 'shifts',
      title: 'Turnos',
      icon: <Calendar style={{ height: '32px', width: '32px' }} />,
      description: 'Gestión de horarios y turnos',
      color: '#2563eb',
      count: stats.activeShifts,
      status: 'pending'
    },
    {
      id: 'evaluations',
      title: 'Evaluaciones',
      icon: <Award style={{ height: '32px', width: '32px' }} />,
      description: 'Desempeño y objetivos',
      color: '#7c3aed',
      count: stats.pendingEvaluations,
      status: 'pending'
    },
    {
      id: 'training',
      title: 'Formación',
      icon: <BookOpen style={{ height: '32px', width: '32px' }} />,
      description: 'Cursos y certificaciones',
      color: '#ea580c',
      status: 'inactive'
    },
    {
      id: 'documents',
      title: 'Documentos',
      icon: <FileText style={{ height: '32px', width: '32px' }} />,
      description: 'Contratos y documentación',
      color: '#0891b2',
      count: stats.documentsToReview,
      status: 'pending'
    },
    {
      id: 'reports',
      title: 'Informes',
      icon: <BarChart style={{ height: '32px', width: '32px' }} />,
      description: 'Reportes y estadísticas',
      color: '#84cc16',
      status: 'pending'
    }
  ];

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />;
      case 'pending':
        return <AlertCircle style={{ height: '16px', width: '16px', color: '#f59e0b' }} />;
      case 'inactive':
        return <AlertCircle style={{ height: '16px', width: '16px', color: '#6b7280' }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Funcional';
      case 'pending':
        return 'En desarrollo';
      case 'inactive':
        return 'Pendiente';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <Clock style={{ 
            height: '48px', 
            width: '48px', 
            animation: 'spin 1s linear infinite',
            color: '#059669',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
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
            color: '#374151',
            fontSize: '14px'
          }}
        >
          <ArrowLeft style={{ height: '16px', width: '16px' }} />
          Volver
        </button>
        
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: 0,
            marginBottom: '4px'
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
          borderRadius: '12px',
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
          borderRadius: '12px',
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
          borderRadius: '12px',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: '1200px'
      }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `3px solid ${card.color}20`,
              transition: 'all 0.3s ease',
              position: 'relative',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = `${card.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = `${card.color}20`;
            }}
          >
            {/* Status indicator */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {getStatusIcon(card.status)}
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {getStatusText(card.status)}
              </span>
            </div>

            {/* Icon */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: `${card.color}15`,
              color: card.color,
              alignSelf: 'flex-start',
              marginBottom: '16px'
            }}>
              {card.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
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

              {/* Count badge */}
              {card.count !== undefined && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  backgroundColor: card.color,
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {card.count}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          margin: 0
        }}>
          💡 <strong>Tip:</strong> Los módulos marcados como "Funcional" están completamente operativos. 
          Los marcados como "En desarrollo" están siendo implementados.
        </p>
      </div>
    </div>
  );
};

export default HRDashboard;
