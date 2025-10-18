// src/App.tsx - VERSIÓN COMPLETA INTEGRADA
import React, { useState, useEffect } from 'react';
import { CreateCenterModal } from './components/CreateCenterModal';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { DataProvider } from './contexts/DataContext';
import { supabase } from './lib/supabase';
import LoginForm from './components/LoginForm';
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
  DollarSign,
} from 'lucide-react';

// Importar todos los componentes del sistema
import ChecklistCompleteSystem from './components/ChecklistCompleteSystem';
import RoleDashboard from './components/RoleDashboard';
import CenterManagementSystem from './components/centers/CenterManagementSystem';
import HRManagementSystem from './components/HRManagementSystem';
import MarketingPublicationSystem from './components/MarketingPublicationSystem';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import IntelligentExecutiveDashboard from './components/IntelligentExecutiveDashboard';
import StrategicMeetingSystem from './components/StrategicMeetingSystem';
import BrandAccountingModule from './components/accounting/BrandAccountingModule';
import MeetingHistorySystem from './components/MeetingHistorySystem';
import MarketingContentSystem from './components/MarketingContentSystem';
import ChecklistHistory from './components/ChecklistHistory';
import CenterManagement from './components/centers/CenterManagement';
import DailyOperations from './components/hr/DailyOperations';
import LogisticsManagementSystem from './components/LogisticsManagementSystem';
import MaintenanceModule from './components/MaintenanceModule';
import IncidentManagementSystem from './components/incidents/IncidentManagementSystem';
import CEODashboard from './components/CEODashboard';
import PendingTasksSystem from './components/PendingTasksSystem';
import DashboardPage from './pages/DashboardPage';

