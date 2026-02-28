import React from 'react';
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
  return (
    <div style={{
      borderTop: '2px solid #e5e7eb',
      margin: '24px 0',
      paddingTop: '24px'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px'
      }}>
        📝 Transcripción de la Reunión
      </h3>

      <textarea
        placeholder="Opción 1: Pega aquí la transcripción (iPhone, Meet, manual...)"
        value={manualTranscript}
        onChange={async (e) => onManualTranscriptChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          minHeight: '150px',
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
          marginBottom: '16px'
        }}
      />

      <div style={{
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '600',
        margin: '16px 0'
      }}>
        O
      </div>

      {!showRecorder ? (
        <button
          onClick={async () => {
            console.log('🎙️ Abriendo grabadora...');
            onShowRecorder(true);
          }}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🎙️ GRABAR DESDE CRM
        </button>
      ) : (
        <>
          {console.log('📹 Renderizando MeetingRecorderComponent')}
          <MeetingRecorderComponent
            meetingId={meeting?.id || 0}
            meetingTitle={meeting?.title || 'Nueva Reunión'}
            participants={participants || []}
            departmentId={departmentId}
            onRecordingComplete={(data) => {
              console.log('✅ Grabación completada:', data);
              onRecordingComplete(data.transcript);
              onShowRecorder(false);
              ui.success('✅ Transcripción guardada. Ahora puedes revisarla y hacer click en "GENERAR ACTA Y ASIGNAR TAREAS"');
            }}
            onClose={() => {
              console.log('❌ Cerrando grabadora');
              onShowRecorder(false);
            }}
          />
        </>
      )}
    </div>
  );
};
