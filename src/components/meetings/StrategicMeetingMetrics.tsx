/**
 * StrategicMeetingMetrics — paso 2 del wizard: revisión de tareas anteriores y KPIs.
 * Extraído de StrategicMeetingSystem.tsx.
 */
import React, { useState } from 'react';
import { CheckCircle, BarChart3 } from 'lucide-react';
import {
  DEPARTMENTS,
  DEPARTMENT_KPIS,
  type MeetingData,
  type MeetingTaskItem,
} from './StrategicMeetingConfig';

interface StrategicMeetingMetricsProps {
  meetingData: MeetingData;
  setMeetingData: React.Dispatch<React.SetStateAction<MeetingData>>;
}

// Tareas de ejemplo por departamento (datos estáticos de demo)
const DEPT_DEMO_TASKS: Record<string, MeetingTaskItem[]> = {
  direccion: [
    { id: 1, title: 'Revisar proceso de onboarding', status: 'completada', assignedTo: 'Carlos Suárez', comments: '' },
    { id: 2, title: 'Actualizar manual de procedimientos', status: 'pendiente', assignedTo: 'Equipo RRHH', comments: '' },
    { id: 3, title: 'Implementar nuevo sistema CRM', status: 'en_progreso', assignedTo: 'Departamento IT', comments: '' },
  ],
  eventos: [
    { id: 4, title: 'Planificar evento de fin de año', status: 'en_progreso', assignedTo: 'Equipo Eventos', comments: '' },
    { id: 5, title: 'Revisar proveedores de catering', status: 'pendiente', assignedTo: 'María González', comments: '' },
  ],
  marketing: [
    { id: 6, title: 'Campaña redes sociales Q4', status: 'en_progreso', assignedTo: 'Diego Fernández', comments: '' },
    { id: 7, title: 'Análisis competencia', status: 'completada', assignedTo: 'Equipo Marketing', comments: '' },
  ],
  rrhh_procedimientos: [
    { id: 8, title: 'Actualizar contratos temporales', status: 'pendiente', assignedTo: 'RRHH', comments: '' },
    { id: 9, title: 'Formación en seguridad', status: 'completada', assignedTo: 'Prevención', comments: '' },
  ],
  logistica: [
    { id: 10, title: 'Optimizar rutas de entrega', status: 'en_progreso', assignedTo: 'Logística', comments: '' },
    { id: 11, title: 'Inventario trimestral', status: 'pendiente', assignedTo: 'Almacén', comments: '' },
  ],
  contabilidad_ventas: [
    { id: 12, title: 'Cierre contable mensual', status: 'completada', assignedTo: 'Contabilidad', comments: '' },
    { id: 13, title: 'Seguimiento clientes morosos', status: 'en_progreso', assignedTo: 'Ventas', comments: '' },
  ],
  online: [
    { id: 14, title: 'Actualizar web corporativa', status: 'en_progreso', assignedTo: 'Desarrollo', comments: '' },
    { id: 15, title: 'SEO análisis mensual', status: 'pendiente', assignedTo: 'Marketing Digital', comments: '' },
  ],
  investigacion: [
    { id: 16, title: 'Estudio mercado fitness 2025', status: 'en_progreso', assignedTo: 'I+D', comments: '' },
    { id: 17, title: 'Prototipo nueva app', status: 'pendiente', assignedTo: 'Desarrollo', comments: '' },
  ],
};

const StrategicMeetingMetrics: React.FC<StrategicMeetingMetricsProps> = ({ meetingData, setMeetingData }) => {
  const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);
  const [previousTasks, setPreviousTasks] = useState<MeetingTaskItem[]>(
    () => DEPT_DEMO_TASKS[meetingData.department] || []
  );

  React.useEffect(() => {
    setPreviousTasks(DEPT_DEMO_TASKS[meetingData.department] || []);
  }, [meetingData.department]);

  const updateTaskStatus = (taskId: number | undefined, newStatus: string) => {
    setPreviousTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
  };

  const updateTaskComments = (taskId: number | undefined, comments: string) => {
    setPreviousTasks(prev => prev.map(task => task.id === taskId ? { ...task, comments } : task));
  };

  const today = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Revisión Semanal - {selectedDepartment?.name}
        </h2>
        <p style={{ color: '#6b7280' }}>Revisa las tareas de la semana anterior y los KPIs del departamento</p>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginTop: '16px', display: 'inline-block' }}>
          <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
            Reunión del {days[today.getDay()]}, {today.toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      {/* Tareas anteriores */}
      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', marginBottom: '12px' }}>
          <CheckCircle style={{ height: '20px', width: '20px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Tareas de la Reunión Anterior</h3>
        </div>
        {previousTasks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {previousTasks.map((task) => (
              <div key={task.id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      backgroundColor: task.status === 'completada' ? '#10b981' : task.status === 'en_progreso' ? '#f59e0b' : '#ef4444',
                    }} />
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{task.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{task.assignedTo}</span>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      style={{
                        fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db',
                        backgroundColor: task.status === 'completada' ? '#d1fae5' : task.status === 'en_progreso' ? '#fef3c7' : '#fee2e2',
                        color: task.status === 'completada' ? '#065f46' : task.status === 'en_progreso' ? '#92400e' : '#991b1b',
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
                      style={{ width: '100%', minHeight: '50px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', backgroundColor: '#f9fafb' }}
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

      {/* KPIs */}
      <div style={{ padding: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '8px' }}>
          <BarChart3 style={{ height: '20px', width: '20px' }} />
          <span style={{ fontWeight: '500' }}>KPIs del Departamento - {selectedDepartment?.name}</span>
        </div>
        <p style={{ color: '#0369a1', fontSize: '14px', margin: 0 }}>Revisa los indicadores clave y anota observaciones de la semana</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {(DEPARTMENT_KPIS[meetingData.department] || []).map((metric) => (
          <div key={metric.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              {metric.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="number"
                step={metric.type === 'currency' ? '0.01' : metric.type === 'percentage' ? '0.1' : '1'}
                placeholder={`Objetivo: ${metric.target}${metric.type === 'percentage' ? '%' : metric.type === 'currency' ? '€' : ''}`}
                value={meetingData.metrics[metric.id] || ''}
                onChange={(e) => setMeetingData(prev => ({ ...prev, metrics: { ...prev.metrics, [metric.id]: e.target.value } }))}
                style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
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
              onChange={(e) => setMeetingData(prev => ({ ...prev, metrics: { ...prev.metrics, [`${metric.id}_notes`]: e.target.value } }))}
              style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit' }}
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

export default StrategicMeetingMetrics;
