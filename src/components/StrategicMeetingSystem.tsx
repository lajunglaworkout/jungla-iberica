// src/components/StrategicMeetingSystem.tsx
// Componente orquestador — lógica de estado, guardado y navegación.
// Sub-componentes en src/components/meetings/Strategic*.tsx
import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Save, FileText, Clock } from 'lucide-react';
import { createObjectives, getAllMeetings, createReunion, createMeetingTasks } from '../services/meetingService';
import { getAllEmployees } from '../services/userService';
import { getEmployeeIdByEmail } from '../services/incidentService';
import { notifyTaskAssigned } from '../services/notificationService';
import { useSession } from '../contexts/SessionContext';
import { ui } from '../utils/ui';

import {
  LEADERSHIP_TEAM,
  DEPARTMENTS,
  MEETING_TYPES_CONFIG,
  type MeetingData,
  type HistoricalMeeting,
  type LeadershipMember,
} from './meetings/StrategicMeetingConfig';
import StrategicMeetingHistory from './meetings/StrategicMeetingHistory';
import StrategicMeetingMetrics from './meetings/StrategicMeetingMetrics';
import StrategicMeetingObjectivesAndTasks from './meetings/StrategicMeetingObjectivesAndTasks';
import StrategicMeetingSummary from './meetings/StrategicMeetingSummary';

interface StrategicMeetingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (meetingData: MeetingData) => void;
}

const totalSteps = 4;

