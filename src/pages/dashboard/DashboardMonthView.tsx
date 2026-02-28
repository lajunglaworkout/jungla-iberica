// src/pages/dashboard/DashboardMonthView.tsx
import React from 'react';
import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '../../types/dashboard';

interface DashboardMonthViewProps {
  selectedDate: Date;
  tasks: Task[];
  onMonthBack: () => void;
  onMonthForward: () => void;
  onToday: () => void;
  onDayClick: (day: Date) => void;
  onTaskClick: (task: Task) => void;
}

export const DashboardMonthView: React.FC<DashboardMonthViewProps> = ({
  selectedDate, tasks, onMonthBack, onMonthForward, onToday, onDayClick, onTaskClick,
}) => {
  const getTasksForDay = (date: Date) =>
    tasks.filter(t => isSameDay(new Date(t.startDate), date));

  const getMonthDays = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const startWeek = startOfWeek(start, { locale: es });
    const endWeek = startOfWeek(addDays(end, 6), { locale: es });
    return eachDayOfInterval({ start: startWeek, end: addDays(endWeek, 6) });
  };

  const weeks: Date[][] = [];
  const days = getMonthDays();
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const monthName = format(selectedDate, 'MMMM yyyy', { locale: es });

  return (
    <div className="calendar-container">
      <div className="month-header">
        <h2>{monthName}</h2>
        <div className="month-navigation">
          <button className="btn btn-secondary" onClick={onMonthBack}>← Anterior</button>
          <button className="btn btn-secondary" onClick={onToday}>Hoy</button>
          <button className="btn btn-secondary" onClick={onMonthForward}>Siguiente →</button>
        </div>
      </div>

      <div className="month-grid">
        <div className="month-weekdays">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="weekday-header">{d}</div>
          ))}
        </div>
        <div className="month-weeks">
          {weeks.map((week, wi) => (
            <div key={wi} className="month-week">
              {week.map((day, di) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isDayToday = isToday(day);
                return (
                  <div
                    key={di}
                    className={`month-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isDayToday ? 'today' : ''}`}
                    onClick={() => onDayClick(day)}
                  >
                    <div className="day-number">{format(day, 'd')}</div>
                    <div className="day-tasks">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`month-task ${task.category} ${task.priority}`}
                          onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                        >
                          <span className="task-time">{task.startTime}</span>
                          <span className="task-title">{task.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && <div className="more-tasks">+{dayTasks.length - 3} más</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
