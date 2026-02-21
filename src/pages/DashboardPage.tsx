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
import { supabase } from '../lib/supabase';
import LogisticsManagementSystem from '../components/LogisticsManagementSystem';
import { LogisticsMetrics } from '../components/logistics/LogisticsMetrics';
import MaintenanceModule from '../components/MaintenanceModule';
import TaskCompletionModal from '../components/meetings/TaskCompletionModal';
import { IncidentVerificationNotification } from '../components/incidents/IncidentVerificationNotification';
import { UserManagementSystem } from '../components/admin/UserManagementSystem';
import SmartIncidentModal from '../components/incidents/SmartIncidentModal';
import IncidentManagementModal from '../components/incidents/IncidentManagementModal';
import { checklistIncidentService } from '../services/checklistIncidentService';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService';
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

// Interfaz para las alertas inteligentes
interface SmartAlert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success' | 'error';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  isRead: boolean;
  department?: string;
  actionUrl?: string;
  moduleId?: string;
  hrView?: string;
  logisticsView?: string;
  taskId?: string | number; // Para notificaciones de tareas
  reviewId?: string | number; // Para revisiones trimestrales
  notificationId?: number; // Para marcar como leída al hacer click
}

const DashboardPage: React.FC = () => {
  const { employee, userRole } = useSession();
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [currentView, setCurrentView] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);
  const [showLogistics, setShowLogistics] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showIncidentManagementModal, setShowIncidentManagementModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showOverdueIncidentsOnly, setShowOverdueIncidentsOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTaskCompletionModal, setShowTaskCompletionModal] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<any>(null);

  // Cargar reuniones y tareas desde Supabase al inicializar
  useEffect(() => {
    const loadMeetingsAndTasks = async () => {
      setLoading(true);
      try {
        // 🔧 NUEVO: Cargar reuniones filtrando por email del usuario
        // Esto permite que cada usuario vea solo las reuniones donde participa
        const userEmail = employee?.email || 'carlossuarezparra@gmail.com';
        const meetingsResult = await loadMeetingsFromSupabase(userEmail);

        // Cargar tareas pendientes del usuario
        const { data: tasksData, error: tasksError } = await supabase
          .from('tareas')
          .select('*')
          .eq('estado', 'pendiente')
          .eq('asignado_a', employee?.email || '')
          .order('fecha_limite', { ascending: true });

        if (tasksError) {
          console.error('Error cargando tareas:', tasksError);
        }

        // Convertir tareas a formato de calendario
        const calendarTasks = (tasksData || []).map(task => ({
          id: `task-${task.id}`,
          title: task.titulo,
          date: task.fecha_limite,
          startDate: task.fecha_limite,
          time: '00:00',
          startTime: '00:00',
          category: 'task' as const,
          priority: task.prioridad,
          department: task.departamento,
          taskId: task.id,
          description: task.descripcion,
          isRecurring: false,
          status: 'pending' as const,
          createdAt: task.created_at || new Date().toISOString(),
          updatedAt: task.created_at || new Date().toISOString(),
          createdBy: task.asignado_a
        }));

        // Combinar reuniones y tareas
        const allItems = [
          ...(meetingsResult.success && meetingsResult.meetings ? meetingsResult.meetings : []),
          ...calendarTasks
        ];

        setTasks(allItems);
        console.log(`📊 Calendario cargado: ${meetingsResult.meetings?.length || 0} reuniones + ${calendarTasks.length} tareas`);
      } catch (error) {
        console.error('Error cargando datos del calendario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employee?.email) {
      loadMeetingsAndTasks();
    }
  }, [employee?.email]);

  // Función para cargar alertas inteligentes según el rol
  const loadSmartAlerts = async () => {
    const newAlerts: SmartAlert[] = [];
    const now = new Date().toISOString();

    try {
      if (userRole === 'admin') {
        console.log('🔔 Buscando solicitudes de vacaciones pendientes...');
        const { data: vacationRequests, error } = await supabase
          .from('vacation_requests')
          .select('*')
          .eq('status', 'pending')
          .order('requested_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (vacationRequests && vacationRequests.length > 0) {
          console.log(`🔔 Encontradas ${vacationRequests.length} solicitudes pendientes`);

          const employees = [...new Set(vacationRequests.map((request: any) => request.employee_name))];
          const maxShown = 3;
          const displayed = employees.slice(0, maxShown);
          const remaining = employees.length - displayed.length;
          const applicantsText = `${displayed.join(', ')}${remaining > 0 ? ` y ${remaining} más` : ''}`;

          newAlerts.push({
            id: 'vac-requests',
            title: 'Vacaciones pendientes de aprobar',
            description: `${vacationRequests.length} solicitud${vacationRequests.length === 1 ? '' : 'es'} de ${applicantsText}`,
            type: 'warning',
            priority: 'high',
            createdAt: vacationRequests[0].requested_at ?? now,
            isRead: false,
            department: 'RRHH',
            actionUrl: '/hr-management',
            moduleId: 'hr',
            hrView: 'vacations'
          });
        }

        // Buscar solicitudes de uniformes pendientes
        console.log('👕 Buscando solicitudes de uniformes pendientes...');
        const { data: uniformRequests, error: uniformError } = await supabase
          .from('uniform_requests')
          .select('*')
          .eq('status', 'pending')
          .order('requested_at', { ascending: false });

        if (!uniformError && uniformRequests && uniformRequests.length > 0) {
          console.log(`👕 Encontradas ${uniformRequests.length} solicitudes de uniformes pendientes`);

          const employees = [...new Set(uniformRequests.map((request: any) => request.employee_name))];
          const maxShown = 3;
          const displayed = employees.slice(0, maxShown);
          const remaining = employees.length - displayed.length;
          const applicantsText = `${displayed.join(', ')}${remaining > 0 ? ` y ${remaining} más` : ''}`;

          newAlerts.push({
            id: 'uniform-requests',
            title: 'Solicitudes de uniformes pendientes',
            description: `${uniformRequests.length} solicitud${uniformRequests.length === 1 ? '' : 'es'} de ${applicantsText}`,
            type: 'info',
            priority: 'high',
            createdAt: uniformRequests[0].requested_at ?? now,
            isRead: false,
            department: 'Logística',
            actionUrl: '/logistics',
            moduleId: 'logistics',
            logisticsView: 'orders'
          });
        }

        // Cargar incidencias reales de checklist para ADMINS
        console.log('🚨 Buscando incidencias pendientes para admin:', employee?.email);
        try {
          const pendingIncidents = await checklistIncidentService.getPendingIncidents();
          console.log('🚨 Incidencias encontradas:', pendingIncidents);

          if (pendingIncidents && pendingIncidents.length > 0) {
            console.log(`🚨 Encontradas ${pendingIncidents.length} incidencias pendientes`);

            // Agrupar por departamento
            const incidentsByDept = pendingIncidents.reduce((acc: any, incident: any) => {
              const dept = incident.department || 'General';
              if (!acc[dept]) acc[dept] = [];
              acc[dept].push(incident);
              return acc;
            }, {});

            // Crear alerta por cada departamento con incidencias
            Object.entries(incidentsByDept).forEach(([dept, incidents]: [string, any]) => {
              const incidentList = incidents as any[];
              const titles = incidentList.slice(0, 2).map((inc: any) => inc.title.replace('Incidencia: ', '')).join(', ');
              const remaining = incidentList.length > 2 ? ` y ${incidentList.length - 2} más` : '';

              // Solo mostrar incidencias relevantes para el usuario actual
              // 🔧 REFACTORIZADO: Usar departamentos asignados en lugar de emails hardcodeados
              const userDepts = employee?.departments || [];
              const hasLogistics = userDepts.some(d => d.id === 'logistics' || d.name === 'Logística');
              const hasMaintenance = userDepts.some(d => d.id === 'maintenance' || d.name === 'Mantenimiento');
              const hasHR = userDepts.some(d => d.id === 'hr' || d.name === 'RRHH' || d.name === 'Personal');
              const hasCustomerService = userDepts.some(d => d.id === 'customer_service' || d.name === 'Atención al Cliente');

              console.log('🚨 Evaluando incidencia:', dept, 'para usuario:', employee?.email);
              console.log('🏢 Departamentos del usuario:', userDepts);

              const shouldShowIncident =
                (hasMaintenance && dept === 'Mantenimiento') ||
                (hasLogistics && dept === 'Logística') ||
                (hasHR && dept === 'Personal') ||
                (hasCustomerService && dept === 'Atención al Cliente') ||
                (userRole === 'superadmin'); // CEO ve todo

              console.log('🚨 Mostrar incidencia:', shouldShowIncident);

              if (shouldShowIncident) {
                newAlerts.push({
                  id: `incidents-${dept.toLowerCase()}`,
                  title: `${incidentList.length} Incidencia${incidentList.length === 1 ? '' : 's'} - ${dept}`,
                  description: `${titles}${remaining}`,
                  type: 'error',
                  priority: incidentList.some((inc: any) => inc.priority === 'critica') ? 'high' : 'high',
                  createdAt: incidentList[0].created_at || now,
                  isRead: false,
                  department: dept,
                  actionUrl: dept === 'Mantenimiento' ? '/maintenance' :
                    dept === 'Logística' ? '/logistics' :
                      dept === 'Personal' ? '/hr-management' : '/incidents',
                  moduleId: dept === 'Mantenimiento' ? 'maintenance' :
                    dept === 'Logística' ? 'logistics' :
                      dept === 'Personal' ? 'hr' : 'incidents'
                });
              }
            });
          }
        } catch (error) {
          console.error('❌ Error cargando incidencias:', error);
        }
      }

      // ALERTAS PARA ENCARGADOS DE CENTRO (Vicente, Francisco, etc.)
      else if (userRole === 'center_manager') {
        // 1. Solicitudes de vacaciones pendientes
        const { data: centerEmployees } = await supabase
          .from('employees')
          .select('id')
          .eq('center_id', 9); // Centro Sevilla

        if (centerEmployees && centerEmployees.length > 0) {
          const employeeIds = centerEmployees.map((emp: any) => emp.id);

          const { data: vacationRequests } = await supabase
            .from('vacation_requests')
            .select('*')
            .in('employee_id', employeeIds)
            .eq('status', 'pending');

          if (vacationRequests && vacationRequests.length > 0) {
            newAlerts.push({
              id: 'vacation-requests',
              title: `${vacationRequests.length} Solicitud${vacationRequests.length > 1 ? 'es' : ''} de Vacaciones`,
              description: `${vacationRequests.map((r: any) => r.employee_name).join(', ')} ha${vacationRequests.length > 1 ? 'n' : ''} solicitado vacaciones`,
              type: 'warning',
              priority: 'high',
              createdAt: now,
              isRead: false,
              department: 'RRHH'
            });
          }
        }

      }


      // ALERTAS PARA CEO (Carlos)
      else if (userRole === 'superadmin') {
        // Verificar incidencias vencidas
        console.log('👑 CEO - Verificando incidencias vencidas...');
        try {
          const overdueIncidents = await checklistIncidentService.getOverdueIncidents();

          if (overdueIncidents && overdueIncidents.length > 0) {
            console.log(`⏰ ${overdueIncidents.length} incidencias vencidas encontradas`);

            // Agrupar por prioridad
            const critical = overdueIncidents.filter(i => i.priority === 'critica');
            const high = overdueIncidents.filter(i => i.priority === 'alta');
            const medium = overdueIncidents.filter(i => i.priority === 'media');
            const low = overdueIncidents.filter(i => i.priority === 'baja');

            let description = '';
            if (critical.length > 0) description += `${critical.length} crítica${critical.length > 1 ? 's' : ''}, `;
            if (high.length > 0) description += `${high.length} alta${high.length > 1 ? 's' : ''}, `;
            if (medium.length > 0) description += `${medium.length} media${medium.length > 1 ? 's' : ''}, `;
            if (low.length > 0) description += `${low.length} baja${low.length > 1 ? 's' : ''}`;
            description = description.replace(/, $/, ''); // Quitar última coma

            newAlerts.push({
              id: 'overdue-incidents',
              title: `⚠️ ${overdueIncidents.length} Incidencia${overdueIncidents.length > 1 ? 's' : ''} Vencida${overdueIncidents.length > 1 ? 's' : ''}`,
              description: `Sin resolver: ${description}`,
              type: 'error',
              priority: 'high',
              createdAt: overdueIncidents[0].created_at || now,
              isRead: false,
              department: 'Incidencias',
              actionUrl: '/incidents',
              moduleId: 'incidents'
            });
          }

          // Verificar incidencias próximas a vencer
          const nearDeadline = await checklistIncidentService.getIncidentsNearDeadline();
          if (nearDeadline && nearDeadline.length > 0) {
            console.log(`⚠️ ${nearDeadline.length} incidencias próximas a vencer`);

            newAlerts.push({
              id: 'near-deadline-incidents',
              title: `⏰ ${nearDeadline.length} Incidencia${nearDeadline.length > 1 ? 's' : ''} Próxima${nearDeadline.length > 1 ? 's' : ''} a Vencer`,
              description: `Menos de 2 horas restantes`,
              type: 'warning',
              priority: 'high',
              createdAt: nearDeadline[0].created_at || now,
              isRead: false,
              department: 'Incidencias',
              actionUrl: '/incidents',
              moduleId: 'incidents'
            });
          }
        } catch (error) {
          console.error('Error verificando incidencias vencidas:', error);
        }
      }

      // Cargar notificaciones de tareas para todos los usuarios
      if (employee?.email) {
        console.log('📧 Cargando notificaciones de tareas para:', employee.email);
        try {
          const notificationsResult = await getUserNotifications(employee.email, true); // Solo no leídas

          if (notificationsResult.success && notificationsResult.notifications) {
            const allNotifications = notificationsResult.notifications;
            console.log(`📧 Procesando ${allNotifications.length} notificaciones`);

            // 1. Procesar TAREAS (excluyendo revisiones)
            const taskNotifications = allNotifications.filter((n: any) =>
              (n.type === 'task_assigned' || n.type === 'task_deadline') &&
              n.reference_type !== 'quarterly_review'
            );

            taskNotifications.forEach((notification: any) => {
              newAlerts.push({
                id: `task-notification-${notification.id}`,
                title: notification.title,
                description: notification.message,
                type: notification.type === 'task_assigned' ? 'info' : 'success',
                priority: 'medium',
                createdAt: notification.created_at,
                isRead: notification.is_read,
                department: 'Tareas',
                actionUrl: '/meetings',
                moduleId: 'meetings',
                taskId: notification.task_id,
                notificationId: notification.id // Guardar ID original
              });
            });

            // 2. Procesar REVISIONES TRIMESTRALES
            const reviewNotifications = allNotifications.filter((n: any) =>
              n.reference_type === 'quarterly_review' ||
              n.type === 'review_assigned'
            );

            if (reviewNotifications.length > 0) {
              console.log(`📋 Encontradas ${reviewNotifications.length} notificaciones de revisión`);
              reviewNotifications.forEach((notification: any) => {
                // Determinar destino según el rol del usuario
                const isAdmin = employee?.role === 'admin' || employee?.role === 'superadmin';
                const targetModuleId = isAdmin ? 'logistics' : 'center-management';
                const targetView = isAdmin ? 'quarterly' : 'inventory-review';
                const targetDepartment = isAdmin ? 'Logística' : 'Gestión';

                newAlerts.push({
                  id: `review-notification-${notification.id}`,
                  title: notification.title,
                  description: notification.message || 'Nueva revisión asignada',
                  type: 'info',
                  priority: 'high',
                  createdAt: notification.created_at,
                  isRead: notification.is_read,
                  department: targetDepartment,
                  actionUrl: `/${targetModuleId}`,
                  moduleId: targetModuleId,
                  logisticsView: targetView,
                  reviewId: notification.reference_id,
                  notificationId: notification.id
                });
              });
            }
          }
        } catch (error) {
          console.error('❌ Error cargando notificaciones de tareas:', error);
        }
      }

      setAlerts(newAlerts);
      console.log(`📬 Estado de alertas actualizado: ${newAlerts.length} elementos`);
    } catch (error) {
      console.error('Error cargando alertas inteligentes:', error);
    }
  };

  // Cargar alertas al inicializar
  useEffect(() => {
    if (userRole && employee) {
      loadSmartAlerts();
      const interval = setInterval(loadSmartAlerts, 120000);
      return () => clearInterval(interval);
    }
  }, [userRole, employee?.id]);

  // Obtener días de la semana (solo lunes a viernes)
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { locale: es });
    // Solo devolver lunes (0) a viernes (4) - 5 días laborables
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  };

  // Obtener tareas para un día específico - ORDENADAS POR HORA
  const getTasksForDay = (date: Date) => {
    return tasks
      .filter(task => isSameDay(new Date(task.startDate), date))
      .sort((a, b) => {
        // Ordenar por hora de inicio
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });
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

  // Renderizar calendario semanal mejorado (Lunes a Viernes)
  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const weekStart = format(weekDays[0], 'dd/MM', { locale: es });
    const weekEnd = format(weekDays[4], 'dd/MM', { locale: es });

    return (
      <div className="calendar-container">
        {/* Header de la semana con navegación */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: '600' }}>
              Semana Laboral: {weekStart} - {weekEnd}
            </h2>
            <span style={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {format(new Date(), 'MMMM yyyy', { locale: es })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              }}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                padding: '8px 12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Hoy
            </button>

            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              }}
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Grid de días laborables */}
        <div className="week-grid">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            const dayName = format(day, 'EEEE', { locale: es });
            const dayNumber = format(day, 'd');
            const monthName = format(day, 'MMM', { locale: es });

            return (
              <div key={index} className="day-column">
                <div className="day-header" style={{
                  backgroundColor: isToday ? '#f0f9ff' : '#f8f9fa',
                  borderBottom: isToday ? '2px solid #059669' : '1px solid #eee'
                }}>
                  <div className="day-name" style={{
                    color: isToday ? '#059669' : '#6b7280',
                    fontWeight: isToday ? '600' : '500'
                  }}>
                    {dayName}
                  </div>
                  <div className={`day-number ${isToday ? 'today' : ''}`} style={{
                    backgroundColor: isToday ? '#059669' : 'transparent',
                    color: isToday ? 'white' : '#111827'
                  }}>
                    {dayNumber}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    marginTop: '2px',
                    textTransform: 'uppercase'
                  }}>
                    {monthName}
                  </div>
                </div>

                <div className="day-events" style={{
                  padding: '8px',
                  minHeight: '300px',
                  backgroundColor: isToday ? '#fefffe' : 'white'
                }}>
                  {dayTasks.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      color: '#9ca3af',
                      fontSize: '13px',
                      marginTop: '20px',
                      fontStyle: 'italic'
                    }}>
                      Sin eventos programados
                    </div>
                  ) : (
                    dayTasks.map(task => (
                      <div
                        key={task.id}
                        className={`event ${task.category} ${task.priority}`}
                        onClick={() => {
                          if (task.category === 'task') {
                            // Si es una tarea, abrir modal de completar
                            setSelectedTaskForCompletion(task);
                            setShowTaskCompletionModal(true);
                          } else {
                            // Si es reunión, abrir modal de edición
                            setSelectedTask(task);
                            setNewTask(task);
                            setIsCreatingMeeting(task.category === 'meeting');
                            setShowTaskModal(true);
                          }
                        }}
                        style={{
                          marginBottom: '8px',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          border: '1px solid #e5e7eb',
                          // 🎨 COLORES: Amarillo para reuniones, Rojo para tareas con deadline
                          backgroundColor: task.category === 'meeting'
                            ? '#fef3c7' // Amarillo para reuniones
                            : task.endTime
                              ? '#fee2e2' // Rojo claro para tareas con hora de fin (deadline)
                              : '#dbeafe', // Azul claro para tareas sin deadline
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div className="event-time" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          <Clock size={12} />
                          {task.startTime}
                          {task.endTime && ` - ${task.endTime}`}
                        </div>
                        <div className="event-title" style={{
                          fontWeight: '500',
                          fontSize: '13px',
                          color: '#111827',
                          marginBottom: '2px'
                        }}>
                          {task.title}
                        </div>
                        {task.meetingType && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            color: '#059669'
                          }}>
                            {task.meetingType === 'weekly' ? '📅' : '🗓️'}
                            <span>Recurrente</span>
                          </div>
                        )}
                        {task.priority === 'high' && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%'
                          }} />
                        )}
                      </div>
                    ))
                  )}

                  {/* Botón para añadir evento rápido */}
                  <button
                    onClick={() => {
                      setNewTask({
                        startDate: format(day, 'yyyy-MM-dd'),
                        startTime: '09:00',
                        endTime: '10:00',
                        category: 'task' as const,
                        priority: 'medium'
                      });
                      setIsCreatingMeeting(false);
                      setShowTaskModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '8px',
                      backgroundColor: 'transparent',
                      border: '1px dashed #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.color = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <Plus size={14} />
                    Añadir evento
                  </button>
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

  // Renderizar panel de alertas y botones de acción
  const renderAlertsPanel = () => (
    <div className="alerts-container">
      <div className="alerts-panel">
        {/* Sección de Alertas - Parte Superior */}
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
            {alerts.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                🎉 No hay notificaciones pendientes
              </div>
            ) : (
              alerts.slice(0, 4).map((alert: SmartAlert) => (
                <div
                  key={alert.id}
                  className={`alert ${alert.type} ${alert.isRead ? 'read' : 'unread'}`}
                  role={alert.actionUrl || alert.moduleId ? 'button' : undefined}
                  tabIndex={alert.actionUrl || alert.moduleId ? 0 : undefined}
                  onClick={() => handleAlertNavigation(alert)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleAlertNavigation(alert);
                    }
                  }}
                  style={{ cursor: alert.actionUrl || alert.moduleId ? 'pointer' : 'default' }}
                >
                  <div className="alert-icon">
                    {alert.type === 'warning' && <AlertTriangle size={16} />}
                    {alert.type === 'info' && <CheckCircle size={16} />}
                    {alert.type === 'error' && <AlertTriangle size={16} />}
                    {alert.type === 'success' && <CheckCircle size={16} />}
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">
                      {alert.title}
                      {alert.department && (
                        <span style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          marginLeft: '8px',
                          fontWeight: 'normal'
                        }}>
                          • {alert.department}
                        </span>
                      )}
                    </div>
                    <div className="alert-message">{alert.description}</div>
                    <div className="alert-time">
                      {format(new Date(alert.createdAt), 'HH:mm', { locale: es })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sección de Botones de Acción - Parte Inferior */}
        <div className="action-buttons-section">
          <div className="action-buttons-header">
            <h3>
              <LayoutDashboard size={18} />
              Acciones Rápidas
            </h3>
          </div>

          <div className="action-buttons-grid">
            {/* Nueva Tarea */}
            <button
              className="action-btn primary"
              onClick={() => {
                setSelectedTask(null);
                setIsCreatingMeeting(false);
                setNewTask({
                  isRecurring: false,
                  category: 'task' as const,
                  priority: 'medium',
                  status: 'pending' as const,
                  startDate: format(new Date(), 'yyyy-MM-dd'),
                  startTime: '09:00'
                });
                setShowTaskModal(true);
              }}
              style={{ backgroundColor: '#059669', color: 'white' }}
            >
              <Plus size={20} />
              <span>Nueva Tarea</span>
            </button>

            {/* Solo directivos pueden crear reuniones y ver módulos administrativos */}
            {canUserCreateMeetings(employee?.email || '') && employee?.role !== 'center_manager' && (
              <>
                {/* Nueva Reunión */}
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    setNewTask({
                      title: 'Nueva Reunión',
                      isRecurring: true,
                      category: 'meeting',
                      meetingType: 'weekly',
                      priority: 'high',
                      status: 'pending' as const,
                      startDate: format(new Date(), 'yyyy-MM-dd'),
                      startTime: '10:00',
                      endTime: '11:00'
                    });
                    setShowTaskModal(true);
                  }}
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                >
                  <Calendar size={20} />
                  <span>Nueva Reunión</span>
                </button>

                {/* Historial Reuniones */}
                <button
                  className="action-btn tertiary"
                  onClick={() => setShowMeetingHistory(!showMeetingHistory)}
                  style={{
                    backgroundColor: showMeetingHistory ? '#8b5cf6' : '#f3f4f6',
                    color: showMeetingHistory ? 'white' : '#374151'
                  }}
                >
                  <History size={20} />
                  <span>Historial</span>
                </button>
              </>
            )}

            {/* Solo CEO puede ver gestión de usuarios */}
            {employee?.email === 'carlossuarezparra@gmail.com' && (
              <button
                className="action-btn users"
                onClick={() => {
                  setShowUserManagement(!showUserManagement);
                  setShowMeetingHistory(false);
                }}
                style={{
                  backgroundColor: showUserManagement ? '#6366f1' : '#f3f4f6',
                  color: showUserManagement ? 'white' : '#374151'
                }}
              >
                <Users size={20} />
                <span>Usuarios</span>
              </button>
            )}

            {/* Incidencias - Disponible para todos */}
            <button
              className="action-btn incidents"
              onClick={() => setShowIncidentModal(true)}
              style={{ backgroundColor: '#ef4444', color: 'white' }}
            >
              <AlertTriangle size={20} />
              <span>Incidencias</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleAlertNavigation = (alert: SmartAlert) => {
    console.log('🔔 handleAlertNavigation llamado con:', alert);

    // 1. PRIORIDAD TOTAL: NAVEGACIÓN
    // Si tiene moduleId, navegar inmediatamente (sin esperar a nada)
    if (alert.moduleId) {
      console.log('🚀 Navegando a módulo:', alert.moduleId);

      // 1. Dispatch evento principal de navegación
      window.dispatchEvent(
        new CustomEvent('navigate-module', {
          detail: {
            moduleId: alert.moduleId,
            fallbackUrl: alert.actionUrl ?? null,
            // App.tsx espera logisticsView para despachar logistics-module-view
            logisticsView: alert.moduleId === 'logistics' ? alert.logisticsView : undefined
          }
        })
      );

      // 2. Si es para gestión del centro, lanzar evento específico
      // Esto es necesario porque App.tsx maneja el módulo pero CenterManagement maneja la sub-vista
      if (alert.moduleId === 'center-management' && alert.logisticsView) {
        setTimeout(() => {
          console.log('🚀 Lanzando evento de vista interna CenterManagement:', alert.logisticsView);
          window.dispatchEvent(
            new CustomEvent('center-management-view', {
              detail: { view: alert.logisticsView }
            })
          );
        }, 100);
      }

      // 3. FIRE AND FORGET: Marcar como leída después de lanzar la navegación
      if (alert.notificationId) {
        // TEMPORALMENTE DESACTIVADO para diagnosticar logout
        // console.log('🔔 (DEBUG) Saltando markNotificationAsRead para evitar logout:', alert.notificationId);

        // REACTIVANDO: El problema era el módulo incorrecto, no el update
        markNotificationAsRead(alert.notificationId)
          .then(() => console.log('✅ Notificación marcada como leída (background)'))
          .catch(err => console.error('❌ Error marcando notificación (background):', err));
      }

      return;
    }

    // Lógica para modales (se mantiene igual, pero añadimos el mark as read safety)

    // Si es una notificación de tarea
    if (alert.id.startsWith('task-notification-')) {
      setSelectedTaskForCompletion({
        taskId: alert.taskId,
        title: alert.title || 'Tarea pendiente',
        description: alert.description
      });
      setShowTaskCompletionModal(true);

      // Marcar como leída
      if (alert.notificationId) markNotificationAsRead(alert.notificationId).catch(console.error);
      return;
    }

    // Si es una alerta de incidencias vencidas
    if (alert.id === 'overdue-incidents' || alert.id === 'near-deadline-incidents') {
      setSelectedDepartment('');
      setShowOverdueIncidentsOnly(true);
      setShowIncidentManagementModal(true);
      return;
    }

    // Si es una alerta de incidencias normales
    if (alert.id.startsWith('incidents-')) {
      setSelectedDepartment(alert.department || '');
      setShowIncidentManagementModal(true);
      return;
    }

    // Último recurso: Action URL directa (solo si no es módulo)
    if (alert.actionUrl) {
      // Marcar como leída antes de redescargar la página
      if (alert.notificationId) {
        markNotificationAsRead(alert.notificationId).catch(console.error);
      }
      window.location.href = alert.actionUrl;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>
          Buenos días, {employee?.name || 'Usuario'}
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
        {/* Solo directivos ven las vistas de calendario - NO encargados de centro */}
        {employee?.role !== 'center_manager' && (
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
        )}
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
            userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
            userName={employee?.nombre || 'Carlos Suárez'}
            onBack={() => setShowMaintenance(false)}
          />
        )}

        {showLogistics && (
          <LogisticsManagementSystem />
        )}

        {showMaintenance && (
          <MaintenanceModule
            userEmail={employee?.email || 'carlossuarezparra@gmail.com'}
            userName={employee?.nombre || 'Carlos Suárez'}
            onBack={() => setShowMaintenance(false)}
          />
        )}

        {showUserManagement && (
          <UserManagementSystem />
        )}

        {!showMeetingHistory && !showLogistics && !showMaintenance && !showUserManagement && (
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

      {/* Modal de Incidencias Inteligente */}
      <SmartIncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        centerName={employee?.centerName || 'Centro'}
        centerId={employee?.center_id?.toString() || '1'}
        onIncidentCreated={(incident) => {
          console.log('Nueva incidencia creada:', incident);
          // Aquí puedes añadir lógica adicional como actualizar alertas
        }}
      />

      {/* Modal de Gestión de Incidencias */}
      <IncidentManagementModal
        isOpen={showIncidentManagementModal}
        onClose={() => {
          console.log('🔥 CERRANDO MODAL DE GESTIÓN');
          setShowIncidentManagementModal(false);
          setShowOverdueIncidentsOnly(false); // Resetear flag al cerrar
        }}
        department={selectedDepartment}
        userEmail={employee?.email || ''}
        showOverdueOnly={showOverdueIncidentsOnly}
      />

      {/* Modal de Completar Tarea */}
      {showTaskCompletionModal && selectedTaskForCompletion && (
        <TaskCompletionModal
          isOpen={showTaskCompletionModal}
          taskId={selectedTaskForCompletion.taskId}
          taskTitle={selectedTaskForCompletion.title}
          userEmail={employee?.email || ''}
          userName={employee?.nombre || ''}
          onClose={() => {
            setShowTaskCompletionModal(false);
            setSelectedTaskForCompletion(null);
          }}
          onSuccess={() => {
            // Recargar calendario después de completar tarea
            const loadMeetingsAndTasks = async () => {
              try {
                const meetingsResult = await loadMeetingsFromSupabase();
                const { data: tasksData } = await supabase
                  .from('tareas')
                  .select('*')
                  .eq('estado', 'pendiente')
                  .eq('asignado_a', employee?.email || '')
                  .order('fecha_limite', { ascending: true });

                const calendarTasks = (tasksData || []).map(task => ({
                  id: `task-${task.id}`,
                  title: task.titulo,
                  date: task.fecha_limite,
                  startDate: task.fecha_limite,
                  time: '00:00',
                  startTime: '00:00',
                  category: 'task' as const,
                  priority: task.prioridad,
                  department: task.departamento,
                  taskId: task.id,
                  description: task.descripcion,
                  isRecurring: false,
                  status: 'pending' as const,
                  createdAt: task.created_at || new Date().toISOString(),
                  updatedAt: task.created_at || new Date().toISOString(),
                  createdBy: task.asignado_a
                }));

                const allItems = [
                  ...(meetingsResult.success && meetingsResult.meetings ? meetingsResult.meetings : []),
                  ...calendarTasks
                ];

                setTasks(allItems);
              } catch (error) {
                console.error('Error recargando calendario:', error);
              }
            };
            loadMeetingsAndTasks();
          }}
        />
      )}

      {/* Notificación de Verificación de Incidencias */}
      {employee?.name && (
        <IncidentVerificationNotification
          employeeName={employee.name}
        />
      )}
    </div>
  );
};

export default DashboardPage;
