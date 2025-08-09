// src/components/StrategicMeetingSystem.tsx - CORREGIDO SIN ERRORES TypeScript
import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, Target, TrendingUp, TrendingDown,
  Building2, UserCheck, Briefcase, Heart, Globe, Zap,
  Plus, Save, ArrowLeft, ChevronRight, ChevronDown,
  FileText, Flag, User, Mail, CheckCircle, AlertCircle,
  BarChart3, DollarSign, UserMinus, Award, Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ============ INTERFACES CORREGIDAS ============
interface MeetingData {
  type: string;
  department: string;
  date: string;
  participants: string[];
  metrics: Record<string, string>;
  objectives: Array<{id: number; title: string; status: string}>;
  tasks: Array<{id: number; title: string; assignedTo: string; deadline: string; priority: string}>;
  notes: string;
}

interface MeetingTypeConfig {
  label: string;
  description: string;
  duration: string;
  frequency: string;
  color: string;
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
}

interface DepartmentConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
  color: string;
}

interface MetricConfig {
  id: string;
  label: string;
  type: 'currency' | 'percentage' | 'number' | 'rating';
  target: number;
}

interface StrategicMeetingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (meetingData: any) => void;
}

interface LeadershipMember {
  id: string;
  name: string;
  role: string;
}

// ============ CONFIGURACIONES TIPADAS ============
const LEADERSHIP_TEAM: LeadershipMember[] = [
  { id: 'carlossuarezparra@gmail.com', name: 'Carlos Suárez Parra', role: 'CEO' },
  { id: 'beni.jungla@gmail.com', name: 'Benito Morales', role: 'Director' },
  { id: 'lajunglacentral@gmail.com', name: 'Vicente Benítez', role: 'Director' }
];

const MEETING_TYPES_CONFIG: Record<string, MeetingTypeConfig> = {
  semanal: {
    label: 'Reunión Semanal',
    description: 'Seguimiento operativo y táctico',
    duration: '1-2 horas',
    frequency: 'Cada lunes',
    color: '#3b82f6',
    icon: Clock
  },
  mensual: {
    label: 'Reunión Mensual',
    description: 'Revisión estratégica y planificación',
    duration: '2-3 horas',
    frequency: 'Primer lunes del mes',
    color: '#8b5cf6',
    icon: Calendar
  }
};

const DEPARTMENTS: DepartmentConfig[] = [
  { id: 'direccion', name: 'Dirección', icon: Building2, color: '#1f2937' },
  { id: 'marketing', name: 'Marketing', icon: Globe, color: '#3b82f6' },
  { id: 'rrhh', name: 'RRHH', icon: Users, color: '#10b981' },
  { id: 'operaciones', name: 'Operaciones', icon: Briefcase, color: '#f59e0b' },
  { id: 'wellness', name: 'Wellness', icon: Heart, color: '#ef4444' }
];

const METRICS_CONFIG: Record<string, MetricConfig[]> = {
  semanal: [
    { id: 'revenue_week', label: 'Facturación Semanal', type: 'currency', target: 15000 },
    { id: 'new_clients', label: 'Nuevos Clientes', type: 'number', target: 5 },
    { id: 'churn_rate', label: 'Tasa de Abandono (%)', type: 'percentage', target: 2 },
    { id: 'satisfaction_score', label: 'Puntuación Satisfacción', type: 'rating', target: 4.5 }
  ],
  mensual: [
    { id: 'revenue_month', label: 'Facturación Mensual', type: 'currency', target: 60000 },
    { id: 'growth_rate', label: 'Crecimiento (%)', type: 'percentage', target: 15 },
    { id: 'market_penetration', label: 'Penetración Mercado (%)', type: 'percentage', target: 25 },
    { id: 'customer_lifetime', label: 'Valor Vida Cliente', type: 'currency', target: 2500 },
    { id: 'operational_margin', label: 'Margen Operativo (%)', type: 'percentage', target: 35 }
  ]
};

