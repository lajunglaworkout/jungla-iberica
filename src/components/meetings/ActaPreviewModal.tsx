import React from 'react';
import { Plus, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Employee } from './MeetingModalTypes';
import { ui } from '../../utils/ui';
import { deleteMeetingFromSupabase } from '../../services/meetingService';
import type { MeetingRecord } from '../../services/meetingService';

interface GeneratedTask {
  id?: number;
  titulo: string;
  asignado_a: string;
  estado: string;
  fecha_limite: string;
  [key: string]: unknown;
}
interface ActaPreviewModalProps {
  meeting?: MeetingRecord;
  generatedMinutes: string;
  generatedTasks: GeneratedTask[];
  isEditingActa: boolean;
  isSaving: boolean;
  employees: Employee[];
  onClose: () => void;
  onCloseModal: () => void;
  onSuccess?: () => void;
  onSetGeneratedMinutes: (minutes: string) => void;
  onSetGeneratedTasks: (tasks: GeneratedTask[]) => void;
  onSetIsEditingActa: (editing: boolean) => void;
  onSave: () => void;
}

export const ActaPreviewModal: React.FC<ActaPreviewModalProps> = ({
  meeting,
  generatedMinutes,
  generatedTasks,
  isEditingActa,
  isSaving,
  employees,
  onClose,
  onCloseModal,
  onSuccess,
  onSetGeneratedMinutes,
  onSetGeneratedTasks,
  onSetIsEditingActa,
  onSave
}) => {
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
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: generatedMinutes.includes('Modo Offline') ? '#fff7ed' : '#f9fafb'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Revisar Acta Generada
              {generatedMinutes.includes('Modo Offline') && (
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: '#ffedd5',
                  color: '#c2410c',
                  borderRadius: '9999px',
                  border: '1px solid #fdba74'
                }}>
                  Modo Offline
                </span>
              )}
            </h2>
            {generatedMinutes.includes('Modo Offline') && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#c2410c' }}>
                ⚠️ Sin conexión a IA (API Key no configurada). Se ha generado una plantilla básica.
              </p>
            )}
          </div>
          <button
            onClick={async () => onClose()}
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

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Acta */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                📄 Acta de la Reunión
              </h3>
              <button
                onClick={async () => onSetIsEditingActa(!isEditingActa)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: isEditingActa ? '#059669' : '#f3f4f6',
                  border: '1px solid',
                  borderColor: isEditingActa ? '#059669' : '#d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: isEditingActa ? 'white' : '#374151'
                }}
              >
                {isEditingActa ? '👁 Ver acta' : '✏️ Editar acta'}
              </button>
            </div>
            {isEditingActa ? (
              <textarea
                value={generatedMinutes}
                onChange={async (e) => onSetGeneratedMinutes(e.target.value)}
                placeholder="Edita el acta aquí..."
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            ) : (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  maxHeight: '400px',
                  overflow: 'auto',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#1f2937'
                }}
              >
                <ReactMarkdown>{generatedMinutes}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Tareas */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #86efac'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              ✅ Tareas Extraídas ({generatedTasks.length})
            </h3>
            {generatedTasks.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                No se extrajeron tareas del acta
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generatedTasks.map((task: GeneratedTask, index: number) => (
                  <div key={index} style={{
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #d1fae5',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {/* Título de la tarea */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <input
                        type="text"
                        value={task.title || task.titulo}
                        onChange={async (e) => {
                          const newTasks = [...generatedTasks];
                          newTasks[index] = {
                            ...newTasks[index],
                            title: e.target.value,
                            titulo: e.target.value
                          };
                          onSetGeneratedTasks(newTasks);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      />
                      <button
                        onClick={async () => {
                          const newTasks = generatedTasks.filter((_, i) => i !== index);
                          onSetGeneratedTasks(newTasks);
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        title="Eliminar tarea"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Selector de asignado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        fontWeight: '500',
                        minWidth: '80px'
                      }}>
                        Asignar a:
                      </label>
                      <select
                        value={task.assignedTo || task.asignado_a || ''}
                        onChange={async (e) => {
                          const newTasks = [...generatedTasks];
                          newTasks[index] = {
                            ...newTasks[index],
                            assignedTo: e.target.value,
                            asignado_a: e.target.value
                          };
                          onSetGeneratedTasks(newTasks);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">-- Seleccionar empleado --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.email}>
                            {emp.name} ({emp.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Campo de fecha límite */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        fontWeight: '500',
                        minWidth: '80px'
                      }}>
                        📅 Fecha límite:
                      </label>
                      <input
                        type="date"
                        value={task.deadline || task.fecha_limite || ''}
                        onChange={async (e) => {
                          const newTasks = [...generatedTasks];
                          newTasks[index] = {
                            ...newTasks[index],
                            deadline: e.target.value,
                            fecha_limite: e.target.value
                          };
                          onSetGeneratedTasks(newTasks);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px',
                          backgroundColor: 'white'
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Selector de prioridad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        fontWeight: '500',
                        minWidth: '80px'
                      }}>
                        🎯 Prioridad:
                      </label>
                      <select
                        value={task.priority || task.prioridad || 'media'}
                        onChange={async (e) => {
                          const newTasks = [...generatedTasks];
                          newTasks[index] = {
                            ...newTasks[index],
                            priority: e.target.value,
                            prioridad: e.target.value
                          };
                          onSetGeneratedTasks(newTasks);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="baja">🟢 Baja</option>
                        <option value="media">🟡 Media</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="critica">🔴 Crítica</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para añadir tarea manual */}
            <button
              onClick={async () => {
                const newTask = {
                  title: 'Nueva tarea',
                  titulo: 'Nueva tarea',
                  assignedTo: '',
                  asignado_a: '',
                  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  priority: 'media',
                  prioridad: 'media'
                };
                onSetGeneratedTasks([...generatedTasks, newTask]);
              }}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              Añadir Tarea Manual
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          backgroundColor: '#f9fafb'
        }}>
          {/* Botón Eliminar (Solo si ya existe la reunión) */}
          {meeting && (
            <button
              onClick={async () => {
                if (await ui.confirm('⚠️ ¿Estás seguro de que quieres eliminar esta reunión?\n\nESTA ACCIÓN NO SE PUEDE DESHACER.\n\nSe eliminarán permanentemente:\n- La reunión\n- Todas las tareas asignadas en esta reunión')) {
                  try {
                    const result = await deleteMeetingFromSupabase(meeting.id);
                    if (result.success) {
                      ui.success('✅ Reunión y tareas eliminadas correctamente');
                      onCloseModal();
                      onSuccess?.();
                    } else {
                      ui.error(`❌ Error al eliminar la reunión: ${result.error}`);
                    }
                  } catch (error) {
                    console.error('Error eliminando reunión:', error);
                    ui.error('❌ Error inesperado al eliminar la reunión');
                  }
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginRight: 'auto'
              }}
            >
              🗑️ Eliminar Reunión
            </button>
          )}
          <button
            onClick={async () => onClose()}
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
            onClick={onSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              backgroundColor: isSaving ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSaving ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Guardando...
              </>
            ) : (
              '💾 Guardar Reunión'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
