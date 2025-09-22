// src/App.tsx - VERSIÓN COMPLETA INTEGRADA
import React, { useState, useEffect } from 'react';
import { CreateCenterModal } from './components/CreateCenterModal';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
import { supabase } from './lib/supabase';
import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  Globe,
  Package,
  ClipboardList,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  FileText,
  Crown,
  Building2,
  Brain,
  Target,
  History,
  X,
  Menu,
  LogOut,
  Loader2,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';

// Importar todos los componentes del sistema
import ChecklistCompleteSystem from './components/ChecklistCompleteSystem';
import RoleDashboard from './components/RoleDashboard';
import HRManagementSystem from './components/HRManagementSystem';
import MarketingPublicationSystem from './components/MarketingPublicationSystem';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import IntelligentExecutiveDashboard from './components/IntelligentExecutiveDashboard';
import StrategicMeetingSystem from './components/StrategicMeetingSystem';
import MeetingHistorySystem from './components/MeetingHistorySystem';
import MarketingContentSystem from './components/MarketingContentSystem';
import ChecklistHistory from './components/ChecklistHistory';
import LogisticsManagementSystem from './components/LogisticsManagementSystem';
import IncidentManagementSystem from './components/incidents/IncidentManagementSystem';
import CEODashboard from './components/CEODashboard';
import PendingTasksSystem from './components/PendingTasksSystem';
import DashboardPage from './pages/DashboardPage';

