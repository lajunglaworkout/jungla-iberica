// src/components/RoleDashboard.tsx - CORRECCIÓN DE INTEGRACIÓN
import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Settings, LogOut, TrendingUp, TrendingDown, 
  Crown, Shield, Users, UserCheck, Briefcase, Building2, 
  Dumbbell, Heart, Menu, Home, BarChart3, Globe, Plus, 
  ArrowRight, Eye, Edit, Filter, RefreshCw, X, User, Mail, 
  Phone, MapPin, Camera, Save, UserPlus, Edit2, Trash2, Loader2,
  Calendar, Clock, Target, Flag, MessageSquare, FileText, Send,
  AlertCircle, CheckCircle, PlayCircle, PauseCircle, ChevronDown,
  Brain, Zap
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';

// Importar el dashboard inteligente
// import IntelligentExecutiveDashboard from './IntelligentExecutiveDashboard';

// Por ahora, crearemos una versión inline del dashboard ejecutivo para evitar problemas de import
const ExecutiveDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadExecutiveData();
  }, []);

  const loadExecutiveData = async () => {
    setLoading(true);
    try {
      const [meetingsResult, tasksResult, objectivesResult, alertsResult] = await Promise.all([
        supabase.from('reuniones').select('*').order('fecha', { ascending: false }),
        supabase.from('tareas').select('*').order('fecha_limite', { ascending: true }),
        supabase.from('objetivos').select('*').order('creado_en', { ascending: false }),
        supabase.from('alertas_automaticas').select('*').eq('estado', 'activa').order('creado_en', { ascending: false })
      ]);

      if (meetingsResult.data) setMeetings(meetingsResult.data);
      if (tasksResult.data) setTasks(tasksResult.data);
      if (objectivesResult.data) setObjectives(objectivesResult.data);
      if (alertsResult.data) setAlerts(alertsResult.data);
    } catch (error) {
      console.error('Error loading executive data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular KPIs
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(obj => obj.estado === 'completado').length;
  const riskyObjectives = objectives.filter(obj => obj.riesgo_calculado === 'alto' || obj.riesgo_calculado === 'critico').length;
  const completionRate = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;
  const pendingTasks = tasks.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length;
  const avgProbability = objectives.length > 0 
    ? Math.round(objectives.reduce((sum, obj) => sum + (obj.probabilidad_cumplimiento || 0), 0) / objectives.length)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ height: '48px', width: '48px', animation: 'spin 1s linear infinite', color: '#3b82f6', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando sistema ejecutivo...</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Analizando datos en tiempo real</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header ejecutivo */}
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
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Sistema IA</span>
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Sistema Ejecutivo Inteligente 🧠
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Dashboard predictivo con IA - Carlos, Benito y Vicente - La Jungla Ibérica
        </p>
      </div>

      {/* KPIs Ejecutivos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Objetivos Activos */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#3b82f620'
            }}>
              <Target style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            </div>
            <TrendingUp style={{ height: '16px', width: '16px', color: '#10b981' }} />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Objetivos Activos
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {totalObjectives}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            objetivos en seguimiento
          </p>
        </div>

        {/* Probabilidad Promedio */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#10b98120'
            }}>
              <Brain style={{ height: '24px', width: '24px', color: '#10b981' }} />
            </div>
            {avgProbability >= 70 ? 
              <TrendingUp style={{ height: '16px', width: '16px', color: '#10b981' }} /> :
              <TrendingDown style={{ height: '16px', width: '16px', color: '#ef4444' }} />
            }
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Probabilidad Promedio
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {avgProbability}%
          </p>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Brain style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
              <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                Predicción IA: {avgProbability >= 70 ? 'Tendencia positiva' : 'Requiere atención'}
              </span>
            </div>
          </div>
        </div>

        {/* Objetivos en Riesgo */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: riskyObjectives > 0 ? '2px solid #ef4444' : '1px solid #e5e7eb',
          position: 'relative'
        }}>
          {riskyObjectives > 0 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px'
            }}>
              <AlertCircle style={{ height: '20px', width: '20px', color: '#ef4444' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#f59e0b20'
            }}>
              <Flag style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
            </div>
            <TrendingDown style={{ height: '16px', width: '16px', color: '#ef4444' }} />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Objetivos en Riesgo
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {riskyObjectives}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            requieren atención inmediata
          </p>
        </div>

        {/* Tasa de Completitud */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#8b5cf620'
            }}>
              <CheckCircle style={{ height: '24px', width: '24px', color: '#8b5cf6' }} />
            </div>
            {completionRate >= 80 ? 
              <TrendingUp style={{ height: '16px', width: '16px', color: '#10b981' }} /> :
              <TrendingDown style={{ height: '16px', width: '16px', color: '#ef4444' }} />
            }
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Tasa de Completitud
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {completionRate}%
          </p>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
              <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                Meta mensual: 85%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '32px'
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

        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <CheckCircle style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5, color: '#10b981' }} />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>¡Todo bajo control!</p>
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.7 }}>No hay alertas activas en el sistema</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle style={{ height: '20px', width: '20px', color: '#f59e0b' }} />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {alert.titulo || 'Alerta del Sistema'}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {alert.descripcion || 'Descripción de la alerta'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen de reuniones y tareas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Próximas reuniones */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Próximas Reuniones
          </h3>
          {meetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              <Calendar style={{ height: '32px', width: '32px', margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No hay reuniones programadas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {meetings.slice(0, 3).map((meeting, index) => (
                <div key={index} style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {meeting.titulo}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {new Date(meeting.fecha).toLocaleDateString('es-ES')} - {meeting.hora_inicio}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tareas pendientes */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Tareas Pendientes ({pendingTasks})
          </h3>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              <Target style={{ height: '32px', width: '32px', margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No hay tareas pendientes</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').slice(0, 3).map((task, index) => (
                <div key={index} style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {task.titulo}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    Límite: {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => alert('Funcionalidad de crear objetivo próximamente')}
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
          onClick={() => alert('Funcionalidad de crear reunión próximamente')}
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
          onClick={() => alert('Funcionalidad de análisis próximamente')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
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
          <BarChart3 style={{ height: '20px', width: '20px' }} />
          Análisis Avanzado
        </button>
      </div>
    </div>
  );
};

// Dashboard SuperAdmin
const SuperAdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('executive');

  const { employee } = useSession();

  const menuItems = [
    { id: 'executive', label: 'Dashboard Ejecutivo', icon: Crown },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'centers', label: 'Centros', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '256px' : '80px',
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        transition: 'width 0.3s ease',
        flexShrink: 0
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '8px',
              backgroundColor: '#d1fae5',
              borderRadius: '12px'
            }}>
              <Crown style={{ height: '32px', width: '32px', color: '#059669' }} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Jungla Ibérica</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Sistema Ejecutivo</p>
              </div>
            )}
          </div>
        </div>

        <nav style={{ padding: '0 16px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '8px',
                cursor: 'pointer',
                backgroundColor: activeTab === item.id ? '#d1fae5' : 'transparent',
                color: activeTab === item.id ? '#047857' : '#6b7280',
                transition: 'all 0.2s ease'
              }}
            >
              <item.icon style={{ height: '20px', width: '20px' }} />
              {sidebarOpen && <span style={{ fontWeight: '500' }}>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <Menu style={{ height: '20px', width: '20px', color: '#6b7280' }} />
              </button>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {activeTab === 'executive' && 'Dashboard Ejecutivo'}
                  {activeTab === 'employees' && 'Gestión de Empleados'}
                  {activeTab === 'centers' && 'Gestión de Centros'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'settings' && 'Configuración'}
                </h1>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Sistema integrado con Supabase - Datos en tiempo real
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{
                padding: '8px',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <Bell style={{ height: '20px', width: '20px', color: '#6b7280' }} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={employee?.imagen_de_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name || 'Usuario')}&background=059669&color=fff`}
                  alt={employee?.name || 'Usuario'} 
                  style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {employee?.name || 'SuperAdmin'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Sistema Ejecutivo</p>
                </div>
                <button style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}>
                  <LogOut style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeTab === 'executive' && <ExecutiveDashboard />}
          {activeTab === 'employees' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                Gestión de Empleados
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Funcionalidad de gestión de empleados disponible próximamente
              </p>
            </div>
          )}
          {(activeTab === 'centers' || activeTab === 'analytics' || activeTab === 'settings') && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                {activeTab === 'centers' && 'Gestión de Centros'}
                {activeTab === 'analytics' && 'Analytics Avanzados'}
                {activeTab === 'settings' && 'Configuración del Sistema'}
              </h2>
              <p style={{ color: '#6b7280' }}>
                Esta funcionalidad estará disponible próximamente.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Dashboard Principal
const RoleDashboard: React.FC = () => {
  const { employee, userRole, dashboardConfig, signOut, hasPermission } = useSession();

  if (!employee || !userRole || !dashboardConfig) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando sistema ejecutivo...</p>
        </div>
      </div>
    );
  }

  // Verificar si debe mostrar SuperAdmin (para Carlos y otros administradores)
  const isCarlos = employee.email === 'carlossuarezparra@gmail.com';
  const shouldShowSuperAdmin = userRole === 'superadmin' || userRole === 'admin' || isCarlos;

  if (shouldShowSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  // Fallback para otros roles
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
          Dashboard: {userRole}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          ¡Bienvenido, {employee.name}! ({employee.role})
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
            ✅ Sistema ejecutivo disponible para el equipo directivo
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;