// src/components/hr/QRGenerator.tsx
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { cleanupExpiredQRTokens, createQRToken } from '../../services/hrService';
import { RefreshCw, MapPin, Clock, Shield } from 'lucide-react';

interface QRGeneratorProps {
  centerId: number;
  centerName: string;
  employeeId?: string;
  employeeName?: string;
}

interface QRToken {
  token: string;
  expiresAt: string;
  timeRemaining: number;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ centerId, centerName, employeeId, employeeName }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentToken, setCurrentToken] = useState<QRToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateNewQR();

    // Generar nuevo QR cada 60 segundos
    intervalRef.current = setInterval(() => {
      generateNewQR();
    }, 60 * 1000); // 60 segundos

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [centerId, employeeId, employeeName]);

  const generateNewQR = async () => {
    setLoading(true);
    setError(null);

    try {
      // Limpiar tokens expirados manualmente
      await cleanupExpiredQRTokens();

      // Generar nuevo token único por empleado
      const employeePrefix = employeeId ? `emp_${employeeId}` : `center_${centerId}`;
      const token = `qr_${employeePrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 60 * 1000); // 60 segundos desde ahora

      // Guardar token en la base de datos
      const { success, error: insertError } = await createQRToken({
        center_id: centerId,
        employee_id: employeeId || null,
        token: token,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });

      if (!success) throw new Error(insertError);

      // Crear datos del QR
      const qrData = {
        token: token,
        centerId: centerId,
        centerName: centerName,
        employeeId: employeeId || null,
        employeeName: employeeName || null,
        timestamp: Date.now(),
        expiresAt: expiresAt.getTime()
      };

      // Generar código QR
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#059669',
          light: '#FFFFFF'
        }
      });

      setQrDataUrl(qrDataUrl);
      setCurrentToken({
        token: token,
        expiresAt: expiresAt.toISOString(),
        timeRemaining: 60 // 60 segundos
      });

      // Iniciar countdown
      startCountdown();

    } catch (error: unknown) {
      console.error('Error generando QR:', error);
      setError(`Error generando código QR: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCurrentToken(prev => {
        if (!prev) return null;

        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return { ...prev, timeRemaining: 0 };
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (timeRemaining: number): string => {
    if (timeRemaining > 20) return '#10b981'; // Verde
    if (timeRemaining > 10) return '#f59e0b';  // Amarillo
    return '#ef4444'; // Rojo
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          margin: '0 0 8px 0',
          color: '#059669',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {employeeName ? `👤 ${employeeName}` : `🏢 ${centerName}`}
        </h3>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Código QR para Fichaje
        </p>
      </div>

      {/* QR Code */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px'
          }}>
            <RefreshCw size={48} style={{
              color: '#059669',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{
              marginTop: '16px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Generando código QR...
            </p>
          </div>
        ) : error ? (
          <div style={{
            color: '#ef4444',
            padding: '40px',
            fontSize: '14px'
          }}>
            <Shield size={48} style={{ margin: '0 auto 16px' }} />
            <p>{error}</p>
            <button
              onClick={generateNewQR}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <img
            src={qrDataUrl}
            alt="Código QR para fichaje"
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        )}
      </div>

      {/* Status Info */}
      {currentToken && !loading && !error && (
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Clock size={20} style={{
              color: getStatusColor(currentToken.timeRemaining),
              marginRight: '8px'
            }} />
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: getStatusColor(currentToken.timeRemaining)
            }}>
              {formatTime(currentToken.timeRemaining)}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <div>Token: {currentToken.token.substring(0, 8)}...</div>
            <div>Expira: {new Date(currentToken.expiresAt).toLocaleTimeString()}</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #d1fae5',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'left'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          color: '#065f46',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          📱 Instrucciones para empleados:
        </h4>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: '#047857',
          lineHeight: '1.5'
        }}>
          <li>Abre la app en tu móvil</li>
          <li>Toca "Fichar Entrada/Salida"</li>
          <li>Escanea este código QR</li>
          <li>Confirma tu ubicación</li>
          <li>¡Fichaje completado!</li>
        </ul>
      </div>

      {/* Manual Refresh */}
      <button
        onClick={generateNewQR}
        disabled={loading}
        style={{
          marginTop: '16px',
          padding: '10px 20px',
          backgroundColor: loading ? '#9ca3af' : '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%'
        }}
      >
        <RefreshCw size={16} style={{
          animation: loading ? 'spin 1s linear infinite' : 'none'
        }} />
        {loading ? 'Generando...' : 'Generar Nuevo QR'}
      </button>

      {/* Security Notice */}
      <div style={{
        marginTop: '16px',
        fontSize: '11px',
        color: '#9ca3af',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }}>
        <Shield size={12} />
        Código seguro • Se renueva cada 30 segundos
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QRGenerator;
