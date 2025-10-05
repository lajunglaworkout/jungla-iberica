import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Meeting {
  id: string;
  type: string;
  department: string;
  date: string;
  participants: string[];
  objectives: any[];
  tasks: any[];
  notes: string;
  created_at: string;
}

interface MeetingHistorySystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENTS = [
  { id: 'direccion', name: 'Dirección' },
  { id: 'rrhh_procedimientos', name: 'RRHH y Procedimientos' },
  { id: 'logistica', name: 'Logística' },
  { id: 'contabilidad_ventas', name: 'Contabilidad y Ventas' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'eventos', name: 'Eventos' },
  { id: 'online', name: 'Online' },
  { id: 'investigacion', name: 'I+D' }
];

const MeetingHistorySystem: React.FC<MeetingHistorySystemProps> = ({ isOpen, onClose }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadMeetings();
    }
  }, [isOpen]);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando reuniones:', error);
        return;
      }

      setMeetings(data || []);
      console.log('✅ Reuniones cargadas:', data?.length || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId: string) => {
    return DEPARTMENTS.find(d => d.id === departmentId)?.name || departmentId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesDepartment = !filterDepartment || meeting.department === filterDepartment;
    const matchesType = !filterType || meeting.type === filterType;
    return matchesDepartment && matchesType;
  });

  if (!isOpen) return null;

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
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              📋 Historial de Reuniones
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Consulta todas las reuniones realizadas
            </p>
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

        {/* Filtros */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">Todos los departamentos</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="semanal">Reunión Semanal</option>
            <option value="mensual">Reunión Mensual</option>
          </select>

          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {filteredMeetings.length} reunión(es) encontrada(s)
          </div>
        </div>

        {/* Lista de reuniones */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 24px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Cargando reuniones...
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No se encontraron reuniones
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header de la reunión */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => setExpandedMeeting(
                      expandedMeeting === meeting.id ? null : meeting.id
                    )}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Calendar size={20} style={{ color: '#059669' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827' }}>
                          {getDepartmentName(meeting.department)} - {meeting.type === 'semanal' ? 'Semanal' : 'Mensual'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(meeting.date)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {meeting.tasks?.length || 0} tareas • {meeting.objectives?.length || 0} objetivos
                      </div>
                      {expandedMeeting === meeting.id ? 
                        <ChevronUp size={20} style={{ color: '#6b7280' }} /> :
                        <ChevronDown size={20} style={{ color: '#6b7280' }} />
                      }
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  {expandedMeeting === meeting.id && (
                    <div style={{ padding: '16px', backgroundColor: 'white' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Objetivos */}
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                            🎯 Objetivos ({meeting.objectives?.length || 0})
                          </h4>
                          {meeting.objectives && meeting.objectives.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                              {meeting.objectives.map((objective: any, index: number) => (
                                <li key={index} style={{ 
                                  fontSize: '14px', 
                                  color: '#374151', 
                                  marginBottom: '8px',
                                  paddingLeft: '16px',
                                  position: 'relative'
                                }}>
                                  <span style={{ 
                                    position: 'absolute', 
                                    left: 0, 
                                    color: '#059669' 
                                  }}>•</span>
                                  {objective.description}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '14px', color: '#9ca3af' }}>No hay objetivos definidos</p>
                          )}
                        </div>

                        {/* Tareas */}
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                            ✅ Tareas ({meeting.tasks?.length || 0})
                          </h4>
                          {meeting.tasks && meeting.tasks.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                              {meeting.tasks.map((task: any, index: number) => (
                                <li key={index} style={{ 
                                  fontSize: '14px', 
                                  color: '#374151', 
                                  marginBottom: '8px',
                                  paddingLeft: '16px',
                                  position: 'relative'
                                }}>
                                  <span style={{ 
                                    position: 'absolute', 
                                    left: 0, 
                                    color: '#059669' 
                                  }}>•</span>
                                  <div>
                                    <div style={{ fontWeight: '500' }}>{task.title}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                      Asignado a: {task.assignedTo} • Fecha límite: {new Date(task.deadline).toLocaleDateString('es-ES')}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '14px', color: '#9ca3af' }}>No hay tareas definidas</p>
                          )}
                        </div>
                      </div>

                      {/* Notas */}
                      {meeting.notes && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                            📝 Notas
                          </h4>
                          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                            {meeting.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingHistorySystem;
