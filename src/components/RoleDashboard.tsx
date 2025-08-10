import React, { useState, useEffect } from 'react';
import {
  Crown, Users, Building2, BarChart3, Settings, Menu, Bell,
  Target, Flag, Brain, CheckCircle, Calendar, Video, Search,
  X, MapPin, AlertTriangle, DollarSign, Globe, 
  Loader2, RefreshCw, Clock, Heart, Briefcase
} from 'lucide-react';

// ====== INTERFACES ======
interface DepartmentStatus {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  criticalAlerts: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  manager: string;
  lastUpdate: string;
  keyMetrics: {
    revenue?: number;
    customers?: number;
    satisfaction?: number;
    efficiency?: number;
  };
}

interface CenterKPI {
  id: string;
  name: string;
  city: string;
  type: 'Propio' | 'Franquicia';
  status: 'Activo' | 'En Construcción' | 'Suspendido';
  manager: string;
  monthlyRevenue: number;
  monthlyTarget: number;
  members: number;
  memberTarget: number;
  satisfaction: number;
  alerts: number;
  lastUpdate: string;
}

interface Task {
  id?: string;
  titulo: string;
  asignado_a: string;
  creado_por: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_progreso' | 'completada';
  fecha_limite: string;
  verificacion_requerida: boolean;
}

interface Meeting {
  id?: string;
  titulo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: 'estrategica' | 'operativa';
  estado: 'programada' | 'en_curso' | 'finalizada';
  participantes: string[];
  creado_por: string;
}

// ====== DATOS ======
const DEPARTMENTS_DATA: DepartmentStatus[] = [
  {
    id: 'direccion',
    name: 'Dirección',
    icon: Crown,
    color: '#1f2937',
    tasksCompleted: 12,
    totalTasks: 15,
    completionRate: 80,
    criticalAlerts: 1,
    status: 'good',
    lastUpdate: '2025-08-09 09:15',
    keyMetrics: { revenue: 58500, efficiency: 85 },
    manager: 'Carlos Suárez'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Globe,
    color: '#3b82f6',
    tasksCompleted: 8,
    totalTasks: 12,
    completionRate: 67,
    criticalAlerts: 2,
    status: 'warning',
    lastUpdate: '2025-08-09 08:45',
    keyMetrics: { customers: 245, satisfaction: 4.2 },
    manager: 'Ana García'
  },
  {
    id: 'finanzas',
    name: 'Finanzas',
    icon: BarChart3,
    color: '#8b5cf6',
    tasksCompleted: 7,
    totalTasks: 10,
    completionRate: 70,
    criticalAlerts: 3,
    status: 'critical',
    lastUpdate: '2025-08-09 09:10',
    keyMetrics: { revenue: 62000, efficiency: 75 },
    manager: 'Roberto Sánchez'
  }
];

const CENTERS_DATA: CenterKPI[] = [
  {
    id: 'sevilla-central',
    name: 'La Jungla Sevilla Central',
    city: 'Sevilla',
    type: 'Propio',
    status: 'Activo',
    manager: 'Vicente Benítez',
    monthlyRevenue: 35000,
    monthlyTarget: 32000,
    members: 450,
    memberTarget: 400,
    satisfaction: 4.7,
    alerts: 0,
    lastUpdate: '2025-08-09 09:00'
  },
  {
    id: 'sevilla-este',
    name: 'La Jungla Sevilla Este',
    city: 'Sevilla',
    type: 'Franquicia',
    status: 'Activo',
    manager: 'José Manuel Torres',
    monthlyRevenue: 28000,
    monthlyTarget: 30000,
    members: 380,
    memberTarget: 420,
    satisfaction: 4.3,
    alerts: 2,
    lastUpdate: '2025-08-09 08:30'
  }
];

const LEADERSHIP_TEAM = [
  { id: 'carlossuarezparra@gmail.com', name: 'Carlos Suárez Parra', role: 'CEO' },
  { id: 'beni.jungla@gmail.com', name: 'Benito Morales', role: 'Director' },
  { id: 'lajunglacentral@gmail.com', name: 'Vicente Benítez', role: 'Director' }
];

