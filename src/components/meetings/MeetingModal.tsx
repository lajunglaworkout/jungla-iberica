import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2, Loader, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { completeTask } from '../../services/taskService';
import { TaskCompletionModal } from './TaskCompletionModal';
import { MeetingRecorderComponent } from '../MeetingRecorderComponent';
import { generateMeetingMinutesViaBackend } from '../../services/transcriptionBackendService';
import { 
  saveMeetingMetrics, 
  saveMeetingObjectives, 
  saveMeetingBottlenecks 
} from '../../services/meetingAnalyticsService';

interface MeetingModalProps {
  departmentId: string;
  meeting?: any;
  userEmail?: string;
  userName?: string;
  participants?: string[];
  preselectedLeadId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PreviousTask {
  id: number;
  titulo: string;
  asignado_a: string;
  estado: string;
  fecha_limite: string;
  notas?: string;
  completada?: boolean;
  motivo_no_completada?: string;
}

interface RecurringTask {
  titulo: string;
  notas: string;
  tipo?: 'simple' | 'expandible_centros' | 'expandible_departamentos' | 'incidencias' | 'incidencias_personal' | 'checklist_incidencias' | 'propuestas_sanciones';
  datos?: any;
}

interface DepartmentObjective {
  nombre: string;
  tipo: 'numero' | 'texto' | 'porcentaje';
  unidad?: string;
  placeholder?: string;
}

interface ObjectiveValue {
  nombre: string;
  valor: string | number;
  tipo: 'numero' | 'texto' | 'porcentaje';
}

type MeetingType = 'FISICA' | 'VIDEOLLAMADA';

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
  preselectedLeadId,
  onClose,
  onSuccess
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [generatingActa, setGeneratingActa] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<PreviousTask | null>(null);
  
  // Estados para preview del acta
  const [generatedMinutes, setGeneratedMinutes] = useState<string>('');
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [showActaPreview, setShowActaPreview] = useState(false);
  
  // Estados para programar siguiente reunión
  const [showNextMeetingScheduler, setShowNextMeetingScheduler] = useState(false);
  const [nextMeetingDate, setNextMeetingDate] = useState('');
  const [nextMeetingTime, setNextMeetingTime] = useState('');
  
  // Estados para leads (cuando departamento = ventas)
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    loadPreviousTasks();
    loadRecurringTasks();
    loadDepartmentObjectives();
    loadEmployees();
    
    // Si el departamento es ventas, cargar leads
    if (departmentId === 'ventas' || departmentId === 'sales') {
      loadLeads();
    }
    
