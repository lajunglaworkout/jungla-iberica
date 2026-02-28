// src/components/logistics/LogisticsHeader.tsx
import React from 'react';
import { Package, Bell } from 'lucide-react';
import { type LogisticsUser, type LogisticsNotification, getRolePermissions } from './LogisticsTypes';

interface Props {
  currentUser: LogisticsUser;
  setCurrentUser: (user: LogisticsUser) => void;
  notifications: LogisticsNotification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  markNotificationAsRead: (id: number) => void;
  getUnreadNotifications: () => LogisticsNotification[];
}

export const LogisticsHeader: React.FC<Props> = ({
  currentUser, setCurrentUser, notifications, showNotifications, setShowNotifications,
  markNotificationAsRead, getUnreadNotifications,
}) => {
  const unread = getUnreadNotifications();

  const ROLE_SWITCHER: Record<string, LogisticsUser> = {
    'ceo': { id: '1', name: 'Carlos Suárez (CEO)', role: 'ceo', center: 'central', permissions: getRolePermissions('ceo') },
    'logistics_director': { id: '2', name: 'Benito Morales (Dir. Logística)', role: 'logistics_director', center: 'central', permissions: getRolePermissions('logistics_director') },
    'center_manager': { id: '7', name: 'Fran Giraldez (Encargado Sevilla)', role: 'center_manager', center: 'sevilla', permissions: getRolePermissions('center_manager') },
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '2rem', borderRadius: '0 0 24px 24px', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Package size={32} style={{ color: 'white' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0 }}>Centro Logístico</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            value={currentUser.role}
            onChange={(e) => { const user = ROLE_SWITCHER[e.target.value]; if (user) setCurrentUser(user); }}
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '0.5rem', color: 'white', fontSize: '0.875rem', fontWeight: '500' }}
          >
            <option value="ceo" style={{ color: '#374151' }}>👑 Carlos Suárez (CEO)</option>
            <option value="logistics_director" style={{ color: '#374151' }}>📊 Benito Morales (Director)</option>
            <option value="center_manager" style={{ color: '#374151' }}>🏪 Ana García (Encargada)</option>
          </select>

          <div style={{ color: 'white', textAlign: 'right' }}>
            <div style={{ fontWeight: '600' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {currentUser.role === 'ceo' ? '👑 CEO' : currentUser.role === 'logistics_director' ? '📊 Director de Logística' : '🏪 Encargado de Centro'}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: 'relative', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Bell size={20} style={{ color: 'white' }} />
              {unread.length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#dc2626', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                  {unread.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', width: '350px', maxHeight: '400px', overflow: 'auto', zIndex: 1000 }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: 0, color: '#374151' }}>🔔 Notificaciones</h3>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No hay notificaciones</div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} onClick={() => markNotificationAsRead(notification.id)}
                      style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', backgroundColor: notification.read ? 'transparent' : '#f0f9ff', borderLeft: notification.urgent ? '4px solid #ef4444' : 'none' }}>
                      <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>{notification.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{notification.message}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(notification.timestamp).toLocaleString('es-ES')}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
