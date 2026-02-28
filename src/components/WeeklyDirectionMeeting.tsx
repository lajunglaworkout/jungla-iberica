// src/components/WeeklyDirectionMeeting.tsx - Sistema de Reuniones de Dirección Semanales
import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle, XCircle, AlertTriangle, Plus, Save, Play, Pause, 
  RotateCcw, Users, Calendar, Target, FileText, Flag, User, 
  TrendingUp, BarChart3, Timer, MessageSquare, Archive
} from 'lucide-react';
import { getDirectionPendingTasks, markDirectionTaskCompleted, markDirectionTaskDelayed, createDirectionTask } from '../services/taskService';
import { useSession } from '../contexts/SessionContext';

// ============ INTERFACES ============
interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string[];
  assigned_names?: string[];
  deadline: string;
  priority: 'critica' | 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  category: string;
  created_at: string;
  completed_at?: string;
  completion_reason?: string;
  delay_reason?: string;
  daysOverdue?: number;
  isOverdue?: boolean;
}

interface Meeting {
  id: string;
  date: string;
  duration_minutes: number;
  participants: string[];
  tasks_reviewed: number;
  tasks_completed: number;
  new_tasks_created: number;
  notes: string;
  status: 'programada' | 'en_curso' | 'completada';
}

interface WeeklyDirectionMeetingProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============ CONSTANTES ============
const LEADERSHIP_TEAM = [
  { id: 'carlossuarezparra@gmail.com', name: 'Carlos Suárez Parra', role: 'CEO' },
  { id: 'beni.jungla@gmail.com', name: 'Benito Morales', role: 'Director' },
  { id: 'lajunglacentral@gmail.com', name: 'Vicente Benítez', role: 'Director RRHH' }
];

const TASK_CATEGORIES = [
  'Operaciones', 'Marketing', 'RRHH', 'Finanzas', 'Tecnología', 'Expansión', 'Calidad', 'Legal'
];

const DELAY_REASONS = [
  'Falta de recursos', 'Dependencias externas', 'Cambio de prioridades', 
  'Complejidad subestimada', 'Problemas técnicos', 'Falta de información',
  'Sobrecarga de trabajo', 'Otros'
];

const PRIORITY_COLORS = {
  critica: '#ef4444',
  alta: '#f97316', 
  media: '#f59e0b',
  baja: '#6b7280'
};

