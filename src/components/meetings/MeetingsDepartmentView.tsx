import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, History, ListTodo, Check, Trash2 } from 'lucide-react';
import { DEPARTMENTS_CONFIG } from '../../config/departmentPermissions';
import { supabase } from '../../lib/supabase';
import MeetingModal from './MeetingModal';
import ParticipantsSelectionModal from './ParticipantsSelectionModal';
import TaskCompletionModal from './TaskCompletionModal';

interface MeetingsDepartmentViewProps {
  departmentId: string;
  userEmail: string;
  userName: string;
  onBack: () => void;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  start_time: string;
  status: string;
  participants: string[];
  created_by?: string;
  summary?: string;
}

interface Task {
  id: number;
  title: string;
  assigned_to: string;
  deadline: string;
  status: string;
  priority: string;
}

export const MeetingsDepartmentView: React.FC<MeetingsDepartmentViewProps> = ({
  departmentId,
  userEmail,
  userName,
  onBack
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [historyMeetings, setHistoryMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<any>(null);
  const [showMeetingDetailModal, setShowMeetingDetailModal] = useState(false);
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState<any>(null);

  const department = DEPARTMENTS_CONFIG[departmentId];

  useEffect(() => {
    loadMeetings();
    loadTasks();
  }, [departmentId]);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      // Obtener solo reuniones futuras (fecha >= hoy)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('department', departmentId)
        .gte('date', today.toISOString())
        .in('status', ['scheduled', 'in_progress']) // Solo reuniones programadas o en progreso
        .order('date', { ascending: true });

      if (error) {
        console.error('Error cargando reuniones:', error);
        return;
      }

      console.log(`📊 Reuniones futuras cargadas para ${departmentId}:`, data?.length || 0);

      // Cargar tareas para cada reunión
      const meetingsWithTasks = await Promise.all((data || []).map(async (meeting) => {
        const { data: tasks, error: tasksError } = await supabase
          .from('tareas')
          .select('*')
          .eq('reunion_origen', meeting.id); // 🔧 FIX: Usar ID en lugar de título para evitar duplicados

        if (tasksError) {
          console.error('Error cargando tareas de reunión:', tasksError);
          return { ...meeting, tasks: [] };
        }

        console.log(`📋 Tareas de reunión "${meeting.title}":`, tasks);
        tasks?.forEach(task => {
          console.log(`  - ${task.titulo}: asignado_a="${task.asignado_a}", estado="${task.estado}"`);
        });

        return { ...meeting, tasks: tasks || [] };
      }));

      setMeetings(meetingsWithTasks);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryMeetings = async () => {
    setLoadingHistory(true);
    try {
      // Obtener solo reuniones completadas (sin importar la fecha)
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('department', departmentId)
        .eq('status', 'completed') // Solo reuniones completadas
        .order('date', { ascending: false }); // Más recientes primero

      if (error) {
        console.error('Error cargando historial:', error);
        return;
      }

      console.log(`📚 Historial de reuniones cargado para ${departmentId}:`, data?.length || 0);

      // Cargar tareas para cada reunión
      const meetingsWithTasks = await Promise.all((data || []).map(async (meeting) => {
        const { data: tasks, error: tasksError } = await supabase
          .from('tareas')
          .select('*')
          .eq('reunion_origen', meeting.id); // 🔧 FIX: Usar ID en lugar de título para evitar duplicados

        if (tasksError) {
          console.error('Error cargando tareas de reunión:', tasksError);
          return { ...meeting, tasks: [] };
        }

        return { ...meeting, tasks: tasks || [] };
      }));

      setHistoryMeetings(meetingsWithTasks);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteTask = async (taskId: number | string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tareas')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error eliminando tarea:', error);
        alert('Error al eliminar la tarea');
        return;
      }

      console.log('✅ Tarea eliminada correctamente');
      loadTasks(); // Recargar tareas
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la tarea');
    }
  };

  const loadTasks = async () => {
    try {
      console.log(`🔍 Buscando tareas para usuario: "${userEmail}"`);

      // Cargar tareas pendientes asignadas al usuario actual
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('estado', 'pendiente')
        .eq('asignado_a', userEmail)
        .order('fecha_limite', { ascending: true });

      if (error) {
        console.error('Error cargando tareas:', error);
        setTasks([]);
        return;
      }

      console.log(`📊 Tareas encontradas:`, data);
      data?.forEach(task => {
        console.log(`  - ${task.titulo}: asignado_a="${task.asignado_a}"`);
      });

      const formattedTasks = (data || []).map((task: any) => ({
        id: task.id,
        title: task.titulo,
        assigned_to: task.asignado_a,
        deadline: task.fecha_limite,
        status: task.estado,
        priority: task.prioridad
      }));

      setTasks(formattedTasks);
      console.log(`ℹ️ Tareas pendientes asignadas a ${userEmail}: ${formattedTasks.length} tareas`);
    } catch (error) {
      console.error('Error:', error);
      setTasks([]);
    }
  };

  if (!department) {
    return <div>Departamento no encontrado</div>;
  }

  const IconComponent = department.icon;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <ArrowLeft size={24} color="#374151" />
        </button>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          backgroundColor: department.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <IconComponent size={28} />
        </div>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            {department.name}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>
            {department.description}
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => {
            setSelectedMeeting(null);
            setShowParticipantsModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Nueva Reunión
        </button>

        <button
          onClick={() => {
            setShowHistoryModal(true);
            loadHistoryMeetings();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <History size={16} />
          Historial
        </button>

        <button
          onClick={() => setShowTasksModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <ListTodo size={16} />
          Tareas ({tasks.length})
        </button>
      </div>

      {/* Próximas Reuniones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          📅 Próximas Reuniones
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            Cargando reuniones...
          </div>
        ) : meetings.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            No hay reuniones programadas
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {meetings.slice(0, 5).map(meeting => (
              <div
                key={meeting.id}
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setShowMeetingModal(true);
                }}
                style={{
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {meeting.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <div>📅 {new Date(meeting.date).toLocaleDateString('es-ES')} a las {meeting.start_time || 'Por definir'}</div>
                  {meeting.created_by && (
                    <div>👤 Creada por: {meeting.created_by}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Selección de Participantes */}
      <ParticipantsSelectionModal
        isOpen={showParticipantsModal}
        departmentId={departmentId}
        onConfirm={(participants) => {
          setSelectedParticipants(participants);
          setShowParticipantsModal(false);
          setShowMeetingModal(true);
        }}
        onClose={() => setShowParticipantsModal(false)}
      />

      {/* Modal de Reunión */}
      {showMeetingModal && (
        <MeetingModal
          departmentId={departmentId}
          meeting={selectedMeeting}
          userEmail={userEmail}
          userName={userName}
          participants={selectedParticipants}
          onClose={() => {
            setShowMeetingModal(false);
            setSelectedMeeting(null);
            setSelectedParticipants([]);
            loadMeetings();
          }}
          onSuccess={() => {
            loadMeetings(); // Recargar lista sin cerrar modal
          }}
        />
      )}

      {/* Modal de Historial */}
      {showHistoryModal && (
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
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
                📋 Historial de Reuniones
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
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

            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '24px'
            }}>
              {loadingHistory ? (
                <div style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '48px 24px'
                }}>
                  Cargando historial...
                </div>
              ) : historyMeetings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '48px 24px'
                }}>
                  No hay reuniones registradas
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {historyMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      onClick={() => {
                        setSelectedMeetingDetail(meeting);
                        setShowMeetingDetailModal(true);
                      }}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#1f2937',
                          flex: 1
                        }}>
                          {meeting.title}
                        </div>
                        {meeting.summary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMeetingDetail(meeting);
                              setShowMeetingDetailModal(true);
                            }}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            📄 Ver Acta
                          </button>
                        )}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '8px'
                      }}>
                        <div>📅 {new Date(meeting.date).toLocaleDateString('es-ES')}</div>
                        <div>🕐 {meeting.start_time}</div>
                        <div>👥 {meeting.participants?.length || 0} participantes</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Tareas */}
      {showTasksModal && (
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
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
                ✅ Mis Tareas Pendientes
              </h2>
              <button
                onClick={() => setShowTasksModal(false)}
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

            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '24px'
            }}>
              {tasks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '48px 24px'
                }}>
                  ¡No hay tareas pendientes! 🎉
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#166534',
                          marginBottom: '8px'
                        }}>
                          {task.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '8px'
                        }}>
                          <div>👤 {task.assigned_to}</div>
                          <div>📅 {new Date(task.deadline).toLocaleDateString('es-ES')}</div>
                          <div>
                            Prioridad:{' '}
                            <span style={{
                              backgroundColor: task.priority === 'critica' ? '#fee2e2' : task.priority === 'alta' ? '#fef3c7' : '#dbeafe',
                              color: task.priority === 'critica' ? '#dc2626' : task.priority === 'alta' ? '#92400e' : '#1e40af',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '11px'
                            }}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedTaskForCompletion(task);
                            setShowCompletionModal(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Check size={14} />
                          Completar
                        </button>
                        {userEmail === 'carlossuarezparra@gmail.com' && (
                          <button
                            onClick={() => deleteTask(task.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Completación de Tarea */}
      {showCompletionModal && selectedTaskForCompletion && (
        <TaskCompletionModal
          isOpen={showCompletionModal}
          taskId={selectedTaskForCompletion.id}
          taskTitle={selectedTaskForCompletion.title}
          userEmail={userEmail}
          userName={userName}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedTaskForCompletion(null);
            loadTasks();
            loadMeetings(); // Recargar reuniones para actualizar el historial
          }}
          onSuccess={() => {
            loadTasks();
            loadMeetings(); // Recargar reuniones para actualizar el historial
          }}
        />
      )}

      {/* Modal de Detalle de Reunión */}
      {showMeetingDetailModal && selectedMeetingDetail && (
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
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {selectedMeetingDetail.title}
              </h2>
              <button
                onClick={() => {
                  setShowMeetingDetailModal(false);
                  setSelectedMeetingDetail(null);
                }}
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
              {/* Información básica */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Fecha</div>
                  <div style={{ fontWeight: '500' }}>📅 {new Date(selectedMeetingDetail.date).toLocaleDateString('es-ES')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Hora</div>
                  <div style={{ fontWeight: '500' }}>🕐 {selectedMeetingDetail.start_time}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Participantes</div>
                  <div style={{ fontWeight: '500' }}>👥 {selectedMeetingDetail.participants?.length || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Estado</div>
                  <div style={{ fontWeight: '500' }}>✅ {selectedMeetingDetail.status}</div>
                </div>
              </div>

              {/* Transcripción */}
              {selectedMeetingDetail.transcript && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    📝 Transcripción
                  </h3>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedMeetingDetail.transcript}
                  </div>
                </div>
              )}

              {/* Acta */}
              {selectedMeetingDetail.summary && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    📋 Acta de Reunión
                  </h3>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                    dangerouslySetInnerHTML={{
                      __html: selectedMeetingDetail.summary.replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
              )}

              {/* Tareas */}
              {selectedMeetingDetail.tasks && selectedMeetingDetail.tasks.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    ✅ Tareas Asignadas ({selectedMeetingDetail.tasks.length})
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {selectedMeetingDetail.tasks.map((task: any, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          // Solo permitir completar si la tarea está asignada al usuario actual y está pendiente
                          if ((task.asignado_a) === userEmail && task.estado === 'pendiente') {
                            setSelectedTaskForCompletion({
                              taskId: task.id,
                              title: task.titulo,
                              description: task.descripcion || 'Sin descripción'
                            });
                            setShowCompletionModal(true);
                          }
                        }}
                        style={{
                          padding: '12px',
                          backgroundColor: task.estado === 'completada'
                            ? '#f3f4f6'
                            : (task.asignado_a === userEmail ? '#f0fdf4' : '#f9fafb'),
                          border: task.estado === 'completada'
                            ? '1px solid #d1d5db'
                            : (task.asignado_a === userEmail ? '1px solid #bbf7d0' : '1px solid #e5e7eb'),
                          borderRadius: '8px',
                          cursor: (task.asignado_a === userEmail && task.estado === 'pendiente') ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                          opacity: task.estado === 'completada' ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (task.asignado_a === userEmail && task.estado === 'pendiente') {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                          {task.estado === 'completada' && '✅ '}
                          {task.titulo}
                          {task.asignado_a === userEmail && task.estado === 'pendiente' && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '12px',
                              color: '#059669',
                              fontWeight: 'normal'
                            }}>
                              (Click para completar)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          👤 {task.asignado_a} • 📅 {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
                          {task.estado === 'completada' && task.completada_por && (
                            <span style={{ marginLeft: '8px', color: '#059669' }}>
                              • ✓ Completada por {task.completada_por}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsDepartmentView;
