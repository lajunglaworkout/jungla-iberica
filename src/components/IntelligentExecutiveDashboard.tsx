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
import { supabase } from '../lib/supabase'; // TODO: Extract to executiveDashboardService.ts - queries alertas_automaticas, objetivos, reuniones, inbox_messages, metricas_departamento (no existing service covers these)
import { useSession } from '../contexts/SessionContext';
import { AIAnalysisService, DailyBriefing } from '../services/aiAnalysisService';

import { ObjectiveModal } from './dashboard/ObjectiveModal';
import { MeetingModal } from './dashboard/MeetingModal';
import { SystemAuditView } from './admin/SystemAuditView';
import WodbusterMetricsPanel from './dashboard/WodbusterMetricsPanel';
import { CXInboxView } from './dashboard/CXInboxView';
import { MultiCenterAnalysis } from './dashboard/MultiCenterAnalysis';
import { CXAnalyticsModal } from './dashboard/CXAnalyticsModal';

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
  metrica_objetivo?: number | string | null;
  metrica_actual?: number | string | null;
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
  const [activeView, setActiveView] = useState<'dashboard' | 'objectives' | 'alerts' | 'meetings' | 'system' | 'cx_inbox' | 'analytics'>('dashboard');

  // Estados para datos
  const [objectives, setObjectives] = useState<SmartObjective[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [meetings, setMeetings] = useState<SmartMeeting[]>([]);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics[]>([]);

  // Estados para modales
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showCXAnalyticsModal, setShowCXAnalyticsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // CX Stats State
  const [cxStats, setCxStats] = useState<{
    total: number;
    pending: number;
    responded: number;
    avgResponseHours: number | null;
  }>({ total: 0, pending: 0, responded: 0, avgResponseHours: null });

  // AI Briefing State
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);

  // Cargar todos los datos
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Run AI Analysis first (creates alerts if needed)
      await AIAnalysisService.runFullAnalysis();

      await Promise.all([
        loadObjectives(),
        loadAlerts(),
        loadMeetings(),
        loadDepartmentMetrics(),
        loadCXStats()
      ]);

      // Generate Briefing
      if (employee?.first_name) {
        const b = await AIAnalysisService.generateBriefing(employee.first_name);
        setBriefing(b);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alertas_automaticas')
        .update({ estado: 'resuelta' })
        .eq('id', id);

      if (error) throw error;

      // Update local state smoothly
      setAlerts(prev => prev.filter(a => a.id !== id));
      loadDashboardData(); // Refresh counts
    } catch (err) {
      console.error('Error dismissing alert:', err);
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
    try {
      const { data, error } = await supabase
        .from('alertas_automaticas')
        .select('*')
        .eq('estado', 'activa')
        .order('creado_en', { ascending: false });

      if (!error && data) {
        setAlerts(data);
      }
    } catch {
      // Tabla alertas_automaticas no existe, ignorar
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

  const loadCXStats = async () => {
    try {
      const { data: messages } = await supabase
        .from('inbox_messages')
        .select('status, created_at, reply_sent_at');

      if (messages) {
        const total = messages.length;
        const pending = messages.filter(m => m.status === 'new').length;
        const responded = messages.filter(m => m.status === 'responded').length;

        // Calcular tiempo promedio de respuesta
        const responseTimes = messages
          .filter(m => m.reply_sent_at && m.created_at)
          .map(m => {
            const created = new Date(m.created_at).getTime();
            const replied = new Date(m.reply_sent_at).getTime();
            return (replied - created) / (1000 * 60 * 60); // horas
          });

        const avgResponseHours = responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : null;

        setCxStats({ total, pending, responded, avgResponseHours });
      }
    } catch {
      // Error loading CX stats, ignorar
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
                  onClick={() => dismissAlert(alert.id!)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                  title="Marcar como resuelta"
                >
                  <X size={16} />
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
          {briefing ? briefing.greeting : 'Sistema Ejecutivo Inteligente'} 🧠
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0, maxWidth: '80%' }}>
          {briefing ? briefing.summary : 'Analizando datos en tiempo real...'}
        </p>

        {briefing && briefing.highlights.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {briefing.highlights.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  if (h.toLowerCase().includes('objetivos')) setActiveView('objectives');
                  else if (h.toLowerCase().includes('alerta') || h.toLowerCase().includes('riesgo')) setActiveView('alerts');
                }}
                className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 hover:bg-white/30 transition-colors text-left cursor-pointer"
              >
                {h}
              </button>
            ))}
          </div>
        )}
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

      {/* KPIs Wodbuster - Multi-Centro */}
      <div style={{ marginBottom: '32px' }}>
        <WodbusterMetricsPanel />
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

        {/* CX Analytics Card - Atención al Cliente */}
        <div
          onClick={() => setShowCXAnalyticsModal(true)}
          style={{
            padding: '20px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '32px' }}>💬</span>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                  Atención al Cliente (CX)
                </h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>
                  Inbox, analytics y agente IA
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '10px 16px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500
            }}>
              <BarChart3 size={18} />
              Ver Analytics
            </div>
          </div>

          {/* Inline KPIs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: cxStats.pending > 0 ? '#fcd34d' : 'white'
              }}>
                {cxStats.pending}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>⏳ Pendientes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                {cxStats.avgResponseHours ? `${cxStats.avgResponseHours.toFixed(1)}h` : '--'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>⚡ Tiempo Resp.</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#86efac' }}>
                {cxStats.responded}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>✅ Respondidos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                {cxStats.total}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>📬 Total</div>
            </div>
          </div>
        </div>

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
          { id: 'analytics', label: 'Análisis Métricas', icon: BarChart3 },
          { id: 'objectives', label: 'Objetivos', icon: Target },
          { id: 'cx_inbox', label: 'Inbox CX', icon: MessageSquare },
          { id: 'alerts', label: `Alertas (${alerts.length})`, icon: Bell },
          { id: 'meetings', label: 'Reuniones', icon: Calendar },
          { id: 'system', label: 'Salud Sistema', icon: Shield }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as 'dashboard' | 'objectives' | 'alerts' | 'meetings' | 'system' | 'cx_inbox' | 'analytics')}
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

      {activeView === 'objectives' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Objetivos Estratégicos</h2>
            <button
              onClick={() => setShowObjectiveModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700"
            >
              <Plus size={18} />
              Nuevo Objetivo
            </button>
          </div>

          <div className="grid gap-4">
            {objectives.map(obj => (
              <div key={obj.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${obj.estado === 'completado' ? 'bg-emerald-100 text-emerald-600' :
                    obj.riesgo_calculado === 'alto' ? 'bg-red-100 text-red-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{obj.titulo}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{obj.departamento}</span>
                      <span>•</span>
                      <span>Vence: {new Date(obj.fecha_limite).toLocaleDateString()}</span>
                      {obj.probabilidad_cumplimiento && (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          <Brain size={12} />
                          {obj.probabilidad_cumplimiento}% prob.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${obj.estado === 'pendiente' ? 'bg-gray-100 text-gray-600' :
                    obj.estado === 'en_progreso' ? 'bg-blue-100 text-blue-600' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                    {obj.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}

            {objectives.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No hay objetivos definidos aún.</p>
                <button
                  onClick={() => setShowObjectiveModal(true)}
                  className="mt-4 text-emerald-600 font-medium hover:underline"
                >
                  Crear el primer objetivo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'cx_inbox' && (
        <div>
          {/* Analytics Button Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '12px 16px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            borderRadius: '12px 12px 0 0'
          }}>
            <button
              onClick={() => setShowCXAnalyticsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              <BarChart3 size={18} />
              Analytics CX
            </button>
          </div>
          <CXInboxView />
        </div>
      )}
      {activeView === 'analytics' && <MultiCenterAnalysis />}
      {activeView === 'alerts' && <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Vista de Alertas (en desarrollo)</div>}
      {activeView === 'meetings' && <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Vista de Reuniones (en desarrollo)</div>}
      {activeView === 'system' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SystemAuditView />
        </div>
      )}

      {/* Modals */}
      {showObjectiveModal && (
        <ObjectiveModal
          onClose={() => setShowObjectiveModal(false)}
          onSave={() => {
            loadDashboardData();
            setActiveView('objectives'); // Switch to view upon create
          }}
        />
      )}

      {showMeetingModal && (
        <MeetingModal onClose={() => setShowMeetingModal(false)} />
      )}

      {/* CX Analytics Modal */}
      <CXAnalyticsModal
        isOpen={showCXAnalyticsModal}
        onClose={() => setShowCXAnalyticsModal(false)}
      />
    </div>
  );
};

export default IntelligentExecutiveDashboard;