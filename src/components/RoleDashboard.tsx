// src/components/RoleDashboard.tsx - VERSIÓN CORREGIDA
import React, { useState } from 'react';
import {
  Crown, Users, Building2, BarChart3, Settings, Menu, Bell,
  Target, Flag, Brain, CheckCircle, Calendar, Video, Search,
  X, MapPin, AlertTriangle, DollarSign, Globe, 
  Loader2, RefreshCw, Clock, Heart, Briefcase, ClipboardList,
  TrendingUp, Activity, Shield, Package, ChevronRight, Star,
  Plus, Edit, Trash2, Eye, Filter, Download, Upload
} from 'lucide-react';
import ChecklistCompleteSystem from './ChecklistCompleteSystem';
import MarketingContentSystem from './MarketingContentSystem';
import HRManagementSystem from './HRManagementSystem';
import ExecutiveDashboard from './ExecutiveDashboard';
import { ui } from '../utils/ui';


// ============ INTERFACES ============
interface Task {
  id: string;
  title: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  department?: string;
  center?: string;
  description?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  location: string;
  type: 'presencial' | 'virtual' | 'hibrida';
  agenda?: string;
}

// ============ COMPONENTE PRINCIPAL ============
const RoleDashboard: React.FC = () => {
  console.log("✅ RoleDashboard ACTUALIZADO - Versión con RRHH");
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);

  // Menú actualizado con las nuevas opciones
  const menuItems = [
    { id: 'executive', label: 'Dashboard Ejecutivo', icon: Crown },
    { id: 'checklist', label: 'Checklist Diario', icon: ClipboardList },
    { id: 'marketing', label: 'Marketing Intelligence', icon: Globe },
    { id: 'hr', label: 'Gestión RRHH', icon: Users },
    { id: 'departments', label: 'Control Departamentos', icon: Users },
    { id: 'centers', label: 'Control Centros', icon: Building2 },
    { id: 'tasks', label: 'Gestión Tareas', icon: Target },
    { id: 'meetings', label: 'Reuniones', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const handleTaskCreated = (task: Record<string, unknown>) => {
    console.log('🎯 Nueva tarea creada:', task);
    ui.success(`¡Tarea creada exitosamente!`);
  };

  const handleMeetingCreated = (meeting: Record<string, unknown>) => {
    console.log('📅 Nueva reunión creada:', meeting);
    ui.success(`¡Reunión programada exitosamente!`);
  };

  const handleMarketingComplete = (data: Record<string, unknown>) => {
    console.log('📱 Marketing data:', data);
    setShowMarketingModal(false);
  };

  // ============ COMPONENTES INTERNOS ============
  
  // Dashboard Ejecutivo Local
  const LocalDashboard: React.FC<{
    onShowTaskModal: () => void;
    onShowMeetingModal: () => void;
  }> = ({ onShowTaskModal, onShowMeetingModal }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {/* KPIs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
            <Target style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Tareas Pendientes</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>12</p>
          </div>
        </div>
        <button
          onClick={onShowTaskModal}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Nueva Tarea
        </button>
      </div>

      {/* Reuniones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', backgroundColor: '#fce7f3', borderRadius: '8px' }}>
            <Calendar style={{ height: '24px', width: '24px', color: '#ec4899' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Reuniones Hoy</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>3</p>
          </div>
        </div>
        <button
          onClick={onShowMeetingModal}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Programar Reunión
        </button>
      </div>

      {/* Centros */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
            <Building2 style={{ height: '24px', width: '24px', color: '#10b981' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Centros Activos</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>5</p>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#10b981' }}>
          Todos operativos ✓
        </p>
      </div>
    </div>
  );

  // Vista de Departamentos
  const DepartmentsView: React.FC = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
        Control de Departamentos
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {['Marketing', 'Ventas', 'Operaciones', 'RRHH'].map(dept => (
          <div key={dept} style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{dept}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Estado: Operativo</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Vista de Centros
  const CentersView: React.FC = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
        Control de Centros
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {['Sevilla', 'Jerez', 'Puerto'].map(center => (
          <div key={center} style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              <MapPin style={{ display: 'inline', height: '16px', width: '16px', marginRight: '4px' }} />
              {center}
            </h3>
            <p style={{ fontSize: '14px', color: '#10b981' }}>✓ Operativo</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Vista de Tareas
  const TasksView: React.FC<{ onShowTaskModal: () => void }> = ({ onShowTaskModal }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
          Gestión de Tareas
        </h2>
        <button
          onClick={onShowTaskModal}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Plus style={{ display: 'inline', height: '16px', width: '16px', marginRight: '4px' }} />
          Nueva Tarea
        </button>
      </div>
      <p style={{ color: '#6b7280' }}>Sistema de gestión de tareas en desarrollo...</p>
    </div>
  );

  // Vista de Reuniones
  const MeetingsView: React.FC<{ onShowMeetingModal: () => void }> = ({ onShowMeetingModal }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
          Gestión de Reuniones
        </h2>
        <button
          onClick={onShowMeetingModal}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Calendar style={{ display: 'inline', height: '16px', width: '16px', marginRight: '4px' }} />
          Programar Reunión
        </button>
      </div>
      <p style={{ color: '#6b7280' }}>Calendario de reuniones en desarrollo...</p>
    </div>
  );

  // Modal de Tareas
  const CreateTaskModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Record<string, unknown>) => void;
  }> = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Nueva Tarea
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Formulario de creación de tareas
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onSave({ title: 'Nueva Tarea' });
                onClose();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Crear Tarea
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Reuniones
  const CreateMeetingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (meeting: Record<string, unknown>) => void;
  }> = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Programar Reunión
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Formulario de programación de reuniones
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onSave({ title: 'Nueva Reunión' });
                onClose();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Programar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER DE CONTENIDO ============
  const renderContent = () => {
    switch (activeTab) {
      case 'executive':
        return <ExecutiveDashboard />;
      
      case 'checklist':
        return <ChecklistCompleteSystem />;
      
      case 'marketing':
        return (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                📱 Marketing Intelligence
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Sistema de gestión de contenido para redes sociales
              </p>
              <button
                onClick={() => setShowMarketingModal(true)}
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
                <Globe style={{ height: '20px', width: '20px' }} />
                Abrir Sistema de Marketing
              </button>
            </div>
            
            {/* Modal del sistema de marketing */}
            <MarketingContentSystem
              isOpen={showMarketingModal}
              onClose={() => setShowMarketingModal(false)}
              onComplete={handleMarketingComplete}
            />
          </div>
        );
      
      case 'hr':
        return <HRManagementSystem />;
      
      case 'departments':
        return <DepartmentsView />;
      
      case 'centers':
        return <CentersView />;
      
      case 'tasks':
        return <TasksView onShowTaskModal={() => setShowTaskModal(true)} />;
      
      case 'meetings':
        return <MeetingsView onShowMeetingModal={() => setShowMeetingModal(true)} />;
      
      case 'analytics':
      case 'settings':
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              {activeTab === 'analytics' && '📊 Analytics Avanzados'}
              {activeTab === 'settings' && '⚙️ Configuración del Sistema'}
            </h2>
            <p style={{ color: '#6b7280' }}>
              Esta funcionalidad estará disponible próximamente.
            </p>
          </div>
        );
      
      default:
        return <ExecutiveDashboard />;
    }
  };

  // ============ RENDER PRINCIPAL ============
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Menu style={{ height: '20px', width: '20px', color: '#4b5563' }} />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            CRM La Jungla Ibérica
          </h1>
        </div>
        <button style={{
          padding: '8px',
          backgroundColor: '#f3f4f6',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          <Bell style={{ height: '20px', width: '20px', color: '#4b5563' }} />
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{
            width: '250px',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            minHeight: 'calc(100vh - 64px)',
            padding: '16px'
          }}>
            <nav>
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: activeTab === item.id ? '#eff6ff' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      color: activeTab === item.id ? '#2563eb' : '#4b5563',
                      fontWeight: activeTab === item.id ? '600' : '400',
                      textAlign: 'left'
                    }}
                  >
                    <Icon style={{ height: '20px', width: '20px' }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, padding: '24px' }}>
          {renderContent()}
        </div>
      </div>

      {/* Modales */}
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskCreated}
      />
      <CreateMeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onSave={handleMeetingCreated}
      />
    </div>
  );
};

// Export por defecto
export default RoleDashboard;