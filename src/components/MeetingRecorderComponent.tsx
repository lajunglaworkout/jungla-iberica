import React, { useState, useRef } from 'react';
import { Mic, Square, Download, Loader } from 'lucide-react';
import {
  AudioRecorder,
  saveMeetingRecording
} from '../services/meetingRecordingService';
import {
  transcribeAudioViaBackend,
  generateMeetingMinutesViaBackend,
  saveRecordingToStorage
} from '../services/transcriptionBackendService';
import MeetingResultsPanel from './meetings/MeetingResultsPanel';

interface MeetingRecorderProps {
  meetingId: number;
  meetingTitle: string;
  participants: string[];
  onRecordingComplete?: (data: {
    transcript: string;
    minutes: string;
    tasks: any[];
  }) => void;
}

export const MeetingRecorderComponent: React.FC<MeetingRecorderProps> = ({
  meetingId,
  meetingTitle,
  participants,
  onRecordingComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState<string>('');
  const [meetingMinutes, setMeetingMinutes] = useState<string>('');
  const [tasksAssigned, setTasksAssigned] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  const recorderRef = useRef(new AudioRecorder());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob | null>(null);

  const handleStartRecording = async () => {
    setError('');
    const success = await recorderRef.current.startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setError('No se pudo acceder al micrófono');
    }
  };

  const handleStopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Obtener blob de audio
      const audioBlob = await recorderRef.current.stopRecording();
      if (!audioBlob) {
        throw new Error('No se pudo obtener la grabación');
      }

      audioChunksRef.current = audioBlob;

      // Transcribir audio usando backend proxy
      console.log('📝 Transcribiendo audio...');
      const transcriptResult = await transcribeAudioViaBackend(audioBlob);
      
      if (!transcriptResult.success || !transcriptResult.transcript) {
        throw new Error(transcriptResult.error || 'Error en transcripción');
      }

      setTranscript(transcriptResult.transcript);

      // Generar acta usando backend proxy
      console.log('📋 Generando acta...');
      const minutesResult = await generateMeetingMinutesViaBackend(
        transcriptResult.transcript,
        meetingTitle,
        participants
      );

      if (!minutesResult.success || !minutesResult.minutes) {
        throw new Error(minutesResult.error || 'Error generando acta');
      }

      setMeetingMinutes(minutesResult.minutes);
      setTasksAssigned(minutesResult.tasks || []);

      // Guardar en Supabase
      console.log('💾 Guardando en Supabase...');
      const saveResult = await saveMeetingRecording(
        meetingId,
        audioBlob,
        transcriptResult.transcript,
        minutesResult.minutes,
        minutesResult.tasks || []
      );

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Error guardando grabación');
      }

      setShowResults(true);

      // Callback
      if (onRecordingComplete) {
        onRecordingComplete({
          transcript: transcriptResult.transcript,
          minutes: minutesResult.minutes,
          tasks: minutesResult.tasks || []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
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


      {/* Controles de Grabación */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        {!isRecording && !isProcessing && (
          <>
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

          </>
        )}

        {isRecording && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '2px solid #ef4444'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }} />
              <span style={{ fontWeight: '600', color: '#ef4444' }}>
                Grabando: {formatTime(recordingTime)}
              </span>
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
          employees={[]}
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
