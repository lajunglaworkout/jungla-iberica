// src/components/hr/QRScanner.tsx - Escáner QR para empleados
import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, CameraOff, CheckCircle, XCircle, MapPin, Clock, User } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import { supabase } from '../../lib/supabase';

interface QRScannerProps {
  onBack: () => void;
}

interface QRData {
  token: string;
  centerId: number;
  centerName: string;
  employeeId?: string;
  employeeName?: string;
  timestamp: number;
  expiresAt: number;
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
}

const QRScanner: React.FC<QRScannerProps> = ({ onBack }) => {
  const { employee } = useSession();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Verificar permisos de cámara
    checkCameraPermission();
    // Obtener ubicación
    getCurrentLocation();
    
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.log('Error checking camera permission:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no disponible en este dispositivo');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setError('No se pudo obtener la ubicación. Verifica los permisos.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const startScanning = async () => {
    try {
      setError(null);
      setSuccess(null);
      setIsScanning(true);

      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await codeReader.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No se encontraron cámaras disponibles');
      }

      // Preferir cámara trasera si está disponible
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

      await codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            handleQRResult(result.getText());
          }
          if (error && !(error instanceof Error)) {
            console.log('Scanning...', error);
          }
        }
      );

      setCameraPermission('granted');
    } catch (error: any) {
      console.error('Error iniciando escáner:', error);
      setError(`Error accediendo a la cámara: ${error.message}`);
      setIsScanning(false);
      setCameraPermission('denied');
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
  };

  const handleQRResult = async (qrText: string) => {
    try {
      setLoading(true);
      stopScanning();

      // Parsear datos del QR
      const qrData: QRData = JSON.parse(qrText);
      
      // Verificar que el QR no haya expirado
      if (Date.now() > qrData.expiresAt) {
        throw new Error('El código QR ha expirado. Solicita uno nuevo.');
      }

      // Verificar token en la base de datos
      const { data: tokenData, error: tokenError } = await supabase
        .from('qr_tokens')
        .select('*')
        .eq('token', qrData.token)
        .eq('is_used', false)
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Código QR inválido o ya utilizado');
      }

      // Marcar token como usado
      await supabase
        .from('qr_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);

      // Registrar fichaje
      await registerTimeclock(qrData, tokenData);

      setScanResult(qrText);
      setSuccess(`¡Fichaje registrado correctamente en ${qrData.centerName}!`);

    } catch (error: any) {
      console.error('Error procesando QR:', error);
      setError(error.message || 'Error procesando el código QR');
    } finally {
      setLoading(false);
    }
  };

  const registerTimeclock = async (qrData: QRData, tokenData: any) => {
    if (!employee?.email) {
      throw new Error('No se pudo identificar al empleado');
    }

    // Obtener ID del empleado
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('email', employee.email)
      .single();

    if (employeeError || !employeeData) {
      throw new Error('Empleado no encontrado en la base de datos');
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Verificar si ya existe un registro para hoy
    const { data: existingRecord, error: recordError } = await supabase
      .from('timeclock_records')
      .select('*')
      .eq('employee_id', employeeData.id)
      .eq('date', today)
      .maybeSingle();

    if (recordError && recordError.code !== 'PGRST116') {
      throw recordError;
    }

    if (existingRecord) {
      // Si ya hay entrada pero no salida, registrar salida
      if (existingRecord.clock_in && !existingRecord.clock_out) {
        const clockIn = new Date(existingRecord.clock_in);
        const clockOut = new Date(now);
        const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

        await supabase
          .from('timeclock_records')
          .update({
            clock_out: now,
            total_hours: Math.round(totalHours * 100) / 100,
            location_out: location ? `${location.lat},${location.lng}` : null
          })
          .eq('id', existingRecord.id);

        setSuccess(`¡Salida registrada! Tiempo trabajado: ${Math.round(totalHours * 100) / 100} horas`);
      } else {
        throw new Error('Ya tienes fichajes completos para hoy');
      }
    } else {
      // Registrar nueva entrada
      await supabase
        .from('timeclock_records')
        .insert({
          employee_id: employeeData.id,
          date: today,
          clock_in: now,
          location_in: location ? `${location.lat},${location.lng}` : null,
          center_id: qrData.centerId
        });

      setSuccess('¡Entrada registrada correctamente!');
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            📱 Fichar Entrada/Salida
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Escanea el código QR del centro para fichar
          </p>
        </div>

        {/* Employee Info */}
        {employee && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <User size={20} color="#059669" />
            <div>
              <div style={{ fontWeight: '600' }}>{employee.name}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{employee.email}</div>
            </div>
          </div>
        )}

        {/* Camera View */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {!isScanning ? (
            <div>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
              <h3 style={{ margin: '0 0 16px 0' }}>Cámara lista para escanear</h3>
              <button
                onClick={startScanning}
                disabled={cameraPermission === 'denied'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: cameraPermission === 'denied' ? '#9ca3af' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: cameraPermission === 'denied' ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                <Camera size={20} />
                {cameraPermission === 'denied' ? 'Cámara no disponible' : 'Iniciar Escáner'}
              </button>
            </div>
          ) : (
            <div>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '300px',
                  borderRadius: '8px',
                  backgroundColor: '#000'
                }}
                autoPlay
                muted
                playsInline
              />
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={stopScanning}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  <CameraOff size={16} />
                  Detener
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {loading && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <Clock size={20} style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, color: '#92400e' }}>Procesando fichaje...</p>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <CheckCircle size={20} color="#10b981" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, color: '#065f46', fontWeight: '600' }}>{success}</p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <XCircle size={20} color="#ef4444" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, color: '#dc2626' }}>{error}</p>
            <button
              onClick={() => {
                setError(null);
                getCurrentLocation();
              }}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Location Status */}
        {location && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={16} />
            Ubicación obtenida (precisión: {Math.round(location.accuracy)}m)
          </div>
        )}

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ← Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
