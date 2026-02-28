import React from 'react';
import { PreviousTask } from './MeetingModalTypes';

interface PreviousTasksSectionProps {
  previousTasks: PreviousTask[];
  previousTasksCompleted: Record<number, boolean>;
  previousTasksReasons: Record<number, string>;
  taskNotes: Record<string, string>;
  taskFilter: 'pending' | 'completed';
  loadingTasks: boolean;
  onSetTaskFilter: (filter: 'pending' | 'completed') => void;
  onTogglePreviousTaskCompleted: (taskId: number) => void;
  onPreviousTaskReasonChange: (taskId: number, reason: string) => void;
  onTaskNoteChange: (taskId: string, note: string) => void;
  onOpenCompletionModal: (task: PreviousTask) => void;
}

export const PreviousTasksSection: React.FC<PreviousTasksSectionProps> = ({
  previousTasks,
  previousTasksCompleted,
  previousTasksReasons,
  taskNotes,
  taskFilter,
  loadingTasks,
  onSetTaskFilter,
  onTogglePreviousTaskCompleted,
  onPreviousTaskReasonChange,
  onTaskNoteChange,
  onOpenCompletionModal
}) => {
  const filteredTasks = previousTasks.filter(t =>
    taskFilter === 'pending' ? !previousTasksCompleted[t.id] : previousTasksCompleted[t.id]
  );

  return (
    <div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px'
      }}>
        📋 Tareas de Reuniones Anteriores
      </h3>

      {/* Filtros de tareas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={async () => onSetTaskFilter('pending')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: taskFilter === 'pending' ? '#dbeafe' : '#f3f4f6',
            color: taskFilter === 'pending' ? '#1e40af' : '#4b5563'
          }}
        >
          ⏳ Pendientes
        </button>
        <button
          onClick={async () => onSetTaskFilter('completed')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: taskFilter === 'completed' ? '#dcfce7' : '#f3f4f6',
            color: taskFilter === 'completed' ? '#166534' : '#4b5563'
          }}
        >
          ✅ Completadas
        </button>
      </div>

      {loadingTasks ? (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          Cargando tareas...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          No hay tareas {taskFilter === 'pending' ? 'pendientes' : 'completadas'} anteriores
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                padding: '16px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={previousTasksCompleted[task.id] || false}
                  onChange={async () => {
                    if (!previousTasksCompleted[task.id]) {
                      onOpenCompletionModal(task);
                    } else {
                      onTogglePreviousTaskCompleted(task.id);
                    }
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <div style={{
                  fontWeight: '600',
                  color: '#166534',
                  flex: 1,
                  textDecoration: previousTasksCompleted[task.id] ? 'line-through' : 'none',
                  opacity: previousTasksCompleted[task.id] ? 0.6 : 1
                }}>
                  {task.titulo}
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '12px',
                marginLeft: '26px'
              }}>
                👤 {task.asignado_a} • 📅 {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
              </div>

              {/* Botón explícito para completar */}
              {!previousTasksCompleted[task.id] && (
                <button
                  onClick={async () => {
                    onOpenCompletionModal(task);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  ✅ Completar Tarea
                </button>
              )}

              {/* Si NO está completada, mostrar campo de motivo */}
              {!previousTasksCompleted[task.id] && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#dc2626',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    ⚠️ Motivo de no completación:
                  </label>
                  <textarea
                    placeholder="Ej: Falta de recursos, Dependencia externa, Prioridad cambiada..."
                    value={previousTasksReasons[task.id] || ''}
                    onChange={async (e) => onPreviousTaskReasonChange(task.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '60px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      backgroundColor: '#fef2f2'
                    }}
                  />
                </div>
              )}

              <textarea
                placeholder="Notas sobre esta tarea..."
                value={taskNotes[task.id] || ''}
                onChange={async (e) => onTaskNoteChange(task.id.toString(), e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '60px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