// ============ COMPONENTE DE NAVEGACIÓN PRINCIPAL ============
const NavigationDashboard: React.FC = () => {
  const { employee, signOut, userRole } = useSession();
  const [selectedModule, setSelectedModule] = useState<string | null>('main-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar siempre visible
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showMeetingHistoryModal, setShowMeetingHistoryModal] = useState(false);
  
  // Estados para el sistema de centros mejorado
  const [showCreateCenterModal, setShowCreateCenterModal] = useState(false);
  const [showChecklistHistory, setShowChecklistHistory] = useState(false);
  const [selectedCenterForHistory, setSelectedCenterForHistory] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  // Sistema de módulos optimizado por roles
  const getAvailableModules = () => {
    const isCEO = ['superadmin', 'admin'].includes(userRole || '');
    const isManager = userRole === 'manager';
    
    // Módulos base para todos los roles
    const baseModules = [
      {
        id: 'main-dashboard',
        title: 'Dashboard',
        description: 'Vista principal con calendario, tareas y alertas',
        icon: LayoutDashboard,
        color: '#1976d2',
        component: DashboardPage,
        available: true,
        isDefault: true
      },
      {
        id: 'meetings',
        title: 'Reuniones',
        description: 'Gestión de reuniones y calendario',
        icon: Calendar,
        color: '#059669',
        component: null,
        available: true,
        onClick: () => setShowMeetingModal(true)
      }
    ];

    // Módulos específicos para CEO
    const ceoModules = [
      {
        id: 'intelligent',
        title: 'Dashboard Inteligente',
        description: 'Sistema con IA predictiva y KPIs críticos',
        icon: Brain,
        color: '#7c3aed',
        component: IntelligentExecutiveDashboard,
        available: true
      },
      {
        id: 'hr',
        title: 'RRHH y Procedimientos',
        description: 'Gestión de empleados y procedimientos',
        icon: Users,
        color: '#059669',
        component: HRManagementSystem,
        available: true
      },
      {
        id: 'logistics',
        title: 'Logística',
        description: 'Gestión de vestuario y pedidos',
        icon: Package,
        color: '#ea580c',
        component: null,
        available: true
      },
      {
        id: 'marketing',
        title: 'Marketing',
        description: 'Contenido y publicaciones',
        icon: Globe,
        color: '#dc2626',
        component: null,
        available: true,
        onClick: () => setShowMarketingModal(true)
      },
      {
        id: 'centers',
        title: 'Centros',
        description: 'Gestión de centros deportivos',
        icon: Building2,
        color: '#0891b2',
        component: null,
        available: true,
        hasSubmenu: true
      },
      {
        id: 'incidents',
        title: 'Incidencias',
        description: 'Ausencias, vacaciones y solicitudes',
        icon: ClipboardList,
        color: '#7c2d12',
        component: null,
        available: true
      }
    ];

    // Módulos específicos por departamento
    const departmentModules = {
      'marketing': [
        {
          id: 'marketing',
          title: 'Marketing',
          description: 'Contenido y publicaciones',
          icon: Globe,
          color: '#dc2626',
          component: null,
          available: true,
          onClick: () => setShowMarketingModal(true)
        }
      ],
      'hr': [
        {
          id: 'hr',
          title: 'RRHH',
          description: 'Gestión de empleados',
          icon: Users,
          color: '#059669',
          component: HRManagementSystem,
          available: true
        }
      ],
      'logistics': [
        {
          id: 'logistics',
          title: 'Logística',
          description: 'Gestión de vestuario y pedidos',
          icon: Package,
          color: '#ea580c',
          component: null,
          available: true
        }
      ]
    };

    // Construir módulos según el rol
    if (isCEO) {
      return [...baseModules, ...ceoModules];
    } else {
      // Para otros roles, solo dashboard + reuniones + su módulo específico
      const userDepartmentModules = departmentModules[userRole as keyof typeof departmentModules] || [];
      return [...baseModules, ...userDepartmentModules];
    }
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
    const module = modules.find(m => m.id === selectedModule);
    if (!module) {
      // Si no hay módulo seleccionado, mostrar el dashboard principal
      return <DashboardPage />;
    }

    // Manejo especial para módulos específicos
    if (module.id === 'main-dashboard') {
      return <DashboardPage />;
    }

    if (module.id === 'logistics') {
      return <LogisticsManagementSystem />;
    }

    if (module.id === 'incidents') {
      return <IncidentManagementSystem />;
    }

    if (module.id === 'pending-tasks') {
      return <PendingTasksSystem />;
    }

    // Manejo especial para el módulo de centros MEJORADO
    if (module.id === 'centers') {
      return (
        <div style={{ padding: '24px' }}>
          {/* Header con botón Nuevo Centro */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px' 
          }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '8px' }}>
                🏢 Gestión de Centros
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                Administra los centros deportivos y sus operaciones diarias
              </p>
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                transition: 'all 0.2s'
              }}
              onClick={() => setShowCreateCenterModal(true)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#047857';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus style={{ height: '18px', width: '18px' }} />
              Nuevo Centro
            </button>
          </div>

          {/* Grid de centros mejorado */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
            {[
              { name: 'Sevilla', type: 'Propio', status: 'Activo', responsable: 'María García', lastChecklist: '2025-01-13' },
              { name: 'Jerez', type: 'Propio', status: 'Activo', responsable: 'Carlos Ruiz', lastChecklist: '2025-01-13' },
              { name: 'Puerto', type: 'Propio', status: 'Activo', responsable: 'Ana Martín', lastChecklist: '2025-01-12' }
            ].map(center => (
              <div
                key={center.name}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: selectedCenter === center.name ? '2px solid #059669' : '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedCenter(center.name)}
                onMouseOver={(e) => {
                  if (selectedCenter !== center.name) {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCenter !== center.name) {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Header del centro con badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Building2 style={{ color: '#059669', height: '28px', width: '28px' }} />
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        Centro {center.name}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        {center.responsable}
                      </p>
                    </div>
                  </div>
                  
                  {/* Badges de tipo y estado */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: center.type === 'Propio' ? '#dcfce7' : '#dbeafe',
                      color: center.type === 'Propio' ? '#059669' : '#2563eb'
                    }}>
                      {center.type === 'Propio' ? '🏢' : '🏪'} {center.type}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: center.status === 'Activo' ? '#dcfce7' : '#fef3c7',
                      color: center.status === 'Activo' ? '#059669' : '#d97706'
                    }}>
                      {center.status === 'Activo' ? '✅' : '⚠️'} {center.status}
                    </span>
                  </div>
                </div>

                {/* Información del centro */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Clock style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      Último checklist: {center.lastChecklist}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      Operaciones diarias activas
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🎯 Abriendo checklist para centro:', center.name);
                      console.log('🎯 Estado showChecklist ANTES:', showChecklist);
                      console.log('📊 Centro seleccionado ANTES:', selectedCenter);
                      console.log('🔍 Componente ChecklistCompleteSystem existe?', !!ChecklistCompleteSystem);
                      
                      setSelectedCenter(center.name);
                      setShowChecklist(true);
                      setSelectedModule('checklist');
                      
                      // Logs después del cambio de estado
                      setTimeout(() => {
                        console.log('🎯 Estado showChecklist DESPUÉS:', true);
                        console.log('📊 Centro seleccionado DESPUÉS:', center.name);
                      }, 100);
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#047857';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                    }}
                  >
                    <CheckCircle style={{ height: '16px', width: '16px' }} />
                    Abrir Checklist
                  </button>
                  
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      backgroundColor: 'white',
                      color: '#6b7280',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('📋 Abriendo historial para centro:', center.name);
                      console.log('📋 Estado showChecklistHistory ANTES:', showChecklistHistory);
                      console.log('🏢 Centro para historial ANTES:', selectedCenterForHistory);
                      console.log('🔍 Componente ChecklistHistory existe?', !!ChecklistHistory);
                      
                      setSelectedCenterForHistory(center.name);
                      setShowChecklistHistory(true);
                      
                      // Logs después del cambio de estado
                      setTimeout(() => {
                        console.log('📋 Estado showChecklistHistory DESPUÉS:', true);
                        console.log('🏢 Centro para historial DESPUÉS:', center.name);
                      }, 100);
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.color = '#059669';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <History style={{ height: '16px', width: '16px' }} />
                    Ver Historial
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de crear centro */}
          <CreateCenterModal
            isOpen={showCreateCenterModal}
            onClose={() => setShowCreateCenterModal(false)}
            onCenterCreated={() => {
              console.log('✅ Centro creado, recargando lista...');
              // Aquí se recargaría la lista de centros desde Supabase
            }}
          />

          {/* Modal de historial de checklists */}
          {showChecklistHistory && selectedCenterForHistory && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                width: '900px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    📋 Historial de Checklists - {selectedCenterForHistory}
                  </h3>
                  <button
                    onClick={() => setShowChecklistHistory(false)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <X style={{ height: '20px', width: '20px', color: '#6b7280' }} />
                  </button>
                </div>
                
                <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
                  <History style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
                  <p style={{ fontSize: '16px', margin: 0 }}>
                    Sistema de historial de checklists en desarrollo...
                  </p>
                  <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
                    Próximamente: Lista completa de checklists por fecha, estado y responsable
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (module.component) {
      const Component = module.component;
      return <Component />;
    }

    return (
      <EmptyState 
        title={`${module.title} - En Desarrollo`} 
        description="Esta funcionalidad estará disponible próximamente"
      />
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex', 
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        minWidth: sidebarOpen ? '280px' : '80px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        zIndex: 10,
        overflowY: 'auto',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        {/* Contenido del sidebar */}
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
          {/* Sidebar siempre visible - botón deshabilitado */}
          <div style={{ padding: '8px' }}>
            <Menu style={{ height: '20px', width: '20px', color: '#059669' }} />
          </div>
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
                  const moduleWithClick = module as any;
                  if (moduleWithClick.onClick && typeof moduleWithClick.onClick === 'function') {
                    moduleWithClick.onClick();
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
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginLeft: sidebarOpen ? '280px' : '80px',
        transition: 'margin-left 0.3s ease',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        maxHeight: '100vh',
        width: `calc(100vw - ${sidebarOpen ? '280px' : '80px'})`
      }}>
        {selectedModule === 'main-dashboard' ? (
          // Para el dashboard principal, mostrar sin padding ni header adicional
          renderModule()
        ) : (
          // Para otros módulos, mantener la estructura original
          <>
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
          </>
        )}
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
      
      {showMeetingModal && (
        <StrategicMeetingSystem
          isOpen={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
          onComplete={() => {
            setShowMeetingModal(false);
            window.location.reload();
          }}
        />
      )}

      {showMeetingHistoryModal && (
        <MeetingHistorySystem
          isOpen={showMeetingHistoryModal}
          onClose={() => setShowMeetingHistoryModal(false)}
        />
      )}

      {/* MODAL CRÍTICO: ChecklistCompleteSystem */}
      {showChecklist && selectedCenter && (
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
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => {
                console.log('🔒 Cerrando modal de checklist');
                setShowChecklist(false);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            
            <ChecklistCompleteSystem />
          </div>
        </div>
      )}

      {/* MODAL CRÍTICO: Historial de Checklists */}
      {showChecklistHistory && selectedCenterForHistory && (
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
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => {
                console.log('🔒 Cerrando modal de historial');
                setShowChecklistHistory(false);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              📋 Historial de Checklists - {selectedCenterForHistory}
            </h2>
            
            <ChecklistHistory centerName={selectedCenterForHistory} />
          </div>
        </div>
      )}
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