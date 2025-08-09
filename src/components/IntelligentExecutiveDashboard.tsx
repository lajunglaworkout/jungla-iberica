// src/components/IntelligentExecutiveDashboard.tsx - Sistema Ejecutivo Inteligente
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Target, Flag, MessageSquare, FileText, Send,
  AlertCircle, CheckCircle, TrendingUp, TrendingDown, Zap,
  Brain, BarChart3, Users, Bell, X, Plus, Eye, Edit, Trash2,
  ArrowUp, ArrowDown, Minus, Activity, Lightbulb, Shield,
  Timer, Award, AlertTriangle, CheckCircle2, XCircle,
  Search, Filter, RefreshCw, Download, Settings, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexts/SessionContext';

// Interfaces para el sistema inteligente
interface SmartObjective {
  id?: string;
  titulo: string;
  descripcion?: string;
  departamento: string;
  asignado_a: string;
  tipo_asignacion: 'persona' | 'departamento';
  mes_objetivo: string;
  fecha_limite: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'no_completado' | 'en_riesgo';
  porcentaje_completitud: number;
  motivo_no_cumplimiento?: string;
  acciones_correctivas?: string;
  metrica_objetivo?: any;
  metrica_actual?: any;
  impacto_negocio: number;
  dificultad: number;
  probabilidad_cumplimiento?: number;
  riesgo_calculado?: 'bajo' | 'medio' | 'alto' | 'critico';
  reunion_origen?: string;
  objetivo_padre?: string;
  etiquetas?: string[];
  creado_por: string;
  creado_en?: string;
  actualizado_en?: string;
}

interface SmartAlert {
  id?: string;
  tipo_alerta: 'objetivo_en_riesgo' | 'reunion_necesaria' | 'tendencia_negativa' | 'objetivo_vencido' | 'departamento_bajo_rendimiento';
  titulo: string;
  descripcion: string;
  nivel_urgencia: 'info' | 'warning' | 'urgent' | 'critical';
  destinatarios: string[];
  departamento_afectado?: string;
  objetivo_relacionado?: string;
  reunion_relacionada?: string;
  estado: 'activa' | 'vista' | 'resuelta' | 'ignorada';
  accion_recomendada?: string;
  es_automatica: boolean;
  creado_en?: string;
  vista_en?: string;
  resuelta_en?: string;
}

interface DepartmentMetrics {
  departamento: string;
  mes: string;
  objetivos_totales: number;
  objetivos_completados: number;
  objetivos_en_riesgo: number;
  tasa_cumplimiento: number;
  tiempo_promedio_resolucion: number;
  efectividad_reuniones: number;
  numero_reuniones: number;
  tendencia: 'mejorando' | 'estable' | 'empeorando';
  prediccion_siguiente_mes: number;
  score_rendimiento: number;
  calculado_en?: string;
}

interface SmartMeeting {
  id?: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  participantes: string[];
  tipo: 'estrategica' | 'operativa' | 'seguimiento' | 'urgente';
  tipo_reunion?: 'estrategica' | 'operativa' | 'seguimiento' | 'urgente' | 'revision_mensual' | 'briefing_semanal';
  departamento_objetivo?: string;
  objetivos_revisados?: string[];
  objetivos_creados?: string[];
  plantilla_utilizada?: string;
  efectividad_reunion?: number;
  tiempo_real_duracion?: number;
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
  acta_reunion?: string;
  tareas_generadas?: string[];
  creado_por: string;
  creado_en?: string;
  actualizado_en?: string;
}

const DEPARTMENTS = [
  { id: 'Marketing', name: 'Marketing', icon: '📈', color: '#3b82f6' },
  { id: 'RRHH', name: 'Recursos Humanos', icon: '👥', color: '#10b981' },
  { id: 'Operaciones', name: 'Operaciones', icon: '⚙️', color: '#f59e0b' },
  { id: 'Finanzas', name: 'Finanzas', icon: '💰', color: '#8b5cf6' },
  { id: 'Direccion', name: 'Dirección', icon: '👑', color: '#ef4444' }
];

const LEADERSHIP_TEAM = [
  { id: 'carlossuarezparra@gmail.com', name: 'Carlos Suárez Parra', role: 'CEO' },
  { id: 'beni.jungla@gmail.com', name: 'Benito Morales', role: 'Director' },
  { id: 'lajunglacentral@gmail.com', name: 'Vicente Benítez', role: 'Director' }
];

