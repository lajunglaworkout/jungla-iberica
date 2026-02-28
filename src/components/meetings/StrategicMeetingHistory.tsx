/**
 * StrategicMeetingHistory — historial de reuniones estratégicas con filtros.
 * Extraído de StrategicMeetingSystem.tsx.
 */
import React from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import {
  DEPARTMENTS,
  MEETING_TYPES_CONFIG,
  type HistoricalMeeting,
  type MeetingObjectiveItem,
  type MeetingTaskItem,
} from './StrategicMeetingConfig';

interface StrategicMeetingHistoryProps {
  meetings: HistoricalMeeting[];
  filterDepartment: string;
  filterType: string;
  expandedMeeting: string | null;
  setFilterDepartment: (v: string) => void;
  setFilterType: (v: string) => void;
  setExpandedMeeting: (v: string | null) => void;
}

const StrategicMeetingHistory: React.FC<StrategicMeetingHistoryProps> = ({
  meetings,
  filterDepartment,
  filterType,
  expandedMeeting,
  setFilterDepartment,
  setFilterType,
  setExpandedMeeting,
}) => {
  const filteredMeetings = meetings.filter(meeting => {
    const matchesDepartment = !filterDepartment || meeting.department === filterDepartment;
    const matchesType = !filterType || meeting.type === filterType;
    return matchesDepartment && matchesType;
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Filtrar por departamento:</label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }}
          >
            <option value="">Todos los departamentos</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Filtrar por tipo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }}
          >
            <option value="">Todos los tipos</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
      </div>

      {/* Listado */}
      {filteredMeetings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
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
            <div key={meeting.id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  cursor: 'pointer',
                  backgroundColor: expandedMeeting === meeting.id ? '#f9fafb' : 'white',
                }}
                onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id ?? null)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      backgroundColor: MEETING_TYPES_CONFIG[meeting.type]?.color || '#6b7280',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {MEETING_TYPES_CONFIG[meeting.type]?.label || meeting.type}
                    </span>
                    <span style={{
                      backgroundColor: DEPARTMENTS.find(d => d.id === meeting.department)?.color || '#e5e7eb',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {DEPARTMENTS.find(d => d.id === meeting.department)?.name || meeting.department}
                    </span>
                  </div>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: '600' }}>
                    Reunión del {new Date(meeting.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {meeting.participants?.length || 0} participantes &bull; {meeting.objectives?.length || 0} objetivos &bull; {meeting.tasks?.length || 0} tareas
                  </p>
                </div>
                <ChevronDown style={{ transition: 'transform 0.2s', transform: expandedMeeting === meeting.id ? 'rotate(180deg)' : 'rotate(0)' }} />
              </div>

              {expandedMeeting === meeting.id && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #e5e7eb' }}>
                  {meeting.notes && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Notas:</h4>
                      <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', whiteSpace: 'pre-line' }}>{meeting.notes}</p>
                    </div>
                  )}

                  {(meeting.objectives as MeetingObjectiveItem[] | undefined)?.length ? (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Objetivos:</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {(meeting.objectives as MeetingObjectiveItem[]).map((obj, index) => (
                          <li key={index} style={{ marginBottom: '4px', color: '#4b5563', fontSize: '14px' }}>
                            {obj.title} <span style={{ color: '#9ca3af' }}>({obj.status})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {(meeting.tasks as MeetingTaskItem[] | undefined)?.length ? (
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tareas:</h4>
                      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }}>
                        {(meeting.tasks as MeetingTaskItem[]).map((task, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: index < (meeting.tasks as MeetingTaskItem[]).length - 1 ? '1px solid #e5e7eb' : 'none',
                          }}>
                            <div>
                              <div style={{ fontWeight: '500', color: '#111827' }}>{task.title}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Asignada a: {task.assignedTo}</div>
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: task.priority === 'Alta' ? '#dc2626' : task.priority === 'Media' ? '#d97706' : '#059669',
                              fontWeight: '500',
                            }}>
                              {task.priority}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrategicMeetingHistory;