const PRIORITY_LEVELS = [
  { value: 'baja', label: 'Baja', color: '#6b7280' },
  { value: 'media', label: 'Media', color: '#f59e0b' },
  { value: 'alta', label: 'Alta', color: '#f97316' },
  { value: 'critica', label: 'Crítica', color: '#dc2626' }
];

// ====== COMPONENTE TARJETA DE DEPARTAMENTO ======
const DepartmentCard: React.FC<{
  department: DepartmentStatus;
  onClick?: () => void;
}> = ({ department, onClick }) => {
  const Icon = department.icon;
  const statusColors = {
    excellent: '#10b981',
    good: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444'
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `2px solid ${statusColors[department.status]}20`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: `${department.color}20`
          }}>
            <Icon style={{ height: '24px', width: '24px', color: department.color }} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {department.name}
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              {department.manager}
            </p>
          </div>
        </div>
        
        {department.criticalAlerts > 0 && (
          <div style={{
            padding: '4px 8px',
            backgroundColor: '#fee2e2',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertTriangle style={{ height: '12px', width: '12px', color: '#dc2626' }} />
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#dc2626' }}>
              {department.criticalAlerts}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
            Tareas Completadas
          </span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: department.color }}>
            {department.tasksCompleted}/{department.totalTasks}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#f3f4f6',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${department.completionRate}%`,
            height: '100%',
            backgroundColor: statusColors[department.status],
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {department.keyMetrics.revenue && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Ingresos</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              €{department.keyMetrics.revenue.toLocaleString()}
            </p>
          </div>
        )}
        {department.keyMetrics.customers && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Clientes</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {department.keyMetrics.customers}
            </p>
          </div>
        )}
        {department.keyMetrics.satisfaction && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Satisfacción</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {department.keyMetrics.satisfaction}/5
            </p>
          </div>
        )}
        {department.keyMetrics.efficiency && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Eficiencia</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {department.keyMetrics.efficiency}%
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af' }}>
        <span>Actualizado: {new Date(department.lastUpdate).toLocaleTimeString()}</span>
        <span>{department.completionRate}% completado</span>
      </div>
    </div>
  );
};

