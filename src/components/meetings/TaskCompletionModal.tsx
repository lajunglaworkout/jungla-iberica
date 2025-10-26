import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { completeTask } from '../../services/taskService';

interface TaskCompletionModalProps {
  isOpen: boolean;
  taskId: number;
  taskTitle: string;
  userEmail: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  taskId,
  taskTitle,
  userEmail,
  userName,
  onClose,
  onSuccess
}) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!completionNotes.trim()) {
      alert('Por favor, añade una justificación del cierre');
      return;
    }

    setLoading(true);
    try {
      const result = await completeTask(taskId, userEmail, completionNotes);
      if (result.success) {
        alert('✅ Tarea completada correctamente');
        setCompletionNotes('');
        onSuccess();
        onClose();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al completar la tarea');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1002
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '95%',
        maxWidth: '500px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            ✅ Completar Tarea
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div style={{
          padding: '24px',
          display: 'grid',
          gap: '16px'
        }}>
          {/* Información de la tarea */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#166534',
              marginBottom: '4px'
            }}>
              Tarea
            </div>
            <div style={{
              fontSize: '14px',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              {taskTitle}
            </div>
          </div>

          {/* Información del usuario */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                display: 'block',
                marginBottom: '4px'
              }}>
                Completado por
              </label>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937'
              }}>
                {userName}
              </div>
            </div>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                display: 'block',
                marginBottom: '4px'
              }}>
                Email
              </label>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937',
                wordBreak: 'break-all'
              }}>
                {userEmail}
              </div>
            </div>
          </div>

          {/* Justificación */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Justificación del Cierre *
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe qué se ha hecho para completar esta tarea..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '120px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '4px'
            }}>
              Mínimo 10 caracteres
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleComplete}
            disabled={loading || completionNotes.trim().length < 10}
            style={{
              backgroundColor: completionNotes.trim().length < 10 ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (loading || completionNotes.trim().length < 10) ? 'not-allowed' : 'pointer',
              opacity: (loading || completionNotes.trim().length < 10) ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Completando...' : 'Completar Tarea'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TaskCompletionModal;
