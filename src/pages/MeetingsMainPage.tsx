import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import {
  getUserAccessibleDepartments,
  DEPARTMENTS_CONFIG,
  type Department
} from '../config/departmentPermissions';
import MeetingsDepartmentView from '../components/meetings/MeetingsDepartmentView';
import { getTaskStatsByDepartments, getAllActiveTasks } from '../services/taskService';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';
import TaskCompletionModal from '../components/meetings/TaskCompletionModal';

interface MeetingsMainPageProps {
  onBack?: () => void;
  userEmail?: string;
  userName?: string;
}

interface DepartmentTaskStats {
  [key: string]: {
    pending: number;
    completed: number;
  };
}

// Campos reales que tiene la tabla meetings en Supabase
interface MeetingRow {
  id: number;
  title: string;
  department: string;
  date: string;
  start_time: string;
  status: string;
  participants?: string[];
  created_by?: string;
  summary?: string;
}

// Campos reales que tiene la tabla tareas en Supabase
interface TareaRow {
  id: string | number;
  titulo?: string;
  estado: string;
  prioridad: string;
  asignado_a?: string;
  fecha_limite?: string;
  departamento?: string;
  reunion_titulo?: string;
  reunion_origen?: number;
  created_at?: string;
}

type ActiveTab = 'departments' | 'meetings' | 'tasks';

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  scheduled:  { label: 'Programada',  bg: '#dbeafe', color: '#1e40af' },
  in_progress:{ label: 'En curso',    bg: '#fef3c7', color: '#92400e' },
  completed:  { label: 'Completada',  bg: '#dcfce7', color: '#166534' },
  cancelled:  { label: 'Cancelada',   bg: '#fee2e2', color: '#dc2626' },
};

const PRIORITY_LABEL: Record<string, { bg: string; color: string }> = {
  critica: { bg: '#fee2e2', color: '#dc2626' },
  alta:    { bg: '#fef3c7', color: '#92400e' },
  media:   { bg: '#dbeafe', color: '#1e40af' },
  baja:    { bg: '#f3f4f6', color: '#374151' },
};

