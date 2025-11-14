import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2, Loader, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { completeTask } from '../../services/taskService';
import { TaskCompletionModal } from './TaskCompletionModal';
import { MeetingRecorderComponent } from '../MeetingRecorderComponent';
import { generateMeetingMinutesViaBackend } from '../../services/transcriptionBackendService';

interface MeetingModalProps {
  departmentId: string;
  meeting?: any;
  userEmail?: string;
  userName?: string;
  participants?: string[];
  preselectedLeadId?: string | null;
  onClose: () => void;
}

interface PreviousTask {
  id: number;
  titulo: string;
  asignado_a: string;
  estado: string;
  fecha_limite: string;
  notas?: string;
}

interface RecurringTask {
  titulo: string;
  notas: string;
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
  onClose
}) => {
  const [meetingType, setMeetingType] = useState<MeetingType>('FISICA');
  const [previousTasks, setPreviousTasks] = useState<PreviousTask[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [recurringTasksCompleted, setRecurringTasksCompleted] = useState<Record<number, boolean>>({});
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});
  const [nextMeetingObjectives, setNextMeetingObjectives] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [generatingActa, setGeneratingActa] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<PreviousTask | null>(null);
  
  // Estados para leads (cuando departamento = ventas)
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    loadPreviousTasks();
    loadRecurringTasks();
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
        'Revisión de objetivos',
        'Seguimiento de KPIs',
        'Reuniones de equipo',
        'Planificación estratégica'
      ]
    };

    const tasks = RECURRING_TASKS_BY_DEPT[departmentId] || [];
    console.log('📋 Tareas recurrentes encontradas:', tasks.length, tasks);
    setRecurringTasks(tasks.map(titulo => ({ titulo, notas: '' })));
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

      // TODO: Guardar en base de datos:
      // 1. Reunión con acta, transcripción, objetivos
      // 2. % de cumplimiento de tareas recurrentes
      // 3. Tareas recurrentes completadas/pendientes
      // 4. Objetivos para próxima reunión
      // 5. Tareas nuevas extraídas por IA
      
      const meetingData = {
        departamento: departmentId,
        tipo: meetingType,
        transcripcion: transcription,
        acta: result.minutes,
        objetivos_proxima: nextMeetingObjectives,
        tareas_recurrentes: recurringTasks,
        tareas_completadas: completedRecurringTasks,
        total_tareas: totalRecurringTasks,
        porcentaje_cumplimiento: completionPercentage,
        tareas_nuevas: result.tasks
      };

      console.log('💾 Datos a guardar:', meetingData);
      
      alert(`✅ Acta generada correctamente!\n\n` +
            `Tareas nuevas: ${result.tasks?.length || 0}\n` +
            `Cumplimiento: ${completionPercentage}%\n` +
            `Objetivos definidos: ${nextMeetingObjectives ? 'Sí' : 'No'}`);
      onClose();
    } catch (error) {
      console.error('Error generando acta:', error);
      alert('Error al generar el acta: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setGeneratingActa(false);
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
                      fontWeight: '600',
                      color: '#166534',
                      marginBottom: '8px'
                    }}>
                      {task.titulo}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '12px'
                    }}>
                      👤 {task.asignado_a} • 📅 {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
                    </div>
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
              marginBottom: '12px'
            }}>
              Define los objetivos que se revisarán en la siguiente reunión para medir el progreso
            </p>
            <textarea
              placeholder="Ej: Aumentar ventas en un 15%, Completar formación del equipo, Implementar nuevo sistema..."
              value={nextMeetingObjectives}
              onChange={(e) => setNextMeetingObjectives(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: '24px'
              }}
            />
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

            {!isRecording ? (
              <button
                onClick={() => setIsRecording(true)}
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
              <div style={{
                padding: '20px',
                backgroundColor: '#fee2e2',
                border: '2px solid #dc2626',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '12px'
                }}>
                  🔴 GRABANDO...
                </div>
                <button
                  onClick={() => {
                    setIsRecording(false);
                    // TODO: Aquí iría la lógica de detener grabación
                    setRecordedTranscript('Transcripción grabada desde CRM...');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ⏹️ DETENER GRABACIÓN
                </button>
              </div>
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
    </div>
  );
};

export default MeetingModal;