// ============ COMPONENTE PRINCIPAL ============
const StrategicMeetingSystem: React.FC<StrategicMeetingSystemProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [meetingData, setMeetingData] = useState<MeetingData>({
    type: '',
    department: '',
    date: '',
    participants: [],
    metrics: {},
    objectives: [],
    tasks: [],
    notes: ''
  });

  const totalSteps = 6;

  // ============ FUNCIÓN DE GUARDADO ============
  const saveMeetingToDatabase = async () => {
    try {
      const selectedType = MEETING_TYPES_CONFIG[meetingData.type];
      const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);

      if (!selectedType || !selectedDepartment) {
        throw new Error('Configuración de reunión no válida');
      }

      // 1. Guardar reunión principal
      const { data: meetingRecord, error: meetingError } = await supabase
        .from('reuniones')
        .insert([{
          titulo: `${selectedType.label} - ${selectedDepartment.name}`,
          descripcion: `Reunión ${meetingData.type} del departamento ${meetingData.department}`,
          fecha: meetingData.date,
          hora_inicio: '09:00',
          hora_fin: meetingData.type === 'mensual' ? '12:00' : '11:00',
          participantes: meetingData.participants,
          tipo: 'estrategica' as const,
          estado: 'programada' as const,
          creado_por: 'carlossuarezparra@gmail.com',
          acta_reunion: JSON.stringify({
            metrics: meetingData.metrics,
            objectives: meetingData.objectives,
            type: meetingData.type,
            department: meetingData.department
          }),
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString()
        }])
        .select()
        .single();

      if (meetingError) throw meetingError;

      // 2. Guardar objetivos
      if (meetingData.objectives.length > 0) {
        const objectivesData = meetingData.objectives.map(obj => ({
          titulo: obj.title,
          estado: 'activo',
          reunion_origen: meetingRecord.id,
          departamento_responsable: meetingData.department,
          fecha_limite: meetingData.date,
          creado_por: 'carlossuarezparra@gmail.com',
          creado_en: new Date().toISOString()
        }));

        await supabase.from('objetivos').insert(objectivesData);
      }

      // 3. Guardar tareas
      if (meetingData.tasks.length > 0) {
        const tasksData = meetingData.tasks.map(task => ({
          titulo: task.title,
          asignado_a: task.assignedTo,
          creado_por: 'carlossuarezparra@gmail.com',
          reunion_origen: meetingRecord.id,
          prioridad: task.priority as 'baja' | 'media' | 'alta' | 'critica',
          estado: 'pendiente' as const,
          fecha_limite: task.deadline,
          verificacion_requerida: true,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString()
        }));

        await supabase.from('tareas').insert(tasksData);
      }

      return meetingRecord;
    } catch (error) {
      console.error('Error saving meeting:', error);
      throw error;
    }
  };

  // ============ COMPONENTES DE PASOS ============
  
  // Paso 1: Selección de tipo
  const TypeSelection: React.FC = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Tipo de Reunión Estratégica
        </h2>
        <p style={{ color: '#6b7280' }}>
          Selecciona el tipo de reunión para configurar el contenido específico
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {Object.entries(MEETING_TYPES_CONFIG).map(([key, type]) => {
          const Icon = type.icon;
          return (
            <button
              key={key}
              onClick={() => setMeetingData(prev => ({ ...prev, type: key }))}
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: `2px solid ${meetingData.type === key ? '#3b82f6' : '#e5e7eb'}`,
                backgroundColor: meetingData.type === key ? '#f0f9ff' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: meetingData.type === key ? '0 10px 25px -5px rgba(59, 130, 246, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: `${type.color}20`
                }}>
                  <Icon style={{ height: '24px', width: '24px', color: type.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {type.label}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                    {type.description}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock style={{ height: '16px', width: '16px' }} />
                  <span>Duración: {type.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar style={{ height: '16px', width: '16px' }} />
                  <span>Frecuencia: {type.frequency}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Paso 2: Selección de departamento
  const DepartmentSelection: React.FC = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Departamento Responsable
        </h2>
        <p style={{ color: '#6b7280' }}>
          Selecciona el departamento que liderará esta reunión
        </p>
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
                border: `2px solid ${meetingData.department === dept.id ? '#3b82f6' : '#e5e7eb'}`,
                backgroundColor: meetingData.department === dept.id ? '#f0f9ff' : 'white',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: `${dept.color}20`,
                margin: '0 auto 12px',
                width: 'fit-content'
              }}>
                <Icon style={{ height: '32px', width: '32px', color: dept.color }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {dept.name}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Paso 3: Configuración básica
  const BasicConfiguration: React.FC = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Configuración de la Reunión
        </h2>
        <p style={{ color: '#6b7280' }}>
          Fecha y participantes del equipo directivo
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            Fecha de la Reunión
          </label>
          <input
            type="date"
            value={meetingData.date}
            onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            Participantes del Equipo Directivo
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {LEADERSHIP_TEAM.map((member) => (
              <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={meetingData.participants.includes(member.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setMeetingData(prev => ({
                        ...prev,
                        participants: [...prev.participants, member.id]
                      }));
                    } else {
                      setMeetingData(prev => ({
                        ...prev,
                        participants: prev.participants.filter(id => id !== member.id)
                      }));
                    }
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=059669&color=fff`}
                    alt={member.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {member.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Paso 4: Métricas
  const MetricsConfiguration: React.FC = () => {
    const metrics = METRICS_CONFIG[meetingData.type] || [];
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Métricas a Revisar
          </h2>
          <p style={{ color: '#6b7280' }}>
            Introduce los valores actuales de las métricas clave
          </p>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '8px' }}>
            <BarChart3 style={{ height: '20px', width: '20px' }} />
            <span style={{ fontWeight: '500' }}>
              Métricas {meetingData.type === 'semanal' ? 'Semanales' : 'Mensuales'}
            </span>
          </div>
          <p style={{ color: '#0369a1', fontSize: '14px', margin: 0 }}>
            Estas métricas se evaluarán contra los objetivos establecidos
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {metrics.map((metric) => (
            <div key={metric.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                {metric.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step={metric.type === 'currency' ? '0.01' : metric.type === 'percentage' ? '0.1' : '1'}
                  placeholder={`Objetivo: ${metric.target}${metric.type === 'percentage' ? '%' : metric.type === 'currency' ? '€' : ''}`}
                  value={meetingData.metrics[metric.id] || ''}
                  onChange={(e) => setMeetingData(prev => ({
                    ...prev,
                    metrics: { ...prev.metrics, [metric.id]: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {metric.type === 'currency' && '€'}
                  {metric.type === 'percentage' && '%'}
                  {metric.type === 'rating' && '/5'}
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                Objetivo: {metric.target}{metric.type === 'percentage' ? '%' : metric.type === 'currency' ? '€' : metric.type === 'rating' ? '/5' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Paso 5: Objetivos y tareas
  const ObjectivesAndTasks: React.FC = () => {
    const [newObjective, setNewObjective] = useState<string>('');
    const [newTask, setNewTask] = useState<{
      title: string;
      assignedTo: string;
      deadline: string;
      priority: string;
    }>({
      title: '',
      assignedTo: '',
      deadline: '',
      priority: 'media'
    });

    const addObjective = () => {
      if (newObjective.trim()) {
        setMeetingData(prev => ({
          ...prev,
          objectives: [...prev.objectives, {
            id: Date.now(),
            title: newObjective,
            status: 'pending'
          }]
        }));
        setNewObjective('');
      }
    };

    const addTask = () => {
      if (newTask.title.trim() && newTask.assignedTo && newTask.deadline) {
        setMeetingData(prev => ({
          ...prev,
          tasks: [...prev.tasks, {
            id: Date.now(),
            ...newTask
          }]
        }));
        setNewTask({
          title: '',
          assignedTo: '',
          deadline: '',
          priority: 'media'
        });
      }
    };

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Objetivos y Tareas
          </h2>
          <p style={{ color: '#6b7280' }}>
            Define los objetivos a alcanzar y las tareas específicas
          </p>
        </div>

        {/* Objetivos */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target style={{ height: '20px', width: '20px', color: '#3b82f6' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Objetivos Estratégicos
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Ej: Aumentar retención de clientes en un 15%"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            />
            <button
              onClick={addObjective}
              style={{
                padding: '12px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {meetingData.objectives.map((objective, index) => (
              <div key={objective.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                  {index + 1}.
                </span>
                <span style={{ flex: 1, fontSize: '14px', color: '#111827' }}>
                  {objective.title}
                </span>
                <button
                  onClick={() => setMeetingData(prev => ({
                    ...prev,
                    objectives: prev.objectives.filter(obj => obj.id !== objective.id)
                  }))}
                  style={{
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tareas */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle style={{ height: '20px', width: '20px', color: '#10b981' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Tareas Específicas
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la tarea"
              style={{
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
              style={{
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Asignar a...</option>
              {LEADERSHIP_TEAM.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
              style={{
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              min={new Date().toISOString().split('T')[0]}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
              <button
                onClick={addTask}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ height: '16px', width: '16px' }} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {meetingData.tasks.map((task) => (
              <div key={task.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px'
              }}>
                <Flag style={{
                  height: '16px',
                  width: '16px',
                  color: task.priority === 'critica' ? '#ef4444' :
                         task.priority === 'alta' ? '#f97316' :
                         task.priority === 'media' ? '#f59e0b' : '#6b7280'
                }} />
                <span style={{ flex: 1, fontSize: '14px', color: '#111827' }}>
                  {task.title}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {LEADERSHIP_TEAM.find(m => m.id === task.assignedTo)?.name}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(task.deadline).toLocaleDateString('es-ES')}
                </span>
                <button
                  onClick={() => setMeetingData(prev => ({
                    ...prev,
                    tasks: prev.tasks.filter(t => t.id !== task.id)
                  }))}
                  style={{
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Paso 6: Resumen
  const Summary: React.FC = () => {
    const selectedType = MEETING_TYPES_CONFIG[meetingData.type];
    const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Resumen de la Reunión
          </h2>
          <p style={{ color: '#6b7280' }}>
            Revisa todos los detalles antes de crear la reunión
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Detalles Generales
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
            <div>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Tipo:</span>
              <span style={{ marginLeft: '8px', color: '#111827' }}>{selectedType?.label}</span>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Departamento:</span>
              <span style={{ marginLeft: '8px', color: '#111827' }}>{selectedDepartment?.name}</span>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Fecha:</span>
              <span style={{ marginLeft: '8px', color: '#111827' }}>
                {new Date(meetingData.date).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Participantes:</span>
              <span style={{ marginLeft: '8px', color: '#111827' }}>{meetingData.participants.length}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Objetivos ({meetingData.objectives.length})
            </h3>
            {meetingData.objectives.length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {meetingData.objectives.map((objective, index) => (
                  <li key={objective.id} style={{ fontSize: '14px', color: '#6b7280' }}>
                    {index + 1}. {objective.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>No hay objetivos definidos</p>
            )}
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Tareas ({meetingData.tasks.length})
            </h3>
            {meetingData.tasks.length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {meetingData.tasks.map((task) => (
                  <li key={task.id} style={{ fontSize: '14px', color: '#6b7280' }}>
                    {task.title}
                    <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
                      - {LEADERSHIP_TEAM.find(m => m.id === task.assignedTo)?.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>No hay tareas definidas</p>
            )}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #10b981',
          borderRadius: '8px',
          marginTop: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
            <CheckCircle style={{ height: '20px', width: '20px' }} />
            <span style={{ fontWeight: '500' }}>¿Todo listo?</span>
          </div>
          <p style={{ color: '#047857', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            La reunión se guardará en el sistema y se enviarán notificaciones a todos los participantes.
          </p>
        </div>
      </div>
    );
  };

  // ============ FUNCIONES DE NAVEGACIÓN ============
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      const savedMeeting = await saveMeetingToDatabase();
      onComplete(savedMeeting);
      alert('¡Reunión estratégica creada exitosamente! 🎉');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la reunión. Inténtalo de nuevo.');
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return meetingData.type !== '';
      case 2: return meetingData.department !== '';
      case 3: return meetingData.date !== '' && meetingData.participants.length > 0;
      case 4: return Object.keys(meetingData.metrics).length > 0;
      case 5: return meetingData.objectives.length > 0 || meetingData.tasks.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  // ============ RENDERIZADO PRINCIPAL ============
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            marginBottom: '32px',
            position: 'relative'
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '18px'
              }}
            >
              ×
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>
                  Sistema de Reuniones Estratégicas
                </h1>
                <p style={{ opacity: 0.9, margin: 0 }}>
                  Configuración inteligente basada en tipo y departamento
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', opacity: 0.75 }}>Paso</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {currentStep}/{totalSteps}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Progreso de configuración
              </span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '10px', height: '8px' }}>
              <div 
                style={{
                  backgroundColor: '#3b82f6',
                  height: '8px',
                  borderRadius: '10px',
                  transition: 'width 0.3s ease',
                  width: `${(currentStep / totalSteps) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            marginBottom: '32px'
          }}>
            {currentStep === 1 && <TypeSelection />}
            {currentStep === 2 && <DepartmentSelection />}
            {currentStep === 3 && <BasicConfiguration />}
            {currentStep === 4 && <MetricsConfiguration />}
            {currentStep === 5 && <ObjectivesAndTasks />}
            {currentStep === 6 && <Summary />}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                backgroundColor: currentStep === 1 ? '#f3f4f6' : '#e5e7eb',
                color: currentStep === 1 ? '#9ca3af' : '#374151',
                fontSize: '16px',
                fontWeight: '500'
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  backgroundColor: canProceed() ? '#3b82f6' : '#f3f4f6',
                  color: canProceed() ? 'white' : '#9ca3af',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Siguiente
                <ChevronRight style={{ height: '16px', width: '16px' }} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                <Save style={{ height: '16px', width: '16px' }} />
                Crear Reunión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicMeetingSystem;