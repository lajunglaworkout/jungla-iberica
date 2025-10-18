// src/components/hr/EmployeeChecklistOriginal.tsx - Versión original del checklist
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

interface EmployeeChecklistOriginalProps {
  onBack: () => void;
}

interface ChecklistTask {
  id: string;
  title: string;
  category: 'limpieza' | 'mantenimiento' | 'equipamiento' | 'seguridad' | 'operacional';
  priority: 'baja' | 'media' | 'alta' | 'critica';
  completed: boolean;
  completedAt?: string;
}

const EmployeeChecklistOriginal: React.FC<EmployeeChecklistOriginalProps> = ({ onBack }) => {
  const { employee } = useSession();
  const [tasks, setTasks] = useState<ChecklistTask[]>([
    { id: '1', title: 'Revisión de equipos', category: 'equipamiento', priority: 'alta', completed: false },
    { id: '2', title: 'Limpieza de vestuarios', category: 'limpieza', priority: 'alta', completed: false },
    { id: '3', title: 'Control de temperatura', category: 'mantenimiento', priority: 'media', completed: false },
    { id: '4', title: 'Inventario de productos', category: 'operacional', priority: 'media', completed: false },
    { id: '5', title: 'Seguridad y emergencias', category: 'seguridad', priority: 'critica', completed: false }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : undefined }
        : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>✅ Checklist Diaria</h1>
        </div>

        {/* Progress */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Progreso: {completedCount}/{tasks.length} ({Math.round(progress)}%)</h3>
          <div style={{ backgroundColor: '#e5e7eb', borderRadius: '8px', height: '8px' }}>
            <div style={{ backgroundColor: '#10b981', height: '100%', width: `${progress}%`, borderRadius: '8px' }} />
          </div>
        </div>

        {/* Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map(task => (
            <div key={task.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: task.completed ? '2px solid #10b981' : '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => toggleTask(task.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: task.completed ? '2px solid #10b981' : '2px solid #d1d5db',
                    backgroundColor: task.completed ? '#10b981' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {task.completed && <CheckCircle size={16} color="white" />}
                </button>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: '600',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#6b7280' : '#111827'
                  }}>
                    {task.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                      {task.category}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      backgroundColor: task.priority === 'critica' ? '#fef2f2' : task.priority === 'alta' ? '#fef3c7' : '#f0fdf4',
                      color: task.priority === 'critica' ? '#dc2626' : task.priority === 'alta' ? '#d97706' : '#059669'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                {task.completed && (
                  <div style={{ fontSize: '12px', color: '#10b981' }}>
                    ✓ Completado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeChecklistOriginal;
