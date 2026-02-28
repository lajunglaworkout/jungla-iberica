// src/app/AppHeader.tsx
import React from 'react';
import { Menu } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { NotificationBell, NotificationPanel } from '../components/notifications/NotificationPanel';

interface AppHeaderProps {
  title: string;
  isMobile: boolean;
  showNotificationPanel: boolean;
  onToggleSidebar: () => void;
  onToggleNotifications: () => void;
  onCloseNotifications: () => void;
  onNavigate: (moduleId: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title, isMobile, showNotificationPanel,
  onToggleSidebar, onToggleNotifications, onCloseNotifications, onNavigate,
}) => {
  const { employee } = useSession();

  const handleNotificationNavigate = (linkPath: string) => {
    const moduleId = linkPath.replace(/^\//, '');

    if (moduleId === 'logistics-quarterly' || moduleId === 'logistics') {
      onNavigate('logistics');
      setTimeout(() => window.dispatchEvent(new CustomEvent('logistics-module-view', { detail: { view: 'quarterly' } })), 100);
    } else if (moduleId === 'center-management-quarterly') {
      onNavigate('center-management');
      setTimeout(() => window.dispatchEvent(new CustomEvent('center-management-view', { detail: { view: 'quarterly-review' } })), 100);
    } else {
      onNavigate(moduleId);
    }

    onCloseNotifications();
  };

  return (
    <header style={{
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 30,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            style={{ padding: '8px', backgroundColor: '#f0fdf4', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Menu size={20} className="text-emerald-600" />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {title}
          </h2>
          {!isMobile && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
              Bienvenido de nuevo, <span style={{ color: '#059669' }}>{employee?.first_name}</span>
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <NotificationBell onClick={onToggleNotifications} isOpen={showNotificationPanel} />
          <NotificationPanel
            isOpen={showNotificationPanel}
            onClose={onCloseNotifications}
            onNavigate={handleNotificationNavigate}
          />
        </div>
        <div style={{ height: '32px', width: '1px', backgroundColor: '#e5e7eb', margin: '0 8px' }} />
        <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </header>
  );
};