// ====== COMPONENTE TARJETA DE CENTRO ======
const CenterCard: React.FC<{
  center: CenterKPI;
  onClick?: () => void;
}> = ({ center, onClick }) => {
  const statusColors = {
    'Activo': '#10b981',
    'En Construcción': '#f59e0b',
    'Suspendido': '#ef4444'
  };

  const typeColors = {
    'Propio': '#3b82f6',
    'Franquicia': '#8b5cf6'
  };

  const revenuePercentage = center.monthlyTarget > 0 ? (center.monthlyRevenue / center.monthlyTarget) * 100 : 0;
  const memberPercentage = center.memberTarget > 0 ? (center.members / center.memberTarget) * 100 : 0;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `2px solid ${statusColors[center.status]}20`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: `${statusColors[center.status]}20`
          }}>
            <Building2 style={{ height: '24px', width: '24px', color: statusColors[center.status] }} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {center.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ height: '12px', width: '12px', color: '#6b7280' }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{center.city}</span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '8px',
                backgroundColor: `${typeColors[center.type]}20`,
                color: typeColors[center.type],
                fontWeight: '500'
              }}>
                {center.type}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{
          padding: '4px 8px',
          backgroundColor: `${statusColors[center.status]}20`,
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          color: statusColors[center.status]
        }}>
          {center.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              Facturación
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: revenuePercentage >= 100 ? '#10b981' : '#f59e0b' }}>
              {revenuePercentage.toFixed(0)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#f3f4f6',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(revenuePercentage, 100)}%`,
              height: '100%',
              backgroundColor: revenuePercentage >= 100 ? '#10b981' : '#f59e0b',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
            €{center.monthlyRevenue.toLocaleString()} / €{center.monthlyTarget.toLocaleString()}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              Miembros
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: memberPercentage >= 100 ? '#10b981' : '#f59e0b' }}>
              {memberPercentage.toFixed(0)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#f3f4f6',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(memberPercentage, 100)}%`,
              height: '100%',
              backgroundColor: memberPercentage >= 100 ? '#10b981' : '#f59e0b',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
            {center.members} / {center.memberTarget}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af' }}>
        <span>Manager: {center.manager.split(' ')[0]}</span>
        {center.alerts > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626' }}>
            <AlertTriangle style={{ height: '12px', width: '12px' }} />
            <span>{center.alerts} alertas</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ====== MODAL CREAR TAREA ======
const CreateTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Task>({
    titulo: '',
    asignado_a: '',
    creado_por: 'carlossuarezparra@gmail.com',
    prioridad: 'media',
    estado: 'pendiente',
    fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    verificacion_requerida: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!formData.titulo.trim() || !formData.asignado_a) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      onSave({ ...formData, id: Date.now().toString() });
      onClose();
      setIsSubmitting(false);
      
      // Reset form
      setFormData({
        titulo: '',
        asignado_a: '',
        creado_por: 'carlossuarezparra@gmail.com',
        prioridad: 'media',
        estado: 'pendiente',
        fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verificacion_requerida: true
      });
    }, 1000);
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
            Nueva Tarea Ejecutiva
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
          </button>
        </div>

        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Título de la Tarea *
            </label>
            <input
              type="text"
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
              placeholder="Ej: Revisar KPIs trimestrales"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Asignado a *
              </label>
              <select
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Fecha Límite
            </label>
            <input
              type="date"
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
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
              onClick={handleSubmit}
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
              {isSubmitting && (
                <Loader2 style={{
                  width: '16px',
                  height: '16px',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {!isSubmitting && <Target style={{ height: '16px', width: '16px' }} />}
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====== MODAL CREAR REUNIÓN ======
const CreateMeetingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Meeting>({
    titulo: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '10:00',
    tipo: 'estrategica',
    estado: 'programada',
    participantes: [],
    creado_por: 'carlossuarezparra@gmail.com'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!formData.titulo.trim() || formData.participantes.length === 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      onSave({ ...formData, id: Date.now().toString() });
      onClose();
      setIsSubmitting(false);
      
      // Reset form
      setFormData({
        titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '09:00',
        hora_fin: '10:00',
        tipo: 'estrategica',
        estado: 'programada',
        participantes: [],
        creado_por: 'carlossuarezparra@gmail.com'
      });
    }, 1000);
  };

  const handleParticipantToggle = (participantId: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.includes(participantId)
        ? prev.participantes.filter(id => id !== participantId)
        : [...prev.participantes, participantId]
    }));
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
            Nueva Reunión Ejecutiva
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X style={{ height: '24px', width: '24px', color: '#6b7280' }} />
          </button>
        </div>

        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Título de la Reunión *
            </label>
            <input
              type="text"
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
              placeholder="Ej: Reunión estratégica mensual"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Inicio
              </label>
              <input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Fin
              </label>
              <input
                type="time"
                value={formData.hora_fin}
                onChange={(e) => setFormData(prev => ({ ...prev, hora_fin: e.target.value }))}
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
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Tipo de Reunión
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tipo: e.target.value as 'estrategica' | 'operativa'
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
              <option value="estrategica">Estratégica</option>
              <option value="operativa">Operativa</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Participantes *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LEADERSHIP_TEAM.map(member => (
                <label
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: formData.participantes.includes(member.id) ? '#f0f9ff' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.participantes.includes(member.id)}
                    onChange={() => handleParticipantToggle(member.id)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {member.name} - {member.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting && (
                <Loader2 style={{
                  width: '16px',
                  height: '16px',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {!isSubmitting && <Calendar style={{ height: '16px', width: '16px' }} />}
              {isSubmitting ? 'Programando...' : 'Programar Reunión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====== DASHBOARD EJECUTIVO ======
const ExecutiveDashboard: React.FC<{
  onShowTaskModal?: () => void;
  onShowMeetingModal?: () => void;
}> = ({ onShowTaskModal, onShowMeetingModal }) => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setMeetings([
        {
          id: 'meeting1',
          titulo: 'Reunión Estratégica Semanal',
          fecha: '2025-08-12',
          hora_inicio: '09:00',
          hora_fin: '10:00',
          tipo: 'estrategica',
          estado: 'programada',
          participantes: ['carlossuarezparra@gmail.com', 'beni.jungla@gmail.com'],
          creado_por: 'system'
        },
        {
          id: 'meeting2',
          titulo: 'Revisión KPIs Centros',
          fecha: '2025-08-13',
          hora_inicio: '15:00',
          hora_fin: '16:00',
          tipo: 'operativa',
          estado: 'programada',
          participantes: ['lajunglacentral@gmail.com'],
          creado_por: 'carlossuarezparra@gmail.com'
        }
      ]);
      
      setTasks([
        {
          id: 'task1',
          titulo: 'Revisar KPIs del mes',
          asignado_a: 'carlossuarezparra@gmail.com',
          creado_por: 'system',
          prioridad: 'alta',
          estado: 'pendiente',
          fecha_limite: '2025-08-15',
          verificacion_requerida: false
        },
        {
          id: 'task2',
          titulo: 'Preparar presentación inversores',
          asignado_a: 'beni.jungla@gmail.com',
          creado_por: 'carlossuarezparra@gmail.com',
          prioridad: 'critica',
          estado: 'en_progreso',
          fecha_limite: '2025-08-18',
          verificacion_requerida: true
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{
            width: '48px',
            height: '48px',
            color: '#3b82f6',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando sistema ejecutivo...</p>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso');
  const criticalTasks = tasks.filter(t => t.prioridad === 'critica');

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Principal */}
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
        
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          🧠 Sistema Ejecutivo Inteligente
        </h2>
        <p style={{ fontSize: '18px', opacity: 0.9, margin: 0 }}>
          Dashboard predictivo con IA - Carlos, Benito y Vicente - La Jungla Ibérica
        </p>
      </div>

      {/* KPIs Principales */}
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
              <Calendar style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Reuniones Programadas
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {meetings.length}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            próximas reuniones estratégicas
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
              backgroundColor: '#f59e0b20'
            }}>
              <Flag style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Tareas Pendientes
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {pendingTasks.length}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            {criticalTasks.length} críticas
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
            Estado Sistema
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            100%
          </p>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
              <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                Todos los sistemas operativos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Próximas Reuniones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Próximas Reuniones
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {meetings.slice(0, 3).map(meeting => (
            <div
              key={meeting.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: meeting.tipo === 'estrategica' ? '#3b82f620' : '#f59e0b20'
                }}>
                  <Calendar style={{
                    height: '16px',
                    width: '16px',
                    color: meeting.tipo === 'estrategica' ? '#3b82f6' : '#f59e0b'
                  }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {meeting.titulo}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {new Date(meeting.fecha).toLocaleDateString()} • {meeting.hora_inicio} - {meeting.hora_fin}
                  </p>
                </div>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: meeting.tipo === 'estrategica' ? '#dbeafe' : '#fef3c7',
                fontSize: '11px',
                fontWeight: '500',
                color: meeting.tipo === 'estrategica' ? '#1d4ed8' : '#92400e'
              }}>
                {meeting.tipo === 'estrategica' ? 'Estratégica' : 'Operativa'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Tareas Pendientes */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Tareas Pendientes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.filter(t => t.estado !== 'completada').slice(0, 4).map(task => {
            const priorityColor = PRIORITY_LEVELS.find(p => p.value === task.prioridad)?.color || '#6b7280';
            const assignedUser = LEADERSHIP_TEAM.find(m => m.id === task.asignado_a);
            
            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: `${priorityColor}20`
                  }}>
                    <Target style={{
                      height: '16px',
                      width: '16px',
                      color: priorityColor
                    }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                      {task.titulo}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      Asignado a: {assignedUser?.name.split(' ')[0]} • Vence: {new Date(task.fecha_limite).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: `${priorityColor}20`,
                    fontSize: '11px',
                    fontWeight: '500',
                    color: priorityColor
                  }}>
                    {PRIORITY_LEVELS.find(p => p.value === task.prioridad)?.label}
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: task.estado === 'en_progreso' ? '#fbbf2420' : '#e5e7eb',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: task.estado === 'en_progreso' ? '#92400e' : '#6b7280'
                  }}>
                    {task.estado === 'pendiente' ? 'Pendiente' : 'En Progreso'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={onShowTaskModal}
          style={{
            padding: '14px 28px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Target style={{ height: '20px', width: '20px' }} />
          Nueva Tarea Ejecutiva
        </button>

        <button
          onClick={onShowMeetingModal}
          style={{
            padding: '14px 28px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Calendar style={{ height: '20px', width: '20px' }} />
          Programar Reunión
        </button>

        <button
          onClick={() => alert('Marketing Intelligence disponible próximamente')}
          style={{
            padding: '14px 28px',
            backgroundColor: '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Video style={{ height: '20px', width: '20px' }} />
          Marketing Intelligence
        </button>
      </div>
    </div>
  );
};

// ====== VISTA DEPARTAMENTOS ======
const DepartmentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = DEPARTMENTS_DATA.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          📊 Control de Departamentos
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Vista ejecutiva del estado de todos los departamentos en tiempo real
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '20px',
            width: '20px',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Buscar departamento o manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw style={{ height: '16px', width: '16px' }} />
          Actualizar
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {filteredDepartments.map((department) => (
          <DepartmentCard 
            key={department.id} 
            department={department}
            onClick={() => alert(`Detalles de ${department.name}`)}
          />
        ))}
      </div>
    </div>
  );
};

// ====== VISTA CENTROS ======
const CentersView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCenters = CENTERS_DATA.filter(center => 
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = CENTERS_DATA.reduce((sum, center) => sum + center.monthlyRevenue, 0);
  const totalMembers = CENTERS_DATA.reduce((sum, center) => sum + center.members, 0);

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          🏢 Control de Centros
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Monitoreo en tiempo real de todos los centros La Jungla Ibérica
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <DollarSign style={{ height: '24px', width: '24px', color: '#10b981', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            €{totalRevenue.toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Facturación Total</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Users style={{ height: '24px', width: '24px', color: '#3b82f6', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {totalMembers.toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Miembros Totales</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Building2 style={{ height: '24px', width: '24px', color: '#8b5cf6', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {CENTERS_DATA.filter(c => c.status === 'Activo').length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Centros Activos</p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '20px',
            width: '20px',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Buscar centro o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '24px'
      }}>
        {filteredCenters.map((center) => (
          <CenterCard 
            key={center.id} 
            center={center}
            onClick={() => alert(`Detalles de ${center.name}`)}
          />
        ))}
      </div>
    </div>
  );
};

// ====== VISTA TAREAS ======
const TasksView: React.FC<{
  onShowTaskModal?: () => void;
}> = ({ onShowTaskModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task1',
      titulo: 'Revisar KPIs del mes',
      asignado_a: 'carlossuarezparra@gmail.com',
      creado_por: 'system',
      prioridad: 'alta',
      estado: 'pendiente',
      fecha_limite: '2025-08-15',
      verificacion_requerida: false
    },
    {
      id: 'task2',
      titulo: 'Preparar presentación inversores',
      asignado_a: 'beni.jungla@gmail.com',
      creado_por: 'carlossuarezparra@gmail.com',
      prioridad: 'critica',
      estado: 'en_progreso',
      fecha_limite: '2025-08-18',
      verificacion_requerida: true
    },
    {
      id: 'task3',
      titulo: 'Análisis competencia Q3',
      asignado_a: 'lajunglacentral@gmail.com',
      creado_por: 'carlossuarezparra@gmail.com',
      prioridad: 'media',
      estado: 'completada',
      fecha_limite: '2025-08-10',
      verificacion_requerida: true
    }
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      LEADERSHIP_TEAM.find(m => m.id === task.asignado_a)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.estado === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.prioridad === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTaskStatusChange = (taskId: string, newStatus: Task['estado']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, estado: newStatus } : task
    ));
  };

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          🎯 Gestión de Tareas
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Control y seguimiento de todas las tareas del equipo ejecutivo
        </p>
      </div>

      {/* Estadísticas de Tareas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Target style={{ height: '24px', width: '24px', color: '#3b82f6', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {tasks.length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total Tareas</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Flag style={{ height: '24px', width: '24px', color: '#f59e0b', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {tasks.filter(t => t.estado === 'pendiente').length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Pendientes</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Loader2 style={{ height: '24px', width: '24px', color: '#8b5cf6', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {tasks.filter(t => t.estado === 'en_progreso').length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>En Progreso</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <CheckCircle style={{ height: '24px', width: '24px', color: '#10b981', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {tasks.filter(t => t.estado === 'completada').length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Completadas</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '20px',
            width: '20px',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Buscar tarea o asignado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completada">Completada</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Todas las prioridades</option>
          <option value="critica">Crítica</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <button
          onClick={onShowTaskModal}
          style={{
            padding: '12px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Target style={{ height: '16px', width: '16px' }} />
          Nueva Tarea
        </button>
      </div>

      {/* Lista de Tareas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTasks.map(task => {
            const priorityColor = PRIORITY_LEVELS.find(p => p.value === task.prioridad)?.color || '#6b7280';
            const assignedUser = LEADERSHIP_TEAM.find(m => m.id === task.asignado_a);
            const createdUser = LEADERSHIP_TEAM.find(m => m.id === task.creado_por);
            
            return (
              <div
                key={task.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: `${priorityColor}20`
                    }}>
                      <Target style={{
                        height: '20px',
                        width: '20px',
                        color: priorityColor
                      }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {task.titulo}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Creado por: {createdUser?.name} • Vence: {new Date(task.fecha_limite).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: `${priorityColor}20`,
                      fontSize: '11px',
                      fontWeight: '500',
                      color: priorityColor
                    }}>
                      {PRIORITY_LEVELS.find(p => p.value === task.prioridad)?.label}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(assignedUser?.name || '')}&background=059669&color=fff`}
                      alt={assignedUser?.name}
                      style={{ height: '32px', width: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                        {assignedUser?.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {assignedUser?.role}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      value={task.estado}
                      onChange={(e) => handleTaskStatusChange(task.id!, e.target.value as Task['estado'])}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="completada">Completada</option>
                    </select>
                    
                    {task.verificacion_requerida && (
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <AlertTriangle style={{ height: '12px', width: '12px' }} />
                        Verificación
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ====== VISTA REUNIONES ======
const MeetingsView: React.FC<{
  onShowMeetingModal?: () => void;
}> = ({ onShowMeetingModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 'meeting1',
      titulo: 'Reunión Estratégica Semanal',
      fecha: '2025-08-12',
      hora_inicio: '09:00',
      hora_fin: '10:00',
      tipo: 'estrategica',
      estado: 'programada',
      participantes: ['carlossuarezparra@gmail.com', 'beni.jungla@gmail.com'],
      creado_por: 'system'
    },
    {
      id: 'meeting2',
      titulo: 'Revisión KPIs Centros',
      fecha: '2025-08-13',
      hora_inicio: '15:00',
      hora_fin: '16:00',
      tipo: 'operativa',
      estado: 'programada',
      participantes: ['lajunglacentral@gmail.com'],
      creado_por: 'carlossuarezparra@gmail.com'
    },
    {
      id: 'meeting3',
      titulo: 'Planificación Q4',
      fecha: '2025-08-08',
      hora_inicio: '10:00',
      hora_fin: '12:00',
      tipo: 'estrategica',
      estado: 'finalizada',
      participantes: ['carlossuarezparra@gmail.com', 'beni.jungla@gmail.com', 'lajunglacentral@gmail.com'],
      creado_por: 'carlossuarezparra@gmail.com'
    }
  ]);

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || meeting.tipo === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          📅 Gestión de Reuniones
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Programación y seguimiento de reuniones del equipo ejecutivo
        </p>
      </div>

      {/* Estadísticas de Reuniones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Calendar style={{ height: '24px', width: '24px', color: '#3b82f6', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {meetings.length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total Reuniones</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Clock style={{ height: '24px', width: '24px', color: '#f59e0b', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {meetings.filter(m => m.estado === 'programada').length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Programadas</p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Crown style={{ height: '24px', width: '24px', color: '#8b5cf6', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {meetings.filter(m => m.tipo === 'estrategica').length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Estratégicas</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <CheckCircle style={{ height: '24px', width: '24px', color: '#10b981', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            {meetings.filter(m => m.estado === 'finalizada').length}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Finalizadas</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '20px',
            width: '20px',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Buscar reunión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">Todos los tipos</option>
          <option value="estrategica">Estratégica</option>
          <option value="operativa">Operativa</option>
        </select>

        <button
          onClick={onShowMeetingModal}
          style={{
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar style={{ height: '16px', width: '16px' }} />
          Nueva Reunión
        </button>
      </div>

      {/* Lista de Reuniones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMeetings.map(meeting => {
            const createdUser = LEADERSHIP_TEAM.find(m => m.id === meeting.creado_por);
            
            return (
              <div
                key={meeting.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: meeting.tipo === 'estrategica' ? '#3b82f620' : '#f59e0b20'
                    }}>
                      <Calendar style={{
                        height: '20px',
                        width: '20px',
                        color: meeting.tipo === 'estrategica' ? '#3b82f6' : '#f59e0b'
                      }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {meeting.titulo}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {new Date(meeting.fecha).toLocaleDateString()} • {meeting.hora_inicio} - {meeting.hora_fin} • Creado por: {createdUser?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: meeting.tipo === 'estrategica' ? '#dbeafe' : '#fef3c7',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: meeting.tipo === 'estrategica' ? '#1d4ed8' : '#92400e'
                    }}>
                      {meeting.tipo === 'estrategica' ? 'Estratégica' : 'Operativa'}
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: meeting.estado === 'finalizada' ? '#dcfce7' : '#fef3c7',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: meeting.estado === 'finalizada' ? '#166534' : '#92400e'
                    }}>
                      {meeting.estado === 'programada' ? 'Programada' : 'Finalizada'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Participantes:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {meeting.participantes.slice(0, 3).map(participantId => {
                      const participant = LEADERSHIP_TEAM.find(m => m.id === participantId);
                      return (
                        <img
                          key={participantId}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(participant?.name || '')}&background=059669&color=fff`}
                          alt={participant?.name}
                          title={participant?.name}
                          style={{ height: '24px', width: '24px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      );
                    })}
                    {meeting.participantes.length > 3 && (
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        padding: '2px 6px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '12px'
                      }}>
                        +{meeting.participantes.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ====== SISTEMA COMPLETO CON NAVEGACIÓN ======
const RoleDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const menuItems = [
    { id: 'executive', label: 'Dashboard Ejecutivo', icon: Crown },
    { id: 'departments', label: 'Control Departamentos', icon: Users },
    { id: 'centers', label: 'Control Centros', icon: Building2 },
    { id: 'tasks', label: 'Gestión Tareas', icon: Target },
    { id: 'meetings', label: 'Reuniones', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const handleTaskCreated = (task: Task) => {
    console.log('🎯 Nueva tarea creada:', task);
    const assignedUser = LEADERSHIP_TEAM.find(m => m.id === task.asignado_a);
    alert(`¡Tarea "${task.titulo}" creada exitosamente para ${assignedUser?.name}!`);
  };

  const handleMeetingCreated = (meeting: Meeting) => {
    console.log('📅 Nueva reunión creada:', meeting);
    alert(`¡Reunión "${meeting.titulo}" programada exitosamente!`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'executive':
        return (
          <ExecutiveDashboard 
            onShowTaskModal={() => setShowTaskModal(true)}
            onShowMeetingModal={() => setShowMeetingModal(true)}
          />
        );
      case 'departments':
        return <DepartmentsView />;
      case 'centers':
        return <CentersView />;
      case 'tasks':
        return <TasksView onShowTaskModal={() => setShowTaskModal(true)} />;
      case 'meetings':
        return <MeetingsView onShowMeetingModal={() => setShowMeetingModal(true)} />;
      case 'analytics':
      case 'settings':
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              {activeTab === 'analytics' && 'Analytics Avanzados'}
              {activeTab === 'settings' && 'Configuración del Sistema'}
            </h2>
            <p style={{ color: '#6b7280' }}>
              Esta funcionalidad estará disponible próximamente.
            </p>
          </div>
        );
      default:
        return (
          <ExecutiveDashboard 
            onShowTaskModal={() => setShowTaskModal(true)}
            onShowMeetingModal={() => setShowMeetingModal(true)}
          />
        );
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        borderRight: '1px solid #e5e7eb'
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
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>La Jungla Ibérica</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Sistema Ejecutivo</p>
              </div>
            )}
          </div>
        </div>

        <nav style={{ padding: '0 16px' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '8px',
                cursor: 'pointer',
                backgroundColor: activeTab === item.id ? '#d1fae5' : 'transparent',
                color: activeTab === item.id ? '#047857' : '#6b7280',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <item.icon style={{ height: '20px', width: '20px' }} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Mini dashboard en sidebar */}
        {sidebarOpen && (
          <div style={{ padding: '16px', marginTop: '24px' }}>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Vista Rápida
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Departamentos</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                      {DEPARTMENTS_DATA.filter(d => d.status === 'excellent' || d.status === 'good').length}/{DEPARTMENTS_DATA.length}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Centros Activos</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6'
                    }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                      {CENTERS_DATA.filter(c => c.status === 'Activo').length}/{CENTERS_DATA.length}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Alertas Críticas</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: DEPARTMENTS_DATA.reduce((sum, d) => sum + d.criticalAlerts, 0) > 0 ? '#ef4444' : '#10b981'
                    }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                      {DEPARTMENTS_DATA.reduce((sum, d) => sum + d.criticalAlerts, 0)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('departments')}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Ver Detalle
              </button>
            </div>
          </div>
        )}
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
                  {activeTab === 'departments' && 'Control de Departamentos'}
                  {activeTab === 'centers' && 'Control de Centros'}
                  {activeTab === 'tasks' && 'Gestión de Tareas'}
                  {activeTab === 'meetings' && 'Gestión de Reuniones'}
                  {activeTab === 'analytics' && 'Analytics Avanzados'}
                  {activeTab === 'settings' && 'Configuración del Sistema'}
                </h1>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Sistema integrado con datos en tiempo real - Carlos Suárez Parra
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{
                position: 'relative',
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer'
              }}>
                <Bell style={{ height: '20px', width: '20px', color: '#6b7280' }} />
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%'
                }}></span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="https://ui-avatars.com/api/?name=Carlos+Suarez&background=059669&color=fff"
                  alt="Carlos Suárez"
                  style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    Carlos Suárez Parra
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>CEO - Sistema Ejecutivo</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>

      {/* Modales */}
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskCreated}
      />

      <CreateMeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onSave={handleMeetingCreated}
      />
    </div>
  );
};

export default RoleDashboard;