import React from 'react';
import { scheduleMeeting } from '../../services/meetingService';
import { ui } from '../../utils/ui';

interface NextMeetingSchedulerProps {
  meeting?: Record<string, unknown>;
  departmentId: string;
  participants?: string[];
  userEmail?: string;
  nextMeetingDate: string;
  nextMeetingTime: string;
  onSetNextMeetingDate: (date: string) => void;
  onSetNextMeetingTime: (time: string) => void;
  onClose: () => void;
  onSuccess?: () => void;
  onCloseModal: () => void;
}

export const NextMeetingScheduler: React.FC<NextMeetingSchedulerProps> = ({
  meeting,
  departmentId,
  participants,
  userEmail,
  nextMeetingDate,
  nextMeetingTime,
  onSetNextMeetingDate,
  onSetNextMeetingTime,
  onClose,
  onSuccess,
  onCloseModal
}) => {
  const handleCancel = async () => {
    onClose();
    onSetNextMeetingDate('');
    onSetNextMeetingTime('');
    onSuccess?.();
    onCloseModal();
  };

  const handleSchedule = async () => {
    if (!nextMeetingDate || !nextMeetingTime) {
      ui.info('Por favor completa la fecha y hora de la reunión');
      return;
    }

    try {
      const { success, error } = await scheduleMeeting({
        title: meeting?.title || 'Nueva Reunión',
        department: departmentId,
        date: nextMeetingDate,
        start_time: nextMeetingTime,
        participants: participants || [],
        created_by: userEmail,
        status: 'scheduled'
      });

      if (!success) throw new Error(error);

      ui.success('✅ Siguiente reunión programada correctamente!');
      onClose();
      onSetNextMeetingDate('');
      onSetNextMeetingTime('');
      onSuccess?.();
      onCloseModal();
    } catch (error) {
      console.error('Error programando reunión:', error);
      ui.error('Error al programar la reunión');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          📅 Programar Siguiente Reunión
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Fecha de la reunión
            </label>
            <input
              type="date"
              value={nextMeetingDate}
              onChange={async (e) => onSetNextMeetingDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Hora de inicio
            </label>
            <input
              type="time"
              value={nextMeetingTime}
              onChange={async (e) => onSetNextMeetingTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ❌ Cancelar
          </button>
          <button
            onClick={handleSchedule}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ✅ Programar
          </button>
        </div>
      </div>
    </div>
  );
};