// ============ COMPONENTE DE NAVEGACIÓN PRINCIPAL ============
const NavigationDashboard: React.FC = () => {
  const { employee, signOut, userRole, isAuthenticated } = useSession();
  const [selectedModule, setSelectedModule] = useState<string | null>('main-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar siempre visible
  
  // Debug: Mostrar información de autenticación
  useEffect(() => {
    console.log('Estado de autenticación:', { 
      isAuthenticated, 
      userRole, 
      employee: employee ? { 
        id: employee.id, 
        name: employee.name, 
        email: employee.email,
        role: employee.role
      } : 'No autenticado'
    });
  }, [isAuthenticated, userRole, employee]);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showMeetingHistoryModal, setShowMeetingHistoryModal] = useState(false);
  
  // Estados para el sistema de centros mejorado
  const [showCreateCenterModal, setShowCreateCenterModal] = useState(false);
  const [showChecklistHistory, setShowChecklistHistory] = useState(false);
  const [selectedCenterForHistory, setSelectedCenterForHistory] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  
  // Estados para notificaciones de vacaciones
  const [vacationNotifications, setVacationNotifications] = useState<any[]>([]);
  const [showVacationNotifications, setShowVacationNotifications] = useState(false);

  // Función para cargar notificaciones de vacaciones (solo para encargados)
  const loadVacationNotifications = async () => {
    if (userRole !== 'center_manager') return;
    
    try {
      const centerIdentifier = Number(employee?.center_id ?? 9);

      // Obtener empleados del centro (solo campos existentes)
      const { data: centerEmployees, error: centerError } = await supabase
        .from('employees')
        .select('id, name, email')
        .eq('center_id', centerIdentifier);
      
      if (centerError) {
        console.error('Error cargando empleados del centro:', centerError);
        setVacationNotifications([]);
        return;
      }

      if (centerEmployees && centerEmployees.length > 0) {
        const employeeIds = centerEmployees.map(emp => emp.id);
        
        // Obtener solicitudes pendientes
        const { data: requests, error: requestError } = await supabase
          .from('vacation_requests')
          .select('*')
          .in('employee_id', employeeIds)
          .eq('status', 'pending')
          .order('requested_at', { ascending: false });
        
        if (requestError) {
          console.error('Error cargando solicitudes de vacaciones:', requestError);
          setVacationNotifications([]);
        } else if (requests) {
          setVacationNotifications(requests);
        }
      } else {
        setVacationNotifications([]);
      }
    } catch (error) {
      console.error('Error cargando notificaciones de vacaciones:', error);
      setVacationNotifications([]);
    }
  };

  // Cargar notificaciones al cambiar el usuario
  useEffect(() => {
    if (userRole === 'center_manager') {
      loadVacationNotifications();
      // Recargar cada 30 segundos
      const interval = setInterval(loadVacationNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole, employee?.id]);

  // Sistema de módulos optimizado por roles
  const getAvailableModules = () => {
    const isCEO = userRole === 'superadmin'; // Solo Carlos tiene acceso total
    const isAdmin = userRole === 'admin'; // Directores con acceso limitado
    const isManager = userRole === 'manager';
    const isCenterManager = userRole === 'center_manager'; // Encargados de centro
    
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
        component: LogisticsManagementSystem,
        available: true
      },
      {
        id: 'maintenance',
        title: 'Mantenimiento',
        description: 'Inspecciones mensuales y mantenimiento',
        icon: AlertTriangle,
        color: '#dc2626',
        component: MaintenanceModule,
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
        id: 'brand-management',
        title: 'Gestión de Marca',
        description: 'Gestión financiera de la marca',
        icon: DollarSign,
        color: '#8b5cf6',
        component: BrandAccountingModule,
        available: true
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
    console.log('Construyendo módulos para el rol:', userRole);
    console.log('¿Es CEO?', isCEO, '¿Es admin?', isAdmin);
    
    if (isCEO) {
      // Solo Carlos (CEO) tiene acceso a TODOS los módulos
      console.log('Módulos CEO disponibles:', ceoModules.map(m => m.title));
      console.log('Módulos base:', baseModules.map(m => m.title));
      const allModules = [...baseModules, ...ceoModules];
      console.log('Todos los módulos para CEO:', allModules.map(m => m.title));
      return allModules;
    } else if (isAdmin) {
      // Directores (admin) solo tienen acceso a SU módulo específico
      const adminModules = [];
      
      // Determinar módulo específico por email del empleado
      if (employee?.email === 'beni.jungla@gmail.com') {
        adminModules.push({
          id: 'logistics',
          title: 'Logística',
          description: 'Gestión de vestuario y pedidos',
          icon: Package,
          color: '#ea580c',
          component: LogisticsManagementSystem,
          available: true
        });
        adminModules.push({
          id: 'maintenance',
          title: 'Mantenimiento',
          description: 'Inspecciones mensuales y mantenimiento',
          icon: AlertTriangle,
          color: '#dc2626',
          component: MaintenanceModule,
          available: true
        });
      } else if (employee?.email === 'lajunglacentral@gmail.com') {
        adminModules.push({
          id: 'hr',
          title: 'RRHH y Procedimientos',
          description: 'Gestión de empleados y procedimientos',
          icon: Users,
          color: '#059669',
          component: HRManagementSystem,
          available: true
        });
      } else if (employee?.email === 'diego@lajungla.es') {
        adminModules.push({
          id: 'marketing',
          title: 'Marketing',
          description: 'Contenido y publicaciones',
          icon: Globe,
          color: '#dc2626',
          component: null,
          available: true,
          onClick: () => setShowMarketingModal(true)
        });
      } else if (employee?.email === 'jonathan@lajungla.es') {
        adminModules.push({
          id: 'online',
          title: 'Online',
          description: 'Gestión de contenido online',
          icon: Globe,
          color: '#2563eb',
          component: null,
          available: true
        });
      } else if (employee?.email === 'antonio@lajungla.es') {
        adminModules.push({
          id: 'events',
          title: 'Eventos',
          description: 'Gestión de eventos y actividades',
          icon: Calendar,
          color: '#7c2d12',
          component: null,
          available: true
        });
      }
      
      return [...baseModules, ...adminModules];
    } else if (isCenterManager) {
      // Encargados de centro: menú reducido (Dashboard + Gestión)
      const centerManagerModule = {
        id: 'center-management',
        title: 'Gestión',
        description: 'Gestión del Centro Sevilla',
        icon: Building2,
        color: '#059669',
        component: CenterManagement,
        available: true
      };

      return [baseModules[0], centerManagerModule];
    } else {
      // Para otros roles, solo dashboard + reuniones + su módulo específico
      const userDepartmentModules = departmentModules[userRole as keyof typeof departmentModules] || [];
      return [...baseModules, ...userDepartmentModules];
    }
  };

  const modules = getAvailableModules();
  console.log('Módulos disponibles para el usuario:', modules.map(m => m.title));
  console.log('Rol del usuario:', userRole);
  console.log('Email del empleado:', employee?.email);

  useEffect(() => {
    const handleModuleNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<{ moduleId?: string; fallbackUrl?: string | null; hrView?: string; logisticsView?: string }>;
      const { moduleId, fallbackUrl = null, hrView, logisticsView } = customEvent.detail || {};

      if (!moduleId) {
        return;
      }

      const targetModule = modules.find(module => module.id === moduleId);

      if (targetModule) {
        // Cerrar paneles relacionados y navegar dentro de la SPA
        setSelectedModule(moduleId);
        setShowVacationNotifications(false);

        const moduleWithClick = targetModule as any;
        if (moduleWithClick.onClick && typeof moduleWithClick.onClick === 'function') {
          moduleWithClick.onClick();
        }

        if (hrView) {
          // Permitir que el módulo RRHH procese la vista solicitada
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('hr-module-view', {
                detail: { view: hrView }
              })
            );
          }, 0);
        }

        if (logisticsView) {
          // Permitir que el módulo Logística procese la vista solicitada
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('logistics-module-view', {
                detail: { view: logisticsView }
              })
            );
          }, 0);
        }
      } else if (fallbackUrl) {
        window.location.href = fallbackUrl;
      }
    };

    window.addEventListener('navigate-module', handleModuleNavigation as EventListener);

    return () => {
      window.removeEventListener('navigate-module', handleModuleNavigation as EventListener);
    };
  }, [modules]);

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

    // Usar el nuevo CenterManagementSystem rediseñado
    if (module.id === 'centers') {
      return (
        <CenterManagementSystem
          userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
          userName={employee?.nombre || 'Carlos Suárez'}
          onBack={() => setSelectedModule('main-dashboard')}
        />
      );
    }

    if (module.component) {
      const Component = module.component;
      
      // Props especiales para módulos específicos
      if (module.id === 'maintenance') {
        return (
          <Component
            userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
            userName={employee?.nombre || 'Carlos Suárez'}
            onBack={() => setSelectedModule('main-dashboard')}
          />
        );
      } else {
        // Otros módulos que no requieren props especiales
        return <Component {...({} as any)} />;
      }
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
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowVacationNotifications(!showVacationNotifications)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <Bell style={{ height: '20px', width: '20px', color: '#6b7280' }} />
                    {vacationNotifications.length > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {vacationNotifications.length}
                      </span>
                    )}
                  </button>
                  
                  {/* Panel de notificaciones */}
                  {showVacationNotifications && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                      border: '1px solid #e5e7eb',
                      width: '350px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      zIndex: 1000
                    }}>
                      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ margin: 0, color: '#111827', fontSize: '16px', fontWeight: 'bold' }}>
                          🏖️ Solicitudes de Vacaciones ({vacationNotifications.length})
                        </h3>
                      </div>
                      
                      {vacationNotifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                          No hay solicitudes pendientes
                        </div>
                      ) : (
                        vacationNotifications.map(request => (
                          <div
                            key={request.id}
                            style={{
                              padding: '16px',
                              borderBottom: '1px solid #f3f4f6',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              // Navegar al módulo de vacaciones
                              setSelectedModule('center-management');
                              setShowVacationNotifications(false);
                            }}
                          >
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px', marginBottom: '4px' }}>
                              {request.employee_name}
                            </div>
                            <div style={{ color: '#374151', fontSize: '13px', marginBottom: '4px' }}>
                              {request.start_date} al {request.end_date} • {request.days_requested} días
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '12px' }}>
                              {request.reason || 'Sin motivo especificado'}
                            </div>
                          </div>
                        ))
                      )}
                      
                      {vacationNotifications.length > 0 && (
                        <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedModule('center-management');
                              setShowVacationNotifications(false);
                            }}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Ver todas las solicitudes
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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