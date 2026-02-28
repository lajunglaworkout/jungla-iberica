import React, { useState, useEffect } from 'react';
import { getTasksByUser, getPendingTasks, deleteTask, deleteTasksByIds } from '../services/taskService';
import { Check, Trash2, Filter, Calendar, User, AlertCircle } from 'lucide-react';
import TaskCompletionModal from '../components/meetings/TaskCompletionModal';
import { ui } from '../utils/ui';


interface Task {
  id: number;
  titulo: string;
  asignado_a: string;
  fecha_limite: string;
  prioridad: string;
  departamento: string;
  estado: string;
  descripcion?: string;
  created_at: string;
}

interface MyTasksPageProps {
  userEmail: string;
  userName: string;
  userRole: string;
}

const DEPARTMENT_COLORS: { [key: string]: { bg: string; text: string; name: string } } = {
  direccion: { bg: '#fef3c7', text: '#92400e', name: 'Dirección' },
  rrhh: { bg: '#dbeafe', text: '#1e40af', name: 'RRHH' },
  procedimientos: { bg: '#e0e7ff', text: '#3730a3', name: 'Procedimientos' },
  logistica: { bg: '#fce7f3', text: '#831843', name: 'Logística' },
  mantenimiento: { bg: '#fed7aa', text: '#9a3412', name: 'Mantenimiento' },
  marketing: { bg: '#d1fae5', text: '#065f46', name: 'Marketing' },
  ventas: { bg: '#dcfce7', text: '#166534', name: 'Ventas' },
  centros: { bg: '#e9d5ff', text: '#6b21a8', name: 'Centros' },
  marca: { bg: '#fecaca', text: '#991b1b', name: 'Marca' },
};

const PRIORITY_CONFIG: { [key: string]: { bg: string; text: string; label: string } } = {
  critica: { bg: '#fee2e2', text: '#dc2626', label: 'Crítica' },
  alta: { bg: '#fef3c7', text: '#92400e', label: 'Alta' },
  media: { bg: '#dbeafe', text: '#1e40af', label: 'Media' },
  baja: { bg: '#f3f4f6', text: '#6b7280', label: 'Baja' },
};

