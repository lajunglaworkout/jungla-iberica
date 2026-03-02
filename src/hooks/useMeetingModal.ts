import { useState, useEffect, useRef } from 'react';
import { generateMeetingMinutes } from '../services/aiService';
import {
  saveMeetingMetrics,
  saveMeetingObjectives,
  saveMeetingBottlenecks
} from '../services/meetingAnalyticsService';
import { maintenanceService } from '../services/maintenanceService';
import { clientsService } from '../services/clientsService';
import { notificationService } from '../services/notificationService';
import { insertTasks, getPendingTasksByDepartment } from '../services/taskService';
import { updateMeetingTasks, scheduleMeeting } from '../services/meetingService';
import { getAllEmployees } from '../services/userService';
import { getActiveLeads } from '../services/leadService';
import { alertService, getOrdersByStatus } from '../services/logisticsService';
import { getPendingVacationRequestsRaw, getPendingUniformRequestsRaw } from '../services/hrService';
import { meetingObjectivesService } from '../services/meetingObjectivesService';
import { ui } from '../utils/ui';
import {
  PreviousTask,
  RecurringTask,
  DepartmentObjective,
  MeetingType,
  Employee,
  PendingObjective,
  ObjectiveReview,
} from '../components/meetings/MeetingModalTypes';
import {
  OBJECTIVES_BY_DEPT,
  RECURRING_TASKS_SIMPLE,
  RRHH_TASKS,
  LOGISTICA_TASKS,
  MANTENIMIENTO_TASKS,
  CONTABILIDAD_TASKS,
  OPERACIONES_TASKS,
  EVENTOS_TASKS,
  ACADEMY_TASKS,
  ONLINE_TASKS,
} from '../components/meetings/meetingDepartmentConfig';
import { eventosService, participantesService, gastosService, ingresosService, tareasService as eventosTareasService } from '../services/eventService';
import { academyDashboardService, onlineDashboardService } from '../services/academyService';