    // Si hay un lead preseleccionado, establecerlo
    if (preselectedLeadId) {
      setSelectedLeadId(preselectedLeadId);
    }
  }, [departmentId, preselectedLeadId]);

  const loadDepartmentObjectives = () => {
    console.log('🎯 Cargando objetivos para departamento:', departmentId);
    
    // Objetivos predefinidos por departamento
    const OBJECTIVES_BY_DEPT: Record<string, DepartmentObjective[]> = {
      mantenimiento: [
        { nombre: 'Incidencias cerradas', tipo: 'numero', unidad: 'incidencias', placeholder: 'Ej: 15' },
        { nombre: 'Incidencias abiertas', tipo: 'numero', unidad: 'incidencias', placeholder: 'Ej: 2' },
        { nombre: 'Tiempo medio de resolución', tipo: 'numero', unidad: 'horas', placeholder: 'Ej: 24' }
      ],
      ventas: [
        { nombre: 'Ventas cerradas', tipo: 'numero', unidad: '€', placeholder: 'Ej: 15000' },
        { nombre: 'Leads contactados', tipo: 'numero', unidad: 'leads', placeholder: 'Ej: 25' },
        { nombre: 'Tasa de conversión', tipo: 'porcentaje', placeholder: 'Ej: 35' }
      ],
      marketing: [
        { nombre: 'Alcance total', tipo: 'numero', unidad: 'personas', placeholder: 'Ej: 50000' },
        { nombre: 'Engagement rate', tipo: 'porcentaje', placeholder: 'Ej: 4.5' },
        { nombre: 'Leads generados', tipo: 'numero', unidad: 'leads', placeholder: 'Ej: 120' }
      ],
      rrhh: [
        { nombre: 'Objetivo 1', tipo: 'texto', placeholder: 'Definir en la reunión' },
        { nombre: 'Objetivo 2', tipo: 'texto', placeholder: 'Definir en la reunión' },
        { nombre: 'Objetivo 3', tipo: 'texto', placeholder: 'Definir en la reunión' }
      ],
      procedimientos: [
        { nombre: 'Procedimientos actualizados', tipo: 'numero', unidad: 'documentos', placeholder: 'Ej: 5' },
        { nombre: 'Formaciones completadas', tipo: 'numero', unidad: 'sesiones', placeholder: 'Ej: 3' },
        { nombre: 'Cumplimiento normativo', tipo: 'porcentaje', placeholder: 'Ej: 100' }
      ],
      logistica: [
        { nombre: 'Pedidos procesados', tipo: 'numero', unidad: 'pedidos', placeholder: 'Ej: 150' },
        { nombre: 'Entregas a tiempo', tipo: 'porcentaje', placeholder: 'Ej: 95' },
        { nombre: 'Rotación de inventario', tipo: 'numero', unidad: 'días', placeholder: 'Ej: 30' }
      ],
      direccion: [
        { nombre: 'Objetivo 1', tipo: 'texto', placeholder: 'Definir en la reunión' },
        { nombre: 'Objetivo 2', tipo: 'texto', placeholder: 'Definir en la reunión' },
        { nombre: 'Objetivo 3', tipo: 'texto', placeholder: 'Definir en la reunión' }
      ]
    };

    const objectives = OBJECTIVES_BY_DEPT[departmentId] || [];
    console.log('📊 Objetivos encontrados:', objectives.length, objectives);
    setDepartmentObjectives(objectives);
  };

  const loadRecurringTasks = () => {
    console.log('🔄 Cargando tareas recurrentes para departamento:', departmentId);
    
    // Tareas recurrentes por departamento
    const RECURRING_TASKS_BY_DEPT: Record<string, string[]> = {
      contabilidad: [
        'Revisar contabilidad',
        'Pagos pendientes',
        'Incidencias',
        'Reconciliación bancaria'
      ],
      marketing: [
        'Revisar campañas activas',
        'Analizar métricas',
        'Planificar contenido',
        'Seguimiento leads'
      ],
      rrhh: [
        'Revisar candidatos',
        'Incidencias de personal',
        'Nóminas',
        'Evaluaciones'
      ],
      ventas: [
        'Seguimiento de leads',
        'Propuestas pendientes',
        'Cierre de ventas',
        'Reuniones programadas'
      ],
      sales: [
        'Seguimiento de leads',
        'Propuestas pendientes',
        'Cierre de ventas',
        'Reuniones programadas'
      ],
      operaciones: [
        'Revisar incidencias',
        'Mantenimiento',
        'Inventario',
        'Proveedores'
      ],
      logistica: [
        'Revisar pedidos',
        'Gestión de inventario',
        'Proveedores',
        'Envíos pendientes'
      ],
      mantenimiento: [
        'Incidencias reportadas',
        'Mantenimiento preventivo',
        'Equipamiento',
        'Proveedores de servicios'
      ],
      procedimientos: [
        'Revisar procedimientos vigentes',
        'Actualizar documentación',
        'Formación del equipo',
        'Auditorías internas'
      ],
      direccion: [
        'Incidencias urgentes',
        'Revisión de contabilidad y clientes de cada centro',
        'Datos de rendimiento de cada departamento'
      ]
    };

    // Configuración especial para Dirección con datos expandibles
    if (departmentId === 'direccion') {
      const direccionTasks: RecurringTask[] = [
        {
          titulo: 'Incidencias urgentes',
          notas: '',
          tipo: 'incidencias',
          datos: {
            // Se cargarán automáticamente desde la BD
          }
        },
        {
          titulo: 'Revisión de contabilidad y clientes de cada centro',
          notas: '',
          tipo: 'expandible_centros',
          datos: {
            centros: ['Sevilla', 'Jerez', 'Puerto']
          }
        },
        {
          titulo: 'Datos de rendimiento de cada departamento',
          notas: '',
          tipo: 'expandible_departamentos',
          datos: {
            departamentos: ['rrhh', 'procedimientos', 'logistica', 'mantenimiento', 'marketing', 'ventas']
          }
        }
      ];
      setRecurringTasks(direccionTasks);
      return;
    }

    // Configuración especial para RRHH con datos expandibles
    if (departmentId === 'rrhh') {
      const rrhhTasks: RecurringTask[] = [
        {
          titulo: 'Incidencias de personal',
          notas: '',
          tipo: 'incidencias_personal',
          datos: {
            // Se cargarán automáticamente: bajas, incidencias pendientes
          }
        },
        {
          titulo: 'Incidencias en checklist a resolver',
          notas: '',
          tipo: 'checklist_incidencias',
          datos: {
            // Se cargarán automáticamente desde checklist
          }
        },
        {
          titulo: 'Propuestas, sanciones, cambios de procedimientos',
          notas: '',
          tipo: 'propuestas_sanciones',
          datos: {
            // Mostrar si hay propuestas o sanciones pendientes
          }
        }
      ];
      setRecurringTasks(rrhhTasks);
      return;
    }

    // Para otros departamentos, usar la configuración simple
    const RECURRING_TASKS_SIMPLE: Record<string, string[]> = {
      contabilidad: [
        'Revisar contabilidad',
        'Pagos pendientes',
        'Incidencias',
        'Reconciliación bancaria'
      ],
      marketing: [
        'Revisar campañas activas',
        'Analizar métricas',
        'Planificar contenido',
        'Seguimiento leads'
      ],
      rrhh: [
        'Revisar candidatos',
        'Incidencias de personal',
        'Nóminas',
        'Evaluaciones'
      ],
      ventas: [
        'Seguimiento de leads',
        'Propuestas pendientes',
        'Cierre de ventas',
        'Reuniones programadas'
      ],
      sales: [
        'Seguimiento de leads',
        'Propuestas pendientes',
        'Cierre de ventas',
        'Reuniones programadas'
      ],
      operaciones: [
        'Revisar incidencias',
        'Mantenimiento',
        'Inventario',
        'Proveedores'
      ],
      logistica: [
        'Revisar pedidos',
        'Gestión de inventario',
        'Proveedores',
        'Envíos pendientes'
      ],
      mantenimiento: [
        'Incidencias reportadas',
        'Mantenimiento preventivo',
        'Equipamiento',
        'Proveedores de servicios'
      ],
      procedimientos: [
        'Revisar procedimientos vigentes',
        'Actualizar documentación',
        'Formación del equipo',
        'Auditorías internas'
      ]
    };

    const tasks = RECURRING_TASKS_SIMPLE[departmentId] || [];
    console.log('📋 Tareas recurrentes encontradas:', tasks.length, tasks);
    setRecurringTasks(tasks.map(titulo => ({ titulo, notas: '', tipo: 'simple' })));
  };

  const loadPreviousTasks = async () => {
    setLoadingTasks(true);
    try {
      // Cargar tareas pendientes del departamento actual
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('estado', 'pendiente')
        .eq('departamento', departmentId)
        .order('fecha_limite', { ascending: true });

      if (error) {
        console.error('Error cargando tareas anteriores:', error);
        setPreviousTasks([]);
        return;
      }

      const formattedTasks = (data || []).map((task: any) => ({
        id: task.id,
        titulo: task.titulo,
        asignado_a: task.asignado_a,
        estado: task.estado,
        fecha_limite: task.fecha_limite
      }));

      setPreviousTasks(formattedTasks);
      console.log(`ℹ️ Tareas anteriores del departamento ${departmentId}: ${formattedTasks.length} tareas pendientes`);
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
      const { data, error } = await supabase
        .from('leads')
        .select('id, nombre, email, telefono, empresa, proyecto_nombre, estado')
        .in('estado', ['prospecto', 'contactado', 'reunion', 'propuesta', 'negociacion'])
        .order('nombre', { ascending: true });

      if (error) {
        console.error('❌ Error cargando leads:', error);
        setLeads([]);
        return;
      }

      console.log('✅ Leads cargados para reunión:', data);
      setLeads(data || []);
    } catch (error) {
      console.error('Error:', error);
      setLeads([]);
    } finally {
      setLoadingLeads(false);
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

  const handleTaskNoteChange = (taskId: string, note: string) => {
    setTaskNotes(prev => ({ ...prev, [taskId]: note }));
  };

  const handleTogglePreviousTaskCompleted = (taskId: number) => {
    setPreviousTasksCompleted(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
    // Si se marca como completada, limpiar el motivo
    if (!previousTasksCompleted[taskId]) {
      setPreviousTasksReasons(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
    }
  };

  const handlePreviousTaskReasonChange = (taskId: number, reason: string) => {
    setPreviousTasksReasons(prev => ({
      ...prev,
      [taskId]: reason
    }));
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
    setRecurringTasksCompleted(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleGenerateActa = async () => {
    try {
      setGeneratingActa(true);
      
      // Obtener transcripción (manual o grabada)
      const transcription = manualTranscript || recordedTranscript;
      
      if (!transcription) {
        alert('Por favor, añade una transcripción o graba la reunión');
        setGeneratingActa(false);
        return;
      }

      console.log('🎯 Generando acta con transcripción:', transcription.substring(0, 100) + '...');
      
      // Calcular % de cumplimiento de tareas recurrentes
      const totalRecurringTasks = recurringTasks.length;
      const completedRecurringTasks = Object.values(recurringTasksCompleted).filter(Boolean).length;
      const completionPercentage = totalRecurringTasks > 0 
        ? Math.round((completedRecurringTasks / totalRecurringTasks) * 100) 
        : 0;

      console.log(`📊 Cumplimiento de tareas recurrentes: ${completedRecurringTasks}/${totalRecurringTasks} (${completionPercentage}%)`);
      
      // Generar acta usando DeepSeek via backend
      const result = await generateMeetingMinutesViaBackend(
        transcription,
        meeting?.title || 'Nueva Reunión',
        participants || []
      );

      if (!result.success) {
        throw new Error(result.error || 'Error generando acta');
      }

      console.log('✅ Acta generada:', result.minutes);
      console.log('📋 Tareas extraídas:', result.tasks);

      // Guardar en estado para preview
      setGeneratedMinutes(result.minutes || '');
      setGeneratedTasks(result.tasks || []);
      setShowActaPreview(true);
      setGeneratingActa(false);
      
    } catch (error) {
      console.error('Error generando acta:', error);
      alert('❌ Error generando acta: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      setGeneratingActa(false);
    }
  };

  // Nueva función para guardar después de revisar
  const handleSaveAfterReview = async () => {
    try {
      const transcription = manualTranscript || recordedTranscript;
      
      // Calcular métricas
      const totalRecurringTasks = recurringTasks.length;
      const completedRecurringTasks = recurringTasks.filter(task => recurringTasksCompleted[task.id]).length;
      const completionPercentage = totalRecurringTasks > 0 
        ? Math.round((completedRecurringTasks / totalRecurringTasks) * 100) 
        : 0;

      // 1. Guardar reunión en tabla meetings
      // Para reuniones completadas, usar fecha de ayer para asegurar que aparezca en historial
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0); // Mediodía de ayer
      const meetingDate = yesterday.toISOString();
      
      const { data: meetingRecord, error: meetingError} = await supabase
        .from('meetings')
        .insert({
          title: meeting?.title || 'Nueva Reunión',
          department: departmentId,
          date: meetingDate,
          start_time: meeting?.start_time || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          participants: participants || [],
          summary: generatedMinutes,
          tipo_reunion: meetingType,
          porcentaje_cumplimiento: completionPercentage,
          tiene_cuellos_botella: previousTasks.some(task => !previousTasksCompleted[task.id]),
          numero_cuellos_botella: previousTasks.filter(task => !previousTasksCompleted[task.id]).length,
          created_by: userEmail,
          status: 'completed'
        })
        .select()
        .single();

      if (meetingError) {
        throw new Error('Error guardando reunión: ' + meetingError.message);
      }

      const meetingId = meetingRecord.id;
      console.log('✅ Reunión guardada con ID:', meetingId);

      // 2. Guardar métricas
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

      // 3. Guardar objetivos
      const objectivesToSave = Object.entries(objectiveValues).map(([nombre, valor]) => ({
        meeting_id: meetingId,
        departamento: departmentId,
        nombre,
        valor_objetivo: valor.toString(),
        tipo_objetivo: departmentObjectives.find(o => o.nombre === nombre)?.tipo || 'texto',
        unidad: departmentObjectives.find(o => o.nombre === nombre)?.unidad
      }));

      if (objectivesToSave.length > 0) {
        await saveMeetingObjectives(objectivesToSave);
      }

      // 4. Guardar cuellos de botella
      const bottlenecksToSave = previousTasks
        .filter(task => !previousTasksCompleted[task.id])
        .map(task => ({
          meeting_id: meetingId,
          departamento: departmentId,
          tarea_titulo: task.titulo,
          tarea_id: typeof task.id === 'number' ? task.id : undefined, // Solo si es número, sino undefined
          motivo: previousTasksReasons[task.id] || 'No especificado',
          asignado_a: task.asignado_a,
          fecha_limite: task.fecha_limite
        }));

      if (bottlenecksToSave.length > 0) {
        await saveMeetingBottlenecks(bottlenecksToSave);
      }

      // 5. Guardar tareas nuevas extraídas por IA
      if (generatedTasks && generatedTasks.length > 0) {
        const tasksToSave = generatedTasks.map((task: any) => ({
          titulo: task.title || task.titulo,
          descripcion: task.description || task.descripcion || '',
          asignado_a: task.assignedTo || task.asignado_a || userEmail,
          creado_por: userEmail,
          prioridad: task.priority || task.prioridad || 'media',
          estado: 'pendiente',
          fecha_limite: task.deadline || task.fecha_limite || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          departamento: departmentId,
          reunion_titulo: meeting?.title || 'Nueva Reunión',
          verificacion_requerida: true
        }));

        const { error: tasksError } = await supabase
          .from('tareas')
          .insert(tasksToSave);

        if (tasksError) {
          console.error('Error guardando tareas:', tasksError);
        } else {
          console.log('✅ Tareas nuevas guardadas:', tasksToSave.length);
        }
      }

      const objetivosDefinidos = Object.keys(objectiveValues).length;
      
      // Limpiar estados del preview
      setShowActaPreview(false);
      setGeneratedMinutes('');
      setGeneratedTasks([]);
      
      // Mostrar resumen y preguntar si quiere programar siguiente
      alert(
        `✅ Reunión guardada correctamente!\n\n` +
        `📋 Acta generada\n` +
        `📊 Tareas nuevas: ${generatedTasks?.length || 0}\n` +
        `✅ Cumplimiento: ${completionPercentage}%\n` +
        `🎯 Objetivos definidos: ${objetivosDefinidos}/${departmentObjectives.length}\n` +
        `⚠️ Cuellos de botella: ${bottlenecksToSave.length}`
      );
      
      // Preguntar si quiere programar siguiente reunión
      const programarSiguiente = window.confirm('¿Deseas programar la siguiente reunión?');
      
      if (programarSiguiente) {
        // Limpiar campos y mostrar scheduler
        setManualTranscript('');
        setRecordedTranscript('');
        setPreviousTasksCompleted({});
        setPreviousTasksReasons({});
        setRecurringTasksCompleted({});
        setObjectiveValues({});
        setShowNextMeetingScheduler(true);
      } else {
        onSuccess?.(); // Recargar lista de reuniones
        onClose();
      }
    } catch (error) {
      console.error('Error guardando reunión:', error);
      alert('Error al guardar la reunión: ' + (error instanceof Error ? error.message : 'Error desconocido'));
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
            {participants && participants.length > 0 && (
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

        {/* Selector de Tipo de Reunión */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Tipo de Reunión
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setMeetingType('FISICA')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: meetingType === 'FISICA' ? '#3b82f6' : 'white',
                color: meetingType === 'FISICA' ? 'white' : '#6b7280',
                border: `2px solid ${meetingType === 'FISICA' ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🏢 Reunión Física
            </button>
            <button
              onClick={() => setMeetingType('VIDEOLLAMADA')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: meetingType === 'VIDEOLLAMADA' ? '#3b82f6' : 'white',
                color: meetingType === 'VIDEOLLAMADA' ? 'white' : '#6b7280',
                border: `2px solid ${meetingType === 'VIDEOLLAMADA' ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📹 Videollamada
            </button>
          </div>
        </div>

        {/* Selector de Lead (solo para ventas) */}
        {(departmentId === 'ventas' || departmentId === 'sales') && (
          <div style={{
            padding: '16px 24px',
            backgroundColor: '#f0f9ff',
            borderBottom: '1px solid #bfdbfe'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1e40af',
              marginBottom: '8px'
            }}>
              🎯 Lead Asociado a la Reunión
            </label>
            {loadingLeads ? (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Cargando leads...</p>
            ) : leads.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>No hay leads disponibles</p>
            ) : (
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Seleccionar lead (opcional) --</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nombre} {lead.empresa ? `(${lead.empresa})` : ''} - {lead.proyecto_nombre || 'Sin proyecto'}
                  </option>
                ))}
              </select>
            )}
            {selectedLeadId && (
              <p style={{ fontSize: '11px', color: '#1e40af', marginTop: '6px', marginBottom: 0 }}>
                ✅ Esta reunión se registrará automáticamente en el historial del lead
              </p>
            )}
          </div>
        )}

        {/* Contenido Principal */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Tareas Anteriores */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              📋 Tareas Pendientes de Reuniones Anteriores
            </h3>

            {previousTasks.length === 0 ? (
              <div style={{
                padding: '16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                No hay tareas pendientes anteriores
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <input
                        type="checkbox"
                        checked={previousTasksCompleted[task.id] || false}
                        onChange={() => handleTogglePreviousTaskCompleted(task.id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{
                        fontWeight: '600',
                        color: '#166534',
                        flex: 1,
                        textDecoration: previousTasksCompleted[task.id] ? 'line-through' : 'none',
                        opacity: previousTasksCompleted[task.id] ? 0.6 : 1
                      }}>
                        {task.titulo}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '12px',
                      marginLeft: '26px'
                    }}>
                      👤 {task.asignado_a} • 📅 {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
                    </div>
                    
                    {/* Si NO está completada, mostrar campo de motivo */}
                    {!previousTasksCompleted[task.id] && (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#dc2626',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          ⚠️ Motivo de no completación:
                        </label>
                        <textarea
                          placeholder="Ej: Falta de recursos, Dependencia externa, Prioridad cambiada..."
                          value={previousTasksReasons[task.id] || ''}
                          onChange={(e) => handlePreviousTaskReasonChange(task.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '14px',
                            minHeight: '60px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                            backgroundColor: '#fef2f2'
                          }}
                        />
                      </div>
                    )}
                    
                    <textarea
                      placeholder="Notas sobre esta tarea..."
                      value={taskNotes[task.id] || ''}
                      onChange={(e) => handleTaskNoteChange(task.id.toString(), e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        minHeight: '60px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tareas Recurrentes */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                🔄 Tareas Recurrentes del Departamento
              </h3>
              <button
                onClick={handleAddManualTask}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                Añadir Punto
              </button>
            </div>

            {recurringTasks.length === 0 ? (
              <div style={{
                padding: '16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                No hay tareas recurrentes. Click en "Añadir Punto" para crear una.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {recurringTasks.map((task, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: 1
                      }}>
                        <input
                          type="checkbox"
                          checked={recurringTasksCompleted[index] || false}
                          onChange={() => handleToggleRecurringTaskCompleted(index)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{
                          fontWeight: '600',
                          color: '#92400e',
                          textDecoration: recurringTasksCompleted[index] ? 'line-through' : 'none',
                          opacity: recurringTasksCompleted[index] ? 0.6 : 1
                        }}>
                          {task.titulo}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRecurringTask(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '18px',
                          lineHeight: 1
                        }}
                        title="Eliminar tarea"
                      >
                        ×
                      </button>
                    </div>
                    {/* Renderizado condicional según el tipo de tarea */}
                    {task.tipo === 'expandible_centros' ? (
                      <div style={{ marginTop: '12px' }}>
                        {task.datos?.centros?.map((centro: string) => (
                          <details key={centro} style={{ marginBottom: '8px' }}>
                            <summary style={{
                              cursor: 'pointer',
                              fontWeight: '600',
                              padding: '8px',
                              backgroundColor: '#fff',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              marginBottom: '4px'
                            }}>
                              🏢 {centro}
                            </summary>
                            <div style={{
                              padding: '12px',
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              marginTop: '4px'
                            }}>
                              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                                <div><strong>💰 Ingresos mes:</strong> <span style={{ color: '#059669' }}>Cargando...</span></div>
                                <div><strong>👥 Clientes activos:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
                                <div><strong>✨ Clientes nuevos:</strong> <span style={{ color: '#10b981' }}>Cargando...</span></div>
                                <div><strong>📉 Bajas del mes:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
                                <textarea
                                  placeholder="Observaciones..."
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    minHeight: '50px',
                                    marginTop: '8px',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                            </div>
                          </details>
                        ))}
                      </div>
                    ) : task.tipo === 'expandible_departamentos' ? (
                      <div style={{ marginTop: '12px' }}>
                        {task.datos?.departamentos?.map((dept: string) => (
                          <details key={dept} style={{ marginBottom: '8px' }}>
                            <summary style={{
                              cursor: 'pointer',
                              fontWeight: '600',
                              padding: '8px',
                              backgroundColor: '#fff',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              marginBottom: '4px'
                            }}>
                              📊 {dept.toUpperCase()}
                            </summary>
                            <div style={{
                              padding: '12px',
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              marginTop: '4px'
                            }}>
                              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                                <div><strong>✅ Cumplimiento:</strong> <span style={{ color: '#059669' }}>Cargando...</span></div>
                                <div><strong>📝 Tareas completadas:</strong> <span style={{ color: '#3b82f6' }}>Cargando...</span></div>
                                <div><strong>⏳ Tareas pendientes:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
                                <div><strong>⚠️ Cuellos de botella:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
                                <select style={{
                                  padding: '6px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                  marginTop: '4px'
                                }}>
                                  <option>Óptimo</option>
                                  <option>Normal</option>
                                  <option>Requiere atención</option>
                                  <option>Crítico</option>
                                </select>
                                <textarea
                                  placeholder="Acciones a tomar..."
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    minHeight: '50px',
                                    marginTop: '4px',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                            </div>
                          </details>
                        ))}
                      </div>
                    ) : task.tipo === 'incidencias' ? (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                          <div><strong>🔴 Incidencias abiertas:</strong> <span style={{ color: '#dc2626' }}>Cargando...</span></div>
                          <div><strong>📊 Nuevas desde última reunión:</strong> <span style={{ color: '#f59e0b' }}>Cargando...</span></div>
                          <textarea
                            placeholder="Motivos de no cierre..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              minHeight: '50px',
                              marginTop: '8px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <textarea
                            placeholder="Comentarios adicionales..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              minHeight: '50px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    ) : task.tipo === 'incidencias_personal' ? (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
                          <div style={{ 
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#dc2626' }}>🚨 Bajas activas</div>
                            <div style={{ color: '#6b7280' }}>Cargando bajas de personal...</div>
                          </div>
                          <div style={{ 
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>⚠️ Incidencias pendientes</div>
                            <div style={{ color: '#6b7280' }}>Cargando incidencias de personal...</div>
                          </div>
                          <textarea
                            placeholder="Comentarios sobre incidencias de personal..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              minHeight: '60px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    ) : task.tipo === 'checklist_incidencias' ? (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#dbeafe',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
                          <div style={{ 
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>📋 Incidencias en checklist</div>
                            <div style={{ color: '#6b7280' }}>Cargando incidencias de checklist...</div>
                          </div>
                          <div style={{ 
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>📊 Resumen</div>
                            <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
                              <div>• <strong>Total pendientes:</strong> <span style={{ color: '#ef4444' }}>Cargando...</span></div>
                              <div>• <strong>Resueltas esta semana:</strong> <span style={{ color: '#10b981' }}>Cargando...</span></div>
                            </div>
                          </div>
                          <textarea
                            placeholder="Acciones a tomar sobre checklist..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              minHeight: '60px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    ) : task.tipo === 'propuestas_sanciones' ? (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#f3e8ff',
                        border: '1px solid #a855f7',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
                          <div style={{ 
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#a855f7' }}>💡 Propuestas pendientes</div>
                            <div style={{ color: '#6b7280' }}>Cargando propuestas...</div>
                          </div>
                          <div style={{ 
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#dc2626' }}>⚖️ Sanciones activas</div>
                            <div style={{ color: '#6b7280' }}>Cargando sanciones...</div>
                          </div>
                          <div style={{ 
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: '#3b82f6' }}>📝 Cambios de procedimientos</div>
                            <div style={{ color: '#6b7280' }}>Cargando cambios pendientes...</div>
                          </div>
                          <textarea
                            placeholder="Decisiones tomadas sobre propuestas, sanciones o cambios..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              minHeight: '80px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <textarea
                        placeholder="Notas sobre esta tarea recurrente..."
                        value={task.notas}
                        onChange={(e) => handleRecurringTaskNoteChange(index, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          minHeight: '60px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Objetivos para Próxima Reunión */}
          <div style={{
            borderTop: '2px solid #e5e7eb',
            margin: '24px 0',
            paddingTop: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              🎯 Objetivos para la Próxima Reunión
            </h3>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              Define los valores objetivo que se revisarán en la siguiente reunión
            </p>

            {departmentObjectives.length === 0 ? (
              <div style={{
                padding: '16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                No hay objetivos predefinidos para este departamento
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                {departmentObjectives.map((objective, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px'
                    }}
                  >
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e40af',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      {objective.nombre}
                      {objective.unidad && (
                        <span style={{ fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>
                          ({objective.unidad})
                        </span>
                      )}
                    </label>
                    <input
                      type={objective.tipo === 'texto' ? 'text' : 'number'}
                      placeholder={objective.placeholder}
                      value={objectiveValues[objective.nombre] || ''}
                      onChange={(e) => setObjectiveValues(prev => ({
                        ...prev,
                        [objective.nombre]: objective.tipo === 'numero' || objective.tipo === 'porcentaje' 
                          ? parseFloat(e.target.value) || 0
                          : e.target.value
                      }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {objective.tipo === 'porcentaje' && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        Valor entre 0 y 100
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transcripción */}
          <div style={{
            borderTop: '2px solid #e5e7eb',
            margin: '24px 0',
            paddingTop: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              📝 Transcripción de la Reunión
            </h3>

            <textarea
              placeholder="Opción 1: Pega aquí la transcripción (iPhone, Meet, manual...)"
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '150px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            />

            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '600',
              margin: '16px 0'
            }}>
              O
            </div>

            {!showRecorder ? (
              <button
                onClick={() => {
                  console.log('🎙️ Abriendo grabadora...');
                  setShowRecorder(true);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🎙️ GRABAR DESDE CRM
              </button>
            ) : (
              <>
                {console.log('📹 Renderizando MeetingRecorderComponent')}
                <MeetingRecorderComponent
                  meetingId={meeting?.id || 0}
                  meetingTitle={meeting?.title || 'Nueva Reunión'}
                  participants={participants || []}
                  departmentId={departmentId}
                  onRecordingComplete={(data) => {
                    console.log('✅ Grabación completada:', data);
                    // Solo guardar la transcripción, NO generar acta automáticamente
                    setManualTranscript(data.transcript);
                    setShowRecorder(false);
                    alert('✅ Transcripción guardada. Ahora puedes revisarla y hacer click en "GENERAR ACTA Y ASIGNAR TAREAS"');
                  }}
                  onClose={() => {
                    console.log('❌ Cerrando grabadora');
                    setShowRecorder(false);
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {meetingType === 'FISICA' ? '🏢 Reunión Física' : '📹 Videollamada'}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
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
              Cancelar
            </button>

            <button
              onClick={handleGenerateActa}
              disabled={generatingActa}
              style={{
                backgroundColor: generatingActa ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: generatingActa ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: generatingActa ? 0.7 : 1
              }}
            >
              {generatingActa ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  GENERANDO ACTA...
                </>
              ) : (
                <>
                  ✅ GENERAR ACTA Y ASIGNAR TAREAS
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Completación de Tarea */}
      {showCompletionModal && selectedTaskForCompletion && userEmail && userName && (
        <TaskCompletionModal
          isOpen={showCompletionModal}
          taskId={selectedTaskForCompletion.id}
          taskTitle={selectedTaskForCompletion.titulo}
          userEmail={userEmail}
          userName={userName}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedTaskForCompletion(null);
          }}
          onSuccess={() => {
            loadPreviousTasks();
          }}
        />
      )}

      {/* Modal de Preview del Acta */}
      {showActaPreview && (
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
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '900px',
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
              alignItems: 'center',
              backgroundColor: '#f9fafb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                📋 Revisar Acta Generada
              </h2>
              <button
                onClick={() => setShowActaPreview(false)}
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
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  📄 Acta de la Reunión
                </h3>
                <textarea
                  value={generatedMinutes}
                  onChange={(e) => setGeneratedMinutes(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
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
                    {generatedTasks.map((task: any, index: number) => (
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
                            onChange={(e) => {
                              const newTasks = [...generatedTasks];
                              newTasks[index] = {
                                ...newTasks[index],
                                title: e.target.value,
                                titulo: e.target.value
                              };
                              setGeneratedTasks(newTasks);
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
                            onClick={() => {
                              const newTasks = generatedTasks.filter((_, i) => i !== index);
                              setGeneratedTasks(newTasks);
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
                            onChange={(e) => {
                              const newTasks = [...generatedTasks];
                              newTasks[index] = {
                                ...newTasks[index],
                                assignedTo: e.target.value,
                                asignado_a: e.target.value
                              };
                              setGeneratedTasks(newTasks);
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
                            <option value="">Sin asignar</option>
                            {participants?.map((email: string) => (
                              <option key={email} value={email}>
                                {employees.find(emp => emp.email === email)?.name || email}
                              </option>
                            ))}
                            {employees
                              .filter(emp => !participants?.includes(emp.email))
                              .map(emp => (
                                <option key={emp.email} value={emp.email}>
                                  {emp.name}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <button
                onClick={() => setShowActaPreview(false)}
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
                onClick={handleSaveAfterReview}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                💾 Guardar Reunión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Programación de Siguiente Reunión */}
      {showNextMeetingScheduler && (
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
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              📅 Programar Siguiente Reunión
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Fecha de la reunión
                </label>
                <input
                  type="date"
                  value={nextMeetingDate}
                  onChange={(e) => setNextMeetingDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={nextMeetingTime}
                  onChange={(e) => setNextMeetingTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowNextMeetingScheduler(false);
                  setNextMeetingDate('');
                  setNextMeetingTime('');
                  onSuccess?.(); // Recargar lista de reuniones
                  onClose();
                }}
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
                onClick={async () => {
                  if (!nextMeetingDate || !nextMeetingTime) {
                    alert('Por favor completa la fecha y hora de la reunión');
                    return;
                  }

                  try {
                    const { data, error } = await supabase
                      .from('meetings')
                      .insert({
                        title: meeting?.title || 'Nueva Reunión',
                        department: departmentId,
                        date: nextMeetingDate,
                        start_time: nextMeetingTime,
                        participants: participants || [],
                        created_by: userEmail,
                        status: 'scheduled'
                      })
                      .select()
                      .single();

                    if (error) throw error;

                    alert('✅ Siguiente reunión programada correctamente!');
                    setShowNextMeetingScheduler(false);
                    setNextMeetingDate('');
                    setNextMeetingTime('');
                    onSuccess?.(); // Recargar lista de reuniones
                    onClose();
                  } catch (error) {
                    console.error('Error programando reunión:', error);
                    alert('Error al programar la reunión');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✅ Programar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingModal;
