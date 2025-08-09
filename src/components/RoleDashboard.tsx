// src/components/RoleDashboard.tsx - SISTEMA COMPLETO SIN ERRORES TypeScript
import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Settings, LogOut, TrendingUp, TrendingDown, 
  Crown, Shield, Users, UserCheck, Briefcase, Building2, 
  Dumbbell, Heart, Menu, Home, BarChart3, Globe, Plus, 
  ArrowRight, Eye, Edit, Filter, RefreshCw, X, User, Mail, 
  Phone, MapPin, Camera, Save, UserPlus, Edit2, Trash2, Loader2,
  Calendar, Clock, Target, Flag, MessageSquare, FileText, Send,
  AlertCircle, CheckCircle, PlayCircle, PauseCircle, ChevronDown,
  Brain, Zap, ChevronRight, ArrowLeft, DollarSign
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';

// Interfaces
interface Meeting {
  id?: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  participantes: string[];
  tipo: 'estrategica' | 'operativa' | 'seguimiento' | 'urgente';
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
  acta_reunion?: string;
  tareas_generadas?: string[];
  creado_por: string;
  creado_en?: string;
  actualizado_en?: string;
}

interface Task {
  id?: string;
  titulo: string;
  descripcion?: string;
  asignado_a: string;
  creado_por: string;
  reunion_origen?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_progreso' | 'en_revision' | 'completada' | 'cancelada';
  fecha_limite: string;
  tiempo_estimado?: number;
  tiempo_real?: number;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  verificacion_requerida: boolean;
  verificado_por?: string;
  fecha_verificacion?: string;
  etiquetas?: string[];
  creado_en?: string;
  actualizado_en?: string;
}

interface Objective {
  id?: string;
  titulo: string;
  estado?: string;
  porcentaje_completitud?: number;
  probabilidad_cumplimiento?: number;
  riesgo_calculado?: string;
}

interface Alert {
  id?: string;
  titulo: string;
  nivel_urgencia?: string;
}

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

// Equipo directivo
const LEADERSHIP_TEAM = [
  { id: 'carlossuarezparra@gmail.com', name: 'Carlos Suárez Parra', role: 'CEO' },
  { id: 'beni.jungla@gmail.com', name: 'Benito Morales', role: 'Director' },
  { id: 'lajunglacentral@gmail.com', name: 'Vicente Benítez', role: 'Director' }
];

const MEETING_TYPES = [
  { value: 'estrategica', label: 'Estratégica', color: '#8b5cf6' },
  { value: 'operativa', label: 'Operativa', color: '#3b82f6' },
  { value: 'seguimiento', label: 'Seguimiento', color: '#10b981' },
  { value: 'urgente', label: 'Urgente', color: '#ef4444' }
];

const PRIORITY_LEVELS = [
  { value: 'baja', label: 'Baja', color: '#6b7280' },
  { value: 'media', label: 'Media', color: '#f59e0b' },
  { value: 'alta', label: 'Alta', color: '#f97316' },
  { value: 'critica', label: 'Crítica', color: '#dc2626' }
];

