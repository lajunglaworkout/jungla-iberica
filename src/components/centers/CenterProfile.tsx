// src/components/centers/CenterProfile.tsx - Perfil específico para cada centro
import React, { useState, useEffect } from 'react';
import { QrCode, Wifi, WifiOff, Clock, Users, Activity, TrendingUp, MapPin } from 'lucide-react';
import CenterQRDisplay from '../hr/CenterQRDisplay';
import ChecklistCompleteSystem from '../ChecklistCompleteSystem';
import { SessionProvider } from '../../contexts/SessionContext';
import { DataProvider } from '../../contexts/DataContext';

interface CenterProfileProps {
  centerId: number;
  centerName: string;
  centerLocation: string;
}

interface CenterStats {
  employeesPresent: number;
  totalEmployees: number;
  lastActivity: string;
}

const CenterProfile: React.FC<CenterProfileProps> = ({ 
  centerId, 
  centerName, 
  centerLocation 
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'qr-display'>('dashboard');
  const [showQRDisplay, setShowQRDisplay] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats, setStats] = useState<CenterStats>({
    employeesPresent: 0,
    totalEmployees: 0,
    lastActivity: new Date().toISOString()
  });

  useEffect(() => {
    // Actualizar hora cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Monitorear conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cargar estadísticas del centro
    loadCenterStats();

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [centerId]);

  const loadCenterStats = async () => {
    // Aquí cargarías las estadísticas reales desde Supabase
    // Por ahora usamos datos simulados
    setStats({
      employeesPresent: Math.floor(Math.random() * 15) + 5,
      totalEmployees: 25,
      lastActivity: new Date().toISOString()
    });
  };

  // Mostrar pantalla QR en fullscreen
  if (activeView === 'qr-display') {
    return (
      <CenterQRDisplay
        centerInfo={{
          id: centerId,
          name: centerName,
          location: centerLocation
        }}
        fullscreen={true}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  // Mostrar checklist completo de La Jungla
  if (showChecklist) {
    return (
      <div>
        <button
          onClick={() => setShowChecklist(false)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Volver al Centro
        </button>
        
        <SessionProvider>
          <DataProvider>
            <ChecklistCompleteSystem
              centerId={centerId.toString()}
              centerName={centerName}
            />
          </DataProvider>
        </SessionProvider>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: window.innerWidth < 768 ? '16px' : '24px', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header del Centro */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          borderRadius: '16px',
          padding: window.innerWidth < 768 ? '20px' : '32px',
          marginBottom: window.innerWidth < 768 ? '20px' : '32px',
          boxShadow: '0 10px 40px rgba(5, 150, 105, 0.2)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', justifyContent: 'space-between', alignItems: window.innerWidth < 768 ? 'flex-start' : 'center', gap: window.innerWidth < 768 ? '16px' : '0' }}>
            <div>
              <h1 style={{ fontSize: window.innerWidth < 768 ? '24px' : '36px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                🏢 {centerName}
              </h1>
              <p style={{ fontSize: window.innerWidth < 768 ? '14px' : '18px', margin: '0 0 16px 0', opacity: 0.9 }}>
                📍 {centerLocation}
              </p>
              <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', gap: window.innerWidth < 768 ? '8px' : '24px', fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} />
                  <span>{stats.employeesPresent}/{stats.totalEmployees} empleados</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                  <span>{isOnline ? 'Conectado' : 'Sin conexión'}</span>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: window.innerWidth < 768 ? 'left' : 'right' }}>
              <div style={{ fontSize: window.innerWidth < 768 ? '24px' : '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                {currentTime.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
              <div style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px', opacity: 0.9 }}>
                {currentTime.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Control */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '2fr 1fr', gap: window.innerWidth < 768 ? '16px' : '24px', marginBottom: window.innerWidth < 768 ? '20px' : '32px' }}>
          {/* Botón Principal de Fichaje */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '3px solid #10b981'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📱</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#111827' }}>
              Sistema de Fichaje
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Muestra el código QR para que los empleados puedan fichar
            </p>
            
            <button
              onClick={() => setShowQRDisplay(true)}
              style={{
                width: '100%',
                padding: '24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 4px 8px rgba(5, 150, 105, 0.3)',
                marginBottom: '16px'
              }}
            >
              <QrCode size={24} />
              MOSTRAR QR DE FICHAJE
            </button>

            <button
              onClick={() => setShowChecklist(true)}
              style={{
                width: '100%',
                padding: '20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              ✅ CHECKLIST DEL CENTRO
            </button>
            
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#065f46'
            }}>
              <strong>💡 Instrucciones:</strong> Los empleados deben abrir su app personal, 
              ir a "Fichar" y escanear el QR que aparecerá en esta pantalla.
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                👥 Empleados Hoy
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                {stats.employeesPresent}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                de {stats.totalEmployees} totales
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                ⏰ Última Actividad
              </h3>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {new Date(stats.lastActivity).toLocaleTimeString('es-ES')}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                🔒 Estado del Sistema
              </h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: isOnline ? '#10b981' : '#ef4444'
              }}>
                {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {isOnline ? 'Sistema Activo' : 'Sin Conexión'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones para Empleados */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            📋 Instrucciones para Empleados
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>1️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Abrir App Personal</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Cada empleado abre la app de La Jungla en su móvil personal
              </p>
            </div>
            
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>2️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Ir a "Fichar"</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Tocar el botón "Fichar (Escanear QR)" en su menú principal
              </p>
            </div>
            
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>3️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Escanear QR</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Usar la cámara para escanear el QR que aparece en esta pantalla
              </p>
            </div>
            
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>4️⃣</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>¡Listo!</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                El fichaje se registra automáticamente con ubicación y hora
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#9ca3af'
        }}>
          <p style={{ margin: 0 }}>
            🔒 Sistema de Fichaje Seguro • La Jungla Ibérica • {centerName}
          </p>
        </div>
      </div>

      {/* Modal QR Display */}
      {showQRDisplay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <SessionProvider>
            <DataProvider>
              <CenterQRDisplay
                centerInfo={{
                  id: centerId,
                  name: centerName,
                  location: centerLocation
                }}
                fullscreen={true}
                onBack={() => setShowQRDisplay(false)}
              />
            </DataProvider>
          </SessionProvider>
        </div>
      )}

      {/* Modal Checklist */}
      {showChecklist && (
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
          <SessionProvider>
            <DataProvider>
              <ChecklistCompleteSystem
                centerId={centerId.toString()}
                centerName={centerName}
                onClose={() => setShowChecklist(false)}
              />
            </DataProvider>
          </SessionProvider>
        </div>
      )}
    </div>
  );
};

export default CenterProfile;
