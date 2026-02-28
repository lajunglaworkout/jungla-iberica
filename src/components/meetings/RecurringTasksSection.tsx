import React from 'react';
import { Plus } from 'lucide-react';
import { RecurringTask } from './MeetingModalTypes';
import { RecurringTaskItem } from './RecurringTaskItem';

interface RecurringTasksSectionProps {
  recurringTasks: RecurringTask[];
  recurringTasksCompleted: Record<number, boolean>;
  onToggleRecurringTaskCompleted: (index: number) => void;
  onRecurringTaskNoteChange: (index: number, note: string) => void;
  onRemoveRecurringTask: (index: number) => void;
  onAddManualTask: () => void;
}

export const RecurringTasksSection: React.FC<RecurringTasksSectionProps> = ({
  recurringTasks,
  recurringTasksCompleted,
  onToggleRecurringTaskCompleted,
  onRecurringTaskNoteChange,
  onRemoveRecurringTask,
  onAddManualTask
}) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          🔄 Tareas Recurrentes del Departamento
        </h3>
        <button
          onClick={onAddManualTask}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Plus size={14} />
          Añadir Punto
        </button>
      </div>

      {recurringTasks.length === 0 ? (
        <div style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          No hay tareas recurrentes. Click en "Añadir Punto" para crear una.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          {recurringTasks.map((task, index) => (
            <RecurringTaskItem
              key={index}
              task={task}
              index={index}
              isCompleted={recurringTasksCompleted[index] || false}
              onToggleCompleted={onToggleRecurringTaskCompleted}
              onNoteChange={onRecurringTaskNoteChange}
              onRemove={onRemoveRecurringTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
