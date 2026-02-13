import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Download, Loader } from 'lucide-react';
import {
  AudioRecorder,
  saveMeetingRecording
} from '../services/meetingRecordingService';
import { transcribeAudio } from '../services/aiService';
import MeetingResultsPanel from './meetings/MeetingResultsPanel';
import { supabase } from '../lib/supabase';

interface MeetingRecorderProps {
  meetingId: number;
  meetingTitle: string;
  participants: string[];
  departmentId: string;
  leadId?: string; // ID del lead asociado (para reuniones de ventas)
  onRecordingComplete?: (data: {
    transcript: string;
    minutes: string;
    tasks: any[];
  }) => void;
  onClose?: () => void;
}

export const MeetingRecorderComponent: React.FC<MeetingRecorderProps> = ({
  meetingId,
  meetingTitle,
  participants,
  departmentId,
  leadId,
  onRecordingComplete,
  onClose
}) => {
  console.log('🏢 MeetingRecorderComponent recibió departmentId:', departmentId);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime, setMaxRecordingTime] = useState<number | null>(null);
  const [showTimerConfig, setShowTimerConfig] = useState(false);
  const [timerInput, setTimerInput] = useState('30');
  const [transcript, setTranscript] = useState<string>('');
  const [meetingMinutes, setMeetingMinutes] = useState<string>('');
  const [tasksAssigned, setTasksAssigned] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const recorderRef = useRef(new AudioRecorder());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob | null>(null);

  // Cargar empleados al montar el componente
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, name, email, departamento')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error cargando empleados:', error);
          return;
        }

        setEmployees(data || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadEmployees();
  }, []);

  const handleStartRecording = async () => {
    setError('');
    const success = await recorderRef.current.startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingTime(0);
      setShowTimerConfig(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;

          // Si hay límite de tiempo y se alcanzó, detener automáticamente
          if (maxRecordingTime && newTime >= maxRecordingTime * 60) {
            console.log('⏱️ Límite de tiempo alcanzado, deteniendo grabación...');
            handleStopRecording();
            return newTime;
          }

          return newTime;
        });
      }, 1000);
    } else {
      setError('No se pudo acceder al micrófono');
    }
  };

  const handleSetTimer = (minutes: number) => {
    setMaxRecordingTime(minutes);
    setShowTimerConfig(false);
  };

  const handleStopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Get audio blob from recorder
      const audioBlob = await recorderRef.current.stopRecording();
      if (!audioBlob) {
        throw new Error('No se pudo obtener la grabación');
      }

      audioChunksRef.current = audioBlob;

      // Transcribe audio using Supabase Edge Function → Gemini
      console.log('📝 Transcribiendo audio via Edge Function...');
      const transcriptText = await transcribeAudio(audioBlob);

      setTranscript(transcriptText);

      // Return only the transcription, NOT auto-generate minutes
      console.log('✅ Transcripción completada, devolviendo al modal...');

      if (onRecordingComplete) {
        onRecordingComplete({
          transcript: transcriptText,
          minutes: '',
          tasks: []
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al transcribir: ${errorMessage}. Puedes pegar la transcripción manualmente.`);
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadMinutes = () => {
    const element = document.createElement('a');
    const file = new Blob([meetingMinutes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `acta_${meetingTitle}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🎙️ Grabación y Generación de Acta
      </h2>


      {/* Selector de Tiempo (antes de grabar) */}
      {!isRecording && !isProcessing && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
              ⏱️ Duración máxima de grabación:
            </span>
            {maxRecordingTime ? (
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#dbeafe',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e40af'
              }}>
                {maxRecordingTime} minutos
              </span>
            ) : (
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Sin límite
              </span>
            )}
            <button
              onClick={() => setShowTimerConfig(!showTimerConfig)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {showTimerConfig ? 'Cancelar' : 'Configurar'}
            </button>
          </div>

          {showTimerConfig && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '8px'
            }}>
              {[15, 30, 45, 60, 90, 120].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => handleSetTimer(minutes)}
                  style={{
                    padding: '10px',
                    backgroundColor: maxRecordingTime === minutes ? '#3b82f6' : '#e0e7ff',
                    color: maxRecordingTime === minutes ? 'white' : '#1e40af',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {minutes}m
                </button>
              ))}
              <button
                onClick={() => setMaxRecordingTime(null)}
                style={{
                  padding: '10px',
                  backgroundColor: maxRecordingTime === null ? '#6b7280' : '#e5e7eb',
                  color: maxRecordingTime === null ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sin límite
              </button>
            </div>
          )}
        </div>
      )}

      {/* Controles de Grabación */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {!isRecording && !isProcessing && (
          <button
            onClick={handleStartRecording}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Mic size={16} />
            Iniciar Grabación
          </button>
        )}

        {isRecording && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '2px solid #ef4444',
              flex: 1,
              minWidth: '250px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#ef4444', fontSize: '16px' }}>
                  {formatTime(recordingTime)}
                </div>
                {maxRecordingTime && (
                  <div style={{ fontSize: '12px', color: '#dc2626' }}>
                    Límite: {formatTime(maxRecordingTime * 60)}
                    {' '}
                    ({Math.round((recordingTime / (maxRecordingTime * 60)) * 100)}%)
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleStopRecording}
              disabled={isProcessing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.7 : 1
              }}
            >
              <Square size={16} />
              Detener
            </button>
          </>
        )}

        {isProcessing && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            border: '2px solid #3b82f6'
          }}>
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: '600', color: '#1e40af' }}>
              Procesando grabación...
            </span>
          </div>
        )}
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Resultados */}
      {showResults && (
        <MeetingResultsPanel
          transcript={transcript}
          minutes={meetingMinutes}
          tasks={tasksAssigned}
          meetingTitle={meetingTitle}
          participants={participants}
          employees={employees}
          departmentId={departmentId}
          onClose={onClose}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MeetingRecorderComponent;
