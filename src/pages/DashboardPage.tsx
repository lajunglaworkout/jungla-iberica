import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getWeek, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus,
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Grid3X3, 
  CheckCircle, 
  Bell,
  History,
  Package,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { Task } from '../types/dashboard';
import { TaskFormModal } from '../components/dashboard/TaskFormModal';
import { RecurrenceModal } from '../components/dashboard/RecurrenceModal';
import { DepartmentMeetingHistory } from '../components/dashboard/DepartmentMeetingHistory';
import { useSession } from '../contexts/SessionContext';
import { saveMeetingToSupabase, loadMeetingsFromSupabase, updateMeetingInSupabase, deleteMeetingFromSupabase } from '../services/meetingService';
import { canUserCreateMeetings } from '../config/departments';
import LogisticsManagementSystem from '../components/LogisticsManagementSystem';
import { LogisticsMetrics } from '../components/logistics/LogisticsMetrics';
import '../styles/dashboard.css';

// Datos de ejemplo para mostrar funcionalidad completa
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Revisión KPIs Centros',
    startDate: '2025-01-20',
    startTime: '10:30',
    endTime: '11:00',
    isRecurring: true,
    recurrenceRule: { pattern: 'weekly', interval: 1, daysOfWeek: [1] },
    category: 'meeting',
    meetingType: 'weekly',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '2',
    title: 'Reunión RRHH Semanal',
    startDate: '2025-01-21',
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true,
    recurrenceRule: { pattern: 'weekly', interval: 1, daysOfWeek: [2] },
    category: 'meeting',
    meetingType: 'weekly',
    department: 'RRHH y Procedimientos', // Mantener compatibilidad
    assignmentType: 'corporativo',
    assignmentId: 'RRHH y Procedimientos',
    priority: 'high',
    status: 'pending',
    description: 'Revisión semanal de ausencias, incidencias y procedimientos del departamento',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '3',
    title: 'Auditoría Sevilla',
    startDate: '2025-01-22',
    startTime: '11:00',
    endTime: '13:00',
    isRecurring: false,
    category: 'audit',
    priority: 'medium',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '4',
    title: 'Reunión Marketing Mensual',
    startDate: '2025-01-23',
    startTime: '16:00',
    endTime: '17:00',
    isRecurring: true,
    recurrenceRule: { pattern: 'monthly', interval: 1 },
    category: 'meeting',
    meetingType: 'monthly',
    department: 'Marketing',
    priority: 'high',
    status: 'pending',
    description: 'Revisión de contenido publicado, estrategia de redes sociales y campañas',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '5',
    title: 'Planificación Mensual',
    startDate: '2025-01-24',
    startTime: '10:00',
    endTime: '12:00',
    isRecurring: false,
    category: 'task',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '6',
    title: 'Formación Empleados',
    startDate: '2025-01-27',
    startTime: '09:30',
    endTime: '11:30',
    isRecurring: false,
    category: 'task',
    priority: 'medium',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '7',
    title: 'Reunión Logística',
    startDate: '2025-01-28',
    startTime: '15:00',
    endTime: '16:00',
    isRecurring: true,
    recurrenceRule: { pattern: 'weekly', interval: 1, daysOfWeek: [2] },
    category: 'meeting',
    meetingType: 'weekly',
    department: 'Logística', // Mantener compatibilidad
    assignmentType: 'corporativo',
    assignmentId: 'Logística',
    priority: 'medium',
    status: 'pending',
    description: 'Revisión de stock, pedidos y gestión de inventario',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '8',
    title: 'Evaluación Trimestral',
    startDate: '2025-01-31',
    startTime: '14:00',
    endTime: '16:00',
    isRecurring: false,
    category: 'review',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  },
  {
    id: '9',
    title: 'Reunión Encargado Sevilla',
    startDate: '2025-01-29',
    startTime: '11:00',
    endTime: '12:00',
    isRecurring: true,
    recurrenceRule: { pattern: 'weekly', interval: 1, daysOfWeek: [3] },
    category: 'meeting',
    meetingType: 'weekly',
    assignmentType: 'centro',
    assignmentId: 'francisco-giraldez',
    priority: 'high',
    status: 'pending',
    description: 'Reunión semanal con el encargado del centro de Sevilla para revisar KPIs y operaciones',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'ceo'
  }
];

