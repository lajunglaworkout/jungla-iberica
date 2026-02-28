/**
 * TranscriptionSection — Sección de transcripción con tres modos:
 * 1. Pegar texto manualmente
 * 2. Dictado en tiempo real con Web Speech API (gratis, sin API)
 * 3. Grabar audio → Gemini (fallback, requiere Edge Function)
 */
import React, { useState } from 'react';
import { VoiceTranscriptionSection } from './VoiceTranscriptionSection';
import { MeetingRecorderComponent } from '../MeetingRecorderComponent';
import { ui } from '../../utils/ui';

interface TranscriptionSectionProps {
  manualTranscript: string;
  showRecorder: boolean;
  meeting?: Record<string, unknown>;
  participants?: string[];
  departmentId: string;
  onManualTranscriptChange: (value: string) => void;
  onShowRecorder: (show: boolean) => void;
  onRecordingComplete: (transcript: string) => void;
}

export const TranscriptionSection: React.FC<TranscriptionSectionProps> = ({
  manualTranscript,
  showRecorder,
  meeting,
  participants,
  departmentId,
  onManualTranscriptChange,
  onShowRecorder,
  onRecordingComplete
}) => {
  const [showVoice, setShowVoice] = useState(false);

  const hasTranscript = manualTranscript.trim().length > 0;

  return (
    <div style={{
      borderTop: '2px solid #e5e7eb',
      margin: '24px 0',
      paddingTop: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
          📝 Transcripción de la Reunión
        </h3>
        {hasTranscript && (
          <span style={{
            fontSize: '12px', color: '#059669', backgroundColor: '#f0fdf4',
            padding: '4px 10px', borderRadius: '20px', border: '1px solid #86efac'
          }}>
            ✅ {manualTranscript.trim().split(/\s+/).length} palabras
          </span>
        )}
      </div>

      {/* Textarea principal */}
      <textarea
        placeholder="Opción 1: Pega aquí la transcripción (iPhone, Meet, Zoom, manual...)"
        value={manualTranscript}
        onChange={(e) => onManualTranscriptChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: `2px solid ${hasTranscript ? '#86efac' : '#d1d5db'}`,
          borderRadius: '8px',
          fontSize: '14px',
          minHeight: '150px',
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
          marginBottom: '12px',
          transition: 'border-color 0.2s'
        }}
      />

      {/* Botones de modo */}
      {!showVoice && !showRecorder && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Opción 2: Dictado en tiempo real */}
          <button
            onClick={() => { setShowVoice(true); onShowRecorder(false); }}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🎙️ DICTADO EN TIEMPO REAL
            <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 'normal' }}>(gratis)</span>
          </button>

          {/* Opción 3: Grabar audio → Gemini */}
          <button
            onClick={() => { onShowRecorder(true); setShowVoice(false); }}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ⏺️ GRABAR AUDIO
            <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 'normal' }}>(IA nube)</span>
          </button>
        </div>
      )}

      {/* Modo dictado en tiempo real */}
      {showVoice && (
        <VoiceTranscriptionSection
          value={manualTranscript}
          onChange={onManualTranscriptChange}
          onClose={() => {
            setShowVoice(false);
            if (manualTranscript.trim()) {
              ui.success('✅ Transcripción lista. Revísala y haz click en "GENERAR ACTA Y ASIGNAR TAREAS"');
            }
          }}
        />
      )}

      {/* Modo grabación de audio (Gemini) */}
      {showRecorder && (
        <MeetingRecorderComponent
          meetingId={meeting?.id as number || 0}
          meetingTitle={meeting?.title as string || 'Nueva Reunión'}
          participants={participants || []}
          departmentId={departmentId}
          onRecordingComplete={(data) => {
            onRecordingComplete(data.transcript);
            onShowRecorder(false);
            ui.success('✅ Transcripción guardada. Revísala y haz click en "GENERAR ACTA Y ASIGNAR TAREAS"');
          }}
          onClose={() => onShowRecorder(false)}
        />
      )}
    </div>
  );
};
