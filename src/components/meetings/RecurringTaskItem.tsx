import React from 'react';
import { RecurringTask } from './MeetingModalTypes';
import { RecurringTaskTypeContent } from './RecurringTaskTypeContent';

interface RecurringTaskItemProps {
  task: RecurringTask;
  index: number;
  isCompleted: boolean;
  onToggleCompleted: (index: number) => void;
  onNoteChange: (index: number, note: string) => void;
  onRemove: (index: number) => void;
}

export const RecurringTaskItem: React.FC<RecurringTaskItemProps> = ({
  task,
  index,
  isCompleted,
  onToggleCompleted,
  onNoteChange,
  onRemove
}) => {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1
        }}>
          <input
            type="checkbox"
            checked={isCompleted || false}
            onChange={async () => onToggleCompleted(index)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer'
            }}
          />
          <div style={{
            fontWeight: '600',
            color: '#92400e',
            textDecoration: isCompleted ? 'line-through' : 'none',
            opacity: isCompleted ? 0.6 : 1
          }}>
            {task.titulo}
          </div>
        </div>
        <button
          onClick={async () => onRemove(index)}
          style={{
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
            lineHeight: 1
          }}
          title="Eliminar tarea"
        >
          ×
        </button>
      </div>
      <RecurringTaskTypeContent
        task={task}
        index={index}
        onNoteChange={onNoteChange}
      />
    </div>
  );
};
