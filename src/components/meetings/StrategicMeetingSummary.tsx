/**
 * StrategicMeetingSummary — paso 4 del wizard: resumen final antes de guardar.
 * Extraído de StrategicMeetingSystem.tsx.
 */
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { DEPARTMENTS, MEETING_TYPES_CONFIG, type MeetingData, type LeadershipMember } from './StrategicMeetingConfig';

interface StrategicMeetingSummaryProps {
  meetingData: MeetingData;
  realEmployees: LeadershipMember[];
}

const StrategicMeetingSummary: React.FC<StrategicMeetingSummaryProps> = ({ meetingData, realEmployees }) => {
  const selectedType = MEETING_TYPES_CONFIG[meetingData.type];
  const selectedDepartment = DEPARTMENTS.find(d => d.id === meetingData.department);
  const today = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Resumen Final - {selectedDepartment?.name}
        </h2>
        <p style={{ color: '#6b7280' }}>Revisa toda la información de la reunión antes de guardar</p>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginTop: '16px', display: 'inline-block' }}>
          <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
            Reunión del {days[today.getDay()]}, {today.toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      {/* Detalles generales */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Detalles Generales</h3>
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
            <span style={{ marginLeft: '8px', color: '#111827' }}>{new Date(meetingData.date).toLocaleDateString('es-ES')}</span>
          </div>
          <div>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>Participantes:</span>
            <span style={{ marginLeft: '8px', color: '#111827' }}>{meetingData.participants.length}</span>
          </div>
        </div>
      </div>

      {/* Objetivos y tareas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
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

        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
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

      {/* CTA final */}
      <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '8px', marginTop: '24px' }}>
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

export default StrategicMeetingSummary;