// Normaliza un nombre de departamento para comparar sin acento ni mayúsculas
const normalizeName = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const getDepartmentsFromSession = (
  sessionDepts: { id: string | number; name: string }[]
): Department[] => {
  const allDepts = Object.values(DEPARTMENTS_CONFIG);
  return sessionDepts
    .map(sd => allDepts.find(d => normalizeName(d.name) === normalizeName(sd.name)))
    .filter((d): d is Department => Boolean(d));
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

export const MeetingsMainPage: React.FC<MeetingsMainPageProps> = ({
  onBack,
  userEmail = '',
  userName = ''
}) => {
  const { employee, userRole } = useSession();
  const isAdmin = userRole === 'superadmin' || userRole === 'ceo';

  const [activeTab, setActiveTab] = useState<ActiveTab>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [accessibleDepartments, setAccessibleDepartments] = useState<Department[]>([]);
  const [taskStats, setTaskStats] = useState<DepartmentTaskStats>({});

  // Tab: Todas las reuniones
  const [allMeetings, setAllMeetings] = useState<MeetingRow[]>([]);
  const [meetingsFilter, setMeetingsFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  // Tab: Tareas pendientes
  const [allTasks, setAllTasks] = useState<TareaRow[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'critica' | 'alta'>('all');
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<TareaRow | null>(null);

  useEffect(() => {
    let departments: Department[];

    if (userRole === 'superadmin' || userRole === 'ceo') {
      departments = Object.values(DEPARTMENTS_CONFIG);
    } else if (employee?.departments && employee.departments.length > 0) {
      departments = getDepartmentsFromSession(employee.departments);
    } else if (userEmail) {
      departments = getUserAccessibleDepartments(userEmail);
    } else {
      departments = [];
    }

    setAccessibleDepartments(departments);
    loadTaskStats(departments);
  }, [userEmail, employee, userRole]);

  // Carga datos cuando cambia el tab activo
  useEffect(() => {
    if (activeTab === 'meetings' && allMeetings.length === 0) loadAllMeetings();
    if (activeTab === 'tasks' && allTasks.length === 0) loadAllTasks();
  }, [activeTab]);

  const loadTaskStats = async (departments: Department[]) => {
    if (departments.length === 0) return;
    const deptIds = departments.map((d) => d.id);
    const stats = await getTaskStatsByDepartments(deptIds);
    setTaskStats(stats);
  };

  const loadAllMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id, title, department, date, start_time, status, participants, created_by, summary')
        .order('date', { ascending: false });

      if (!error) setAllMeetings((data ?? []) as MeetingRow[]);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const loadAllTasks = async () => {
    setLoadingTasks(true);
    try {
      const tasks = await getAllActiveTasks();
      setAllTasks(tasks as unknown as TareaRow[]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // ── Filtros de reuniones ──────────────────────────────────────────────────────
  const filteredMeetings = allMeetings.filter(m => {
    if (meetingsFilter === 'upcoming') return m.status === 'scheduled' || m.status === 'in_progress';
    if (meetingsFilter === 'completed') return m.status === 'completed';
    return true;
  });

  // ── Filtros de tareas ─────────────────────────────────────────────────────────
  const filteredTasks = allTasks.filter(t => {
    if (taskFilter === 'all') return true;
    return t.prioridad === taskFilter;
  }) as TareaRow[];

  // ── Estadísticas rápidas de tareas ────────────────────────────────────────────
  const taskCounts = {
    total:   allTasks.length,
    critica: allTasks.filter(t => t.prioridad === 'critica').length,
    alta:    allTasks.filter(t => t.prioridad === 'alta').length,
    sin_fecha: allTasks.filter(t => !t.fecha_limite).length,
  };

  // ── Si hay departamento seleccionado, renderizar su vista ─────────────────────
  if (selectedDepartment) {
    return (
      <MeetingsDepartmentView
        departmentId={selectedDepartment}
        userEmail={userEmail}
        userName={userName}
        onBack={() => setSelectedDepartment(null)}
      />
    );
  }

  // ── Helpers de UI ─────────────────────────────────────────────────────────────
  const tabStyle = (tab: ActiveTab): React.CSSProperties => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: activeTab === tab ? '#1f2937' : 'white',
    color: activeTab === tab ? 'white' : '#6b7280',
    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
    transition: 'all 0.15s',
  });

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    border: `1px solid ${active ? '#1f2937' : '#d1d5db'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    backgroundColor: active ? '#1f2937' : 'white',
    color: active ? 'white' : '#374151',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <ArrowLeft size={24} color="#374151" />
          </button>
        )}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            Reuniones
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {userName || employee?.first_name || 'usuario'}
          </p>
        </div>
      </div>

      {/* Tabs — solo visibles para admin/CEO */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '10px', width: 'fit-content' }}>
          <button style={tabStyle('departments')} onClick={() => setActiveTab('departments')}>
            Departamentos
          </button>
          <button style={tabStyle('meetings')} onClick={() => setActiveTab('meetings')}>
            Todas las reuniones
            {allMeetings.length > 0 && (
              <span style={{ marginLeft: '6px', background: '#6b7280', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '12px' }}>
                {allMeetings.length}
              </span>
            )}
          </button>
          <button style={tabStyle('tasks')} onClick={() => setActiveTab('tasks')}>
            Tareas pendientes
            {allTasks.length > 0 && (
              <span style={{ marginLeft: '6px', background: taskCounts.critica > 0 ? '#dc2626' : '#6b7280', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '12px' }}>
                {allTasks.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── TAB: DEPARTAMENTOS ───────────────────────────────────────────────── */}
      {activeTab === 'departments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {accessibleDepartments.map(department => {
            const IconComponent = department.icon;
            return (
              <button
                key={department.id}
                onClick={() => setSelectedDepartment(department.id)}
                style={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                } as React.CSSProperties}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '60px', height: '60px', borderRadius: '12px',
                  backgroundColor: department.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                  <IconComponent size={32} />
                </div>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                    {department.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0' }}>
                    {department.description}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ backgroundColor: '#fef3c7', padding: '8px 12px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400e' }}>
                        {taskStats[department.id]?.pending || 0}
                      </div>
                      <div style={{ fontSize: '10px', color: '#b45309', marginTop: '2px' }}>Pendientes</div>
                    </div>
                    <div style={{ backgroundColor: '#dcfce7', padding: '8px 12px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#166534' }}>
                        {taskStats[department.id]?.completed || 0}
                      </div>
                      <div style={{ fontSize: '10px', color: '#15803d', marginTop: '2px' }}>Completadas</div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {accessibleDepartments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b7280', gridColumn: '1/-1' }}>
              No tienes acceso a ningún departamento
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TODAS LAS REUNIONES ─────────────────────────────────────────── */}
      {activeTab === 'meetings' && (
        <div>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button style={filterBtnStyle(meetingsFilter === 'upcoming')} onClick={() => setMeetingsFilter('upcoming')}>
              Próximas
            </button>
            <button style={filterBtnStyle(meetingsFilter === 'completed')} onClick={() => setMeetingsFilter('completed')}>
              Completadas
            </button>
            <button style={filterBtnStyle(meetingsFilter === 'all')} onClick={() => setMeetingsFilter('all')}>
              Todas
            </button>
          </div>

          {loadingMeetings ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Cargando reuniones...</div>
          ) : filteredMeetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>No hay reuniones</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {filteredMeetings.map(meeting => {
                const deptCfg = DEPARTMENTS_CONFIG[meeting.department];
                const statusCfg = STATUS_LABEL[meeting.status] ?? { label: meeting.status, bg: '#f3f4f6', color: '#374151' };
                return (
                  <div
                    key={meeting.id}
                    onClick={() => setSelectedDepartment(meeting.department)}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}
                  >
                    {/* Icono departamento */}
                    {deptCfg && (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px',
                        backgroundColor: deptCfg.color, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                      }}>
                        {React.createElement(deptCfg.icon, { size: 20 })}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>
                          {meeting.title}
                        </span>
                        <span style={{
                          fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '4px',
                          backgroundColor: statusCfg.bg, color: statusCfg.color,
                        }}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {formatDate(meeting.date)}
                          {meeting.start_time && ` · ${meeting.start_time}`}
                        </span>
                        {deptCfg && (
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            {deptCfg.name}
                          </span>
                        )}
                        {meeting.participants && meeting.participants.length > 0 && (
                          <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            {meeting.participants.length} participantes
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TAREAS PENDIENTES ───────────────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <div>
          {/* Estadísticas rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total pendientes', value: taskCounts.total, bg: '#f9fafb', color: '#1f2937' },
              { label: 'Críticas',         value: taskCounts.critica, bg: '#fee2e2', color: '#dc2626' },
              { label: 'Prioridad alta',   value: taskCounts.alta, bg: '#fef3c7', color: '#92400e' },
              { label: 'Sin fecha límite', value: taskCounts.sin_fecha, bg: '#f3f4f6', color: '#6b7280' },
            ].map(stat => (
              <div key={stat.label} style={{
                backgroundColor: stat.bg,
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filtros por prioridad */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button style={filterBtnStyle(taskFilter === 'all')} onClick={() => setTaskFilter('all')}>
              Todas
            </button>
            <button style={filterBtnStyle(taskFilter === 'critica')} onClick={() => setTaskFilter('critica')}>
              Críticas ({taskCounts.critica})
            </button>
            <button style={filterBtnStyle(taskFilter === 'alta')} onClick={() => setTaskFilter('alta')}>
              Alta prioridad ({taskCounts.alta})
            </button>
          </div>

          {loadingTasks ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Cargando tareas...</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>No hay tareas pendientes</div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {filteredTasks.map((task) => {
                const prioStyle = PRIORITY_LABEL[task.prioridad] ?? { bg: '#f3f4f6', color: '#374151' };
                const isOverdue = task.fecha_limite && new Date(task.fecha_limite) < new Date();
                const isMyTask = task.asignado_a === userEmail;

                return (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${isOverdue ? '#fca5a5' : '#e5e7eb'}`,
                      borderLeft: `4px solid ${isOverdue ? '#dc2626' : prioStyle.bg === '#fee2e2' ? '#dc2626' : prioStyle.bg === '#fef3c7' ? '#f59e0b' : '#d1d5db'}`,
                      borderRadius: '8px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                          {task.titulo || '(sin título)'}
                        </span>
                        <span style={{
                          fontSize: '11px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px',
                          backgroundColor: prioStyle.bg, color: prioStyle.color,
                        }}>
                          {task.prioridad}
                        </span>
                        {isOverdue && (
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626' }}>
                            Vencida
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {task.asignado_a && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {task.asignado_a}
                          </span>
                        )}
                        {task.fecha_limite && (
                          <span style={{ fontSize: '12px', color: isOverdue ? '#dc2626' : '#6b7280', fontWeight: isOverdue ? '600' : '400' }}>
                            {formatDate(task.fecha_limite)}
                          </span>
                        )}
                        {task.departamento && (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {DEPARTMENTS_CONFIG[task.departamento]?.name ?? task.departamento}
                          </span>
                        )}
                        {task.reunion_titulo && (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {task.reunion_titulo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón completar — solo si la tarea es del usuario actual */}
                    {isMyTask && (
                      <button
                        onClick={() => setSelectedTaskForCompletion(task)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          backgroundColor: '#dcfce7', color: '#166534',
                          border: 'none', borderRadius: '6px',
                          padding: '8px 12px', fontSize: '12px', fontWeight: '600',
                          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        <Check size={13} />
                        Completar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de completación */}
      {selectedTaskForCompletion && (
        <TaskCompletionModal
          isOpen={true}
          taskId={selectedTaskForCompletion.id}
          taskTitle={selectedTaskForCompletion.titulo ?? ''}
          userEmail={userEmail}
          userName={userName}
          onClose={() => {
            setSelectedTaskForCompletion(null);
            loadAllTasks();
          }}
          onSuccess={() => {
            loadAllTasks();
          }}
        />
      )}
    </div>
  );
};

export default MeetingsMainPage;
