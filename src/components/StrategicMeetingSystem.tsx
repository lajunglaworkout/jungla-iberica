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
  { id: 'lajunglacentral@gmail.com', name: 'Vicente Benítez', role: 'Director' },
  { id: 'antonio.eventos@jungla.com', name: 'Antonio García', role: 'Responsable Eventos' },
  { id: 'maria.rrhh@jungla.com', name: 'María González', role: 'RRHH' },
  { id: 'diego.marketing@jungla.com', name: 'Diego Fernández', role: 'Marketing' },
  { id: 'laura.logistica@jungla.com', name: 'Laura Martín', role: 'Logística' },
  { id: 'pablo.contabilidad@jungla.com', name: 'Pablo Ruiz', role: 'Contabilidad' },
  { id: 'ana.online@jungla.com', name: 'Ana López', role: 'Online' },
  { id: 'javier.id@jungla.com', name: 'Javier Sánchez', role: 'I+D' }
];

const MEETING_TYPES_CONFIG: Record<string, MeetingTypeConfig> = {
  semanal: {
    label: 'Reunión Semanal',
    description: 'Seguimiento operativo y táctico',
    duration: '1-2 horas',
    frequency: 'Cada lunes',
    color: '#059669',
    icon: Clock
  },
  mensual: {
    label: 'Reunión Mensual',
    description: 'Revisión estratégica y planificación',
    duration: '2-3 horas',
    frequency: 'Primer lunes del mes',
    color: '#047857',
    icon: Calendar
  }
};

const DEPARTMENTS: DepartmentConfig[] = [
  { id: 'direccion', name: 'Dirección', icon: Building2, color: '#059669' },
  { id: 'rrhh_procedimientos', name: 'RRHH y Procedimientos', icon: Users, color: '#047857' },
  { id: 'logistica', name: 'Logística', icon: Briefcase, color: '#059669' },
  { id: 'contabilidad_ventas', name: 'Contabilidad y Ventas', icon: DollarSign, color: '#047857' },
  { id: 'marketing', name: 'Marketing', icon: Globe, color: '#059669' },
  { id: 'eventos', name: 'Eventos', icon: Calendar, color: '#047857' },
  { id: 'online', name: 'Online', icon: Zap, color: '#059669' },
  { id: 'investigacion', name: 'I+D', icon: TrendingUp, color: '#047857' }
];

const DEPARTMENT_KPIS: Record<string, MetricConfig[]> = {
  direccion: [
    { id: 'tasks_completed_prev_week', label: 'Tareas Completadas Semana Anterior', type: 'number', target: 10 },
    { id: 'tasks_not_completed', label: 'Tareas No Completadas (Principal)', type: 'number', target: 0 },
    { id: 'new_general_tasks', label: 'Tareas Generales Nuevas', type: 'number', target: 5 }
  ],
  rrhh_procedimientos: [
    { id: 'employee_absences', label: 'Ausencias Laborales', type: 'number', target: 2 },
    { id: 'employee_incidents', label: 'Incidencias de Empleados', type: 'number', target: 0 },
    { id: 'new_procedures', label: 'Procedimientos Nuevos Implementados', type: 'number', target: 3 },
    { id: 'training_sessions', label: 'Sesiones de Formación', type: 'number', target: 2 }
  ],
  logistica: [
    { id: 'delivery_delays', label: 'Retrasos en Entregas', type: 'number', target: 0 },
    { id: 'inventory_accuracy', label: 'Precisión de Inventario (%)', type: 'percentage', target: 98 },
    { id: 'supplier_issues', label: 'Problemas con Proveedores', type: 'number', target: 1 }
  ],
  contabilidad_ventas: [
    { id: 'weekly_revenue', label: 'Facturación Semanal', type: 'currency', target: 15000 },
    { id: 'new_clients', label: 'Nuevos Clientes', type: 'number', target: 5 },
    { id: 'payment_delays', label: 'Retrasos en Pagos', type: 'number', target: 2 }
  ],
  marketing: [
    { id: 'campaign_performance', label: 'Rendimiento Campañas (%)', type: 'percentage', target: 85 },
    { id: 'social_engagement', label: 'Engagement Redes Sociales', type: 'number', target: 1000 },
    { id: 'lead_generation', label: 'Leads Generados', type: 'number', target: 50 }
  ],
  eventos: [
    { id: 'events_completed', label: 'Eventos Completados', type: 'number', target: 3 },
    { id: 'client_satisfaction', label: 'Satisfacción Cliente (%)', type: 'percentage', target: 95 },
    { id: 'event_issues', label: 'Incidencias en Eventos', type: 'number', target: 0 }
  ],
  online: [
    { id: 'website_traffic', label: 'Tráfico Web', type: 'number', target: 5000 },
    { id: 'conversion_rate', label: 'Tasa de Conversión (%)', type: 'percentage', target: 3 },
    { id: 'online_bookings', label: 'Reservas Online', type: 'number', target: 100 }
  ],
  investigacion: [
    { id: 'research_projects', label: 'Proyectos de Investigación', type: 'number', target: 2 },
    { id: 'innovation_proposals', label: 'Propuestas de Innovación', type: 'number', target: 5 },
    { id: 'market_analysis', label: 'Análisis de Mercado Completados', type: 'number', target: 1 }
  ]
};

