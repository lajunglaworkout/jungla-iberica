// src/components/hr/CenterQRDisplay.tsx - Pantalla QR para el Centro
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import QRGenerator from './QRGenerator';
import { useIsMobile } from '../../hooks/useIsMobile';

interface CenterQRDisplayProps {
  onBack?: () => void;
  centerInfo: {
    id: number;
    name: string;
    location: string;
  };
  fullscreen?: boolean;
}

const CenterQRDisplay: React.FC<CenterQRDisplayProps> = ({
  onBack,
  centerInfo,
  fullscreen = false
}) => {
  const isMobile = useIsMobile();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const containerStyle = fullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f9fafb',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: isMobile ? '16px' : '24px',
    overflowY: 'auto' as const
  } : {
    padding: isMobile ? '16px' : '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    overflowY: 'auto' as const
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', flex: 1 }}>
        {/* Header con botón de volver SIEMPRE visible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: isMobile ? '20px' : '32px' }}>
          {onBack && (
            <button 
              onClick={onBack}
              style={{ 
                padding: isMobile ? '10px 16px' : '8px 16px', 
                backgroundColor: '#f3f4f6', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? '16px' : '14px',
                fontWeight: '500'
              }}
            >
              <ArrowLeft size={isMobile ? 20 : 16} /> Volver
            </button>
          )}
          <h1 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 'bold', margin: 0 }}>
            🏢 Fichaje del Centro
          </h1>
        </div>

        {/* Status Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: isMobile ? '12px' : '16px',
          marginBottom: isMobile ? '16px' : '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '12px' : '0'
        }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '16px', width: isMobile ? '100%' : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#059669" />
              <span style={{ fontWeight: '600', fontSize: isMobile ? '14px' : '16px' }}>
                {centerInfo.name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isOnline ? (
                <Wifi size={16} color="#10b981" />
              ) : (
                <WifiOff size={16} color="#ef4444" />
              )}
              <span style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                color: isOnline ? '#10b981' : '#ef4444',
                fontWeight: '500'
              }}>
                {isOnline ? 'Conectado' : 'Sin conexión'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#6b7280" />
            <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
              {currentTime.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Main QR Display */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: isMobile ? '20px' : '32px',
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Title */}
          <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
            <h2 style={{ 
              fontSize: isMobile ? '24px' : (fullscreen ? '36px' : '28px'), 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              color: '#111827'
            }}>
              📱 Escanea para Fichar
            </h2>
            <p style={{ 
              fontSize: isMobile ? '14px' : (fullscreen ? '18px' : '16px'), 
              color: '#6b7280',
              margin: 0
            }}>
              Usa tu móvil para escanear el código QR
            </p>
          </div>

          {/* QR Code */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <QRGenerator 
              centerId={centerInfo.id}
              centerName={centerInfo.name}
            />
          </div>

          {/* Instructions */}
          <div style={{
            marginTop: '32px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #bbf7d0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{ 
              margin: '0 0 12px 0',
              color: '#065f46',
              fontSize: fullscreen ? '18px' : '16px',
              fontWeight: 'bold'
            }}>
              📋 Instrucciones:
            </h4>
            <ol style={{ 
              margin: 0,
              paddingLeft: '20px',
              fontSize: fullscreen ? '16px' : '14px',
              color: '#047857',
              lineHeight: '1.6',
              textAlign: 'left'
            }}>
              <li>Abre la app de La Jungla en tu móvil</li>
              <li>Toca "Fichar Entrada/Salida"</li>
              <li>Escanea este código QR</li>
              <li>Confirma tu ubicación</li>
              <li>¡Fichaje completado!</li>
            </ol>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#9ca3af'
        }}>
          <p style={{ margin: 0 }}>
            🔒 Código seguro • Se renueva cada 30 segundos • Solo para empleados de {centerInfo.name}
          </p>
          <p style={{ margin: '8px 0 0 0' }}>
            {currentTime.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Fullscreen Toggle */}
      {!fullscreen && (
        <button
          onClick={() => {
            // Activar pantalla completa
            document.documentElement.requestFullscreen?.();
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          📺 Pantalla Completa
        </button>
      )}
    </div>
  );
};

export default CenterQRDisplay;