const StrategicMeetingSystem: React.FC<StrategicMeetingSystemProps> = ({ isOpen, onClose, onComplete }) => {
  const { employee } = useSession();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [realEmployees, setRealEmployees] = useState<LeadershipMember[]>([]);
  const [viewMode, setViewMode] = useState<'create' | 'history'>('create');
  const [meetings, setMeetings] = useState<HistoricalMeeting[]>([]);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [meetingData, setMeetingData] = useState<MeetingData>({
    type: 'semanal',
    department: '',
    date: new Date().toISOString().split('T')[0],
    participants: [],
    metrics: {},
    objectives: [],
    tasks: [],
    notes: '',
  });

  // ─── Carga de datos ─────────────────────────────────────────────────────────

  React.useEffect(() => {
    const loadRealEmployees = async () => {
      try {
        const allEmployees = await getAllEmployees();

        if (!allEmployees || allEmployees.length === 0) {
          setRealEmployees(LEADERSHIP_TEAM);
          return;
        }

        setRealEmployees(allEmployees.map((emp: any) => ({
          id: emp.email || emp.id,
          name: emp.name || `Usuario ${emp.id?.slice(0, 8)}`,
          role: emp.role || emp.department || 'Empleado',
        })));
      } catch {
        setRealEmployees(LEADERSHIP_TEAM);
      }
    };

    const loadMeetings = async () => {
      try {
        const data = await getAllMeetings();

        setMeetings(data.map((meeting: any) => ({
          id: meeting.id,
          type: meeting.type || 'semanal',
          department: meeting.department || '',
          date: meeting.date || new Date().toISOString(),
          participants: meeting.participants || [],
          metrics: meeting.metrics || {},
          objectives: meeting.objectives || [],
          tasks: meeting.tasks || [],
          notes: meeting.notes || '',
          created_at: meeting.created_at || new Date().toISOString(),
        })));
      } catch (err) {
        console.error('Error cargando reuniones:', err);
      }
    };

    if (isOpen) {
      loadRealEmployees();
      loadMeetings();
    }
  }, [isOpen]);

  // ─── Guardado en base de datos ───────────────────────────────────────────────

  const saveMeetingToDatabase = async () => {
    const selectedType = MEETING_TYPES_CONFIG[meetingData.type];
    const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);

    if (!selectedDepartment) throw new Error('Debe seleccionar un departamento');
    if (!selectedType) throw new Error('Tipo de reunión no válido');

    const reunionResult = await createReunion({
      titulo: `${selectedType.label} - ${selectedDepartment.name}`,
      descripcion: `Reunión ${meetingData.type} del departamento ${meetingData.department}`,
      fecha: meetingData.date,
      hora_inicio: '09:00',
      hora_fin: meetingData.type === 'mensual' ? '12:00' : '11:00',
      participantes: meetingData.participants,
      tipo: 'estrategica',
      estado: 'programada',
      creado_por: employee?.email || '',
      acta_reunion: JSON.stringify({
        metrics: meetingData.metrics,
        objectives: meetingData.objectives,
        type: meetingData.type,
        department: meetingData.department,
      }),
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    });

    if (!reunionResult.success) throw new Error(reunionResult.error);
    const meetingRecord = reunionResult.record!;

    if (meetingData.objectives.length > 0) {
      await createObjectives(
        meetingData.objectives.map((obj: any) => ({
          titulo: obj.title,
          estado: 'activo',
          reunion_origen: meetingRecord.id,
          departamento_responsable: meetingData.department,
          fecha_limite: meetingData.date,
          creado_por: employee?.email || '',
          creado_en: new Date().toISOString(),
        }))
      );
    }

    if (meetingData.tasks.length > 0) {
      const tasksResult = await createMeetingTasks(meetingData.tasks.map((task: any) => ({
        titulo: task.title,
        asignado_a: task.assignedTo,
        creado_por: employee?.email || '',
        reunion_origen: meetingRecord.id,
        prioridad: task.priority,
        estado: 'pendiente',
        fecha_limite: task.deadline,
        verificacion_requerida: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      })));

      if (!tasksResult.success) throw new Error(tasksResult.error);

      const savedTasks = tasksResult.data ?? [];
      if (savedTasks.length > 0) {
        for (const task of savedTasks) {
          const t = task as any;
          const assigneeId = await getEmployeeIdByEmail(t.asignado_a);

          if (assigneeId) {
            await notifyTaskAssigned({
              taskId: t.id,
              taskTitle: t.titulo,
              assigneeId,
              assignerName: 'Dirección',
              dueDate: t.fecha_limite,
            });
          }
        }
      }
    }

    return meetingRecord;
  };

  // ─── Navegación ──────────────────────────────────────────────────────────────

  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSave = async () => {
    try {
      const savedMeeting = await saveMeetingToDatabase();
      onComplete(savedMeeting);
      ui.success('¡Reunión estratégica creada exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      ui.error('Error al crear la reunión. Inténtalo de nuevo.');
    }
  };

  const canProceed = (): boolean => {
    if (currentStep === 1) return meetingData.department !== '';
    return true;
  };

  // ─── Paso 1: Selección de departamento ──────────────────────────────────────

  const DepartmentSelection: React.FC = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Departamento Responsable
        </h2>
        <p style={{ color: '#6b7280' }}>Selecciona el departamento que liderará esta reunión</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          return (
            <button
              key={dept.id}
              onClick={() => setMeetingData(prev => ({ ...prev, department: dept.id }))}
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: `2px solid ${meetingData.department === dept.id ? '#059669' : '#e5e7eb'}`,
                backgroundColor: meetingData.department === dept.id ? '#f0fdf4' : 'white',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: `${dept.color}20`, margin: '0 auto 12px', width: 'fit-content' }}>
                <Icon style={{ height: '32px', width: '32px', color: dept.color }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{dept.name}</h3>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isOpen ? 'flex' : 'none',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px', overflowY: 'auto',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px',
        width: '100%', maxWidth: '1000px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'none', border: 'none', fontSize: '24px',
              cursor: 'pointer', color: '#6b7280', padding: '4px',
              borderRadius: '4px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', width: '32px', height: '32px', zIndex: 2,
            }}
          >×</button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                {viewMode === 'create' ? 'Nueva Reunión Estratégica' : 'Historial de Reuniones'}
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                {viewMode === 'create' ? 'Configuración inteligente basada en tipo y departamento' : 'Consulta y revisa reuniones anteriores'}
              </p>
            </div>
            {viewMode === 'create' && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Paso</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{currentStep}/{totalSteps}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', margin: '0 24px', position: 'relative', zIndex: 1 }}>
          {(['create', 'history'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '16px 24px', border: 'none', backgroundColor: 'transparent',
                cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                color: viewMode === mode ? '#059669' : '#6b7280',
                borderBottom: viewMode === mode ? '2px solid #059669' : '2px solid transparent',
                marginBottom: '-1px', transition: 'all 0.2s', outline: 'none',
              }}
            >
              {mode === 'create'
                ? <><FileText style={{ marginRight: '8px', height: '16px', width: '16px' }} />Nueva Reunión</>
                : <><Clock style={{ marginRight: '8px', height: '16px', width: '16px' }} />Historial de Reuniones</>
              }
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {viewMode === 'create' && (
          <div style={{ padding: '0 24px', marginBottom: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Progreso de configuración</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '10px', height: '8px' }}>
                <div style={{ backgroundColor: '#059669', height: '8px', borderRadius: '10px', transition: 'width 0.3s ease', width: `${(currentStep / totalSteps) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: viewMode === 'create' ? '0 24px 24px' : '24px',
          backgroundColor: '#f9fafb',
          borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px',
        }}>
          {viewMode === 'create' ? (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '24px' }}>
              {currentStep === 1 && <DepartmentSelection />}
              {currentStep === 2 && <StrategicMeetingMetrics meetingData={meetingData} setMeetingData={setMeetingData} />}
              {currentStep === 3 && <StrategicMeetingObjectivesAndTasks meetingData={meetingData} setMeetingData={setMeetingData} realEmployees={realEmployees} />}
              {currentStep === 4 && <StrategicMeetingSummary meetingData={meetingData} realEmployees={realEmployees} />}
            </div>
          ) : (
            <StrategicMeetingHistory
              meetings={meetings}
              filterDepartment={filterDepartment}
              filterType={filterType}
              expandedMeeting={expandedMeeting}
              setFilterDepartment={setFilterDepartment}
              setFilterType={setFilterType}
              setExpandedMeeting={setExpandedMeeting}
            />
          )}
        </div>

        {/* Navigation */}
        {viewMode === 'create' && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white',
            borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb',
                backgroundColor: currentStep === 1 ? '#f9fafb' : 'white',
                color: currentStep === 1 ? '#9ca3af' : '#374151',
                fontSize: '15px', fontWeight: '500',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ArrowLeft style={{ height: '16px', width: '16px' }} />
              Anterior
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  backgroundColor: canProceed() ? '#059669' : '#e5e7eb',
                  color: canProceed() ? 'white' : '#9ca3af',
                  fontSize: '15px', fontWeight: '500',
                }}
              >
                Siguiente
                <ChevronRight style={{ height: '16px', width: '16px' }} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', backgroundColor: '#059669', color: 'white',
                  fontSize: '15px', fontWeight: '500',
                }}
              >
                <Save style={{ height: '16px', width: '16px' }} />
                Crear Reunión
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategicMeetingSystem;
