// src/components/auth/CenterSessionManager.tsx - Gestor de sesiones de centro
import React, { useEffect, useState } from 'react';
import { LogOut, Clock, Shield } from 'lucide-react';

interface CenterSessionManagerProps {
  children: React.ReactNode;
  onLogout: () => void;
}

interface CenterSession {
  type: 'center';
  centerData: {
    id: number;
    name: string;
    location: string;
    type: string;
  };
  loginTime: string;
}

const CenterSessionManager: React.FC<CenterSessionManagerProps> = ({ children, onLogout }) => {
  const [session, setSession] = useState<CenterSession | null>(null);
  const [showSessionInfo, setShowSessionInfo] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedSession = localStorage.getItem('centerSession');
    if (savedSession) {
      try {
        const sessionData: CenterSession = JSON.parse(savedSession);
        setSession(sessionData);
        console.log('📱 Sesión de centro recuperada:', sessionData.centerData.name);
      } catch (error) {
        console.error('Error recuperando sesión:', error);
        localStorage.removeItem('centerSession');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('centerSession');
    setSession(null);
    console.log('🚪 Sesión de centro cerrada');
    onLogout();
  };

  const getSessionDuration = () => {
    if (!session) return '';
    
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const diffMs = now.getTime() - loginTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Session Info Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#059669',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        fontSize: '14px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={16} />
          <span style={{ fontWeight: '600' }}>
            🏢 {session.centerData.name}
          </span>
          <span style={{ opacity: 0.9 }}>
            <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Sesión activa: {getSessionDuration()}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowSessionInfo(!showSessionInfo)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ℹ️ Info
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.8)',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={12} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionInfo && (
        <div style={{
          position: 'fixed',
          top: '48px',
          right: '16px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          zIndex: 1001,
          minWidth: '250px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
            📊 Información de Sesión
          </h4>
          
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Centro:</strong> {session.centerData.name}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Ubicación:</strong> {session.centerData.location}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>ID:</strong> {session.centerData.id}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Inicio:</strong> {new Date(session.loginTime).toLocaleString('es-ES')}
            </div>
            <div>
              <strong>Duración:</strong> {getSessionDuration()}
            </div>
          </div>
          
          <button
            onClick={() => setShowSessionInfo(false)}
            style={{
              marginTop: '12px',
              padding: '4px 8px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%'
            }}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main Content with top padding */}
      <div style={{ paddingTop: '48px' }}>
        {children}
      </div>
    </div>
  );
};

export default CenterSessionManager;
