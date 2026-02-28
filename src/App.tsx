// src/App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertTriangle, Package } from 'lucide-react';

import { useIsMobile } from './hooks/useIsMobile';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { ToastContainer } from './components/ui/ToastContainer';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { supabase } from './lib/supabase';
import LoginForm from './components/LoginForm';

import { AppSidebar } from './app/AppSidebar';
import { AppHeader } from './app/AppHeader';
import { VacationNotificationToast } from './app/VacationNotificationToast';
import { getAvailableModules } from './app/moduleRegistry';

// Module components used in renderModule
import { FranquiciadoDashboard } from './components/franquiciados/FranquiciadoDashboard';
import SignaturePage from './pages/SignaturePage';
import DashboardPage from './pages/DashboardPage';
import MyTasksPage from './pages/MyTasksPage';
import HRManagementSystem from './components/HRManagementSystem';
import LogisticsManagementSystem from './components/LogisticsManagementSystem';
import { MarketingDashboard } from './components/marketing/MarketingDashboard';
import CenterManagementSystem from './components/centers/CenterManagementSystem';
import { AcademyDashboard } from './components/academy/Dashboard/AcademyDashboard';
import { OnlineDashboard } from './components/online/OnlineDashboard';
import IncidentManagementSystem from './components/incidents/IncidentManagementSystem';
import PendingTasksSystem from './components/PendingTasksSystem';
import MaintenanceDirectorDashboard from './components/maintenance/MaintenanceDirectorDashboard';
import StrategicMeetingSystem from './components/StrategicMeetingSystem';
import MeetingHistorySystem from './components/MeetingHistorySystem';
import ChecklistCompleteSystem from './components/ChecklistCompleteSystem';
import ChecklistHistory from './components/ChecklistHistory';

