// src/pages/dashboard/DashboardWeekView.tsx
import React from 'react';
import { format, addDays, isSameDay, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { Task } from '../../types/dashboard';

interface DashboardWeekViewProps {
  selectedDate: Date;
  tasks: Task[];
  onWeekBack: () => void;
  onWeekForward: () => void;
  onToday: () => void;
  onTaskClick: (task: Task) => void;
  onAddEventForDay: (day: Date) => void;
}

export const DashboardWeekView: React.FC<DashboardWeekViewProps> = ({
  selectedDate, tasks, onWeekBack, onWeekForward, onToday, onTaskClick, onAddEventForDay,
}) => {
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startOfWeek(selectedDate, { locale: es }), i));
  const weekStart = format(weekDays[0], 'dd/MM', { locale: es });
  const weekEnd = format(weekDays[4], 'dd/MM', { locale: es });

  const getTasksForDay = (date: Date) =>
    tasks.filter(t => isSameDay(new Date(t.startDate), date)).sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  return (
    <div className="calendar-container">
      {/* Week header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: '600' }}>
            Semana Laboral: {weekStart} - {weekEnd}
          </h2>
          <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
            {format(new Date(), 'MMMM yyyy', { locale: es })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onWeekBack} style={{ padding: '8px 12px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <ChevronLeft size={16} /> Anterior
          </button>
          <button onClick={onToday} style={{ padding: '8px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            Hoy
          </button>
          <button onClick={onWeekForward} style={{ padding: '8px 12px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day columns */}
      <div className="week-grid">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          return (
            <div key={index} className="day-column">
              <div className="day-header" style={{ backgroundColor: isToday ? '#f0f9ff' : '#f8f9fa', borderBottom: isToday ? '2px solid #059669' : '1px solid #eee' }}>
                <div className="day-name" style={{ color: isToday ? '#059669' : '#6b7280', fontWeight: isToday ? '600' : '500' }}>
                  {format(day, 'EEEE', { locale: es })}
                </div>
                <div className={`day-number ${isToday ? 'today' : ''}`} style={{ backgroundColor: isToday ? '#059669' : 'transparent', color: isToday ? 'white' : '#111827' }}>
                  {format(day, 'd')}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', textTransform: 'uppercase' }}>
                  {format(day, 'MMM', { locale: es })}
                </div>
              </div>

              <div className="day-events" style={{ padding: '8px', minHeight: '300px', backgroundColor: isToday ? '#fefffe' : 'white' }}>
                {dayTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '20px', fontStyle: 'italic' }}>
                    Sin eventos programados
                  </div>
                ) : (
                  dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`event ${task.category} ${task.priority}`}
                      onClick={() => onTaskClick(task)}
                      style={{
                        marginBottom: '8px', padding: '8px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e5e7eb',
                        backgroundColor: task.category === 'meeting' ? '#fef3c7' : task.endTime ? '#fee2e2' : '#dbeafe',
                        transition: 'all 0.2s ease', position: 'relative',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        <Clock size={12} />
                        {task.startTime}{task.endTime && ` - ${task.endTime}`}
                      </div>
                      <div style={{ fontWeight: '500', fontSize: '13px', color: '#111827', marginBottom: '2px' }}>{task.title}</div>
                      {task.meetingType && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669' }}>
                          {task.meetingType === 'weekly' ? '📅' : '🗓️'} <span>Recurrente</span>
                        </div>
                      )}
                      {task.priority === 'high' && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                      )}
                    </div>
                  ))
                )}

                <button
                  onClick={() => onAddEventForDay(day)}
                  style={{ width: '100%', padding: '8px', marginTop: '8px', backgroundColor: 'transparent', border: '1px dashed #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#059669'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#6b7280'; }}
                >
                  <Plus size={14} /> Añadir evento
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
