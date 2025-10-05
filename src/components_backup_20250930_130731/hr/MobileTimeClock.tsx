// src/components/hr/MobileTimeClock.tsx
import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Camera, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Loader2,
  User,
  Calendar,
  Timer
} from 'lucide-react';

interface TimeclockRecord {
  id: number;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number | null;
  date: string;
}

interface QRData {
  token: string;
  centerId: number;
  centerName: string;
  timestamp: number;
  expiresAt: number;
}

const MobileTimeClock: React.FC = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [todayRecord, setTodayRecord] = useState<TimeclockRecord | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    loadEmployeeData();
    loadTodayRecord();
    getCurrentLocation();
    
    return () => {
      stopScanning();
    };
  }, [user]);

  const loadEmployeeData = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      setEmployeeData(data);
    } catch (error: any) {
      console.error('Error cargando datos del empleado:', error);
    }
  };

  const loadTodayRecord = async () => {
    if (!user?.email) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!employee) return;

      const { data, error } = await supabase
        .from('timeclock_records')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTodayRecord(data);
    } catch (error: any) {
      console.error('Error cargando registro de hoy:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setError('No se pudo obtener la ubicación. Verifica los permisos.');
        }
      );
    } else {
      setError('Geolocalización no soportada en este dispositivo.');
    }
  };

  const startScanning = async () => {
    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      codeReader.current = new BrowserMultiFormatReader();
      
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No se encontraron cámaras disponibles');
      }

      // Preferir cámara trasera si está disponible
      const backCamera = videoInputDevices.find((device: any) => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

      await codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            setScanResult(result.getText());
            stopScanning();
            processQRCode(result.getText());
          }
        }
      );
    } catch (error: any) {
      console.error('Error iniciando escaneo:', error);
      setError(`Error accediendo a la cámara: ${error.message}`);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current && videoRef.current) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      } catch (error) {
        console.error('Error stopping video stream:', error);
      }
      codeReader.current = null;
    }
    setIsScanning(false);
  };

  const processQRCode = async (qrText: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse QR data
      const qrData: QRData = JSON.parse(qrText);
      
      // Validar que el QR no haya expirado
      if (Date.now() > qrData.expiresAt) {
        throw new Error('El código QR ha expirado. Solicita uno nuevo.');
      }

      // Verificar que el token existe y está activo
      const { data: tokenData, error: tokenError } = await supabase
        .from('qr_tokens')
        .select('*')
        .eq('token', qrData.token)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Código QR inválido o expirado.');
      }

      // Verificar ubicación (opcional - puedes ajustar la precisión)
      if (!location) {
        throw new Error('Se requiere ubicación para fichar.');
      }

      // Procesar fichaje
      await processClock(qrData, tokenData);

    } catch (error: any) {
      console.error('Error procesando QR:', error);
      setError(error.message || 'Error procesando código QR');
    } finally {
      setLoading(false);
    }
  };

  const processClock = async (qrData: QRData, tokenData: any) => {
    if (!employeeData || !location) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      if (!todayRecord) {
        // Fichaje de entrada
        const { data, error } = await supabase
          .from('timeclock_records')
          .insert({
            employee_id: employeeData.id,
            center_id: qrData.centerId,
            clock_in: now,
            date: today,
            qr_token_used: qrData.token,
            location_lat: location.lat,
            location_lng: location.lng,
            device_info: JSON.stringify({
              userAgent: navigator.userAgent,
              timestamp: Date.now()
            })
          })
          .select()
          .single();

        if (error) throw error;

        setTodayRecord(data);
        setSuccess(`✅ Entrada registrada en ${qrData.centerName} a las ${new Date().toLocaleTimeString()}`);
        
      } else if (todayRecord.clock_in && !todayRecord.clock_out) {
        // Fichaje de salida
        const { data, error } = await supabase
          .from('timeclock_records')
          .update({
            clock_out: now,
            location_lat: location.lat,
            location_lng: location.lng
          })
          .eq('id', todayRecord.id)
          .select()
          .single();

        if (error) throw error;

        setTodayRecord(data);
        const totalHours = data.total_hours ? data.total_hours.toFixed(2) : '0';
        setSuccess(`✅ Salida registrada en ${qrData.centerName} a las ${new Date().toLocaleTimeString()}. Total: ${totalHours}h`);
        
      } else {
        throw new Error('Ya has completado tu jornada de hoy.');
      }

      // Desactivar el token usado (seguridad)
      await supabase
        .from('qr_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);

    } catch (error: any) {
      throw new Error(error.message || 'Error registrando fichaje');
    }
  };

  const getStatusMessage = () => {
    if (!todayRecord) {
      return {
        message: 'Listo para fichar entrada',
        color: '#10b981',
        icon: <Clock size={20} />
      };
    } else if (todayRecord.clock_in && !todayRecord.clock_out) {
      const clockInTime = new Date(todayRecord.clock_in).toLocaleTimeString();
      return {
        message: `Entrada: ${clockInTime} - Listo para fichar salida`,
        color: '#f59e0b',
        icon: <Timer size={20} />
      };
    } else {
      const clockInTime = new Date(todayRecord.clock_in!).toLocaleTimeString();
      const clockOutTime = new Date(todayRecord.clock_out!).toLocaleTimeString();
      const hours = todayRecord.total_hours?.toFixed(2) || '0';
      return {
        message: `Jornada completa: ${clockInTime} - ${clockOutTime} (${hours}h)`,
        color: '#059669',
        icon: <CheckCircle size={20} />
      };
    }
  };

  const status = getStatusMessage();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '16px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <User size={24} style={{ color: '#059669', marginRight: '12px' }} />
          <div>
            <h2 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>
              {employeeData ? employeeData.name : 'Cargando...'}
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {employeeData?.position || 'Empleado'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: `2px solid ${status.color}`
        }}>
          {status.icon}
          <span style={{ 
            marginLeft: '8px', 
            color: status.color,
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {status.message}
          </span>
        </div>
      </div>

      {/* Scanner Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#1f2937',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          📱 Escanear Código QR
        </h3>

        {!isScanning ? (
          <div style={{ textAlign: 'center' }}>
            <Camera size={64} style={{ 
              color: '#9ca3af', 
              margin: '0 auto 16px',
              display: 'block'
            }} />
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              Toca el botón para activar la cámara y escanear el código QR del centro
            </p>
            <button
              onClick={startScanning}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Camera size={20} />
              Activar Cámara
            </button>
          </div>
        ) : (
          <div>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                backgroundColor: '#000'
              }}
              playsInline
              muted
            />
            <button
              onClick={stopScanning}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancelar Escaneo
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {loading && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Loader2 size={20} style={{ 
            color: '#d97706',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#92400e' }}>Procesando fichaje...</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <XCircle size={20} style={{ color: '#dc2626' }} />
          <span style={{ color: '#991b1b' }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={20} style={{ color: '#059669' }} />
          <span style={{ color: '#065f46' }}>{success}</span>
        </div>
      )}

      {/* Today's Summary */}
      {todayRecord && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            color: '#1f2937',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar size={20} />
            Resumen de Hoy
          </h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            {todayRecord.clock_in && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280' }}>Entrada:</span>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                  {new Date(todayRecord.clock_in).toLocaleTimeString()}
                </span>
              </div>
            )}

            {todayRecord.clock_out && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280' }}>Salida:</span>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                  {new Date(todayRecord.clock_out).toLocaleTimeString()}
                </span>
              </div>
            )}

            {todayRecord.total_hours && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <span style={{ color: '#6b7280' }}>Total Horas:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: '#059669',
                  fontSize: '18px'
                }}>
                  {todayRecord.total_hours.toFixed(2)}h
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MobileTimeClock;
