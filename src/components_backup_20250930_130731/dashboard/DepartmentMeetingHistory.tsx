import React, { useState, useEffect } from 'react';
import { Task } from '../../types/dashboard';
import { DEPARTMENTS, CENTERS, getDepartmentByName, getAssignmentResponsible } from '../../config/departments';
import { Calendar, Clock, Users, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DepartmentMeetingHistoryProps {
  tasks: Task[];
  onEditMeeting: (task: Task) => void;
}

export const DepartmentMeetingHistory: React.FC<DepartmentMeetingHistoryProps> = ({
  tasks,
  onEditMeeting
}) => {
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filtrar solo reuniones
  const meetings = tasks.filter(task => task.category === 'meeting');

  // Agrupar reuniones por asignación
  const meetingsByAssignment = meetings.reduce((acc, meeting) => {
    let groupKey = 'Sin asignar';
    let groupName = 'Sin asignar';
    let groupIcon = '📁';
    let responsibleName = 'Sin responsable';

    if (meeting.assignmentType && meeting.assignmentId) {
      const responsible = getAssignmentResponsible(meeting.assignmentType, meeting.assignmentId);
      if (responsible) {
        if (meeting.assignmentType === 'corporativo') {
          groupKey = `dept_${meeting.assignmentId}`;
          groupName = `🏢 ${meeting.assignmentId}`;
          groupIcon = '🏢';
          responsibleName = responsible.name;
        } else {
          groupKey = `emp_${meeting.assignmentId}`;
          groupName = `👤 ${responsible.name}`;
          groupIcon = '👤';
          responsibleName = responsible.description;
        }
      }
    } else if (meeting.department) {
      // Compatibilidad hacia atrás
      groupKey = `dept_${meeting.department}`;
      groupName = `🏢 ${meeting.department}`;
      groupIcon = '🏢';
      const dept = getDepartmentByName(meeting.department);
      responsibleName = dept?.responsibleName || 'Sin responsable';
    }

    if (!acc[groupKey]) {
      acc[groupKey] = {
        meetings: [],
        displayName: groupName,
        icon: groupIcon,
        responsibleName: responsibleName
      };
    }
    acc[groupKey].meetings.push(meeting);
    return acc;
  }, {} as Record<string, { meetings: Task[]; displayName: string; icon: string; responsibleName: string }>);

  // Obtener estadísticas por departamento
  const getDepartmentStats = (departmentMeetings: Task[]) => {
    const total = departmentMeetings.length;
    const completed = departmentMeetings.filter(m => m.status === 'completed').length;
    const pending = departmentMeetings.filter(m => m.status === 'pending').length;
    const upcoming = departmentMeetings.filter(m => {
      const meetingDate = new Date(m.startDate);
      return meetingDate > new Date() && m.status === 'pending';
    }).length;

    return { total, completed, pending, upcoming };
  };

  const toggleDepartment = (department: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(department)) {
      newExpanded.delete(department);
    } else {
      newExpanded.add(department);
    }
    setExpandedDepartments(newExpanded);
  };

  const formatMeetingDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pendiente' },
      'in-progress': { bg: '#dbeafe', color: '#1e40af', text: 'En curso' },
      completed: { bg: '#d1fae5', color: '#065f46', text: 'Completada' },
      cancelled: { bg: '#fecaca', color: '#991b1b', text: 'Cancelada' }
    };

    const style = styles[status as keyof typeof styles] || styles.pending;
    
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>
        {style.text}
      </span>
    );
  };

  const filteredAssignments = selectedDepartment === 'all' 
    ? Object.keys(meetingsByAssignment)
    : Object.keys(meetingsByAssignment).filter(key => key.includes(selectedDepartment));

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#111827',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          <Calendar size={20} />
          Historial de Reuniones por Departamento
        </h3>

        {/* Filtro por departamento */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            minWidth: '200px'
          }}
        >
          <option value="all">Todos los departamentos</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept.id} value={dept.name}>
              {dept.icon} {dept.name}
            </option>
          ))}
        </select>
      </div>

      {filteredAssignments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '6px'
        }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No hay reuniones registradas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAssignments.map((assignmentKey: string) => {
            const assignmentData = meetingsByAssignment[assignmentKey];
            const assignmentMeetings = assignmentData.meetings;
            const stats = getDepartmentStats(assignmentMeetings);
            const isExpanded = expandedDepartments.has(assignmentKey);

            return (
              <div key={assignmentKey} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                {/* Header de la asignación */}
                <div 
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => toggleDepartment(assignmentKey)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span style={{ fontSize: '1.5rem' }}>{assignmentData.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                        {assignmentData.displayName}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                        {assignmentData.responsibleName}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: '#059669' }}>
                      <strong>{stats.total}</strong> total
                    </span>
                    <span style={{ color: '#0ea5e9' }}>
                      <strong>{stats.upcoming}</strong> próximas
                    </span>
                    <span style={{ color: '#10b981' }}>
                      <strong>{stats.completed}</strong> completadas
                    </span>
                  </div>
                </div>

                {/* Lista de reuniones */}
                {isExpanded && (
                  <div style={{ padding: '1rem' }}>
                    {assignmentMeetings.length === 0 ? (
                      <p style={{ color: '#6b7280', textAlign: 'center', margin: 0 }}>
                        No hay reuniones para esta asignación
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {assignmentMeetings
                          .sort((a: Task, b: Task) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                          .map((meeting: Task) => (
                            <div 
                              key={meeting.id}
                              style={{
                                padding: '0.75rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => onEditMeeting(meeting)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f9ff';
                                e.currentTarget.style.borderColor = '#0ea5e9';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>
                                  {meeting.title}
                                </h5>
                                {getStatusBadge(meeting.status)}
                              </div>
                              
                              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={12} />
                                  {formatMeetingDate(meeting.startDate)}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={12} />
                                  {meeting.startTime}
                                  {meeting.endTime && ` - ${meeting.endTime}`}
                                </span>
                                {meeting.meetingType && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Users size={12} />
                                    {meeting.meetingType === 'weekly' ? 'Semanal' : 'Mensual'}
                                  </span>
                                )}
                              </div>

                              {meeting.description && (
                                <p style={{ 
                                  margin: '0.5rem 0 0 0', 
                                  fontSize: '0.8rem', 
                                  color: '#4b5563',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.25rem'
                                }}>
                                  <FileText size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                                  {meeting.description}
                                </p>
                              )}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
