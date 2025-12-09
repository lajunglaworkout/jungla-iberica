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
  ListTodo,
  GraduationCap,
  Shield,
} from 'lucide-react';

// Importar todos los componentes del sistema
import ChecklistCompleteSystem from './components/ChecklistCompleteSystem';
import RoleDashboard from './components/RoleDashboard';
import CenterManagementSystem from './components/centers/CenterManagementSystem';
import HRManagementSystem from './components/HRManagementSystem';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import IntelligentExecutiveDashboard from './components/IntelligentExecutiveDashboard';
import StrategicMeetingSystem from './components/StrategicMeetingSystem';
import BrandAccountingModule from './components/accounting/BrandAccountingModule';
import MeetingHistorySystem from './components/MeetingHistorySystem';
import ChecklistHistory from './components/ChecklistHistory';
import MeetingsMainPage from './pages/MeetingsMainPage';
import SignaturePage from './pages/SignaturePage';
import CenterManagement from './components/centers/CenterManagement';
import DailyOperations from './components/hr/DailyOperations';
import LogisticsManagementSystem from './components/LogisticsManagementSystem';
import MaintenanceModule from './components/MaintenanceModule';
import IncidentManagementSystem from './components/incidents/IncidentManagementSystem';
import CEODashboard from './components/CEODashboard';
import PendingTasksSystem from './components/PendingTasksSystem';
import DashboardPage from './pages/DashboardPage';
import MyTasksPage from './pages/MyTasksPage';
import MaintenanceDirectorDashboard from './components/maintenance/MaintenanceDirectorDashboard';
import { AcademyDashboard } from './components/academy/Dashboard/AcademyDashboard';
import { ContenidosView } from './components/academy/Contenidos/ContenidosView';
import { TareasView } from './components/academy/Tareas/TareasView';
import { OnlineDashboard } from './components/online/OnlineDashboard';
import { MarketingDashboard } from './components/marketing/MarketingDashboard';
import { UserManagementSystem } from './components/admin/UserManagementSystem';
import { EventsDashboard } from './components/events/EventsDashboard';
import { FranquiciadoDashboard } from './components/franquiciados/FranquiciadoDashboard';