// Componente principal del Dashboard Inteligente
const IntelligentExecutiveDashboard: React.FC = () => {
  const { employee } = useSession();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'objectives' | 'alerts' | 'meetings'>('dashboard');
  
  // Estados para datos
  const [objectives, setObjectives] = useState<SmartObjective[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [meetings, setMeetings] = useState<SmartMeeting[]>([]);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics[]>([]);
  
  // Estados para modales
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // Cargar todos los datos
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadObjectives(),
        loadAlerts(),
        loadMeetings(),
        loadDepartmentMetrics()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadObjectives = async () => {
    const { data, error } = await supabase
      .from('objetivos')
      .select('*')
      .order('creado_en', { ascending: false });
    
    if (!error && data) {
      setObjectives(data);
    }
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('alertas_automaticas')
      .select('*')
      .eq('estado', 'activa')
      .order('creado_en', { ascending: false });
    
    if (!error && data) {
      setAlerts(data);
    }
  };

  const loadMeetings = async () => {
    const { data, error } = await supabase
      .from('reuniones')
      .select('*')
      .order('fecha', { ascending: false });
    
    if (!error && data) {
      setMeetings(data);
    }
  };

  const loadDepartmentMetrics = async () => {
    const { data, error } = await supabase
      .from('metricas_departamento')
      .select('*')
      .order('calculado_en', { ascending: false });
    
    if (!error && data) {
      setDepartmentMetrics(data);
    }
  };

  // Calcular métricas inteligentes
  const calculateIntelligentKPIs = () => {
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(obj => obj.estado === 'completado').length;
    const riskyObjectives = objectives.filter(obj => obj.riesgo_calculado === 'alto' || obj.riesgo_calculado === 'critico').length;
    const overdueObjectives = objectives.filter(obj => {
      const deadline = new Date(obj.fecha_limite);
      return deadline < new Date() && obj.estado !== 'completado';
    }).length;
    
    const avgProbability = objectives.length > 0 
      ? Math.round(objectives.reduce((sum, obj) => sum + (obj.probabilidad_cumplimiento || 0), 0) / objectives.length)
      : 0;

    const criticalAlerts = alerts.filter(alert => alert.nivel_urgencia === 'critical').length;
    const urgentAlerts = alerts.filter(alert => alert.nivel_urgencia === 'urgent').length;

    return {
      totalObjectives,
      completedObjectives,
      riskyObjectives,
      overdueObjectives,
      avgProbability,
      criticalAlerts,
      urgentAlerts,
      completionRate: totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0
    };
  };

  const kpis = calculateIntelligentKPIs();

  // Componente para KPI inteligente
  const SmartKPICard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    prediction?: string;
    alert?: boolean;
  }> = ({ title, value, subtitle, icon, color, trend, prediction, alert }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: alert ? '2px solid #ef4444' : '1px solid #e5e7eb',
      position: 'relative'
    }}>
      {alert && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px'
        }}>
          <AlertTriangle style={{ height: '20px', width: '20px', color: '#ef4444' }} />
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: color + '20'
        }}>
          {icon}
        </div>
        
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {trend === 'up' && <TrendingUp style={{ height: '16px', width: '16px', color: '#10b981' }} />}
            {trend === 'down' && <TrendingDown style={{ height: '16px', width: '16px', color: '#ef4444' }} />}
            {trend === 'stable' && <Minus style={{ height: '16px', width: '16px', color: '#6b7280' }} />}
          </div>
        )}
      </div>
      
      <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
        {title}
      </h3>
      
      <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
        {value}
      </p>
      
      <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: prediction ? '8px' : '0' }}>
        {subtitle}
      </p>
      
      {prediction && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Brain style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
            <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
              {prediction}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Componente para alertas inteligentes
  const SmartAlertsPanel: React.FC = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Zap style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Alertas Inteligentes
          </h3>
        </div>
        <span style={{
          backgroundColor: alerts.length > 0 ? '#fef3c7' : '#f0fdf4',
          color: alerts.length > 0 ? '#92400e' : '#166534',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {alerts.length} activas
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <CheckCircle2 style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5, color: '#10b981' }} />
            <p style={{ margin: 0 }}>¡Todo bajo control!</p>
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.7 }}>No hay alertas activas</p>
          </div>
        ) : (
          alerts.slice(0, 5).map(alert => (
            <div key={alert.id} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: alert.nivel_urgencia === 'critical' ? '#fef2f2' : 
                               alert.nivel_urgencia === 'urgent' ? '#fff7ed' : '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>
                  {alert.nivel_urgencia === 'critical' && <AlertTriangle style={{ height: '20px', width: '20px', color: '#dc2626' }} />}
                  {alert.nivel_urgencia === 'urgent' && <AlertCircle style={{ height: '20px', width: '20px', color: '#ea580c' }} />}
                  {alert.nivel_urgencia === 'warning' && <AlertCircle style={{ height: '20px', width: '20px', color: '#d97706' }} />}
                  {alert.nivel_urgencia === 'info' && <Bell style={{ height: '20px', width: '20px', color: '#2563eb' }} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '4px' }}>
                    {alert.titulo}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>
                    {alert.descripcion}
                  </p>
                  
                  {alert.accion_recomendada && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lightbulb style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                          {alert.accion_recomendada}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#9ca3af' }}>
                    <span>{alert.departamento_afectado}</span>
                    <span>•</span>
                    <span>{new Date(alert.creado_en!).toLocaleString('es-ES')}</span>
                    {alert.es_automatica && (
                      <>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Brain style={{ height: '12px', width: '12px' }} />
                          <span>Auto-generada</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => {/* Marcar como vista */}}
                  style={{
                    padding: '4px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{ height: '16px', width: '16px', color: '#9ca3af' }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {alerts.length > 5 && (
        <button
          onClick={() => setActiveView('alerts')}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Ver todas las alertas ({alerts.length})
        </button>
      )}
    </div>
  );

  // Vista principal del dashboard
  const DashboardView: React.FC = () => (
    <div>
      {/* Header inteligente */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '8px 12px',
          borderRadius: '20px'
        }}>
          <Brain style={{ height: '16px', width: '16px' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>IA Activa</span>
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Sistema Ejecutivo Inteligente 🧠
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Dashboard predictivo con IA - Carlos, Benito y Vicente
        </p>
      </div>

      {/* KPIs inteligentes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <SmartKPICard
          title="Objetivos Activos"
          value={kpis.totalObjectives}
          subtitle="objetivos en seguimiento"
          icon={<Target style={{ height: '24px', width: '24px', color: '#3b82f6' }} />}
          color="#3b82f6"
          trend="up"
        />
        
        <SmartKPICard
          title="Probabilidad Promedio"
          value={`${kpis.avgProbability}%`}
          subtitle="de cumplimiento predicha"
          icon={<Brain style={{ height: '24px', width: '24px', color: '#10b981' }} />}
          color="#10b981"
          trend={kpis.avgProbability >= 70 ? 'up' : kpis.avgProbability >= 50 ? 'stable' : 'down'}
          prediction={`Tendencia ${kpis.avgProbability >= 70 ? 'positiva' : 'a mejorar'}`}
        />
        
        <SmartKPICard
          title="Objetivos en Riesgo"
          value={kpis.riskyObjectives}
          subtitle="requieren atención"
          icon={<AlertTriangle style={{ height: '24px', width: '24px', color: '#f59e0b' }} />}
          color="#f59e0b"
          alert={kpis.riskyObjectives > 0}
          trend={kpis.riskyObjectives > 0 ? 'down' : 'stable'}
        />
        
        <SmartKPICard
          title="Tasa de Completitud"
          value={`${kpis.completionRate}%`}
          subtitle="objetivos completados"
          icon={<Award style={{ height: '24px', width: '24px', color: '#8b5cf6' }} />}
          color="#8b5cf6"
          trend={kpis.completionRate >= 80 ? 'up' : kpis.completionRate >= 60 ? 'stable' : 'down'}
          prediction={`Meta: 85% mensual`}
        />
      </div>

      {/* Alertas inteligentes */}
      <div style={{ marginBottom: '32px' }}>
        <SmartAlertsPanel />
      </div>

      {/* Análisis por departamentos */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '20px' }}>
          Análisis Predictivo por Departamento
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {DEPARTMENTS.map(dept => {
            const deptObjectives = objectives.filter(obj => obj.departamento === dept.id);
            const completedCount = deptObjectives.filter(obj => obj.estado === 'completado').length;
            const riskyCount = deptObjectives.filter(obj => obj.riesgo_calculado === 'alto' || obj.riesgo_calculado === 'critico').length;
            const completionRate = deptObjectives.length > 0 ? Math.round((completedCount / deptObjectives.length) * 100) : 0;
            
            return (
              <div key={dept.id} style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px' }}>{dept.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {dept.name}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {deptObjectives.length} objetivos activos
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Completitud</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {completionRate}%
                  </span>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: `${completionRate}%`,
                    height: '100%',
                    backgroundColor: completionRate >= 80 ? '#10b981' : completionRate >= 60 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                {riskyCount > 0 && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertTriangle style={{ height: '16px', width: '16px', color: '#dc2626' }} />
                    <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                      {riskyCount} objetivo{riskyCount > 1 ? 's' : ''} en riesgo
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{
        marginTop: '32px',
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShowObjectiveModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Target style={{ height: '20px', width: '20px' }} />
          Nuevo Objetivo
        </button>
        
        <button
          onClick={() => setShowMeetingModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar style={{ height: '20px', width: '20px' }} />
          Nueva Reunión
        </button>
        
        <button
          onClick={() => setActiveView('alerts')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Zap style={{ height: '20px', width: '20px' }} />
          Ver Alertas ({alerts.length})
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ height: '48px', width: '48px', animation: 'spin 1s linear infinite', color: '#3b82f6', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando sistema inteligente...</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Analizando datos y predicciones</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        padding: '4px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard IA', icon: Brain },
          { id: 'objectives', label: 'Objetivos', icon: Target },
          { id: 'alerts', label: `Alertas (${alerts.length})`, icon: Bell },
          { id: 'meetings', label: 'Reuniones', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeView === tab.id ? '#3b82f6' : 'transparent',
              color: activeView === tab.id ? 'white' : '#6b7280',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <tab.icon style={{ height: '16px', width: '16px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'objectives' && <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Vista de Objetivos (en desarrollo)</div>}
      {activeView === 'alerts' && <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Vista de Alertas (en desarrollo)</div>}
      {activeView === 'meetings' && <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Vista de Reuniones (en desarrollo)</div>}
    </div>
  );
};

export default IntelligentExecutiveDashboard;