export const useMeetingModal = ({
  departmentId,
  meeting,
  userEmail,
  participants,
  preselectedLeadId,
  onClose,
  onSuccess
}: {
  departmentId: string;
  meeting?: import('../services/meetingService').MeetingRecord;
  userEmail?: string;
  participants?: string[];
  preselectedLeadId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const [meetingType, setMeetingType] = useState<MeetingType>('FISICA');
  const [previousTasks, setPreviousTasks] = useState<PreviousTask[]>([]);
  const [previousTasksCompleted, setPreviousTasksCompleted] = useState<Record<number, boolean>>({});
  const [previousTasksReasons, setPreviousTasksReasons] = useState<Record<number, string>>({});
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [recurringTasksCompleted, setRecurringTasksCompleted] = useState<Record<number, boolean>>({});
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});
  const [departmentObjectives, setDepartmentObjectives] = useState<DepartmentObjective[]>([]);
  const [objectiveValues, setObjectiveValues] = useState<Record<string, string | number>>({});
  const [manualTranscript, setManualTranscript] = useState('');
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  // ── Objetivos (nuevo sistema texto libre) ─────────────────────────────────
  const [previousObjectives, setPreviousObjectives] = useState<PendingObjective[]>([]);
  const [objectiveReviews, setObjectiveReviews] = useState<Record<string, ObjectiveReview>>({});
  const [newObjectives, setNewObjectives] = useState<string[]>(['']);
  const [generatingActa, setGeneratingActa] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<PreviousTask | null>(null);
  const [taskFilter, setTaskFilter] = useState<'pending' | 'completed'>('pending');
  const [generatedMinutes, setGeneratedMinutes] = useState<string>('');
  const [generatedTasks, setGeneratedTasks] = useState<Array<{ title: string; assignedTo: string | string[]; deadline: string; priority: string }>>([]);
  const [showActaPreview, setShowActaPreview] = useState(false);
  const [showNextMeetingScheduler, setShowNextMeetingScheduler] = useState(false);
  const [isEditingActa, setIsEditingActa] = useState(false);
  const [nextMeetingDate, setNextMeetingDate] = useState('');
  const [nextMeetingTime, setNextMeetingTime] = useState('');
  const [leads, setLeads] = useState<Array<{ id: string | number; nombre?: string; email?: string; telefono?: string; empresa?: string; proyecto_nombre?: string; estado?: string }>>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    loadPreviousTasks();
    loadRecurringTasks();
    loadDepartmentObjectives();
    loadEmployees();
    loadPreviousObjectives();

    if (departmentId === 'ventas' || departmentId === 'sales') {
      loadLeads();
    }

    if (preselectedLeadId) {
      setSelectedLeadId(preselectedLeadId);
    }
  }, [departmentId, preselectedLeadId]);

  const loadDepartmentObjectives = () => {
    const objectives = OBJECTIVES_BY_DEPT[departmentId] || [];
    setDepartmentObjectives(objectives);
  };

  const loadPreviousObjectives = async () => {
    try {
      const objs = await meetingObjectivesService.getPendingObjectives(departmentId);
      setPreviousObjectives(objs.map(o => ({ id: o.id!, texto: o.texto, orden: o.orden ?? 0 })));
    } catch (e) {
      console.error('Error cargando objetivos previos:', e);
    }
  };

  const handleObjectiveReview = (id: string, conseguido: boolean | null, nota?: string) => {
    setObjectiveReviews(prev => ({
      ...prev,
      [id]: { conseguido, nota: nota ?? prev[id]?.nota ?? '' },
    }));
  };

  const handleObjectiveReviewNota = (id: string, nota: string) => {
    setObjectiveReviews(prev => ({
      ...prev,
      [id]: { conseguido: prev[id]?.conseguido ?? null, nota },
    }));
  };

  const handleNewObjectiveChange = (idx: number, value: string) => {
    setNewObjectives(prev => prev.map((v, i) => (i === idx ? value : v)));
  };

  const handleAddNewObjective = () => {
    setNewObjectives(prev => [...prev, '']);
  };

  const handleRemoveNewObjective = (idx: number) => {
    setNewObjectives(prev => prev.filter((_, i) => i !== idx));
  };

  const loadRecurringTasks = async () => {
    // ── Dirección ────────────────────────────────────────────────────────────
    if (departmentId === 'direccion') {
      // Objetivos de facturación por centro (configurables — sin tabla BD por ahora)
      const CENTROS_CONFIG = [
        { label: 'Sevilla', id: 'sevilla', objetivo_facturacion: 22000 },
        { label: 'Jerez',   id: 'jerez',   objetivo_facturacion: 17000 },
        { label: 'Puerto',  id: 'puerto',  objetivo_facturacion: 15000 },
      ];

      const now = new Date();
      const mes = now.getMonth() + 1;
      const año = now.getFullYear();

      const [maintenanceStats, centrosValores] = await Promise.all([
        maintenanceService.getMaintenanceStats().catch(() => ({ criticalIssues: 0, pendingTasks: 0 })),
        Promise.all(
          CENTROS_CONFIG.map(async (c) => {
            try {
              const m = await clientsService.getClientMetrics(c.id, c.label, mes, año);
              return {
                label: c.label,
                valores: {
                  ingresos: m.facturacion_total,
                  clientes_activos: m.clientes_activos,
                  nuevos: m.altas_reales,
                  bajas: m.bajas_reales,
                  objetivo_clientes: m.objetivo_mensual,
                  objetivo_facturacion: c.objetivo_facturacion,
                },
              };
            } catch (e) {
              console.error(`Error cargando métricas ${c.label}:`, e);
              return { label: c.label, valores: { objetivo_facturacion: c.objetivo_facturacion } };
            }
          })
        ).then((results) =>
          Object.fromEntries(results.map((r) => [r.label, r.valores]))
        ),
      ]);

      setRecurringTasks([
        { titulo: 'Incidencias urgentes', notas: '', tipo: 'incidencias', datos: { incidencias_abiertas: maintenanceStats.criticalIssues, nuevas_desde_ultima_reunion: maintenanceStats.pendingTasks } },
        { titulo: 'Revisión de contabilidad y clientes de cada centro', notas: '', tipo: 'expandible_centros', datos: { centros: CENTROS_CONFIG.map((c) => c.label), valores: centrosValores } },
        { titulo: 'Datos de rendimiento de cada departamento', notas: '', tipo: 'expandible_departamentos', datos: { departamentos: ['rrhh', 'procedimientos', 'logistica', 'mantenimiento', 'marketing', 'ventas'], valores: {} } }
      ]);
      return;
    }

    // ── Mantenimiento — tickets abiertos/cerrados ────────────────────────────
    if (departmentId === 'mantenimiento') {
      let abiertas = 0, cerradas = 0;
      try {
        const [openRes, closedRes] = await Promise.all([
          maintenanceService.getTickets({ status: 'open' }),
          maintenanceService.getTickets({ status: 'closed' }),
        ]);
        abiertas = openRes.data?.length ?? 0;
        cerradas = closedRes.data?.length ?? 0;
      } catch (e) {
        console.error('Error cargando tickets mantenimiento:', e);
      }
      setRecurringTasks([
        { ...MANTENIMIENTO_TASKS[0], datos: { abiertas, cerradas_este_periodo: cerradas } },
        { ...MANTENIMIENTO_TASKS[1], datos: { pendientes: abiertas } },
        { ...MANTENIMIENTO_TASKS[2], datos: {} },
      ]);
      return;
    }

    // ── Logística — pedidos y alertas de stock ───────────────────────────────
    if (departmentId === 'logistica') {
      let recibidos = 0, enviados = 0, articulosBajoMinimos = 0, pendientes = 0;
      try {
        const [alertsData, ordersData] = await Promise.all([
          alertService.getActive().catch(() => []),
          getOrdersByStatus(['pending', 'sent', 'received']).catch(() => []),
        ]);
        articulosBajoMinimos = alertsData.length;
        recibidos = (ordersData as Array<{ status?: string }>).filter(o => o.status === 'received').length;
        enviados = (ordersData as Array<{ status?: string }>).filter(o => o.status === 'sent').length;
        pendientes = (ordersData as Array<{ status?: string }>).filter(o => o.status === 'pending').length;
      } catch (e) {
        console.error('Error cargando datos logística:', e);
      }
      setRecurringTasks([
        { ...LOGISTICA_TASKS[0], datos: { recibidos, enviados } },
        { ...LOGISTICA_TASKS[1], datos: {} },
        { ...LOGISTICA_TASKS[2], datos: { articulos_bajo_minimos: articulosBajoMinimos } },
        { ...LOGISTICA_TASKS[3], datos: { pendientes } },
      ]);
      return;
    }

    // ── RRHH — vacaciones pendientes e incidencias uniformes ────────────────
    if (departmentId === 'rrhh') {
      let bajasActivas = 0, incidenciasPendientes = 0;
      try {
        const [vacReq, unifReq] = await Promise.all([
          getPendingVacationRequestsRaw().catch(() => []),
          getPendingUniformRequestsRaw().catch(() => []),
        ]);
        bajasActivas = vacReq.length;
        incidenciasPendientes = unifReq.length;
      } catch (e) {
        console.error('Error cargando datos RRHH:', e);
      }
      setRecurringTasks([
        { ...RRHH_TASKS[0], datos: { bajas_activas: bajasActivas, incidencias_pendientes: incidenciasPendientes } },
        { ...RRHH_TASKS[1], datos: {} },
        { ...RRHH_TASKS[2], datos: {} },
      ]);
      return;
    }

    // ── Contabilidad / Operaciones — sin datos de API (se rellenan manual) ──
    const DEPT_TASK_MAP: Record<string, RecurringTask[]> = {
      contabilidad: CONTABILIDAD_TASKS,
      operaciones: OPERACIONES_TASKS,
    };

    if (DEPT_TASK_MAP[departmentId]) {
      setRecurringTasks(DEPT_TASK_MAP[departmentId]);
      return;
    }

    // ── Eventos — datos en tiempo real desde eventService ───────────────────
    if (departmentId === 'eventos') {
      const hoy = new Date();
      const firstDay = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      const lastDay  = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

      let activos = 0, este_mes = 0, participantes = 0, tareas_pendientes = 0, balance = 0;
      try {
        const [a, m, p, t, gastos, ingresos] = await Promise.all([
          eventosService.countActive(),
          eventosService.countByDateRange(firstDay, lastDay),
          participantesService.countAll(),
          eventosTareasService.countPending(),
          gastosService.getAll('coste'),
          ingresosService.getAll('importe'),
        ]);
        activos          = a;
        este_mes         = m;
        participantes    = p;
        tareas_pendientes = t;
        const totalGastos   = (gastos as Record<string, number>[]).reduce((s, g) => s + (g.coste   || 0), 0);
        const totalIngresos = (ingresos as Record<string, number>[]).reduce((s, i) => s + (i.importe || 0), 0);
        balance = totalIngresos - totalGastos;
      } catch { /* mantiene defaults */ }

      setRecurringTasks([
        { ...EVENTOS_TASKS[0], datos: { activos, este_mes, participantes, tareas_pendientes, balance } },
        { ...EVENTOS_TASKS[1] },
        { ...EVENTOS_TASKS[2] },
      ]);
      return;
    }

    // ── Academy — datos en tiempo real desde academyDashboardService ─────────
    if (departmentId === 'academy') {
      let alumnos_activos = 0, tutores_activos = 0, centros_activos = 0, cohortes_proximas = 0, tareas_pendientes = 0;
      try {
        const m = await academyDashboardService.getMetrics();
        alumnos_activos   = m.activeStudents  ?? 0;
        tutores_activos   = m.activeTutors    ?? 0;
        centros_activos   = m.activeCenters   ?? 0;
        cohortes_proximas = m.upcomingCohorts ?? 0;
        tareas_pendientes = m.pendingTasks    ?? 0;
      } catch { /* mantiene defaults */ }

      setRecurringTasks([
        { ...ACADEMY_TASKS[0], datos: { alumnos_activos, tutores_activos, centros_activos, cohortes_proximas, tareas_pendientes } },
        { ...ACADEMY_TASKS[1] },
        { ...ACADEMY_TASKS[2] },
      ]);
      return;
    }

    // ── Online — datos en tiempo real desde onlineDashboardService ───────────
    if (departmentId === 'online') {
      let tareas_pendientes = 0, contenido_produccion = 0, publicaciones_programadas = 0, ideas_nuevas = 0;
      try {
        const m = await onlineDashboardService.getMetrics();
        tareas_pendientes        = m.pendingTasks    ?? 0;
        contenido_produccion     = m.contentPieces   ?? 0;
        publicaciones_programadas = m.scheduledPosts ?? 0;
        ideas_nuevas             = m.newIdeas        ?? 0;
      } catch { /* mantiene defaults */ }

      setRecurringTasks([
        { ...ONLINE_TASKS[0], datos: { tareas_pendientes, contenido_produccion, publicaciones_programadas, ideas_nuevas } },
        { ...ONLINE_TASKS[1] },
        { ...ONLINE_TASKS[2] },
      ]);
      return;
    }

    // ── Resto de departamentos — tareas simples de texto ────────────────────
    const simpleTasks = RECURRING_TASKS_SIMPLE[departmentId] || [];
    setRecurringTasks(simpleTasks.map(titulo => ({ titulo, notas: '', tipo: 'simple' as const })));
  };

  const loadPreviousTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await getPendingTasksByDepartment(departmentId);

      const formattedTasks = data.map((task: any) => ({
        id: task.id,
        titulo: task.titulo,
        asignado_a: task.asignado_a,
        estado: task.estado,
        fecha_limite: task.fecha_limite
      }));

      setPreviousTasks(formattedTasks);
    } catch (error) {
      console.error('Error:', error);
      setPreviousTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadLeads = async () => {
    setLoadingLeads(true);
    try {
      const data = await getActiveLeads();
      setLeads(data as typeof leads);
    } catch (error) {
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.departamento
      })));
    } catch (error) {
      setEmployees([]);
    }
  };

  const handleTaskNoteChange = (taskId: string, note: string) => {
    setTaskNotes(prev => ({ ...prev, [taskId]: note }));
  };

  const handleTogglePreviousTaskCompleted = (taskId: number) => {
    setPreviousTasksCompleted(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    if (!previousTasksCompleted[taskId]) {
      setPreviousTasksReasons(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
    }
  };

  const handlePreviousTaskReasonChange = (taskId: number, reason: string) => {
    setPreviousTasksReasons(prev => ({ ...prev, [taskId]: reason }));
  };

  const handleRecurringTaskNoteChange = (index: number, note: string) => {
    const updated = [...recurringTasks];
    updated[index] = { ...updated[index], notas: note };
    setRecurringTasks(updated);
  };

  const handleAddManualTask = () => {
    const taskTitle = prompt('Título de la tarea:');
    if (taskTitle && taskTitle.trim()) {
      setRecurringTasks([...recurringTasks, { titulo: taskTitle.trim(), notas: '' }]);
    }
  };

  const handleRemoveRecurringTask = (index: number) => {
    setRecurringTasks(recurringTasks.filter((_, i) => i !== index));
  };

  const handleToggleRecurringTaskCompleted = (index: number) => {
    setRecurringTasksCompleted(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleGenerateActa = async () => {
    try {
      setGeneratingActa(true);
      const transcription = manualTranscript || recordedTranscript;

      if (!transcription) {
        ui.info('Por favor, añade una transcripción o graba la reunión');
        setGeneratingActa(false);
        return;
      }

      const totalRecurringTasks = recurringTasks.length;
      const completedRecurringTasks = Object.values(recurringTasksCompleted).filter(Boolean).length;
      const completionPercentage = totalRecurringTasks > 0
        ? Math.round((completedRecurringTasks / totalRecurringTasks) * 100)
        : 0;

      const pendingTasksText = previousTasks
        .filter(t => !previousTasksCompleted[t.id])
        .map(t => `- ${t.titulo} (asignada a: ${t.asignado_a})`)
        .join('\n') || 'No hay tareas pendientes';

      // Contexto de objetivos para la AI
      const prevObjContext = previousObjectives.length > 0
        ? previousObjectives.map(o => {
            const r = objectiveReviews[o.id];
            const estado = r?.conseguido === true ? '✅ CONSEGUIDO' : r?.conseguido === false ? '❌ NO CONSEGUIDO' : '⬜ Sin revisar';
            return `- "${o.texto}" → ${estado}${r?.nota ? ` (nota: ${r.nota})` : ''}`;
          }).join('\n')
        : '';
      const newObjContext = newObjectives.filter(t => t.trim()).length > 0
        ? newObjectives.filter(t => t.trim()).map(t => `- ${t}`).join('\n')
        : '';
      const objectivesContext = [
        prevObjContext ? `Objetivos reunión anterior:\n${prevObjContext}` : '',
        newObjContext ? `Nuevos objetivos para próxima reunión:\n${newObjContext}` : '',
      ].filter(Boolean).join('\n\n');

      const result = await generateMeetingMinutes({
        transcription,
        departmentName: departmentId || 'General',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        participants: participants || [],
        pendingTasks: pendingTasksText,
        objectives: objectivesContext || departmentObjectives.map(o => o.nombre).join(', '),
      });

      if (result.parseWarning) {
        console.warn('⚠️', result.parseWarning);
      }

      setGeneratedMinutes(result.minutes || '');
      setGeneratedTasks(result.tasks || []);
      setShowActaPreview(true);
      setGeneratingActa(false);
    } catch (error) {
      console.error('Error generando acta:', error);
      ui.error(`❌ Error generando acta: ${(error instanceof Error ? error.message : 'Error desconocido')}`);
      setGeneratingActa(false);
    }
  };

  const handleSaveAfterReview = async () => {
    if (isSaving || savingRef.current) return;

    try {
      setIsSaving(true);
      savingRef.current = true;

      const totalRecurringTasks = recurringTasks.length;
      const completedRecurringTasks = recurringTasks.filter((task, idx) => {
        const key = task.id !== undefined ? task.id : idx;
        return recurringTasksCompleted[key];
      }).length;
      const completionPercentage = totalRecurringTasks > 0
        ? Math.round((completedRecurringTasks / totalRecurringTasks) * 100)
        : 0;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      const DEPT_LABELS: Record<string, string> = {
        direccion: 'Dirección', rrhh: 'RRHH', procedimientos: 'Procedimientos',
        logistica: 'Logística', mantenimiento: 'Mantenimiento', contabilidad: 'Contabilidad',
        ventas: 'Ventas', operaciones: 'Operaciones', marketing: 'Marketing',
        online: 'Online', investigacion: 'I+D', sales: 'Ventas', centro_sevilla: 'Centro Sevilla',
        centro_jerez: 'Centro Jerez', centro_puerto: 'Centro Puerto'
      };
      const deptLabel = DEPT_LABELS[departmentId] || departmentId.charAt(0).toUpperCase() + departmentId.slice(1);
      const dateLabel = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const autoTitle = meeting?.title && meeting.title !== 'Nueva Reunión'
        ? meeting.title
        : `Reunión ${deptLabel} — ${dateLabel}`;

      const meetingResult = await scheduleMeeting({
          title: autoTitle,
          department: departmentId,
          date: yesterday.toISOString(),
          start_time: meeting?.start_time || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          participants: participants || [],
          summary: generatedMinutes,
          tipo_reunion: meetingType,
          porcentaje_cumplimiento: completionPercentage,
          tiene_cuellos_botella: previousTasks.some(task => !previousTasksCompleted[task.id]),
          numero_cuellos_botella: previousTasks.filter(task => !previousTasksCompleted[task.id]).length,
          created_by: userEmail,
          status: 'completed'
        });

      if (!meetingResult.success) throw new Error('Error guardando reunión: ' + meetingResult.error);

      const meetingId = (meetingResult.data as any).id;
      const totalPreviousTasks = previousTasks.length;
      const completedPreviousTasks = previousTasks.filter(task => previousTasksCompleted[task.id]).length;

      await saveMeetingMetrics({
        meeting_id: meetingId,
        departamento: departmentId,
        tipo_reunion: meetingType,
        tareas_recurrentes_total: totalRecurringTasks,
        tareas_recurrentes_completadas: completedRecurringTasks,
        porcentaje_cumplimiento: completionPercentage,
        tareas_anteriores_total: totalPreviousTasks,
        tareas_anteriores_completadas: completedPreviousTasks,
        tareas_anteriores_pendientes: totalPreviousTasks - completedPreviousTasks
      });

      const objectivesToSave = Object.entries(objectiveValues).map(([nombre, valor]) => ({
        meeting_id: meetingId,
        departamento: departmentId,
        nombre,
        valor_objetivo: valor.toString(),
        tipo_objetivo: departmentObjectives.find(o => o.nombre === nombre)?.tipo || 'texto',
        unidad: departmentObjectives.find(o => o.nombre === nombre)?.unidad
      }));
      if (objectivesToSave.length > 0) await saveMeetingObjectives(objectivesToSave);

      const bottlenecksToSave = previousTasks
        .filter(task => !previousTasksCompleted[task.id])
        .map(task => ({
          meeting_id: meetingId,
          departamento: departmentId,
          tarea_titulo: task.titulo,
          tarea_id: typeof task.id === 'number' ? task.id : undefined,
          motivo: previousTasksReasons[task.id] || 'No especificado',
          asignado_a: task.asignado_a,
          fecha_limite: task.fecha_limite
        }));
      if (bottlenecksToSave.length > 0) await saveMeetingBottlenecks(bottlenecksToSave);

      // ── Guardar revisiones de objetivos previos ────────────────────────────
      await Promise.all(
        previousObjectives
          .filter(o => objectiveReviews[o.id]?.conseguido !== null && objectiveReviews[o.id]?.conseguido !== undefined)
          .map(o =>
            meetingObjectivesService.reviewObjective(
              o.id,
              objectiveReviews[o.id].conseguido as boolean,
              objectiveReviews[o.id].nota,
              meetingId
            )
          )
      );

      // ── Guardar nuevos objetivos para la próxima reunión ──────────────────
      const textos = newObjectives.filter(t => t.trim());
      if (textos.length > 0) {
        await meetingObjectivesService.saveObjectives(meetingId, departmentId, textos);
      }

      if (generatedTasks && generatedTasks.length > 0) {
        const tasksToSave = generatedTasks.map((task: Record<string, unknown>) => ({
          titulo: task.title || task.titulo,
          descripcion: task.description || task.descripcion || '',
          asignado_a: task.assignedTo || task.asignado_a || userEmail,
          creado_por: userEmail,
          prioridad: task.priority || task.prioridad || 'media',
          estado: 'pendiente',
          fecha_limite: task.deadline || task.fecha_limite || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          departamento: departmentId,
          reunion_titulo: meeting?.title || 'Nueva Reunión',
          reunion_origen: typeof meetingId === 'number' ? meetingId : parseInt(meetingId),
          verificacion_requerida: true
        }));

        const { data: savedTasks, error: tasksError } = await insertTasks(tasksToSave);

        if (tasksError) {
          console.error('Error insertando tareas:', tasksError);
          ui.error(`⚠️ Reunión guardada pero hubo un error al crear las tareas: ${tasksError}`);
        } else if (savedTasks && savedTasks.length > 0) {
          // Enviar notificaciones (await para garantizar envío)
          await Promise.all(savedTasks.map(async (task) => {
            if (task.asignado_a && task.asignado_a !== 'Por asignar' && task.asignado_a !== userEmail) {
              try {
                await notificationService.createNotification({
                  recipient_email: task.asignado_a,
                  type: 'task_assigned',
                  title: '📋 Nueva tarea asignada',
                  message: `Se te ha asignado la tarea "${task.titulo}" desde la reunión de ${departmentId.toUpperCase()}. Prioridad: ${task.prioridad}.`,
                  reference_type: 'task',
                  reference_id: task.id.toString(),
                });
              } catch (err) {
                console.error('Error sending notification:', err);
              }
            }
          }));

          const tasksForMeetingField = generatedTasks.map((task: Record<string, unknown>) => ({
            id: task.id || Date.now() + Math.random(),
            title: task.title || task.titulo,
            assigned_to: task.assignedTo || task.asignado_a || userEmail,
            deadline: task.deadline || task.fecha_limite || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: task.status || task.estado || 'pendiente',
            priority: task.priority || task.prioridad || 'media'
          }));

          const { error: updateError } = await updateMeetingTasks(meetingId, tasksForMeetingField);
          if (updateError) {
            console.error('Error vinculando tareas a la reunión:', updateError);
          }
        }
      }

      const objetivosDefinidos = Object.keys(objectiveValues).length;
      setShowActaPreview(false);
      setGeneratedMinutes('');
      setGeneratedTasks([]);

      ui.success(`Reunion guardada. Tareas: ${generatedTasks?.length || 0} | Cumplimiento: ${completionPercentage}% | Objetivos: ${objetivosDefinidos}/${departmentObjectives.length} | Cuellos: ${bottlenecksToSave.length}`);

      const programarSiguiente = await ui.confirm('¿Deseas programar la siguiente reunión?');
      if (programarSiguiente) {
        setManualTranscript('');
        setRecordedTranscript('');
        setPreviousTasksCompleted({});
        setPreviousTasksReasons({});
        setRecurringTasksCompleted({});
        setObjectiveValues({});
        setShowNextMeetingScheduler(true);
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('🔴 Error guardando reunión:', error);
      ui.error(`Error al guardar la reunión: ${(error instanceof Error ? error.message : 'Error desconocido')}`);
    } finally {
      setIsSaving(false);
      savingRef.current = false;
    }
  };

  return {
    // State
    meetingType, setMeetingType,
    previousTasks,
    previousTasksCompleted,
    previousTasksReasons,
    recurringTasks,
    recurringTasksCompleted,
    taskNotes,
    departmentObjectives,
    objectiveValues, setObjectiveValues,
    manualTranscript, setManualTranscript,
    recordedTranscript, setRecordedTranscript,
    showRecorder, setShowRecorder,
    employees,
    loadingTasks,
    generatingActa,
    showCompletionModal, setShowCompletionModal,
    selectedTaskForCompletion, setSelectedTaskForCompletion,
    taskFilter, setTaskFilter,
    generatedMinutes, setGeneratedMinutes,
    generatedTasks, setGeneratedTasks,
    showActaPreview, setShowActaPreview,
    showNextMeetingScheduler, setShowNextMeetingScheduler,
    isEditingActa, setIsEditingActa,
    nextMeetingDate, setNextMeetingDate,
    nextMeetingTime, setNextMeetingTime,
    leads,
    selectedLeadId, setSelectedLeadId,
    loadingLeads,
    isSaving,
    // Handlers
    loadPreviousTasks,
    handleTaskNoteChange,
    handleTogglePreviousTaskCompleted,
    handlePreviousTaskReasonChange,
    handleRecurringTaskNoteChange,
    handleAddManualTask,
    handleRemoveRecurringTask,
    handleToggleRecurringTaskCompleted,
    handleGenerateActa,
    handleSaveAfterReview,
    // Objetivos nuevo sistema
    previousObjectives,
    objectiveReviews,
    newObjectives,
    handleObjectiveReview,
    handleObjectiveReviewNota,
    handleNewObjectiveChange,
    handleAddNewObjective,
    handleRemoveNewObjective,
  };
};