// ============ COMPONENTE PRINCIPAL ============
const StrategicMeetingSystem: React.FC<StrategicMeetingSystemProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [realEmployees, setRealEmployees] = useState<LeadershipMember[]>([]);
  const [viewMode, setViewMode] = useState<'create' | 'history'>('create');
  const [meetings, setMeetings] = useState<any[]>([]);
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
    notes: ''
  });

  // Cargar empleados reales de Supabase
  React.useEffect(() => {
    const loadRealEmployees = async () => {
      try {
        console.log('🔍 Intentando cargar empleados desde Supabase...');
        
        // Primero verificar qué hay en la tabla sin filtros
        const { data: allEmployees, error: allError } = await supabase
          .from('employees')
          .select('*')
          .order('name', { ascending: true });
        
        console.log('📊 Total empleados en tabla:', allEmployees?.length || 0);
        
        if (allError) {
          console.error('❌ Error cargando todos los empleados:', allError);
          setRealEmployees(LEADERSHIP_TEAM);
          return;
        }

        if (!allEmployees || allEmployees.length === 0) {
          console.log('⚠️ No hay empleados en la tabla, usando lista por defecto');
          setRealEmployees(LEADERSHIP_TEAM);
          return;
        }

        // Mapear todos los empleados (sin filtro de activo por ahora)
        const mappedEmployees: LeadershipMember[] = allEmployees.map(emp => ({
          id: emp.email || emp.id,
          name: emp.name || `Usuario ${emp.id?.slice(0, 8)}`,
          role: emp.role || emp.department || 'Empleado'
        }));

        setRealEmployees(mappedEmployees);
        console.log('✅ Empleados mapeados:', mappedEmployees);
        
      } catch (error) {
        console.error('❌ Error general:', error);
        setRealEmployees(LEADERSHIP_TEAM);
      }
    };

    const loadMeetings = async () => {
      try {
        console.log('🔍 Cargando reuniones...');
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        
        // Mapear los datos para asegurar que todos los campos necesarios existan
        const formattedMeetings = (data || []).map(meeting => ({
          id: meeting.id,
          type: meeting.type || 'semanal',
          department: meeting.department || '',
          date: meeting.date || new Date().toISOString(),
          participants: meeting.participants || [],
          metrics: meeting.metrics || {},
          objectives: meeting.objectives || [],
          tasks: meeting.tasks || [],
          notes: meeting.notes || '',
          created_at: meeting.created_at || new Date().toISOString()
        }));
        
        setMeetings(formattedMeetings);
        console.log(`✅ Reuniones cargadas: ${formattedMeetings.length}`);
      } catch (error) {
        console.error('❌ Error cargando reuniones:', error);
      }
    };

    if (isOpen) {
      loadRealEmployees();
      loadMeetings();
    }
  }, [isOpen]);

  const totalSteps = 4;

  // ============ FUNCIÓN DE GUARDADO ============
  const saveMeetingToDatabase = async () => {
    try {
      const selectedType = MEETING_TYPES_CONFIG[meetingData.type];
      const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);

      if (!selectedDepartment) {
        throw new Error('Debe seleccionar un departamento');
      }
      
      if (!selectedType) {
        throw new Error('Tipo de reunión no válido');
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
  
  // Componente para mostrar el historial de reuniones
  const MeetingHistory = () => {
    const filteredMeetings = meetings.filter(meeting => {
      const matchesDepartment = !filterDepartment || meeting.department === filterDepartment;
      const matchesType = !filterType || meeting.type === filterType;
      return matchesDepartment && matchesType;
    });

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Filtrar por departamento:</label>
            <select 
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todos los departamentos</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Filtrar por tipo:</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todos los tipos</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>

        {filteredMeetings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db'
          }}>
            <FileText style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px', color: '#111827' }}>No hay reuniones registradas</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              {filterDepartment || filterType 
                ? 'No hay reuniones que coincidan con los filtros seleccionados.' 
                : 'Crea tu primera reunión para comenzar.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredMeetings.map((meeting) => (
              <div 
                key={meeting.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: expandedMeeting === meeting.id ? '#f9fafb' : 'white'
                  }}
                  onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        backgroundColor: MEETING_TYPES_CONFIG[meeting.type]?.color || '#6b7280',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {MEETING_TYPES_CONFIG[meeting.type]?.label || meeting.type}
                      </span>
                      <span style={{
                        backgroundColor: DEPARTMENTS.find(d => d.id === meeting.department)?.color || '#e5e7eb',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {DEPARTMENTS.find(d => d.id === meeting.department)?.name || meeting.department}
                      </span>
                    </div>
                    <h3 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: '600' }}>
                      Reunión del {new Date(meeting.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      {meeting.participants?.length || 0} participantes • {meeting.objectives?.length || 0} objetivos • {meeting.tasks?.length || 0} tareas
                    </p>
                  </div>
                  <ChevronDown style={{
                    transition: 'transform 0.2s',
                    transform: expandedMeeting === meeting.id ? 'rotate(180deg)' : 'rotate(0)'
                  }} />
                </div>
                
                {expandedMeeting === meeting.id && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #e5e7eb' }}>
                    {meeting.notes && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Notas:</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', whiteSpace: 'pre-line' }}>
                          {meeting.notes}
                        </p>
                      </div>
                    )}
                    
                    {meeting.objectives?.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Objetivos:</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {meeting.objectives.map((obj: any, index: number) => (
                            <li key={index} style={{ marginBottom: '4px', color: '#4b5563', fontSize: '14px' }}>
                              {obj.title} <span style={{ color: '#9ca3af' }}>({obj.status})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {meeting.tasks?.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tareas:</h4>
                        <div style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {meeting.tasks.map((task: any, index: number) => (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 0',
                              borderBottom: index < meeting.tasks.length - 1 ? '1px solid #e5e7eb' : 'none'
                            }}>
                              <div>
                                <div style={{ fontWeight: '500', color: '#111827' }}>{task.title}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                  Asignada a: {task.assignedTo}
                                </div>
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: task.priority === 'Alta' ? '#dc2626' : 
                                       task.priority === 'Media' ? '#d97706' : '#059669',
                                fontWeight: '500'
                              }}>
                                {task.priority}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
                border: `2px solid ${meetingData.type === key ? '#059669' : '#e5e7eb'}`,
                backgroundColor: meetingData.type === key ? '#f0fdf4' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: meetingData.type === key ? '0 10px 25px -5px rgba(5, 150, 105, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                border: `2px solid ${meetingData.department === dept.id ? '#059669' : '#e5e7eb'}`,
                backgroundColor: meetingData.department === dept.id ? '#f0fdf4' : 'white',
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
            {realEmployees.map((member) => (
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
                <div>
                  <div style={{ fontWeight: '500' }}>{member.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{member.role}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Paso 2: Revisión de Tareas Anteriores y KPIs
  const Metrics: React.FC = () => {
    const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);
    const getDepartmentTasks = (departmentId: string) => {
      const tasksByDepartment: Record<string, any[]> = {
        direccion: [
          { id: 1, title: 'Revisar proceso de onboarding', status: 'completada', assignedTo: 'Carlos Suárez', comments: '' },
          { id: 2, title: 'Actualizar manual de procedimientos', status: 'pendiente', assignedTo: 'Equipo RRHH', comments: '' },
          { id: 3, title: 'Implementar nuevo sistema CRM', status: 'en_progreso', assignedTo: 'Departamento IT', comments: '' }
        ],
        eventos: [
          { id: 4, title: 'Planificar evento de fin de año', status: 'en_progreso', assignedTo: 'Equipo Eventos', comments: '' },
          { id: 5, title: 'Revisar proveedores de catering', status: 'pendiente', assignedTo: 'María González', comments: '' }
        ],
        marketing: [
          { id: 6, title: 'Campaña redes sociales Q4', status: 'en_progreso', assignedTo: 'Diego Fernández', comments: '' },
          { id: 7, title: 'Análisis competencia', status: 'completada', assignedTo: 'Equipo Marketing', comments: '' }
        ],
        rrhh_procedimientos: [
          { id: 8, title: 'Actualizar contratos temporales', status: 'pendiente', assignedTo: 'RRHH', comments: '' },
          { id: 9, title: 'Formación en seguridad', status: 'completada', assignedTo: 'Prevención', comments: '' }
        ],
        logistica: [
          { id: 10, title: 'Optimizar rutas de entrega', status: 'en_progreso', assignedTo: 'Logística', comments: '' },
          { id: 11, title: 'Inventario trimestral', status: 'pendiente', assignedTo: 'Almacén', comments: '' }
        ],
        contabilidad_ventas: [
          { id: 12, title: 'Cierre contable mensual', status: 'completada', assignedTo: 'Contabilidad', comments: '' },
          { id: 13, title: 'Seguimiento clientes morosos', status: 'en_progreso', assignedTo: 'Ventas', comments: '' }
        ],
        online: [
          { id: 14, title: 'Actualizar web corporativa', status: 'en_progreso', assignedTo: 'Desarrollo', comments: '' },
          { id: 15, title: 'SEO análisis mensual', status: 'pendiente', assignedTo: 'Marketing Digital', comments: '' }
        ],
        investigacion: [
          { id: 16, title: 'Estudio mercado fitness 2025', status: 'en_progreso', assignedTo: 'I+D', comments: '' },
          { id: 17, title: 'Prototipo nueva app', status: 'pendiente', assignedTo: 'Desarrollo', comments: '' }
        ]
      };
      return tasksByDepartment[departmentId] || [];
    };

    const [previousTasks, setPreviousTasks] = useState(() => getDepartmentTasks(meetingData.department));

    // Actualizar tareas cuando cambie el departamento
    React.useEffect(() => {
      setPreviousTasks(getDepartmentTasks(meetingData.department));
    }, [meetingData.department]);

    const updateTaskStatus = (taskId: number, newStatus: string) => {
      setPreviousTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    };

    const updateTaskComments = (taskId: number, comments: string) => {
      setPreviousTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, comments } : task
      ));
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            📋 Revisión Semanal - {selectedDepartment?.name}
          </h2>
          <p style={{ color: '#6b7280' }}>
            Revisa las tareas de la semana anterior y los KPIs del departamento
          </p>
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px', 
            padding: '12px', 
            marginTop: '16px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
              📅 Reunión del {(() => {
                const today = new Date();
                const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                return days[today.getDay()];
              })()}, {new Date().toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>

        {/* Sección de Tareas Anteriores */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', marginBottom: '12px' }}>
            <CheckCircle style={{ height: '20px', width: '20px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Tareas de la Reunión Anterior
            </h3>
          </div>
          {previousTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {previousTasks.map((task) => (
                <div key={task.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  padding: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: task.status === 'completada' ? '#10b981' : task.status === 'en_progreso' ? '#f59e0b' : '#ef4444'
                      }} />
                      <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{task.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{task.assignedTo}</span>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          backgroundColor: task.status === 'completada' ? '#d1fae5' : task.status === 'en_progreso' ? '#fef3c7' : '#fee2e2',
                          color: task.status === 'completada' ? '#065f46' : task.status === 'en_progreso' ? '#92400e' : '#991b1b'
                        }}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="completada">Completada</option>
                      </select>
                    </div>
                  </div>
                  
                  {(task.status === 'pendiente' || task.status === 'en_progreso' || task.comments) && (
                    <div style={{ marginTop: '8px' }}>
                      <textarea
                        placeholder={task.status === 'completada' ? 'Comentarios adicionales...' : 'Explica por qué no se ha completado o qué obstáculos hay...'}
                        value={task.comments}
                        onChange={(e) => updateTaskComments(task.id, e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '50px',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          backgroundColor: '#f9fafb'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
              No hay reunión anterior. Esta es la primera reunión del departamento.
            </p>
          )}
        </div>

        {/* Sección de KPIs del Departamento */}
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
              KPIs del Departamento - {selectedDepartment?.name}
            </span>
          </div>
          <p style={{ color: '#0369a1', fontSize: '14px', margin: 0 }}>
            Revisa los indicadores clave y anota observaciones de la semana
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {(DEPARTMENT_KPIS[meetingData.department] || []).map((metric) => (
            <div key={metric.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                {metric.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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
              <textarea
                placeholder="Observaciones y comentarios sobre este KPI..."
                value={meetingData.metrics[`${metric.id}_notes`] || ''}
                onChange={(e) => setMeetingData(prev => ({
                  ...prev,
                  metrics: { ...prev.metrics, [`${metric.id}_notes`]: e.target.value }
                }))}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
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
            <Target style={{ height: '20px', width: '20px', color: '#059669' }} />
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
                backgroundColor: '#059669',
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
            <CheckCircle style={{ height: '20px', width: '20px', color: '#059669' }} />
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
              {realEmployees.map((member) => (
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
                  backgroundColor: '#059669',
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
                  {realEmployees.find(m => m.id === task.assignedTo)?.name}
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
            📊 Resumen Final - {selectedDepartment?.name}
          </h2>
          <p style={{ color: '#6b7280' }}>
            Revisa toda la información de la reunión antes de guardar
          </p>
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px', 
            padding: '12px', 
            marginTop: '16px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
              📅 Reunión del {(() => {
                const today = new Date();
                const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                return days[today.getDay()];
              })()}, {new Date().toLocaleDateString('es-ES')}
            </span>
          </div>
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
                      - {realEmployees.find(m => m.id === task.assignedTo)?.name}
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
      case 1: return meetingData.department !== '';
      case 2: return true; // Permitir continuar sin validaciones estrictas
      case 3: return true; // Permitir continuar sin validaciones estrictas
      case 4: return true;
      default: return false;
    }
  };

  // Render tabs for create/history view
  const renderTabs = () => (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      margin: '0 24px',
      position: 'relative',
      zIndex: 1
    }}>
      <button
        onClick={() => setViewMode('create')}
        style={{
          padding: '16px 24px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: '600',
          color: viewMode === 'create' ? '#059669' : '#6b7280',
          borderBottom: viewMode === 'create' ? '2px solid #059669' : '2px solid transparent',
          marginBottom: '-1px',
          transition: 'all 0.2s',
          outline: 'none'
        }}
      >
        <FileText style={{ marginRight: '8px', height: '16px', width: '16px' }} />
        Nueva Reunión
      </button>
      <button
        onClick={() => setViewMode('history')}
        style={{
          padding: '16px 24px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: '600',
          color: viewMode === 'history' ? '#059669' : '#6b7280',
          borderBottom: viewMode === 'history' ? '2px solid #059669' : '2px solid transparent',
          marginBottom: '-1px',
          transition: 'all 0.2s',
          outline: 'none'
        }}
      >
        <Clock style={{ marginRight: '8px', height: '16px', width: '16px' }} />
        Historial de Reuniones
      </button>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isOpen ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              zIndex: 2
            }}
          >
            ×
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                {viewMode === 'create' ? 'Nueva Reunión Estratégica' : 'Historial de Reuniones'}
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                {viewMode === 'create' 
                  ? 'Configuración inteligente basada en tipo y departamento'
                  : 'Consulta y revisa reuniones anteriores'}
              </p>
            </div>
            {viewMode === 'create' && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Paso</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                  {currentStep}/{totalSteps}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {renderTabs()}

        {/* Progress bar (only for create mode) */}
        {viewMode === 'create' && (
          <div style={{ padding: '0 24px', marginBottom: '24px' }}>
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
                    backgroundColor: '#059669',
                    height: '8px',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease',
                    width: `${(currentStep / totalSteps) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: viewMode === 'create' ? '0 24px 24px' : '24px',
          backgroundColor: '#f9fafb',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px'
        }}>
          {viewMode === 'create' ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              padding: '24px',
              marginBottom: '24px'
            }}>
              {currentStep === 1 && <DepartmentSelection />}
              {currentStep === 2 && <Metrics />}
              {currentStep === 3 && <ObjectivesAndTasks />}
              {currentStep === 4 && <Summary />}
            </div>
          ) : (
            <MeetingHistory />
          )}
        </div>

        {/* Navigation - Only show in create mode */}
        {viewMode === 'create' && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: currentStep === 1 ? '#f9fafb' : 'white',
                color: currentStep === 1 ? '#9ca3af' : '#374151',
                fontSize: '15px',
                fontWeight: '500',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
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
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  backgroundColor: canProceed() ? '#059669' : '#e5e7eb',
                  color: canProceed() ? 'white' : '#9ca3af',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
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
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#059669',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
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