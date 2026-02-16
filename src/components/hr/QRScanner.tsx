// src/components/hr/QRScanner.tsx - Escáner QR para empleados
import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, CameraOff, CheckCircle, XCircle, MapPin, Clock, User, ArrowLeft } from 'lucide-react';
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

interface ScanResultData {
  type: 'entrada' | 'salida';
  time: string;
  totalHours?: number;
  centerName: string;
  employeeName: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onBack }) => {
  const { employee } = useSession();
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [scanSuccessData, setScanSuccessData] = useState<ScanResultData | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

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
      setScanSuccessData(null);
      setIsScanning(true);

      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      // Check native camera support first
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Tu navegador no soporta acceso a cámaras.');
      }

      // 1. Get List of Devices using Native API (Robust)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoInputDevices.length === 0) {
        throw new Error('No se encontraron cámaras disponibles');
      }

      // 2. Select Back Camera logic
      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('trasera')
      );

      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

      // 3. Start Decoding
      controlsRef.current = await codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            handleQRResult(result.getText());
          }
        }
      );

      setCameraPermission('granted');
    } catch (error: any) {
      console.error('Error iniciando escáner:', error);
      let msg = error.message;
      if (error.name === 'NotAllowedError') msg = 'Permiso de cámara denegado.';
      if (error.name === 'NotFoundError') msg = 'No se encontró ninguna cámara.';

      setError(`Error: ${msg}`);
      setIsScanning(false);
      setCameraPermission('denied');
    }
  };

  const stopScanning = () => {
    if (controlsRef.current) {
      try {
        if (typeof controlsRef.current.stop === 'function') {
          controlsRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping controls:', err);
      }
      controlsRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  const handleQRResult = async (qrText: string) => {
    if (loading) return;

    // VIBRACIÓN AL DETECTAR
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    try {
      setLoading(true);
      setError(null);
      stopScanning(); // Stop immediately on detection

      // 1. Try to parse QR data
      let qrData: QRData;
      try {
        qrData = JSON.parse(qrText);
      } catch (parseError) {
        throw new Error('El código QR no es válido.');
      }

      // 2. Validate required fields
      if (!qrData.token || !qrData.centerId) {
        throw new Error('QR incompleto.');
      }

      // 3. Check expiration (Grace period of 10s for network latency)
      const GRACE_PERIOD_MS = 10000;
      if (qrData.expiresAt && Date.now() > (qrData.expiresAt + GRACE_PERIOD_MS)) {
        throw new Error('⏱️ El código QR ha expirado. Espera un nuevo código.');
      }

      // 4. Validate token against database
      const { data: tokenData, error: tokenError } = await supabase
        .from('qr_tokens')
        .select('*')
        .eq('token', qrData.token)
        .eq('is_used', false)
        .single();

      if (tokenError || !tokenData) {
        const { data: usedToken } = await supabase
          .from('qr_tokens')
          .select('is_used')
          .eq('token', qrData.token)
          .single();

        if (usedToken?.is_used) {
          throw new Error('Este código QR ya fue utilizado.');
        }
        throw new Error('Código QR no válido o expirado.');
      }

      // 5. Mark token as used
      await supabase
        .from('qr_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);

      // 6. Register timeclock entry
      await registerTimeclock(qrData, tokenData);

    } catch (error: any) {
      console.error('Error procesando QR:', error);
      setError(error.message || 'Error procesando el código QR.');
    } finally {
      setLoading(false);
    }
  };

  const registerTimeclock = async (qrData: QRData, tokenData: any) => {
    if (!employee?.email) throw new Error('Usuario no identificado');

    // 1. Obtener ID del empleado
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id, name')
      .eq('email', employee.email)
      .single();

    if (employeeError || !employeeData) throw new Error('Empleado no encontrado');

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 2. Buscar si hay un fichaje ABIERTO hoy (status='entrada' y clock_out_time es null)
    const { data: openRecord } = await supabase
      .from('time_records')
      .select('*')
      .eq('employee_id', employeeData.id)
      .eq('date', today)
      .is('clock_out_time', null)
      .eq('status', 'entrada') // Aseguramos que sea una entrada pendiente
      .maybeSingle();

    let resultData: ScanResultData;
    let type: 'entrada' | 'salida';
    let totalHours: number | undefined;

    if (openRecord) {
      // --- ES SALIDA (UPDATE) ---
      type = 'salida';

      const clockIn = new Date(openRecord.clock_in_time);
      const clockOut = new Date(now);
      const diffMs = clockOut.getTime() - clockIn.getTime();
      totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

      // Actualizamos el registro existente
      const { error: updateError } = await supabase
        .from('time_records')
        .update({
          clock_out_time: now,
          // clock_out_method: 'QRCode', // Si la columna existe en tu schema real, descomenta
          // clock_out_location: locationString // Si quisieras guardar ubicación de salida
          status: 'completado', // Marcamos como cerrado/completado
          notes: `Jornada finalizada: ${totalHours}h`
        })
        .eq('id', openRecord.id);

      if (updateError) {
        console.error('ERROR UPDATE SALIDA:', updateError);
        alert('❌ ERROR AL CERRAR FICHAJE: ' + JSON.stringify(updateError));
        throw new Error('Error al actualizar la salida: ' + updateError.message);
      }

      // Actualizar resumen diario (daily_attendance)
      // Nota: Si ya existe una entrada en daily, la actualizamos con la salida
      await supabase.from('daily_attendance').upsert({
        employee_id: employeeData.id,
        employee_name: employeeData.name,
        center_id: qrData.centerId.toString(),
        center_name: qrData.centerName,
        date: today,
        clock_out_time: now,
        total_hours: totalHours,
        status: 'presente',
        updated_at: now
      }, { onConflict: 'employee_id,date' });

      resultData = {
        type: 'salida',
        time: nowTime,
        totalHours: totalHours,
        centerName: qrData.centerName,
        employeeName: employeeData.name
      };

    } else {
      // --- ES ENTRADA (INSERT NUEVO) ---
      type = 'entrada';

      const locationString = location ? JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy
      }) : null;

      const { error: insertError } = await supabase
        .from('time_records')
        .insert({
          employee_id: employeeData.id,
          center_id: Number(qrData.centerId),
          date: today,
          clock_in_time: now,
          clock_in_method: 'QRCode',
          clock_in_location: locationString,
          clock_in_qr_token: qrData.token,
          status: 'entrada', // Estado inicial
          notes: 'Inicio de jornada'
        });

      if (insertError) {
        console.error('ERROR INSERT ENTRADA:', insertError);
        alert('❌ ERROR AL CREAR ENTRADA: ' + JSON.stringify(insertError));
        throw new Error('Error al crear la entrada: ' + insertError.message);
      }

      // Crear resumen diario
      await supabase.from('daily_attendance').upsert({
        employee_id: employeeData.id,
        employee_name: employeeData.name,
        center_id: qrData.centerId.toString(),
        center_name: qrData.centerName,
        date: today,
        clock_in_time: now,
        status: 'presente',
        updated_at: now
      }, { onConflict: 'employee_id,date' });

      resultData = {
        type: 'entrada',
        time: nowTime,
        centerName: qrData.centerName,
        employeeName: employeeData.name
      };
    }

    setScanSuccessData(resultData);
  };

  // --- RENDER SUCCES SCREEN ---
  if (scanSuccessData) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#f0fdf4', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', backgroundColor: '#dcfce7', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={48} color="#16a34a" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>
            {scanSuccessData.type === 'entrada' ? '✅ Entrada Registrada' : '✅ Salida Registrada'}
          </h2>

          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            {new Date().toLocaleDateString()}
          </p>

          <div style={{ textAlign: 'left', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Empleado</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{scanSuccessData.employeeName}</span>
            </div>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Hora</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '18px' }}>{scanSuccessData.time}</span>
              </div>
              {scanSuccessData.totalHours !== undefined && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Total Hoy</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{scanSuccessData.totalHours}h</span>
                </div>
              )}
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Centro</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{scanSuccessData.centerName}</span>
            </div>
          </div>

          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#16a34a',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', backgroundColor: '#000', minHeight: '100vh', color: 'white' }}>
      {/* Header Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
          <span style={{ fontWeight: '500' }}>Volver</span>
        </button>
      </div>

      {/* Camera Area */}
      <div style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay
              muted
              playsInline
            />

            {/* Scanner Overlay Frame */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '280px',
              height: '280px',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '24px',
              boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)', // Dim outside
              zIndex: 5
            }}>
              {/* Corners */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '40px', height: '40px', borderTop: '4px solid #10b981', borderLeft: '4px solid #10b981', borderTopLeftRadius: '24px' }}></div>
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '40px', height: '40px', borderTop: '4px solid #10b981', borderRight: '4px solid #10b981', borderTopRightRadius: '24px' }}></div>
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '40px', height: '40px', borderBottom: '4px solid #10b981', borderLeft: '4px solid #10b981', borderBottomLeftRadius: '24px' }}></div>
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '40px', height: '40px', borderBottom: '4px solid #10b981', borderRight: '4px solid #10b981', borderBottomRightRadius: '24px' }}></div>

              {/* Scanning animation line */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '2px',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #10b981',
                animation: 'scan 2s linear infinite'
              }}></div>
            </div>

            <div style={{ position: 'absolute', bottom: '100px', width: '100%', textAlign: 'center', zIndex: 10 }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Encadra el código QR</p>
            </div>

            <style>{`
                    @keyframes scan {
                        0% { top: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                `}</style>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}>
            <Camera size={64} color="#374151" style={{ marginBottom: '24px' }} />
            <button
              onClick={startScanning}
              style={{
                padding: '16px 32px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Camera size={24} />
              Escanear QR
            </button>
            {cameraPermission === 'denied' && (
              <p style={{ color: '#ef4444', marginTop: '16px', padding: '0 20px', textAlign: 'center' }}>Permiso de cámara denegado. <br /> Habilítalo en la configuración del navegador.</p>
            )}
          </div>
        )}

        {loading && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <div style={{ width: '50px', height: '50px', border: '4px solid #374151', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '16px', fontWeight: 'bold' }}>Procesando fichaje...</p>
          </div>
        )}

        {error && (
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '24px', backgroundColor: '#ef4444', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', zIndex: 30, animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <XCircle size={24} style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>Error</h3>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{error}</p>
              </div>
              <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', fontSize: '24px' }}>×</button>
            </div>
            <button onClick={startScanning} style={{ width: '100%', marginTop: '16px', padding: '12px', backgroundColor: 'white', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Reintentar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
