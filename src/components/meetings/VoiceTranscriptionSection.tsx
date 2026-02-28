/**
 * VoiceTranscriptionSection — Transcripción en tiempo real con Web Speech API
 *
 * Gratis, sin API externa, funciona en Chrome/Edge.
 * El texto transcrito va apareciendo en tiempo real en el textarea.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, RefreshCw } from 'lucide-react';

interface VoiceTranscriptionSectionProps {
  value: string;
  onChange: (text: string) => void;
  onClose: () => void;
}

// Tipos para Web Speech API (no incluidos en TypeScript por defecto)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export const VoiceTranscriptionSection: React.FC<VoiceTranscriptionSectionProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTextRef = useRef(value);

  // Sincronizar ref con prop
  useEffect(() => {
    finalTextRef.current = value;
  }, [value]);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    setError('');
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (finalChunk) {
        const newFinal = finalTextRef.current + finalChunk;
        finalTextRef.current = newFinal;
        onChange(newFinal);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return; // Normal, no es error real
      if (event.error === 'aborted') return;   // Usuario paró manualmente
      setError(`Error: ${event.error}. Asegúrate de dar permiso al micrófono.`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText('');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const clearTranscript = () => {
    finalTextRef.current = '';
    onChange('');
    setInterimText('');
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!isSupported) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d', fontSize: '14px', color: '#92400e' }}>
        ⚠️ Tu navegador no soporta transcripción por voz. Usa Chrome o Edge. Puedes pegar la transcripción manualmente arriba.
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f0fdf4',
      border: '2px solid #86efac',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: isListening ? '#ef4444' : '#d1d5db',
            animation: isListening ? 'pulse 1s infinite' : 'none'
          }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>
            {isListening ? `🎙️ Escuchando... ${formatTime(recordingTime)}` : '🎙️ Transcripción en Tiempo Real'}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>×</button>
      </div>

      <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '12px', margin: '0 0 12px 0' }}>
        Habla y el texto aparece solo. Gratis, sin API. Funciona en Chrome/Edge.
      </p>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {!isListening ? (
          <button
            onClick={startListening}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#ef4444', color: 'white',
              border: 'none', borderRadius: '8px', padding: '10px 16px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            <Mic size={16} /> Iniciar Dictado
          </button>
        ) : (
          <button
            onClick={stopListening}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#374151', color: 'white',
              border: 'none', borderRadius: '8px', padding: '10px 16px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            <MicOff size={16} /> Pausar
          </button>
        )}
        <button
          onClick={clearTranscript}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#fee2e2', color: '#dc2626',
            border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 16px',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Borrar
        </button>
        {value && !isListening && (
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#059669', color: 'white',
              border: 'none', borderRadius: '8px', padding: '10px 16px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            ✅ Usar esta transcripción
          </button>
        )}
      </div>

      {/* Texto transcrito en tiempo real */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #d1fae5',
        borderRadius: '8px',
        padding: '12px',
        minHeight: '100px',
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#1f2937',
        position: 'relative'
      }}>
        {value || interimText ? (
          <>
            <span>{value}</span>
            {interimText && (
              <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{interimText}</span>
            )}
          </>
        ) : (
          <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            {isListening ? 'Hablando...' : 'El texto transcrito aparecerá aquí'}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: '6px', fontSize: '13px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
};

export default VoiceTranscriptionSection;
