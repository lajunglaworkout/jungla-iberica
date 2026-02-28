// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Task } from '../types/dashboard';
import { TaskFormModal } from '../components/dashboard/TaskFormModal';
import { RecurrenceModal } from '../components/dashboard/RecurrenceModal';
import { DepartmentMeetingHistory } from '../components/dashboard/DepartmentMeetingHistory';
import { useSession } from '../contexts/SessionContext';
import { saveMeetingToSupabase, loadMeetingsFromSupabase, updateMeetingInSupabase, deleteMeetingFromSupabase } from '../services/meetingService';
import { canUserCreateMeetings } from '../config/departments';
import { filterTasks } from '../services/taskService';
import LogisticsManagementSystem from '../components/LogisticsManagementSystem';
import MaintenanceModule from '../components/MaintenanceModule';
import TaskCompletionModal from '../components/meetings/TaskCompletionModal';
import { IncidentVerificationNotification } from '../components/incidents/IncidentVerificationNotification';
import { UserManagementSystem } from '../components/admin/UserManagementSystem';
import IncidentCreationModal from '../components/incidents/IncidentCreationModal';
import IncidentManagementModal from '../components/incidents/IncidentManagementModal';
import '../styles/dashboard.css';

import { SAMPLE_TASKS } from './dashboard/DashboardSampleData';
import { SmartAlert } from './dashboard/DashboardTypes';
import { useSmartAlerts } from './dashboard/useSmartAlerts';
import { DashboardWeekView } from './dashboard/DashboardWeekView';
import { DashboardMonthView } from './dashboard/DashboardMonthView';
import { DashboardAlertsPanel } from './dashboard/DashboardAlertsPanel';