// ============ COMPONENTE DE NAVEGACIÓN PRINCIPAL ============
const NavigationDashboard: React.FC = () => {
  const { employee, signOut, userRole, isAuthenticated } = useSession();
  // Inicializar desde localStorage o usar default
  const [selectedModule, setSelectedModule] = useState<string | null>(() => {
    return localStorage.getItem('lastSelectedModule') || 'main-dashboard';
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persistir módulo seleccionado
  useEffect(() => {
    if (selectedModule) {
      localStorage.setItem('lastSelectedModule', selectedModule);
    }
  }, [selectedModule]);

  // Detectar ruta de firma en hash URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/firma/')) {
      const signatureId = hash.replace('#/firma/', '');
      setSelectedModule(`firma-${signatureId}`);
    }
  }, []);

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

  // *** FRANQUICIADO: Vista exclusiva sin navegación lateral ***
  if (userRole === 'franquiciado') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header simple para franquiciado */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '36px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span style={{ fontWeight: 600, color: '#10b981', fontSize: '18px' }}>La Jungla Workout</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-lg border-2 border-white shadow-sm">
                {(employee?.first_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isAuthenticated ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">
                {employee?.first_name} {employee?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{employee?.email}</p>
            </div>
            <button
              onClick={signOut}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
        {/* Dashboard Franquiciado */}
        <FranquiciadoDashboard />
      </div>
    );
  }

  // Sistema de módulos optimizado por roles
  const getAvailableModules = () => {
    const isCEO = userRole === 'superadmin'; // Solo Carlos tiene acceso total
    const isAdmin = userRole === 'admin'; // Directores con acceso limitado
    const isManager = userRole === 'manager';
    const isCenterManager = userRole === 'center_manager'; // Encargados de centro

    // Módulos base para todos los usuarios autenticados
    const baseModules = [
      {
        id: 'main-dashboard',
        title: 'Dashboard',
        description: 'Vista general del sistema',
        icon: LayoutDashboard,
        color: '#3b82f6',
        component: DashboardPage,
        available: true,
        isDefault: true
      },
      {
        id: 'my-tasks',
        title: 'Mis Tareas',
        description: 'Gestiona tus tareas pendientes',
        icon: ListTodo,
        color: '#8b5cf6',
        component: MyTasksPage,
        available: true
      },
      {
        id: 'meetings',
        title: 'Reuniones',
        description: 'Gestión de reuniones y calendario',
        icon: Calendar,
        color: '#059669',
        component: MeetingsMainPage,
        available: true
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
        id: 'admin-users',
        title: 'Gestión de Accesos',
        description: 'Alta de usuarios, centros y permisos',
        icon: Shield,
        color: '#10b981',
        component: UserManagementSystem,
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
        component: MarketingDashboard,
        available: true
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
      },
      {
        id: 'academy',
        title: 'Academy',
        description: 'Gestión de formación',
        icon: GraduationCap,
        color: '#CDDC39',
        component: AcademyDashboard,
        available: true
      },
      {
        id: 'online',
        title: 'La Jungla Online',
        icon: Globe,
        component: OnlineDashboard,
        available: true
      },
      {
        id: 'events',
        title: 'Eventos',
        description: 'Gestión de eventos',
        icon: Calendar,
        color: '#7c2d12',
        component: EventsDashboard,
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
          component: MarketingDashboard,
          available: true
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
      // ========== DIRECTORES (DB-BASED) ==========
      // Ahora nos basamos en los DEPARTAMENTOS asignados en la BD
      const adminModules: any[] = [];
      const departments = employee?.departments || [];

      // Helper para verificar departamento
      const hasDept = (name: string) => departments.some(d => d.name.toLowerCase().includes(name.toLowerCase()));

      // LOGÍSTICA
      if (hasDept('logística') || hasDept('logistica')) {
        adminModules.push({
          id: 'logistics',
          title: 'Logística',
          description: 'Gestión de vestuario y pedidos',
          icon: Package,
          color: '#ea580c',
          component: LogisticsManagementSystem,
          available: true
        });
      }

      // MANTENIMIENTO
      if (hasDept('mantenimiento')) {
        adminModules.push({
          id: 'maintenance',
          title: 'Mantenimiento',
          description: 'Inspecciones mensuales y mantenimiento',
          icon: AlertTriangle,
          color: '#dc2626',
          component: MaintenanceModule,
          available: true
        });
      }

      // RRHH
      if (hasDept('rrhh') || hasDept('humanos')) {
        adminModules.push({
          id: 'hr',
          title: 'RRHH y Procedimientos',
          description: 'Gestión de empleados y procedimientos',
          icon: Users,
          color: '#059669',
          component: HRManagementSystem,
          available: true
        });
      }

      // ONLINE
      if (hasDept('online')) {
        adminModules.push({
          id: 'online',
          title: 'La Jungla Online',
          description: 'Gestión de contenido online',
          icon: Globe,
          color: '#2563eb',
          component: OnlineDashboard,
          available: true
        });
      }

      // EVENTOS
      if (hasDept('eventos')) {
        adminModules.push({
          id: 'events',
          title: 'Eventos',
          description: 'Gestión de eventos',
          icon: Calendar,
          color: '#7c2d12',
          component: EventsDashboard,
          available: true
        });
      }

      // ACADEMY
      if (hasDept('academy') || hasDept('formación')) {
        adminModules.push({
          id: 'academy',
          title: 'Academy',
          description: 'Gestión de formación',
          icon: GraduationCap,
          color: '#CDDC39',
          component: AcademyDashboard,
          available: true
        });
      }

      // BRAND MANAGEMENT (Default for Directors)
      if (isAdmin) {
        adminModules.push({
          id: 'centers',
          title: 'Centros',
          description: 'Gestión de centros deportivos',
          icon: Building2,
          color: '#0891b2',
          component: null,
          available: true,
          hasSubmenu: true
        });
      }

      return [...baseModules, ...adminModules];
    } else if (isCenterManager) {
      // Encargados de centro: Todos los módulos base + Gestión de su centro
      const centerManagerModule = {
        id: 'center-management',
        title: 'Gestión',
        description: 'Gestión del Centro',
        icon: Building2,
        color: '#059669',
        component: CenterManagement,
        available: true
      };

      return [...baseModules, centerManagerModule];
    } else {
      // ========== EMPLEADOS DE CENTROS ==========

      const departments = employee?.departments || [];
      const hasDept = (name: string) => departments.some(d => d.name.toLowerCase().includes(name.toLowerCase()));

      // Módulo base de gestión para todos los empleados de centro
      const centerModule = {
        id: 'center-management',
        title: 'Gestión del Centro',
        description: 'Tu centro de trabajo',
        icon: Building2,
        color: '#059669',
        component: CenterManagement,
        available: true
      };

      // Módulos extra basados en departamentos/roles
      const extraModules: any[] = [];

      // ONLINE
      if (hasDept('online')) {
        extraModules.push({
          id: 'online',
          title: 'La Jungla Online',
          description: 'Gestión de contenido online',
          icon: Globe,
          color: '#2563eb',
          component: OnlineDashboard,
          available: true,
          hideBilling: true
        });
      }

      // EVENTOS
      if (hasDept('eventos')) {
        extraModules.push({
          id: 'events',
          title: 'Eventos',
          description: 'Gestión de eventos',
          icon: Calendar,
          color: '#7c2d12',
          component: EventsDashboard,
          available: true
        });
      }

      return [...baseModules, centerModule, ...extraModules];
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
    // Detectar ruta de firma
    if (selectedModule?.startsWith('firma-')) {
      return <SignaturePage />;
    }

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

    // Academy Module Routing
    if (module.id === 'academy') {
      if (selectedModule === 'academy') return <AcademyDashboard />;
      // Sub-routes handling via selectedModule state or internal state
      // For now, we rely on the AcademyDashboard to handle its own internal state or we can lift it up
      // But since the requirement was a single module entry point, we return the Dashboard
      // However, the dashboard has navigation. 
      // Let's check if we need to handle sub-views here or if AcademyDashboard handles them.
      // The AcademyDashboard has local state `currentView`. 
      // To make it persistent or deep-linkable, we might need to lift state up, 
      // but for now let's stick to the requested architecture.
      return <AcademyDashboard />;
    }

    // Online Module Routing
    if (selectedModule === 'online') {
      const hideBilling = module?.hideBilling || false;
      return <OnlineDashboard hideBilling={hideBilling} />;
    }

    // Usar el nuevo CenterManagementSystem rediseñado
    if (module.id === 'centers') {
      return (
        <CenterManagementSystem
          userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
          userName={employee?.first_name || 'Carlos Suárez'}
          onBack={() => setSelectedModule('main-dashboard')}
        />
      );
    }

    if (module.component) {
      const Component = module.component;

      // Props especiales para módulos específicos

      if (module.id === 'maintenance') {
        // Si es admin (Director), mostrar el dashboard de director
        if (userRole === 'admin' || userRole === 'superadmin') {
          return <MaintenanceDirectorDashboard />;
        }

        // Si no, mostrar el módulo normal
        return (
          <Component
            userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
            userName={employee?.first_name || 'Carlos Suárez'}
            userRole={userRole || 'employee'}
            onBack={() => setSelectedModule('main-dashboard')}
          />
        );
      } else if (module.id === 'my-tasks') {
        return (
          <MyTasksPage />
        );
      } else if (module.id === 'hr') {
        return (
          <HRManagementSystem
            userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
            initialView={(module as any).initialView}
          />
        );
      } else if (module.id === 'logistics') {
        return (
          <LogisticsManagementSystem
            userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
            initialView={(module as any).initialView}
          />
        );
      } else if (module.id === 'marketing') {
        return (
          <MarketingDashboard />
        );
      } else {
        // Otros módulos que no requieren props especiales
        return (
          <Component
            onBack={() => setSelectedModule('main-dashboard')}
            userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
            userName={employee?.first_name || 'Usuario'}
            userRole={userRole || 'employee'}
          />
        );
      }
    }

    return (
      <EmptyState
        title={`Módulo ${module.title}`}
        description="Este módulo está en desarrollo o no tiene componente asignado."
      />
    );
  };

  const getPageTitle = () => {
    const module = modules.find(m => m.id === selectedModule);
    return module ? module.title : 'Dashboard';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        flexShrink: 0,
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        overflowX: 'hidden',
        height: '100vh',
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
        {
          employee && (
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
                          userRole === 'center_manager' ? 'Encargado' :
                            userRole === 'manager' ? 'Encargado' : 'Empleado'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        }

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
      </div >

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        marginLeft: isMobile ? 0 : (sidebarOpen ? '280px' : '80px'),
        transition: 'margin-left 0.3s ease',
      }}>
        {/* Mobile Header Spacer */}
        <div style={{ display: isMobile ? 'block' : 'none', height: '70px', width: '100%', flexShrink: 0 }} />

        {/* Dynamic Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              {getPageTitle()}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
              Bienvenido de nuevo, <span style={{ color: '#059669' }}>{employee?.first_name}</span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setShowVacationNotifications(!showVacationNotifications)}
              style={{
                padding: '8px',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                position: 'relative',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <Bell style={{ height: '20px', width: '20px' }} />
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
            <div style={{ height: '32px', width: '1px', backgroundColor: '#e5e7eb', margin: '0 8px' }}></div>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '32px',
          scrollBehavior: 'smooth'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', height: '100%' }}>
            {renderModule()}
          </div>
        </div>
      </main>

      {/* Vacation Notification Toast */}
      {showVacationNotifications && vacationNotifications.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          width: '320px',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: '#fff7ed',
            padding: '12px 16px',
            borderBottom: '1px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#c2410c" />
              <span style={{ fontWeight: 600, color: '#9a3412', fontSize: '14px' }}>
                Solicitudes Pendientes ({vacationNotifications.length})
              </span>
            </div>
            <button
              onClick={() => setShowVacationNotifications(false)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9a3412', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {vacationNotifications.map((req, idx) => (
              <div
                key={req.id}
                onClick={() => {
                  setSelectedModule('incidents');
                  setShowVacationNotifications(false);
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: idx < vacationNotifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    Empleado #{req.employee_id}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    {new Date(req.requested_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>
                  Solicita <span style={{ fontWeight: 500 }}>{req.type === 'vacation' ? 'Vacaciones' : 'Día Personal'}</span>
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
            <div style={{ padding: '8px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setSelectedModule('incidents');
                  setShowVacationNotifications(false);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#059669',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Ver todas las solicitudes →
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modales del sistema */}
      {/* Modales del sistema */}

      {
        showMeetingModal && (
          <StrategicMeetingSystem
            isOpen={showMeetingModal}
            onClose={() => setShowMeetingModal(false)}
            onComplete={() => {
              setShowMeetingModal(false);
              window.location.reload();
            }}
          />
        )
      }

      {
        showMeetingHistoryModal && (
          <MeetingHistorySystem
            isOpen={showMeetingHistoryModal}
            onClose={() => setShowMeetingHistoryModal(false)}
            userEmail={employee?.email} // 🔧 NUEVO: Filtrar por email del usuario
          />
        )
      }

      {/* MODAL CRÍTICO: ChecklistCompleteSystem */}
      {
        showChecklist && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 9999,
            overflowY: 'auto'
          }}>
            <ChecklistCompleteSystem
              centerId={employee?.center_id?.toString() || '9'}
              centerName={employee?.centerName || 'Centro'}
              onClose={() => setShowChecklist(false)}
            />
          </div>
        )
      }

      {/* MODAL CRÍTICO: Historial de Checklists */}
      {
        showChecklistHistory && selectedCenterForHistory && (
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
        )
      }
    </div >
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
  const [forceShowContent, setForceShowContent] = useState(false);

  // 🔧 TIMEOUT DE SEGURIDAD: Si loading está activo más de 5 segundos, forzar mostrar contenido
  useEffect(() => {
    if (loading) {
      console.log('⏱️ Loading activo, iniciando timeout de seguridad...');
      const timeout = setTimeout(() => {
        console.log('⚠️ Timeout de seguridad alcanzado, forzando mostrar contenido');
        setForceShowContent(true);
      }, 5000); // 5 segundos máximo

      return () => clearTimeout(timeout);
    } else {
      setForceShowContent(false);
    }
  }, [loading]);

  if (loading && !forceShowContent) {
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