export const MyTasksPage: React.FC<MyTasksPageProps> = ({ userEmail, userName, userRole }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('todos');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const isSuperAdmin = userEmail === 'carlossuarezparra@gmail.com';

  useEffect(() => {
    loadTasks();
  }, [userEmail]);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedDepartment, selectedPriority]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      let data: Task[];
      if (isSuperAdmin) {
        const result = await getPendingTasks();
        data = (result.tasks ?? []) as Task[];
      } else {
        const result = await getTasksByUser(userEmail, 'pendiente');
        data = (result.tasks ?? []) as Task[];
      }
      console.log(`📋 Tareas cargadas: ${data.length}`);
      setTasks(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (selectedDepartment !== 'todos') {
      filtered = filtered.filter(task => task.departamento === selectedDepartment);
    }

    if (selectedPriority !== 'todos') {
      filtered = filtered.filter(task => task.prioridad === selectedPriority);
    }

    setFilteredTasks(filtered);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!await ui.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }
    const result = await deleteTask(taskId);
    if (!result.success) {
      ui.error('Error al eliminar la tarea');
      return;
    }
    console.log('✅ Tarea eliminada correctamente');
    loadTasks();
  };

  const deleteMultipleTasks = async () => {
    if (selectedTaskIds.length === 0) {
      ui.info('Selecciona al menos una tarea para eliminar');
      return;
    }
    if (!await ui.confirm(`¿Estás seguro de que quieres eliminar ${selectedTaskIds.length} tarea(s)?`)) {
      return;
    }
    const result = await deleteTasksByIds(selectedTaskIds);
    if (!result.success) {
      ui.error('Error al eliminar las tareas');
      return;
    }
    console.log(`✅ ${selectedTaskIds.length} tareas eliminadas correctamente`);
    setSelectedTaskIds([]);
    setSelectionMode(false);
    loadTasks();
  };

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(task => task.id));
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Agrupar tareas por departamento
  const tasksByDepartment = filteredTasks.reduce((acc, task) => {
    if (!acc[task.departamento]) {
      acc[task.departamento] = [];
    }
    acc[task.departamento].push(task);
    return acc;
  }, {} as { [key: string]: Task[] });

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(18px, 5vw, 28px)',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px',
            lineHeight: 1.2
          }}>
            📋 Mis Tareas Pendientes
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px'
          }}>
            {isSuperAdmin ? 'Vista completa de todas las tareas del sistema' : 'Gestiona tus tareas asignadas'}
          </p>
        </div>

        {/* Botones de acción masiva */}
        {isSuperAdmin && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {!selectionMode ? (
              <button
                onClick={async () => setSelectionMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Check size={16} />
                Seleccionar múltiples
              </button>
            ) : (
              <>
                <button
                  onClick={selectAllTasks}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {selectedTaskIds.length === filteredTasks.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
                <button
                  onClick={deleteMultipleTasks}
                  disabled={selectedTaskIds.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: selectedTaskIds.length > 0 ? '#fee2e2' : '#f3f4f6',
                    color: selectedTaskIds.length > 0 ? '#dc2626' : '#9ca3af',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: selectedTaskIds.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Trash2 size={16} />
                  Eliminar ({selectedTaskIds.length})
                </button>
                <button
                  onClick={async () => {
                    setSelectionMode(false);
                    setSelectedTaskIds([]);
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Filtro por Departamento */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            <Filter size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Departamento
          </label>
          <select
            value={selectedDepartment}
            onChange={async (e) => setSelectedDepartment(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="todos">Todos los departamentos</option>
            {Object.entries(DEPARTMENT_COLORS).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Prioridad */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Prioridad
          </label>
          <select
            value={selectedPriority}
            onChange={async (e) => setSelectedPriority(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="todos">Todas las prioridades</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Estadísticas */}
        <div style={{
          flex: '1',
          minWidth: '200px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              {filteredTasks.length}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Tareas pendientes
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Tareas */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280'
        }}>
          Cargando tareas...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280'
        }}>
          {tasks.length === 0 ? '🎉 ¡No tienes tareas pendientes!' : 'No hay tareas que coincidan con los filtros'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {Object.entries(tasksByDepartment).map(([dept, deptTasks]) => (
            <div key={dept}>
              {/* Header del Departamento */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: DEPARTMENT_COLORS[dept]?.bg || '#f3f4f6',
                  color: DEPARTMENT_COLORS[dept]?.text || '#6b7280',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {DEPARTMENT_COLORS[dept]?.name || dept}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {deptTasks.length} {deptTasks.length === 1 ? 'tarea' : 'tareas'}
                </div>
              </div>

              {/* Tareas del Departamento */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {deptTasks.map(task => {
                  const daysUntil = getDaysUntilDeadline(task.fecha_limite);
                  const overdue = isOverdue(task.fecha_limite);

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '16px',
                        backgroundColor: selectionMode && selectedTaskIds.includes(task.id) ? '#eff6ff' : 'white',
                        border: `2px solid ${selectionMode && selectedTaskIds.includes(task.id) ? '#3b82f6' : overdue ? '#fca5a5' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Checkbox de selección */}
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={async () => toggleTaskSelection(task.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            marginTop: '2px'
                          }}
                        />
                      )}

                      {/* Contenido de la tarea */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '8px',
                          fontSize: '15px'
                        }}>
                          {task.titulo}
                        </div>

                        {task.descripcion && (
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            marginBottom: '12px',
                            lineHeight: '1.5'
                          }}>
                            {task.descripcion}
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          flexWrap: 'wrap',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={14} />
                            {task.asignado_a}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: overdue ? '#dc2626' : daysUntil <= 2 ? '#f59e0b' : '#6b7280',
                            fontWeight: overdue || daysUntil <= 2 ? '600' : '400'
                          }}>
                            <Calendar size={14} />
                            {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
                            {overdue ? ' (Vencida)' : daysUntil === 0 ? ' (Hoy)' : daysUntil === 1 ? ' (Mañana)' : ` (${daysUntil} días)`}
                          </div>
                          <div>
                            <span style={{
                              backgroundColor: PRIORITY_CONFIG[task.prioridad]?.bg || '#f3f4f6',
                              color: PRIORITY_CONFIG[task.prioridad]?.text || '#6b7280',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {PRIORITY_CONFIG[task.prioridad]?.label || task.prioridad}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={async () => {
                            setSelectedTask(task);
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
                        {isSuperAdmin && (
                          <button
                            onClick={async () => handleDeleteTask(task.id)}
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Completación */}
      {showCompletionModal && selectedTask && (
        <TaskCompletionModal
          isOpen={showCompletionModal}
          taskId={selectedTask.id}
          taskTitle={selectedTask.titulo}
          userEmail={userEmail}
          userName={userName}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedTask(null);
            loadTasks();
          }}
          onSuccess={() => {
            loadTasks();
          }}
        />
      )}
    </div>
  );
};

export default MyTasksPage;