// SISTEMA DE REUNIONES ESTRATÉGICAS
const StrategicMeetingSystem: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: (meetingData: any) => void;
}> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
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

  // Configuraciones
  const MEETING_TYPES_CONFIG: Record<string, any> = {
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

  const DEPARTMENTS = [
    { id: 'direccion', name: 'Dirección', icon: Building2, color: '#1f2937' },
    { id: 'marketing', name: 'Marketing', icon: Globe, color: '#3b82f6' },
    { id: 'rrhh', name: 'RRHH', icon: Users, color: '#10b981' },
    { id: 'operaciones', name: 'Operaciones', icon: Briefcase, color: '#f59e0b' },
    { id: 'wellness', name: 'Wellness', icon: Heart, color: '#ef4444' }
  ];

  const METRICS_CONFIG: Record<string, any[]> = {
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

  // Función para guardar en Supabase
  const saveMeetingToDatabase = async () => {
    try {
      const selectedType = MEETING_TYPES_CONFIG[meetingData.type];
      const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);

      // 1. Guardar reunión principal
      const { data: meetingRecord, error: meetingError } = await supabase
        .from('reuniones')
        .insert([{
          titulo: `${selectedType?.label} - ${selectedDepartment?.name}`,
          descripcion: `Reunión ${meetingData.type} del departamento ${meetingData.department}`,
          fecha: meetingData.date,
          hora_inicio: '09:00',
          hora_fin: meetingData.type === 'mensual' ? '12:00' : '11:00',
          participantes: meetingData.participants,
          tipo: 'estrategica',
          estado: 'programada',
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
        const objectivesData = meetingData.objectives.map((obj: any) => ({
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
        const tasksData = meetingData.tasks.map((task: any) => ({
          titulo: task.title,
          asignado_a: task.assignedTo,
          creado_por: 'carlossuarezparra@gmail.com',
          reunion_origen: meetingRecord.id,
          prioridad: task.priority,
          estado: 'pendiente',
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

  // Paso 1: Selección de tipo
  const TypeSelection = () => (
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
  const DepartmentSelection = () => (
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
  const BasicConfiguration = () => (
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
                        participants: prev.participants.filter((id: string) => id !== member.id)
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
  const MetricsConfiguration = () => {
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
          {metrics.map((metric: any) => (
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
  const ObjectivesAndTasks = () => {
    const [newObjective, setNewObjective] = useState('');
    const [newTask, setNewTask] = useState({
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
            {meetingData.objectives.map((objective: any, index: number) => (
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
                    objectives: prev.objectives.filter((obj: any) => obj.id !== objective.id)
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
            {meetingData.tasks.map((task: any) => (
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
                  {LEADERSHIP_TEAM.find((m: any) => m.id === task.assignedTo)?.name}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(task.deadline).toLocaleDateString('es-ES')}
                </span>
                <button
                  onClick={() => setMeetingData(prev => ({
                    ...prev,
                    tasks: prev.tasks.filter((t: any) => t.id !== task.id)
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
  const Summary = () => {
    const selectedType = MEETING_TYPES_CONFIG[meetingData.type];
    const selectedDepartment = DEPARTMENTS.find((d: any) => d.id === meetingData.department);

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
                {meetingData.objectives.map((objective: any, index: number) => (
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
                {meetingData.tasks.map((task: any) => (
                  <li key={task.id} style={{ fontSize: '14px', color: '#6b7280' }}>
                    {task.title}
                    <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
                      - {LEADERSHIP_TEAM.find((m: any) => m.id === task.assignedTo)?.name}
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

  const canProceed = () => {
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

// Modal para crear tarea (mantenemos el original)
const CreateTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  meetingId?: string;
}> = ({ isOpen, onClose, onSave, meetingId }) => {
  const { employee } = useSession();
  const [formData, setFormData] = useState<Task>({
    titulo: '',
    descripcion: '',
    asignado_a: '',
    creado_por: employee?.email || '',
    reunion_origen: meetingId,
    prioridad: 'media',
    estado: 'pendiente',
    fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    verificacion_requerida: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('🎯 Creando tarea:', formData);
      
      const { data, error } = await supabase
        .from('tareas')
        .insert([{
          ...formData,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando tarea:', error);
        throw error;
      }
      
      console.log('✅ Tarea creada:', data);
      onSave(data as Task);
      onClose();
      
      // Reset form
      setFormData({
        titulo: '',
        descripcion: '',
        asignado_a: '',
        creado_por: employee?.email || '',
        reunion_origen: meetingId,
        prioridad: 'media',
        estado: 'pendiente',
        fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verificacion_requerida: true
      });
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear la tarea. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Nueva Tarea {meetingId && '(desde reunión)'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Ej: Preparar presentación trimestral"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Asignado a *
              </label>
              <select
                required
                value={formData.asignado_a}
                onChange={(e) => setFormData(prev => ({ ...prev, asignado_a: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Seleccionar...</option>
                {LEADERSHIP_TEAM.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Prioridad
              </label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  prioridad: e.target.value as 'baja' | 'media' | 'alta' | 'critica'
                }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                {PRIORITY_LEVELS.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Fecha Límite *
            </label>
            <input
              type="date"
              required
              value={formData.fecha_limite}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_limite: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Descripción
            </label>
            <textarea
              value={formData.descripcion || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Detalles específicos de la tarea..."
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.verificacion_requerida}
                onChange={(e) => setFormData(prev => ({ ...prev, verificacion_requerida: e.target.checked }))}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Requiere verificación al completar
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#10b981',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting && <Loader2 style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />}
              {!isSubmitting && <Target style={{ height: '16px', width: '16px' }} />}
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dashboard ejecutivo con funcionalidades completas
const ExecutiveDashboard: React.FC = () => {
  console.log('🧠 ExecutiveDashboard: Componente iniciado');
  
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showStrategicMeeting, setShowStrategicMeeting] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    console.log('🧠 ExecutiveDashboard: useEffect ejecutado');
    loadExecutiveData();
  }, []);

  const loadExecutiveData = async () => {
    console.log('🚀 CARGA SIMPLIFICADA INICIADA');
    setLoading(true);
    
    try {
      // 1. Reuniones
      console.log('📊 Cargando reuniones...');
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('reuniones')
        .select('id, titulo, fecha, hora_inicio, hora_fin, tipo, estado, participantes')
        .order('fecha', { ascending: false })
        .limit(10);

      if (!meetingsError && meetingsData) {
        console.log('✅ Reuniones OK:', meetingsData.length);
        setMeetings(meetingsData as Meeting[]);
      } else {
        console.error('❌ Error reuniones:', meetingsError);
      }

      // 2. Tareas
      console.log('📋 Cargando tareas...');
      const { data: tasksData, error: tasksError } = await supabase
        .from('tareas')
        .select('id, titulo, asignado_a, prioridad, estado, fecha_limite')
        .order('fecha_limite', { ascending: true })
        .limit(10);

      if (!tasksError && tasksData) {
        console.log('✅ Tareas OK:', tasksData.length);
        setTasks(tasksData as Task[]);
      } else {
        console.error('❌ Error tareas:', tasksError);
      }

      // 3. Objetivos
      console.log('🎯 Cargando objetivos...');
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objetivos')
        .select('id, titulo, estado, porcentaje_completitud')
        .limit(5);

      if (!objectivesError && objectivesData) {
        console.log('✅ Objetivos OK:', objectivesData.length);
        setObjectives(objectivesData as Objective[]);
      } else {
        console.error('❌ Error objetivos:', objectivesError);
        setObjectives([]);
      }

      // 4. Alertas
      console.log('🚨 Cargando alertas...');
      const { data: alertsData, error: alertsError } = await supabase
        .from('alertas_automaticas')
        .select('id, titulo, nivel_urgencia')
        .eq('estado', 'activa')
        .limit(3);

      if (!alertsError && alertsData) {
        console.log('✅ Alertas OK:', alertsData.length);
        setAlerts(alertsData as Alert[]);
      } else {
        console.error('❌ Error alertas:', alertsError);
        setAlerts([]);
      }

      console.log('🎉 CARGA COMPLETADA SIN TIMEOUT');
      
    } catch (error) {
      console.error('💥 ERROR CRÍTICO:', error);
      
      // Datos de emergencia
      console.log('🆘 Aplicando datos de emergencia...');
      
      setMeetings([{
        id: 'emergency1',
        titulo: 'Sistema Funcionando - Datos Cargando...',
        fecha: '2025-08-12',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        tipo: 'operativa',
        estado: 'programada',
        participantes: ['carlossuarezparra@gmail.com'],
        creado_por: 'system'
      }]);
      
      setTasks([{
        id: 'emergency1',
        titulo: 'Verificar conexión a base de datos',
        asignado_a: 'carlossuarezparra@gmail.com',
        creado_por: 'system',
        prioridad: 'alta',
        estado: 'pendiente',
        fecha_limite: '2025-08-15',
        verificacion_requerida: false
      }]);
      
      setObjectives([]);
      setAlerts([]);
      
    } finally {
      setLoading(false);
      console.log('🏁 Proceso finalizado');
    }
  };

  const handleMeetingCreated = (meeting: Meeting) => {
    console.log('🎯 Reunión creada, actualizando lista');
    setMeetings(prev => [meeting, ...prev]);
  };

  const handleTaskCreated = (task: Task) => {
    console.log('🎯 Tarea creada, actualizando lista');
    setTasks(prev => [task, ...prev]);
  };

  // Calcular KPIs
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(obj => obj.estado === 'completado').length;
  const riskyObjectives = objectives.filter(obj => obj.riesgo_calculado === 'alto' || obj.riesgo_calculado === 'critico').length;
  const completionRate = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;
  const pendingTasks = tasks.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length;

  if (loading) {
    console.log('🧠 ExecutiveDashboard: Mostrando loading');
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ height: '48px', width: '48px', animation: 'spin 1s linear infinite', color: '#3b82f6', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando sistema ejecutivo...</p>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Analizando datos en tiempo real</p>
        </div>
      </div>
    );
  }

  console.log('🧠 ExecutiveDashboard: Renderizando dashboard completo');

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header ejecutivo */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '8px 12px',
          borderRadius: '20px'
        }}>
          <Brain style={{ height: '16px', width: '16px' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Sistema IA</span>
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Sistema Ejecutivo Inteligente 🧠
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Dashboard predictivo con IA - Carlos, Benito y Vicente - La Jungla Ibérica
        </p>
      </div>

      {/* KPIs simplificados */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#3b82f620'
            }}>
              <Target style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Objetivos Activos
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {totalObjectives}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            objetivos en seguimiento
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#10b98120'
            }}>
              <Brain style={{ height: '24px', width: '24px', color: '#10b981' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Reuniones Programadas
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {meetings.length}
          </p>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
              <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                Sistema funcionando
              </span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#f59e0b20'
            }}>
              <Flag style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Tareas Pendientes
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {pendingTasks}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            tareas activas
          </p>
        </div>
      </div>

      {/* Reuniones y Tareas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Reuniones */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Reuniones Programadas ({meetings.length})
            </h3>
            <button
              onClick={() => setShowStrategicMeeting(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              Nueva
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {meetings.slice(0, 5).map(meeting => (
              <div key={meeting.id} style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {meeting.titulo}
                  </h4>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: MEETING_TYPES.find(t => t.value === meeting.tipo)?.color || '#6b7280',
                    color: 'white'
                  }}>
                    {MEETING_TYPES.find(t => t.value === meeting.tipo)?.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ height: '14px', width: '14px' }} />
                    {new Date(meeting.fecha).toLocaleDateString('es-ES')}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ height: '14px', width: '14px' }} />
                    {meeting.hora_inicio} - {meeting.hora_fin}
                  </span>
                </div>
                {meeting.participantes && meeting.participantes.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Participantes: {meeting.participantes.map((p: string) => 
                      LEADERSHIP_TEAM.find(l => l.id === p)?.name
                    ).filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            ))}
            
            {meetings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <Calendar style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No hay reuniones programadas</p>
                <button
                  onClick={() => setShowStrategicMeeting(true)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Crear primera reunión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tareas */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Tareas Asignadas ({tasks.length})
            </h3>
            <button
              onClick={() => setShowTaskModal(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              Nueva
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {task.titulo}
                  </h4>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: PRIORITY_LEVELS.find(p => p.value === task.prioridad)?.color || '#6b7280',
                    color: 'white'
                  }}>
                    {PRIORITY_LEVELS.find(p => p.value === task.prioridad)?.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User style={{ height: '14px', width: '14px' }} />
                    {LEADERSHIP_TEAM.find(l => l.id === task.asignado_a)?.name || 'No asignado'}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flag style={{ height: '14px', width: '14px' }} />
                    {new Date(task.fecha_limite).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Estado: {task.estado.replace('_', ' ')}
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <Target style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No hay tareas asignadas</p>
                <button
                  onClick={() => setShowTaskModal(true)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Crear primera tarea
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShowStrategicMeeting(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar style={{ height: '20px', width: '20px' }} />
          Nueva Reunión Estratégica
        </button>
        
        <button
          onClick={() => setShowTaskModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Target style={{ height: '20px', width: '20px' }} />
          Nueva Tarea
        </button>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw style={{ height: '20px', width: '20px' }} />
          Actualizar Datos
        </button>
      </div>

      {/* Modales - SISTEMA ESTRATÉGICO INTEGRADO */}
      <StrategicMeetingSystem
        isOpen={showStrategicMeeting}
        onClose={() => setShowStrategicMeeting(false)}
        onComplete={(meetingData) => {
          handleMeetingCreated(meetingData);
          setShowStrategicMeeting(false);
        }}
      />
      
      <CreateTaskModal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskCreated}
      />
    </div>
  );
};

// Dashboard SuperAdmin
const SuperAdminDashboard: React.FC = () => {
  console.log('👑 SuperAdminDashboard: Componente iniciado');
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('executive');

  const { employee } = useSession();
  
  console.log('👑 SuperAdminDashboard: Employee data:', employee?.name);

  const menuItems = [
    { id: 'executive', label: 'Dashboard Ejecutivo', icon: Crown },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'centers', label: 'Centros', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  console.log('👑 SuperAdminDashboard: Renderizando con activeTab:', activeTab);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '256px' : '80px',
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        transition: 'width 0.3s ease',
        flexShrink: 0
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '8px',
              backgroundColor: '#d1fae5',
              borderRadius: '12px'
            }}>
              <Crown style={{ height: '32px', width: '32px', color: '#059669' }} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Jungla Ibérica</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Sistema Ejecutivo</p>
              </div>
            )}
          </div>
        </div>

        <nav style={{ padding: '0 16px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                console.log('👑 SuperAdminDashboard: Cambiando tab a:', item.id);
                setActiveTab(item.id);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '8px',
                cursor: 'pointer',
                backgroundColor: activeTab === item.id ? '#d1fae5' : 'transparent',
                color: activeTab === item.id ? '#047857' : '#6b7280',
                transition: 'all 0.2s ease'
              }}
            >
              <item.icon style={{ height: '20px', width: '20px' }} />
              {sidebarOpen && <span style={{ fontWeight: '500' }}>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <Menu style={{ height: '20px', width: '20px', color: '#6b7280' }} />
              </button>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {activeTab === 'executive' && 'Dashboard Ejecutivo'}
                  {activeTab === 'employees' && 'Gestión de Empleados'}
                  {activeTab === 'centers' && 'Gestión de Centros'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'settings' && 'Configuración'}
                </h1>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Sistema integrado con Supabase - Datos en tiempo real
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={employee?.imagen_de_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name || 'Usuario')}&background=059669&color=fff`}
                  alt={employee?.name || 'Usuario'} 
                  style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {employee?.name || 'SuperAdmin'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Sistema Ejecutivo</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeTab === 'executive' && <ExecutiveDashboard />}
          {activeTab === 'employees' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                Gestión de Empleados
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Funcionalidad de gestión de empleados disponible próximamente.
                Por ahora, enfócate en el Dashboard Ejecutivo para crear reuniones estratégicas y tareas.
              </p>
              <button
                onClick={() => setActiveTab('executive')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Ir al Dashboard Ejecutivo
              </button>
            </div>
          )}
          {(activeTab === 'centers' || activeTab === 'analytics' || activeTab === 'settings') && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                {activeTab === 'centers' && 'Gestión de Centros'}
                {activeTab === 'analytics' && 'Analytics Avanzados'}
                {activeTab === 'settings' && 'Configuración del Sistema'}
              </h2>
              <p style={{ color: '#6b7280' }}>
                Esta funcionalidad estará disponible próximamente.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Dashboard Principal
const RoleDashboard: React.FC = () => {
  console.log('🚀 RoleDashboard: Componente iniciado');
  
  const { employee, userRole, dashboardConfig } = useSession();
  
  console.log('📊 RoleDashboard: Datos de sesión:', {
    employee: employee?.name,
    email: employee?.email,
    userRole,
    dashboardConfig: dashboardConfig?.sections
  });

  if (!employee || !userRole || !dashboardConfig) {
    console.log('⏳ RoleDashboard: Cargando datos de sesión...');
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando sistema ejecutivo...</p>
        </div>
      </div>
    );
  }

  // Verificar si debe mostrar SuperAdmin
  const isCarlos = employee.email === 'carlossuarezparra@gmail.com';
  const shouldShowSuperAdmin = userRole === 'superadmin' || userRole === 'admin' || isCarlos;
  
  console.log('🔐 RoleDashboard: Verificación de permisos:', {
    isCarlos,
    userRole,
    shouldShowSuperAdmin
  });

  if (shouldShowSuperAdmin) {
    console.log('👑 RoleDashboard: Renderizando SuperAdminDashboard');
    return <SuperAdminDashboard />;
  }

  console.log('👤 RoleDashboard: Renderizando dashboard básico');
  
  // Fallback para otros roles
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
          Dashboard: {userRole}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          ¡Bienvenido, {employee.name}! ({employee.role})
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
            ✅ Sistema ejecutivo disponible para el equipo directivo
          </p>
        </div>
      </div>
    </div>
  );
};

console.log('📁 RoleDashboard: Archivo cargado completamente');

export default RoleDashboard;