const DashboardPage: React.FC = () => {
  const { employee, userRole } = useSession();
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
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
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<import('../services/taskService').Tarea | null>(null);

  const { alerts } = useSmartAlerts(userRole, employee);

  // Load meetings and tasks from Supabase
  const loadMeetingsAndTasks = async () => {
    setLoading(true);
    try {
      const userEmail = employee?.email ?? 'carlossuarezparra@gmail.com';
      const meetingsResult = await loadMeetingsFromSupabase(userEmail);

      const tasksResult = await filterTasks({ estado: 'pendiente', asignado_a: employee?.email ?? '' });
      const tasksData = tasksResult.tasks ?? [];

      const calendarTasks = (tasksData ?? []).map(task => ({
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
        createdAt: task.created_at ?? new Date().toISOString(),
        updatedAt: task.created_at ?? new Date().toISOString(),
        createdBy: task.asignado_a,
      }));

      setTasks([
        ...(meetingsResult.success && meetingsResult.meetings ? meetingsResult.meetings : []),
        ...calendarTasks,
      ]);
    } catch (error) {
      console.error('Error cargando datos del calendario:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee?.email) loadMeetingsAndTasks();
  }, [employee?.email]);

  const handleSaveTask = async (task: Task) => {
    setLoading(true);
    try {
      if (task.category === 'meeting') {
        if (selectedTask) {
          const result = await updateMeetingInSupabase(task);
          setTasks(prev => prev.map(t => t.id === task.id ? task : t));
          if (!result.success) console.error('Error actualizando reunión:', result.error);
        } else {
          const result = await saveMeetingToSupabase(task);
          const saved = result.success && result.meeting
            ? { ...task, id: result.meeting.id?.toString() ?? task.id }
            : task;
          setTasks(prev => [...prev, saved]);
          if (!result.success) console.error('Error guardando reunión:', result.error);
        }
      } else {
        setTasks(prev => selectedTask ? prev.map(t => t.id === task.id ? task : t) : [...prev, task]);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setTasks(prev => selectedTask ? prev.map(t => t.id === task.id ? task : t) : [...prev, task]);
    } finally {
      setLoading(false);
      setShowTaskModal(false);
      setSelectedTask(null);
      setNewTask({});
      setIsCreatingMeeting(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.category === 'task') {
      setSelectedTaskForCompletion(task);
      setShowTaskCompletionModal(true);
    } else {
      setSelectedTask(task);
      setNewTask(task);
      setIsCreatingMeeting(task.category === 'meeting');
      setShowTaskModal(true);
    }
  };

  const handleAddEventForDay = (day: Date) => {
    setNewTask({ startDate: format(day, 'yyyy-MM-dd'), startTime: '09:00', endTime: '10:00', category: 'task', priority: 'medium' });
    setIsCreatingMeeting(false);
    setShowTaskModal(true);
  };

  const handleAlertClick = (alert: SmartAlert) => {
    if (alert.moduleId) {
      let targetModuleId = alert.moduleId;
      let targetLogisticsView = alert.logisticsView;

      if (targetModuleId === 'logistics-quarterly') { targetModuleId = 'logistics'; targetLogisticsView = 'quarterly'; }
      else if (targetModuleId === 'center-management-quarterly') { targetModuleId = 'center-management'; targetLogisticsView = 'quarterly-review'; }

      window.dispatchEvent(new CustomEvent('navigate-module', {
        detail: { moduleId: targetModuleId, fallbackUrl: alert.actionUrl ?? null, logisticsView: targetModuleId === 'logistics' ? targetLogisticsView : undefined },
      }));

      if (alert.moduleId === 'center-management' && alert.logisticsView) {
        setTimeout(() => window.dispatchEvent(new CustomEvent('center-management-view', { detail: { view: alert.logisticsView } })), 100);
      }
      return;
    }

    if (alert.id.startsWith('task-notification-')) {
      setSelectedTaskForCompletion({ taskId: alert.taskId, title: alert.title || 'Tarea pendiente', description: alert.description });
      setShowTaskCompletionModal(true);
      return;
    }

    if (alert.id === 'overdue-incidents' || alert.id === 'near-deadline-incidents') {
      setSelectedDepartment('');
      setShowOverdueIncidentsOnly(true);
      setShowIncidentManagementModal(true);
      return;
    }

    if (alert.id.startsWith('incidents-')) {
      setSelectedDepartment(alert.department ?? '');
      setShowIncidentManagementModal(true);
      return;
    }

    if (alert.actionUrl) window.location.href = alert.actionUrl;
  };

  const isCEO = employee?.email === 'carlossuarezparra@gmail.com';
  const canCreate = canUserCreateMeetings(employee?.email ?? '') && employee?.role !== 'center_manager';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>
          Buenos días, {employee?.name || 'Usuario'}
          {loading && (
            <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid #059669', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Guardando...
            </span>
          )}
        </h1>
        {employee?.role !== 'center_manager' && (
          <div className="view-toggle">
            <button className={`btn ${currentView === 'week' ? 'active' : ''}`} onClick={() => setCurrentView('week')}>Semana</button>
            <button className={`btn ${currentView === 'month' ? 'active' : ''}`} onClick={() => setCurrentView('month')}>Mes</button>
          </div>
        )}
      </header>

      <div className="dashboard-content">
        {showMeetingHistory && (
          <DepartmentMeetingHistory
            tasks={tasks.filter(t => t.category === 'meeting')}
            onEditMeeting={(meeting) => { setSelectedTask(meeting); setIsCreatingMeeting(true); setNewTask(meeting); setShowTaskModal(true); }}
          />
        )}
        {showLogistics && <LogisticsManagementSystem />}
        {showMaintenance && <MaintenanceModule userEmail={employee?.email ?? ''} userName={employee?.name ?? employee?.first_name ?? ''} onBack={() => setShowMaintenance(false)} />}
        {showUserManagement && <UserManagementSystem />}

        {!showMeetingHistory && !showLogistics && !showMaintenance && !showUserManagement && (
          <>
            {currentView === 'week' ? (
              <DashboardWeekView
                selectedDate={selectedDate}
                tasks={tasks}
                onWeekBack={() => setSelectedDate(addDays(selectedDate, -7))}
                onWeekForward={() => setSelectedDate(addDays(selectedDate, 7))}
                onToday={() => setSelectedDate(new Date())}
                onTaskClick={handleTaskClick}
                onAddEventForDay={handleAddEventForDay}
              />
            ) : (
              <DashboardMonthView
                selectedDate={selectedDate}
                tasks={tasks}
                onMonthBack={() => setSelectedDate(addDays(selectedDate, -30))}
                onMonthForward={() => setSelectedDate(addDays(selectedDate, 30))}
                onToday={() => setSelectedDate(new Date())}
                onDayClick={(day) => { setSelectedDate(day); setCurrentView('week'); }}
                onTaskClick={handleTaskClick}
              />
            )}
            <DashboardAlertsPanel
              alerts={alerts}
              canCreateMeetings={canCreate}
              isCEO={isCEO}
              showMeetingHistory={showMeetingHistory}
              showUserManagement={showUserManagement}
              onNewTask={() => { setSelectedTask(null); setIsCreatingMeeting(false); setNewTask({ isRecurring: false, category: 'task', priority: 'medium', status: 'pending', startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00' }); setShowTaskModal(true); }}
              onNewMeeting={() => { setNewTask({ title: 'Nueva Reunión', isRecurring: true, category: 'meeting', meetingType: 'weekly', priority: 'high', status: 'pending', startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '10:00', endTime: '11:00' }); setShowTaskModal(true); }}
              onToggleMeetingHistory={() => setShowMeetingHistory(prev => !prev)}
              onToggleUserManagement={() => { setShowUserManagement(prev => !prev); setShowMeetingHistory(false); }}
              onShowIncidentModal={() => setShowIncidentModal(true)}
              onAlertClick={handleAlertClick}
            />
          </>
        )}
      </div>

      {/* Modales */}
      {showTaskModal && (
        <TaskFormModal
          task={newTask}
          isCreatingMeeting={isCreatingMeeting}
          currentUserEmail={employee?.email ?? 'carlossuarezparra@gmail.com'}
          onSave={handleSaveTask}
          onDelete={selectedTask ? async () => {
            setLoading(true);
            try {
              if (selectedTask.category === 'meeting') {
                const result = await deleteMeetingFromSupabase(selectedTask.id);
                if (!result.success) console.error('Error eliminando reunión:', result.error);
              }
              setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
            } catch (error) {
              console.error('Error eliminando:', error);
              setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
            } finally {
              setLoading(false);
              setShowTaskModal(false);
              setSelectedTask(null);
              setIsCreatingMeeting(false);
            }
          } : undefined}
          onClose={() => { setShowTaskModal(false); setSelectedTask(null); setNewTask({}); setIsCreatingMeeting(false); }}
          onRecurrenceClick={() => setShowRecurrenceModal(true)}
        />
      )}

      {showRecurrenceModal && (
        <RecurrenceModal
          initialRule={newTask.recurrenceRule}
          onSave={(rule) => { setNewTask(prev => ({ ...prev, recurrenceRule: rule })); setShowRecurrenceModal(false); }}
          onClose={() => setShowRecurrenceModal(false)}
        />
      )}

      <IncidentCreationModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        centerName={employee?.centerName ?? 'Centro'}
        centerId={employee?.center_id?.toString() ?? '1'}
        onIncidentCreated={() => {}}
      />

      <IncidentManagementModal
        isOpen={showIncidentManagementModal}
        onClose={() => { setShowIncidentManagementModal(false); setShowOverdueIncidentsOnly(false); }}
        department={selectedDepartment}
        userEmail={employee?.email ?? ''}
        showOverdueOnly={showOverdueIncidentsOnly}
      />

      {showTaskCompletionModal && selectedTaskForCompletion && (
        <TaskCompletionModal
          isOpen={showTaskCompletionModal}
          taskId={selectedTaskForCompletion.taskId}
          taskTitle={selectedTaskForCompletion.title}
          userEmail={employee?.email ?? ''}
          userName={employee?.name ?? employee?.first_name ?? ''}
          onClose={() => { setShowTaskCompletionModal(false); setSelectedTaskForCompletion(null); }}
          onSuccess={loadMeetingsAndTasks}
        />
      )}

      {employee?.name && <IncidentVerificationNotification employeeName={employee.name} />}
    </div>
  );
};

export default DashboardPage;
