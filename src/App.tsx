// src/App.tsx - VERSIÓN COMPLETA INTEGRADA
import React, { useState, useEffect } from 'react';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
import { supabase } from './lib/supabase';
import {
  Crown, Users, Building2, BarChart3, Settings, Menu, Bell, X,
  Target, Flag, Brain, CheckCircle, Calendar, Video, Search,
  MapPin, AlertTriangle, DollarSign, Globe, Shield,
  Loader2, RefreshCw, Clock, Heart, Briefcase, ClipboardList,
  TrendingUp, Activity, Package, ChevronRight, Star, LogOut,
  Plus, Edit, Trash2, Eye, Filter, Download, Upload, Home
} from 'lucide-react';

// Importar todos los componentes del sistema
import ChecklistCompleteSystem from './components/ChecklistCompleteSystem';
import MarketingContentSystem from './components/MarketingContentSystem';
import MarketingPublicationSystem from './components/MarketingPublicationSystem';
import HRManagementSystem from './components/HRManagementSystem';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import IntelligentExecutiveDashboard from './components/IntelligentExecutiveDashboard';
import StrategicMeetingSystem from './components/StrategicMeetingSystem';

// ============ COMPONENTE DE NAVEGACIÓN PRINCIPAL ============
const NavigationDashboard: React.FC = () => {
  const { employee, signOut, userRole } = useSession();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Sistema de módulos dinámicos según rol
  const getAvailableModules = () => {
    const isExecutive = ['superadmin', 'admin'].includes(userRole || '');
    const isManager = userRole === 'manager';
    const isEmployee = userRole === 'employee';
    
    return [
      {
        id: 'dashboard',
        title: 'Dashboard Ejecutivo',
        description: 'Panel de control principal',
        icon: Crown,
        color: '#1e40af',
        component: ExecutiveDashboard,
        available: isExecutive || isManager
      },
      {
        id: 'intelligent',
        title: 'Dashboard Inteligente',
        description: 'Sistema con IA predictiva',
        icon: Brain,
        color: '#7c3aed',
        component: IntelligentExecutiveDashboard,
        available: isExecutive
      },
      {
        id: 'checklist',
        title: 'Checklist Operativo',
        description: 'Control diario de tareas',
        icon: ClipboardList,
        color: '#059669',
        component: ChecklistCompleteSystem,
        available: true // Disponible para todos
      },
      {
        id: 'hr',
        title: 'Gestión RRHH',
        description: 'Recursos humanos completo',
        icon: Users,
        color: '#dc2626',
        component: HRManagementSystem,
        available: isExecutive || isManager
      },
      {
        id: 'marketing',
        title: 'Marketing Digital',
        description: 'Gestión de contenido y publicaciones',
        icon: Globe,
        color: '#ec4899',
        component: null, // Usa modal
        available: isExecutive || isManager,
        onClick: () => setShowMarketingModal(true)
      },
      {
        id: 'publications',
        title: 'Publicaciones',
        description: 'Cola de publicaciones para redes',
        icon: Video,
        color: '#f59e0b',
        component: MarketingPublicationSystem,
        available: isExecutive || isManager
      },
      {
        id: 'meetings',
        title: 'Reuniones Estratégicas',
        description: 'Sistema de reuniones y objetivos',
        icon: Calendar,
        color: '#3b82f6',
        component: null, // Usa modal
        available: isExecutive,
        onClick: () => setShowMeetingModal(true)
      },
      {
        id: 'analytics',
        title: 'Analytics',
        description: 'Métricas y análisis avanzado',
        icon: BarChart3,
        color: '#10b981',
        component: null,
        available: isExecutive
      },
      {
        id: 'settings',
        title: 'Configuración',
        description: 'Ajustes del sistema',
        icon: Settings,
        color: '#6b7280',
        component: null,
        available: isExecutive
      }
    ].filter(m => m.available);
  };

  const modules = getAvailableModules();

  // Componente de contenido vacío para módulos en desarrollo
  const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      color: '#6b7280'
    }}>
      <Package style={{ height: '48px', width: '48px', marginBottom: '16px', opacity: 0.5 }} />
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        {description}
      </p>
    </div>
  );

  // Renderizar el módulo seleccionado
  const renderModule = () => {
    if (!selectedModule) {
      return <ExecutiveDashboard />;
    }

    const module = modules.find(m => m.id === selectedModule);
    if (!module) return null;

    // Si el módulo tiene componente, renderizarlo
    if (module.component) {
      const Component = module.component;
      return <Component />;
    }

    // Si no tiene componente, mostrar estado vacío
    return (
      <EmptyState 
        title={`${module.title} - En Desarrollo`} 
        description="Esta funcionalidad estará disponible próximamente"
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Logo y toggle */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              🌿
            </div>
            {sidebarOpen && (
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  La Jungla
                </h1>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  CRM Ejecutivo
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <Menu style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        {/* Perfil del usuario */}
        {employee && (
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || employee.nombre || '')}&background=059669&color=fff`}
                alt="Avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%'
                }}
              />
              {sidebarOpen && (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {employee.name || employee.nombre}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {userRole === 'superadmin' ? 'CEO' : 
                     userRole === 'admin' ? 'Director' :
                     userRole === 'manager' ? 'Encargado' : 'Empleado'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Módulos de navegación */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = selectedModule === module.id;
            
            return (
              <button
                key={module.id}
                onClick={() => {
                  if (module.onClick) {
                    module.onClick();
                  } else {
                    setSelectedModule(module.id);
                  }
                }}
                style={{
                  width: '100%',
                  padding: sidebarOpen ? '12px 16px' : '12px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: isActive ? `${module.color}10` : 'transparent',
                  border: `2px solid ${isActive ? module.color : 'transparent'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon style={{ 
                  height: '20px', 
                  width: '20px', 
                  color: isActive ? module.color : '#6b7280',
                  flexShrink: 0
                }} />
                {sidebarOpen && (
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? module.color : '#374151',
                      margin: 0
                    }}>
                      {module.title}
                    </p>
                    <p style={{ 
                      fontSize: '11px', 
                      color: '#9ca3af',
                      margin: 0
                    }}>
                      {module.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón de cerrar sesión */}
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={signOut}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut style={{ height: '16px', width: '16px' }} />
            {sidebarOpen && 'Cerrar Sesión'}
          </button>
        </div>
      </div>

      {/* Área de contenido principal */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header del contenido */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              {modules.find(m => m.id === selectedModule)?.title || 'Dashboard Ejecutivo'}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              padding: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <Bell style={{ height: '20px', width: '20px', color: '#6b7280' }} />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%'
              }} />
            </button>
          </div>
        </div>

        {/* Contenido del módulo */}
        <div style={{ padding: '24px' }}>
          {renderModule()}
        </div>
      </div>

      {/* Modales del sistema */}
      <MarketingContentSystem
        isOpen={showMarketingModal}
        onClose={() => setShowMarketingModal(false)}
        onComplete={(data) => {
          console.log('Marketing data:', data);
          setShowMarketingModal(false);
        }}
      />
      
      <StrategicMeetingSystem
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onComplete={(data) => {
          console.log('Meeting data:', data);
          setShowMeetingModal(false);
        }}
      />
    </div>
  );
};

// ============ COMPONENTE DE LOADING ============
const LoadingScreen: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      maxWidth: '400px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    }}>
      <Loader2 style={{
        height: '48px',
        width: '48px',
        animation: 'spin 1s linear infinite',
        color: '#059669',
        margin: '0 auto 16px'
      }} />
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
        Verificando sesión...
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        Cargando tu perfil y permisos
      </p>
    </div>
  </div>
);

// ============ COMPONENTE DE ERROR ============
const ErrorScreen: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      maxWidth: '400px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    }}>
      <AlertTriangle style={{
        height: '48px',
        width: '48px',
        color: '#dc2626',
        margin: '0 auto 16px'
      }} />
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
        Error de Sistema
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: onRetry ? '16px' : '0' }}>
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
);

// ============ COMPONENTE DE CONTENIDO ============
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, error, employee, userRole } = useSession();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!employee || !userRole) {
    return (
      <ErrorScreen 
        error="No se pudieron cargar los datos del usuario. Contacta con el administrador."
      />
    );
  }

  return (
    <DataProvider>
      <NavigationDashboard />
    </DataProvider>
  );
};

// ============ COMPONENTE PRINCIPAL ============
const App: React.FC = () => {
  // Añadir estilos globales para animaciones
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
};

export default App;