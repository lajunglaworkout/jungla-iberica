import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2, Loader } from 'lucide-react';
import MeetingRecorderComponent from '../MeetingRecorderComponent';
import { supabase } from '../../lib/supabase';

interface MeetingModalProps {
  departmentId: string;
  meeting: any;
  userEmail: string;
  userName: string;
  participants: string[];
  onClose: () => void;
}

interface PreviousTask {
  id: number;
  titulo: string;
  asignado_a: string;
  estado: string;
  fecha_limite: string;
}

interface NewTask {
  title: string;
  assignedTo: string;
  deadline: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({
  departmentId,
  meeting,
  userEmail,
  userName,
  participants,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'previous' | 'recording' | 'tasks'>('previous');
  const [previousTasks, setPreviousTasks] = useState<PreviousTask[]>([]);
  const [newTasks, setNewTasks] = useState<NewTask[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [meetingMinutes, setMeetingMinutes] = useState('');

  useEffect(() => {
    loadPreviousTasks();
    loadEmployees();
  }, [departmentId]);

  const loadPreviousTasks = async () => {
    setLoadingTasks(true);
    try {
      // Por ahora, no cargamos tareas anteriores hasta que tengamos la tabla correcta
      setPreviousTasks([]);
      console.log('ℹ️ Tareas anteriores: No hay tareas pendientes');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, departamento')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error cargando empleados:', error);
        // Si la tabla no existe, usar datos vacíos
        setEmployees([]);
        return;
      }

      const mappedEmployees = (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.departamento
      }));
      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error:', error);
      setEmployees([]);
    }
  };

  const handleAddTask = () => {
    setNewTasks([...newTasks, {
      title: '',
      assignedTo: '',
      deadline: '',
      priority: 'media'
    }]);
  };

  const handleRemoveTask = (index: number) => {
    setNewTasks(newTasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index: number, field: string, value: string) => {
    const updated = [...newTasks];
    updated[index] = { ...updated[index], [field]: value };
    setNewTasks(updated);
  };

  const handleSaveTasks = async () => {
    try {
      const tasksToSave = newTasks.map(task => ({
        titulo: task.title,
        descripcion: '',
        asignado_a: task.assignedTo,
        creado_por: userEmail,
        prioridad: task.priority,
        estado: 'pendiente',
        fecha_limite: task.deadline,
        verificacion_requerida: true
      }));

      const { error } = await supabase
        .from('tareas')
        .insert(tasksToSave);

      if (error) {
        console.error('Error guardando tareas:', error);
        return;
      }

      console.log('✅ Tareas guardadas');
      setNewTasks([]);
      loadPreviousTasks();
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '95%',
        maxWidth: '1000px',
        maxHeight: '90vh',
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
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {meeting?.title || 'Nueva Reunión'}
            </h2>
            {participants.length > 0 && (
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                👥 Participantes: {participants.join(', ')}
              </div>
            )}
          </div>
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          {['previous', 'recording', 'tasks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                borderBottom: activeTab === tab ? '3px solid #3b82f6' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '600' : '500',
                color: activeTab === tab ? '#3b82f6' : '#6b7280'
              }}
            >
              {tab === 'previous' && '📋 Tareas Anteriores'}
              {tab === 'recording' && '🎙️ Grabación'}
              {tab === 'tasks' && '✅ Nuevas Tareas'}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Tab: Tareas Anteriores */}
          {activeTab === 'previous' && (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Tareas Pendientes de Reuniones Anteriores
              </h3>

              {loadingTasks ? (
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                  Cargando tareas...
                </div>
              ) : previousTasks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px'
                }}>
                  No hay tareas pendientes
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {previousTasks.map(task => (
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
                        fontWeight: '600',
                        color: '#166534',
                        marginBottom: '8px'
                      }}>
                        {task.titulo}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '8px'
                      }}>
                        <div>👤 {task.asignado_a}</div>
                        <div>📅 {new Date(task.fecha_limite).toLocaleDateString('es-ES')}</div>
                        <div>
                          Estado: <span style={{
                            backgroundColor: task.estado === 'completada' ? '#dcfce7' : '#fef3c7',
                            color: task.estado === 'completada' ? '#166534' : '#92400e',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {task.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Grabación */}
          {activeTab === 'recording' && (
            <MeetingRecorderComponent
              meetingId={meeting?.id || 0}
              meetingTitle={meeting?.title || 'Nueva Reunión'}
              participants={meeting?.participants || []}
              onClose={onClose}
              onRecordingComplete={(data) => {
                setTranscript(data.transcript);
                setMeetingMinutes(data.minutes);
                setRecordingComplete(true);
              }}
            />
          )}

          {/* Tab: Nuevas Tareas */}
          {activeTab === 'tasks' && (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Asignar Nuevas Tareas
              </h3>

              {newTasks.map((task, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    {/* Título */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Título de la Tarea
                      </label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                        placeholder="Ej: Revisar documentación"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Asignado a */}
                    <div>
                      <label style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Asignado a
                      </label>
                      <select
                        value={task.assignedTo}
                        onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Seleccionar persona...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.email}>
                            {emp.name} ({emp.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fecha Límite */}
                    <div>
                      <label style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Fecha Límite
                      </label>
                      <input
                        type="date"
                        value={task.deadline}
                        onChange={(e) => handleTaskChange(index, 'deadline', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* Prioridad */}
                    <div>
                      <label style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Prioridad
                      </label>
                      <select
                        value={task.priority}
                        onChange={(e) => handleTaskChange(index, 'priority', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveTask(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              ))}

              <button
                onClick={handleAddTask}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                <Plus size={16} />
                Añadir Tarea
              </button>
            </div>
          )}
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
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>

          {activeTab === 'tasks' && newTasks.length > 0 && (
            <button
              onClick={handleSaveTasks}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Guardar Tareas
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;
