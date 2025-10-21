// Dashboard de Fichajes Tipo Factorial
import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Coffee } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import { supabase } from '../../lib/supabase';

const TimeTrackingDashboard: React.FC = () => {
  const { employee } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWorking, setIsWorking] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleClockIn = () => {
    setIsWorking(true);
    setStartTime(new Date());
  };

  const handleClockOut = () => {
    setIsWorking(false);
    setOnBreak(false);
    setStartTime(null);
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '24px' }}>
      {/* Header Reloj */}
      <div style={{ 
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        borderRadius: '16px',
        padding: '40px',
        color: 'white',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', margin: '0 0 8px 0' }}>
          {formatTime(currentTime)}
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, margin: 0 }}>
          {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {!isWorking ? (
          <button onClick={handleClockIn} style={{ 
            padding: '24px', 
            backgroundColor: '#059669', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '18px', 
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <Play size={24} /> Iniciar Jornada
          </button>
        ) : (
          <>
            <button onClick={handleClockOut} style={{ 
              padding: '24px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '18px', 
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <Square size={24} /> Finalizar Jornada
            </button>
            
            <button onClick={() => setOnBreak(!onBreak)} style={{ 
              padding: '24px', 
              backgroundColor: onBreak ? '#f59e0b' : '#6b7280', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '18px', 
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <Coffee size={24} /> {onBreak ? 'Fin Pausa' : 'Pausa'}
            </button>
          </>
        )}
      </div>

      {/* Estado Actual */}
      {isWorking && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Estado Actual
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: onBreak ? '#f59e0b' : '#10b981',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '18px', fontWeight: '500' }}>
              {onBreak ? '☕ En pausa' : '✅ Trabajando'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingDashboard;