// ============ NAVIGATION DASHBOARD ============
const NavigationDashboard: React.FC = () => {
  const { employee, userRole } = useSession();
  const isMobile = useIsMobile();

  const [selectedModule, setSelectedModule] = useState<string | null>(
    () => localStorage.getItem('lastSelectedModule') ?? 'main-dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showMeetingHistoryModal, setShowMeetingHistoryModal] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showChecklistHistory, setShowChecklistHistory] = useState(false);
  const [selectedCenterForHistory, setSelectedCenterForHistory] = useState<string | null>(null);
  const [vacationNotifications, setVacationNotifications] = useState<Record<string, unknown>[]>([]);
  const [showVacationNotifications, setShowVacationNotifications] = useState(false);

  // ALL HOOKS MUST COME BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [isMobile]);

  useEffect(() => {
    if (selectedModule) localStorage.setItem('lastSelectedModule', selectedModule);
  }, [selectedModule]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/firma/')) setSelectedModule(`firma-${hash.replace('#/firma/', '')}`);
  }, []);

  const loadVacationNotifications = async () => {
    if (userRole !== 'center_manager') return;
    try {
      const centerId = Number(employee?.center_id ?? 9);
      const { data: centerEmployees, error: centerError } = await supabase
        .from('employees').select('id').eq('center_id', centerId);
      if (centerError || !centerEmployees?.length) { setVacationNotifications([]); return; }

      const { data: requests, error: requestError } = await supabase
        .from('vacation_requests').select('*')
        .in('employee_id', centerEmployees.map(e => e.id))
        .eq('status', 'pending').order('requested_at', { ascending: false });
      setVacationNotifications(requestError ? [] : (requests ?? []));
    } catch {
      setVacationNotifications([]);
    }
  };

  useEffect(() => {
    if (userRole !== 'center_manager') return;
    loadVacationNotifications();
    const interval = setInterval(loadVacationNotifications, 30000);
    return () => clearInterval(interval);
  }, [userRole, employee?.id]);

  // Memoize modules to avoid rebuilding on every render
  const modules = useMemo(
    () => getAvailableModules(userRole, employee),
    [userRole, employee]
  );

  useEffect(() => {
    if (userRole === 'franquiciado') return;

    const handleModuleNavigation = (event: Event) => {
      const e = event as CustomEvent<{ moduleId?: string; fallbackUrl?: string | null; hrView?: string; logisticsView?: string }>;
      const { moduleId, fallbackUrl = null, hrView, logisticsView } = e.detail ?? {};
      if (!moduleId) return;

      const target = modules.find(m => m.id === moduleId);
      if (target) {
        setSelectedModule(moduleId);
        setShowVacationNotifications(false);
        if (hrView) setTimeout(() => window.dispatchEvent(new CustomEvent('hr-module-view', { detail: { view: hrView } })), 0);
        if (logisticsView) setTimeout(() => window.dispatchEvent(new CustomEvent('logistics-module-view', { detail: { view: logisticsView } })), 0);
      } else if (fallbackUrl) {
        window.location.href = fallbackUrl;
      }
    };

    window.addEventListener('navigate-module', handleModuleNavigation as EventListener);
    return () => window.removeEventListener('navigate-module', handleModuleNavigation as EventListener);
  }, [modules, userRole]);

  // *** FRANQUICIADO: Vista exclusiva sin navegación lateral ***
  if (userRole === 'franquiciado') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#10b981', fontSize: '18px' }}>La Jungla Workout</span>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{employee?.first_name} {employee?.last_name}</p>
        </div>
        <FranquiciadoDashboard />
      </div>
    );
  }

  const renderModule = () => {
    if (selectedModule?.startsWith('firma-')) return <SignaturePage />;

    const module = modules.find(m => m.id === selectedModule);
    if (!module) return <DashboardPage />;

    if (module.id === 'main-dashboard') return <DashboardPage />;
    if (module.id === 'logistics') return <LogisticsManagementSystem />;
    if (module.id === 'incidents') return <IncidentManagementSystem />;
    if (module.id === 'pending-tasks') return <PendingTasksSystem />;
    if (module.id === 'academy') return <AcademyDashboard />;
    if (module.id === 'online') return <OnlineDashboard hideBilling={module.hideBilling as boolean ?? false} />;
    if (module.id === 'centers') return <CenterManagementSystem userEmail={employee?.email ?? ''} userName={employee?.first_name ?? ''} onBack={() => setSelectedModule('main-dashboard')} />;
    if (module.id === 'maintenance' && (userRole === 'admin' || userRole === 'superadmin')) return <MaintenanceDirectorDashboard />;
    if (module.id === 'my-tasks') return <MyTasksPage userEmail={employee?.email ?? ''} userName={`${employee?.first_name ?? ''} ${employee?.last_name ?? ''}`} userRole={userRole ?? 'employee'} />;
    if (module.id === 'hr') return <HRManagementSystem />;
    if (module.id === 'marketing') return <MarketingDashboard />;

    if (module.component) {
      const Component = module.component;
      return <Component onBack={() => setSelectedModule('main-dashboard')} userEmail={employee?.email ?? ''} userName={employee?.first_name ?? ''} userRole={userRole ?? 'employee'} />;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#6b7280' }}>
        <Package style={{ height: '48px', width: '48px', marginBottom: '16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{module.title}</h3>
        <p style={{ fontSize: '14px' }}>Este módulo está en desarrollo.</p>
      </div>
    );
  };

  const pageTitle = modules.find(m => m.id === selectedModule)?.title ?? 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AppSidebar
        modules={modules}
        selectedModule={selectedModule}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        onModuleSelect={(id) => { setSelectedModule(id); if (isMobile) setSidebarOpen(false); }}
        onToggle={() => setSidebarOpen(prev => !prev)}
      />

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }} />
      )}

      <main style={{
        flex: 1, minWidth: 0, overflowX: 'clip',
        backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column',
        width: '100%',
        marginLeft: isMobile ? 0 : (sidebarOpen ? '280px' : '80px'),
        paddingBottom: isMobile ? '70px' : '0',
        transition: 'margin-left 0.3s ease',
      }}>
        <AppHeader
          title={pageTitle}
          isMobile={isMobile}
          showNotificationPanel={showNotificationPanel}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onToggleNotifications={() => setShowNotificationPanel(prev => !prev)}
          onCloseNotifications={() => setShowNotificationPanel(false)}
          onNavigate={setSelectedModule}
        />
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '32px', scrollBehavior: 'smooth' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', height: '100%' }}>
            {renderModule()}
          </div>
        </div>
      </main>

      {showVacationNotifications && (
        <VacationNotificationToast
          notifications={vacationNotifications as Parameters<typeof VacationNotificationToast>[0]['notifications']}
          onClose={() => setShowVacationNotifications(false)}
          onNavigateToIncidents={() => { setSelectedModule('incidents'); setShowVacationNotifications(false); }}
        />
      )}

      {showMeetingModal && (
        <StrategicMeetingSystem isOpen onClose={() => setShowMeetingModal(false)} onComplete={() => { setShowMeetingModal(false); window.location.reload(); }} />
      )}
      {showMeetingHistoryModal && (
        <MeetingHistorySystem isOpen onClose={() => setShowMeetingHistoryModal(false)} userEmail={employee?.email} />
      )}
      {showChecklist && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 9999, overflowY: 'auto' }}>
          <ChecklistCompleteSystem centerId={employee?.center_id?.toString() ?? '9'} centerName={employee?.centerName ?? 'Centro'} onClose={() => setShowChecklist(false)} />
        </div>
      )}
      {showChecklistHistory && selectedCenterForHistory && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '80%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', position: 'relative' }}>
            <button onClick={() => setShowChecklistHistory(false)} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontWeight: 'bold' }}>✕</button>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Historial de Checklists — {selectedCenterForHistory}</h2>
            <ChecklistHistory centerName={selectedCenterForHistory} />
          </div>
        </div>
      )}

      {isMobile && userRole !== 'franquiciado' && (
        <MobileBottomNav
          currentModule={selectedModule}
          userRole={userRole ?? 'employee'}
          onNavigate={(id) => {
            if (id === 'toggle-sidebar') {
              setSidebarOpen(prev => !prev);
            } else {
              setSelectedModule(id);
              setSidebarOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

// ============ LOADING SCREEN ============
const LoadingScreen: React.FC = () => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
      <Loader2 style={{ height: '48px', width: '48px', animation: 'spin 1s linear infinite', color: '#059669', margin: '0 auto 16px' }} />
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Verificando sesión...</h2>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>Cargando tu perfil y permisos</p>
    </div>
  </div>
);

// ============ ERROR SCREEN ============
const ErrorScreen: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
      <AlertTriangle style={{ height: '48px', width: '48px', color: '#dc2626', margin: '0 auto 16px' }} />
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Error de Sistema</h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: onRetry ? '16px' : '0' }}>{error}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Reintentar
        </button>
      )}
    </div>
  </div>
);

// ============ APP CONTENT (Auth Gate) ============
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, error, employee, userRole } = useSession();
  const [forceShowContent, setForceShowContent] = useState(false);

  useEffect(() => {
    if (!loading) { setForceShowContent(false); return; }
    const timeout = setTimeout(() => setForceShowContent(true), 20000);
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !forceShowContent) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!isAuthenticated) return <LoginForm />;
  if (!employee || !userRole) return <ErrorScreen error="No se pudieron cargar los datos del usuario. Contacta con el administrador." />;

  return (
    <NotificationProvider>
      <DataProvider>
        <NavigationDashboard />
      </DataProvider>
    </NotificationProvider>
  );
};

// ============ ROOT ============
const App: React.FC = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <SessionProvider>
      <GlobalErrorBoundary>
        <AppContent />
        <ToastContainer />
        <ConfirmDialog />
      </GlobalErrorBoundary>
    </SessionProvider>
  );
};

export default App;