// ============ COMPONENTE PRINCIPAL ============
const WeeklyDirectionMeeting: React.FC<WeeklyDirectionMeetingProps> = ({ isOpen, onClose }) => {
  const { employee } = useSession();
  const [currentStep, setCurrentStep] = useState<'review' | 'create' | 'summary'>('review');
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [newTasks, setNewTasks] = useState<Task[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [plannedDuration, setPlannedDuration] = useState<number>(60); // minutos

  // New task form
  const [newTaskForm, setNewTaskForm] = useState<{
    title: string;
    description: string;
    assigned_to: string[];
    deadline: string;
    priority: 'critica' | 'alta' | 'media' | 'baja';
    category: string;
  }>({
    title: '',
    description: '',
    assigned_to: [],
    deadline: '',
    priority: 'media',
    category: 'Operaciones'
  });

  // ============ EFFECTS ============
  useEffect(() => {
    if (isOpen) {
      loadPendingTasks();
    }
  }, [isOpen]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // ============ FUNCIONES DE FECHAS ============
  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lunes como inicio
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  const getCurrentWeek = () => getWeekRange(new Date());
  const getPreviousWeek = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return getWeekRange(lastWeek);
  };

  const getWeeksAgo = (weeksBack: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (weeksBack * 7));
    return getWeekRange(targetDate);
  };

  const categorizeTasksByAge = (tasks: Task[]) => {
    const now = new Date();
    const currentWeek = getCurrentWeek();
    const previousWeek = getPreviousWeek();
    
    return {
      thisWeek: tasks.filter(task => {
        const deadline = new Date(task.deadline);
        return deadline >= currentWeek.start && deadline <= currentWeek.end;
      }),
      lastWeek: tasks.filter(task => {
        const deadline = new Date(task.deadline);
        return deadline >= previousWeek.start && deadline <= previousWeek.end;
      }),
      older: tasks.filter(task => {
        const deadline = new Date(task.deadline);
        return deadline < previousWeek.start;
      }),
      overdue: tasks.filter(task => new Date(task.deadline) < now)
    };
  };

  // ============ FUNCIONES DE DATOS ============
  const loadPendingTasks = async () => {
    setLoading(true);
    try {
      const tasks = await getDirectionPendingTasks();

      // Enriquecer con nombres de asignados y datos adicionales
      const enrichedTasks = tasks?.map(task => {
        const deadline = new Date(task.fecha_limite);
        const now = new Date();
        const daysOverdue = deadline < now ? Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        return {
          ...task,
          id: task.id.toString(),
          assigned_to: Array.isArray(task.asignado_a) ? task.asignado_a : [task.asignado_a],
          assigned_names: Array.isArray(task.asignado_a) 
            ? task.asignado_a.map((id: string) => LEADERSHIP_TEAM.find(m => m.id === id)?.name || id)
            : [LEADERSHIP_TEAM.find(m => m.id === task.asignado_a)?.name || task.asignado_a],
          title: task.titulo,
          description: task.descripcion || '',
          deadline: task.fecha_limite,
          priority: task.prioridad,
          status: task.estado,
          category: task.categoria || 'Operaciones',
          created_at: task.creado_en,
          completed_at: task.completado_en,
          completion_reason: task.motivo_completado,
          delay_reason: task.motivo_retraso,
          daysOverdue,
          isOverdue: deadline < now
        };
      }) || [];

      setPendingTasks(enrichedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTaskCompleted = async (taskId: string, reason: string) => {
    try {
      const result = await markDirectionTaskCompleted(taskId, new Date().toISOString(), reason);
      if (!result.success) throw new Error(result.error);
      const task = pendingTasks.find(t => t.id === taskId);
      if (task) {
        setCompletedTasks(prev => [...prev, { ...task, status: 'completada', completion_reason: reason }]);
        setPendingTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  const markTaskDelayed = async (taskId: string, reason: string, newDeadline: string) => {
    try {
      const result = await markDirectionTaskDelayed(taskId, newDeadline, reason);
      if (!result.success) throw new Error(result.error);
      setPendingTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, deadline: newDeadline, delay_reason: reason }
          : t
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const createNewTask = async () => {
    if (!newTaskForm.title.trim() || newTaskForm.assigned_to.length === 0) return;

    try {
      const result = await createDirectionTask({
        titulo: newTaskForm.title,
        descripcion: newTaskForm.description,
        asignado_a: newTaskForm.assigned_to,
        fecha_limite: newTaskForm.deadline,
        prioridad: newTaskForm.priority,
        categoria: newTaskForm.category,
        estado: 'pendiente',
        departamento_responsable: 'direccion',
        creado_por: employee?.email || '',
        creado_en: new Date().toISOString()
      });

      if (!result.success) throw new Error(result.error);
      const data = result.data!;

      const newTask: Task = {
        id: (data.id as string | number).toString(),
        title: newTaskForm.title,
        description: newTaskForm.description,
        assigned_to: newTaskForm.assigned_to,
        assigned_names: newTaskForm.assigned_to.map(id => 
          LEADERSHIP_TEAM.find(m => m.id === id)?.name || id
        ),
        deadline: newTaskForm.deadline,
        priority: newTaskForm.priority,
        status: 'pendiente',
        category: newTaskForm.category,
        created_at: new Date().toISOString()
      };

      setNewTasks(prev => [...prev, newTask]);
      
      // Reset form
      setNewTaskForm({
        title: '',
        description: '',
        assigned_to: [],
        deadline: '',
        priority: 'media',
        category: 'Operaciones'
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // ============ FUNCIONES DE TIMER ============
  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const minutes = timerSeconds / 60;
    if (minutes > plannedDuration) return '#ef4444';
    if (minutes > plannedDuration * 0.8) return '#f59e0b';
    return '#059669';
  };

  // ============ COMPONENTES DE RENDERIZADO ============
  const TaskReviewStep = () => {
    const categorizedTasks = categorizeTasksByAge(pendingTasks);
    const currentWeek = getCurrentWeek();
    const previousWeek = getPreviousWeek();
    
    return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Revisión de Tareas Pendientes
          </h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
            {pendingTasks.length} tareas pendientes de revisión
          </p>
        </div>
        
        {/* Timer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Timer style={{ height: '20px', width: '20px', color: '#059669' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Duración planeada:</span>
            <input
              type="number"
              value={plannedDuration}
              onChange={(e) => setPlannedDuration(Number(e.target.value))}
              style={{
                width: '60px',
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>min</span>
          </div>
          
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: getTimeColor(),
            fontFamily: 'monospace'
          }}>
            {formatTime(timerSeconds)}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isTimerRunning ? (
              <button onClick={startTimer} style={{
                padding: '8px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <Play style={{ height: '16px', width: '16px' }} />
              </button>
            ) : (
              <button onClick={pauseTimer} style={{
                padding: '8px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <Pause style={{ height: '16px', width: '16px' }} />
              </button>
            )}
            <button onClick={resetTimer} style={{
              padding: '8px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              <RotateCcw style={{ height: '16px', width: '16px' }} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: '#6b7280' }}>Cargando tareas...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Resumen de tareas por categoría */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: categorizedTasks.overdue.length > 0 ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${categorizedTasks.overdue.length > 0 ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: categorizedTasks.overdue.length > 0 ? '#dc2626' : '#059669' }}>
                {categorizedTasks.overdue.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Tareas Vencidas</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                {categorizedTasks.lastWeek.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Semana Pasada</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#e0e7ff',
              border: '1px solid #c7d2fe',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3730a3' }}>
                {categorizedTasks.older.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Más Antiguas</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                {categorizedTasks.thisWeek.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Esta Semana</div>
            </div>
          </div>

          {/* Tareas Vencidas (Prioridad Máxima) */}
          {categorizedTasks.overdue.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <AlertTriangle style={{ height: '24px', width: '24px', color: '#dc2626' }} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', margin: 0 }}>
                    ⚠️ Tareas Vencidas - Requieren Atención Inmediata
                  </h3>
                  <p style={{ fontSize: '14px', color: '#991b1b', margin: '4px 0 0 0' }}>
                    {categorizedTasks.overdue.length} tareas han superado su fecha límite
                  </p>
                </div>
              </div>
              {categorizedTasks.overdue.map((task) => (
                <TaskReviewCard key={task.id} task={task} isUrgent={true} />
              ))}
            </div>
          )}

          {/* Tareas de Semana Pasada */}
          {categorizedTasks.lastWeek.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <Calendar style={{ height: '20px', width: '20px', color: '#92400e' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', margin: 0 }}>
                  📅 Tareas de la Semana Pasada ({previousWeek.start.toLocaleDateString('es-ES')} - {previousWeek.end.toLocaleDateString('es-ES')})
                </h3>
              </div>
              {categorizedTasks.lastWeek.map((task) => (
                <TaskReviewCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {/* Tareas Más Antiguas */}
          {categorizedTasks.older.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <Archive style={{ height: '20px', width: '20px', color: '#3730a3' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#3730a3', margin: 0 }}>
                  📦 Tareas Acumuladas (Anteriores a la semana pasada)
                </h3>
              </div>
              {categorizedTasks.older.map((task) => (
                <TaskReviewCard key={task.id} task={task} isOld={true} />
              ))}
            </div>
          )}

          {/* Tareas de Esta Semana */}
          {categorizedTasks.thisWeek.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <Target style={{ height: '20px', width: '20px', color: '#059669' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#059669', margin: 0 }}>
                  🎯 Tareas de Esta Semana ({currentWeek.start.toLocaleDateString('es-ES')} - {currentWeek.end.toLocaleDateString('es-ES')})
                </h3>
              </div>
              {categorizedTasks.thisWeek.map((task) => (
                <TaskReviewCard key={task.id} task={task} />
              ))}
            </div>
          )}
          
          {pendingTasks.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #059669'
            }}>
              <CheckCircle style={{ height: '48px', width: '48px', color: '#059669', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#047857', margin: '0 0 8px 0' }}>¡Excelente trabajo!</h3>
              <p style={{ color: '#065f46', margin: 0 }}>No hay tareas pendientes</p>
            </div>
          )}
        </div>
      )}
    </div>
    );
  };

  const TaskReviewCard: React.FC<{ task: Task; isUrgent?: boolean; isOld?: boolean }> = ({ task, isUrgent = false, isOld = false }) => {
    const [showActions, setShowActions] = useState(false);
    const [completionReason, setCompletionReason] = useState('');
    const [delayReason, setDelayReason] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    
    const isOverdue = task.isOverdue;
    const daysOverdue = task.daysOverdue || 0;
    
    return (
      <div style={{
        backgroundColor: 'white',
        border: `2px solid ${
          isUrgent ? '#dc2626' : 
          isOverdue ? '#fecaca' : 
          isOld ? '#c7d2fe' : 
          '#e5e7eb'
        }`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: isUrgent ? '0 4px 12px rgba(220, 38, 38, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {task.title}
              </h3>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                color: PRIORITY_COLORS[task.priority]
              }}>
                {task.priority.toUpperCase()}
              </span>
              {isOverdue && (
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: '#fecaca',
                  color: '#dc2626'
                }}>
                  VENCIDA
                </span>
              )}
            </div>
            
            <p style={{ color: '#6b7280', margin: '0 0 12px 0', fontSize: '14px' }}>
              {task.description}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users style={{ height: '16px', width: '16px' }} />
                <span>{task.assigned_names?.join(', ')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar style={{ height: '16px', width: '16px' }} />
                <span>{new Date(task.deadline).toLocaleDateString('es-ES')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flag style={{ height: '16px', width: '16px' }} />
                <span>{task.category}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setShowActions(!showActions);
                if (!showActions) {
                  setCompletionReason('');
                  setDelayReason('');
                  setNewDeadline('');
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: showActions ? '#f3f4f6' : '#059669',
                color: showActions ? '#374151' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showActions ? 'Cancelar' : 'Revisar'}
            </button>
          </div>
        </div>
        
        {showActions && (
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {/* Marcar como completada */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <h4 style={{ color: '#047857', margin: '0 0 12px 0', fontSize: '16px' }}>
                ✅ Marcar como Completada
              </h4>
              <textarea
                value={completionReason}
                onChange={(e) => setCompletionReason(e.target.value)}
                placeholder="Describe brevemente cómo se completó la tarea..."
                style={{
                  width: '100%',
                  height: '60px',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'none',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={() => markTaskCompleted(task.id, completionReason)}
                disabled={!completionReason.trim()}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: completionReason.trim() ? '#059669' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: completionReason.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Completar Tarea
              </button>
            </div>
            
            {/* Posponer tarea */}
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fcd34d'
            }}>
              <h4 style={{ color: '#92400e', margin: '0 0 12px 0', fontSize: '16px' }}>
                ⏰ Posponer Tarea
              </h4>
              <select
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}
              >
                <option value="">Selecciona motivo...</option>
                {DELAY_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={() => markTaskDelayed(task.id, delayReason, newDeadline)}
                disabled={!delayReason || !newDeadline}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: (delayReason && newDeadline) ? '#f59e0b' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (delayReason && newDeadline) ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Posponer Tarea
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      overflow: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: '#f9fafb', 
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '1400px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '16px 16px 0 0',
          padding: '24px',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Reunión Semanal de Dirección
              </h1>
              <p style={{ opacity: 0.9, margin: 0 }}>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', opacity: 0.75 }}>Participantes</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {LEADERSHIP_TEAM.length} directivos
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {currentStep === 'review' && <TaskReviewStep />}
          {/* Otros pasos se implementarán en la siguiente iteración */}
        </div>

        {/* Navigation */}
        <div style={{ 
          padding: '24px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex', 
          justifyContent: 'space-between',
          backgroundColor: 'white',
          borderRadius: '0 0 16px 16px'
        }}>
          <button
            onClick={() => setCurrentStep('review')}
            style={{
              padding: '12px 24px',
              backgroundColor: currentStep === 'review' ? '#059669' : '#f3f4f6',
              color: currentStep === 'review' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            1. Revisar Tareas
          </button>
          
          <button
            onClick={() => setCurrentStep('create')}
            disabled={pendingTasks.length > 0}
            style={{
              padding: '12px 24px',
              backgroundColor: currentStep === 'create' ? '#059669' : '#f3f4f6',
              color: currentStep === 'create' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: pendingTasks.length === 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500',
              opacity: pendingTasks.length > 0 ? 0.5 : 1
            }}
          >
            2. Crear Nuevas Tareas
          </button>
          
          <button
            onClick={() => setCurrentStep('summary')}
            style={{
              padding: '12px 24px',
              backgroundColor: currentStep === 'summary' ? '#059669' : '#f3f4f6',
              color: currentStep === 'summary' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            3. Resumen y Cierre
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyDirectionMeeting;