const sampleAlerts = [
  {
    id: '1',
    title: 'Tarea Pendiente',
    description: 'Revisar informe financiero del Q3',
    type: 'warning' as const,
    priority: 'high' as const,
    createdAt: '2025-01-16T08:00:00Z',
    isRead: false
  },
  {
    id: '2',
    title: 'Reunión en 15 minutos',
    description: 'Revisión de objetivos trimestrales',
    type: 'info' as const,
    priority: 'medium' as const,
    createdAt: '2025-01-16T08:45:00Z',
    isRead: false
  }
];

const DashboardPage: React.FC = () => {
  const { employee } = useSession();
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [alerts] = useState(sampleAlerts);
  const [currentView, setCurrentView] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);
  const [showLogistics, setShowLogistics] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar reuniones desde Supabase al inicializar
  useEffect(() => {
    const loadMeetings = async () => {
      setLoading(true);
      try {
        const result = await loadMeetingsFromSupabase();
        if (result.success && result.meetings) {
          // Combinar reuniones de Supabase con tareas locales (no reuniones)
          const localTasks = sampleTasks.filter(task => task.category !== 'meeting');
          setTasks([...localTasks, ...result.meetings]);
        }
      } catch (error) {
        console.error('Error cargando reuniones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

  // Obtener días de la semana
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { locale: es });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Obtener tareas para un día específico
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => 
      isSameDay(new Date(task.startDate), date)
    );
  };

  // Funciones para vista mensual
  const getMonthDays = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const startWeek = startOfWeek(start, { locale: es });
    const endWeek = startOfWeek(addDays(end, 6), { locale: es });
    
    return eachDayOfInterval({ start: startWeek, end: addDays(endWeek, 6) });
  };

  const getWeeksInMonth = () => {
    const days = getMonthDays();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth();
  };

  // Manejar guardado de tarea
  const handleSaveTask = async (task: Task) => {
    setLoading(true);
    
    try {
      // Si es una reunión, guardar en Supabase
      if (task.category === 'meeting') {
        if (selectedTask) {
          // Actualizar reunión existente
          const result = await updateMeetingInSupabase(task);
          if (result.success) {
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
            console.log('✅ Reunión actualizada correctamente');
          } else {
            console.error('❌ Error actualizando reunión:', result.error);
            // Actualizar localmente aunque falle Supabase
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
          }
        } else {
          // Crear nueva reunión
          const result = await saveMeetingToSupabase(task);
          if (result.success && result.meeting) {
            // Usar el ID de Supabase para la tarea
            const taskWithSupabaseId = { ...task, id: result.meeting.id?.toString() || task.id };
            setTasks(prev => [...prev, taskWithSupabaseId]);
            console.log('✅ Reunión guardada correctamente');
          } else {
            console.error('❌ Error guardando reunión:', result.error);
            // Guardar localmente aunque falle Supabase
            setTasks(prev => [...prev, task]);
          }
        }
      } else {
        // Para tareas normales, solo guardar localmente
        if (selectedTask) {
          setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        } else {
          setTasks(prev => [...prev, task]);
        }
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      // Guardar localmente en caso de error
      if (selectedTask) {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      } else {
        setTasks(prev => [...prev, task]);
      }
    } finally {
      setLoading(false);
      setShowTaskModal(false);
      setSelectedTask(null);
      setNewTask({});
      setIsCreatingMeeting(false);
    }
  };

  // Renderizar calendario semanal
  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="calendar-container">
        <div className="week-grid">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={index} className="day-column">
                <div className="day-header">
                  <div className="day-name">
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className={`day-number ${isToday ? 'today' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="day-events">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`event ${task.category} ${task.priority}`}
                      onClick={() => {
                        setSelectedTask(task);
                        setNewTask(task);
                        setIsCreatingMeeting(task.category === 'meeting');
                        setShowTaskModal(true);
                      }}
                    >
                      <div className="event-time">
                        <Clock size={12} />
                        {task.startTime}
                      </div>
                      <div className="event-title">{task.title}</div>
                      {task.meetingType && (
                        <div className="event-recurring">
                          {task.meetingType === 'weekly' ? '📅' : '🗓️'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar vista mensual
  const renderMonthView = () => {
    const weeks = getWeeksInMonth();
    const monthName = format(selectedDate, 'MMMM yyyy', { locale: es });
    
    return (
      <div className="calendar-container">
        <div className="month-header">
          <h2>{monthName}</h2>
          <div className="month-navigation">
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedDate(addDays(selectedDate, -30))}
            >
              ← Anterior
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedDate(new Date())}
            >
              Hoy
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedDate(addDays(selectedDate, 30))}
            >
              Siguiente →
            </button>
          </div>
        </div>
        
        <div className="month-grid">
          {/* Header con días de la semana */}
          <div className="month-weekdays">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>
          
          {/* Semanas del mes */}
          <div className="month-weeks">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="month-week">
                {week.map((day, dayIndex) => {
                  const dayTasks = getTasksForDay(day);
                  const isCurrentMonthDay = isCurrentMonth(day);
                  const isDayToday = isToday(day);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`month-day ${isCurrentMonthDay ? 'current-month' : 'other-month'} ${isDayToday ? 'today' : ''}`}
                      onClick={() => {
                        setSelectedDate(day);
                        setCurrentView('week');
                      }}
                    >
                      <div className="day-number">
                        {format(day, 'd')}
                      </div>
                      
                      <div className="day-tasks">
                        {dayTasks.slice(0, 3).map(task => (
                          <div 
                            key={task.id}
                            className={`month-task ${task.category} ${task.priority}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setNewTask(task);
                              setIsCreatingMeeting(task.category === 'meeting');
                              setShowTaskModal(true);
                            }}
                          >
                            <span className="task-time">{task.startTime}</span>
                            <span className="task-title">{task.title}</span>
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="more-tasks">
                            +{dayTasks.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar panel de alertas
  const renderAlertsPanel = () => (
    <div className="alerts-container">
      <div className="alerts-panel">
        <div className="alerts-header">
          <h3>
            <Bell size={18} />
            Alertas
          </h3>
          <span className="badge">{alerts.filter(a => !a.isRead).length}</span>
        </div>
        
        <div className="alerts-list">
          <div className="alert-section">
            <h4>Pendientes</h4>
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`alert ${alert.type} ${alert.isRead ? 'read' : 'unread'}`}>
                <div className="alert-icon">
                  {alert.type === 'warning' && <AlertTriangle size={16} />}
                  {alert.type === 'info' && <CheckCircle size={16} />}
                </div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.description}</div>
                  <div className="alert-time">
                    {format(new Date(alert.createdAt), 'HH:mm', { locale: es })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>
          Bienvenido, {employee?.name || 'Usuario'}
          {loading && (
            <span style={{ 
              marginLeft: '1rem', 
              fontSize: '0.8rem', 
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #059669',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Guardando...
            </span>
          )}
        </h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSelectedTask(null);
              setIsCreatingMeeting(false);
              setNewTask({
                isRecurring: false,
                category: 'task',
                priority: 'medium',
                status: 'pending',
                startDate: format(new Date(), 'yyyy-MM-dd'),
                startTime: '09:00'
              });
              setShowTaskModal(true);
            }}
          >
            <Plus size={16} />
            Nueva Tarea
          </button>
          
          {canUserCreateMeetings(employee?.email || 'carlossuarezparra@gmail.com') && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedTask(null);
                setIsCreatingMeeting(true);
                setNewTask({
                  isRecurring: true,
                  category: 'meeting',
                  meetingType: 'weekly',
                  priority: 'high',
                  status: 'pending',
                  startDate: format(new Date(), 'yyyy-MM-dd'),
                  startTime: '10:00',
                  endTime: '11:00'
                });
                setShowTaskModal(true);
              }}
            >
              <Calendar size={16} />
              Nueva Reunión
            </button>
          )}

          <button 
            className="btn btn-secondary"
            onClick={() => setShowMeetingHistory(!showMeetingHistory)}
            style={{ 
              backgroundColor: showMeetingHistory ? '#059669' : undefined,
              color: showMeetingHistory ? 'white' : undefined
            }}
          >
            <History size={16} />
            Historial Reuniones
          </button>

          <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowLogistics(!showLogistics);
              setShowMeetingHistory(false); // Cerrar historial si está abierto
            }}
            style={{ 
              backgroundColor: showLogistics ? '#059669' : undefined,
              color: showLogistics ? 'white' : undefined
            }}
          >
            <Package size={16} />
            Logística
          </button>

          {/* Solo CEO puede ver gestión de usuarios */}
          {employee?.email === 'carlossuarezparra@gmail.com' && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                // TODO: Implementar gestión de usuarios
                alert('Módulo de Gestión de Usuarios - Próximamente');
              }}
            >
              <Users size={16} />
              Usuarios
            </button>
          )}

          <div className="view-toggle">
            <button 
              className={`btn ${currentView === 'week' ? 'active' : ''}`}
              onClick={() => setCurrentView('week')}
            >
              <List size={16} />
              Semana
            </button>
            <button 
              className={`btn ${currentView === 'month' ? 'active' : ''}`}
              onClick={() => setCurrentView('month')}
            >
              <LayoutDashboard size={16} />
              Mes
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="dashboard-content">
        {showMeetingHistory && (
          <DepartmentMeetingHistory 
            tasks={tasks.filter(task => task.category === 'meeting')}
            onEditMeeting={(meeting) => {
              setSelectedTask(meeting);
              setIsCreatingMeeting(true);
              setNewTask(meeting);
              setShowTaskModal(true);
            }}
          />
        )}

        {showLogistics && (
          <LogisticsManagementSystem />
        )}
        
        {!showMeetingHistory && !showLogistics && (
          <>
            {(currentView === 'week' ? renderWeekView() : renderMonthView())}
            {renderAlertsPanel()}
          </>
        )}
      </div>

      {/* Modales */}
      {showTaskModal && (
        <TaskFormModal
          task={newTask}
          isCreatingMeeting={isCreatingMeeting}
          currentUserEmail={employee?.email || 'carlossuarezparra@gmail.com'}
          onSave={handleSaveTask}
          onDelete={selectedTask ? async () => {
            setLoading(true);
            try {
              // Si es una reunión, eliminar de Supabase
              if (selectedTask.category === 'meeting') {
                const result = await deleteMeetingFromSupabase(selectedTask.id);
                if (result.success) {
                  console.log('✅ Reunión eliminada de Supabase');
                } else {
                  console.error('❌ Error eliminando reunión:', result.error);
                }
              }
              
              // Eliminar localmente en cualquier caso
              setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
            } catch (error) {
              console.error('Error inesperado eliminando:', error);
              // Eliminar localmente aunque falle Supabase
              setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
            } finally {
              setLoading(false);
              setShowTaskModal(false);
              setSelectedTask(null);
              setIsCreatingMeeting(false);
            }
          } : undefined}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
            setNewTask({});
            setIsCreatingMeeting(false);
          }}
          onRecurrenceClick={() => setShowRecurrenceModal(true)}
        />
      )}

      {showRecurrenceModal && (
        <RecurrenceModal
          initialRule={newTask.recurrenceRule}
          onSave={(rule) => {
            setNewTask(prev => ({ ...prev, recurrenceRule: rule }));
            setShowRecurrenceModal(false);
          }}
          onClose={() => setShowRecurrenceModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
