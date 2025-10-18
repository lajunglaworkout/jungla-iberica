// src/components/hr/EmployeeChecklist.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

interface EmployeeChecklistProps {
  onBack: () => void;
  centerMode?: boolean; // Para usar desde tablet del centro
}

interface ChecklistTask {
  id: string;
  title: string;
  category: 'limpieza' | 'mantenimiento' | 'equipamiento' | 'seguridad' | 'operacional';
  priority: 'baja' | 'media' | 'alta' | 'critica';
  completed: boolean;
  completedAt?: string;
  signed: boolean;
  signedBy?: string;
  turn: 'mañana' | 'tarde';
}

const EmployeeChecklist: React.FC<EmployeeChecklistProps> = ({ onBack, centerMode = false }) => {
  // Solo usar useSession si no estamos en modo centro
  let employee = null;
  try {
    if (!centerMode) {
      employee = useSession().employee;
    }
  } catch (error) {
    // Si falla useSession (modo centro), employee queda como null
    console.log('Modo centro: sin acceso a sesión de empleado');
  }
  const [selectedTurn, setSelectedTurn] = useState<'mañana' | 'tarde'>('mañana');
  const [tasks, setTasks] = useState<ChecklistTask[]>([
    // Turno Mañana
    { id: '1m', title: 'Apertura del centro', category: 'operacional', priority: 'critica', completed: false, signed: false, turn: 'mañana' },
    { id: '2m', title: 'Revisión equipos matutina', category: 'equipamiento', priority: 'alta', completed: false, signed: false, turn: 'mañana' },
    { id: '3m', title: 'Limpieza vestuarios mañana', category: 'limpieza', priority: 'alta', completed: false, signed: false, turn: 'mañana' },
    { id: '4m', title: 'Control temperatura inicial', category: 'mantenimiento', priority: 'media', completed: false, signed: false, turn: 'mañana' },
    
    // Turno Tarde
    { id: '1t', title: 'Limpieza profunda tarde', category: 'limpieza', priority: 'alta', completed: false, signed: false, turn: 'tarde' },
    { id: '2t', title: 'Revisión equipos vespertina', category: 'equipamiento', priority: 'alta', completed: false, signed: false, turn: 'tarde' },
    { id: '3t', title: 'Cierre y seguridad', category: 'seguridad', priority: 'critica', completed: false, signed: false, turn: 'tarde' },
    { id: '4t', title: 'Control final temperatura', category: 'mantenimiento', priority: 'media', completed: false, signed: false, turn: 'tarde' }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : undefined }
        : task
    ));
  };

  const filteredTasks = tasks.filter(task => task.turn === selectedTurn);
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const signedCount = filteredTasks.filter(t => t.signed).length;
  const progress = (completedCount / filteredTasks.length) * 100;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>✅ Checklist por Turnos</h1>
        </div>

        {/* Selector de Turnos */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setSelectedTurn('mañana')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: selectedTurn === 'mañana' ? '#fbbf24' : 'white',
              color: selectedTurn === 'mañana' ? 'white' : '#374151',
              border: selectedTurn === 'mañana' ? '2px solid #fbbf24' : '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🌅 Turno Mañana
          </button>
          <button
            onClick={() => setSelectedTurn('tarde')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: selectedTurn === 'tarde' ? '#6366f1' : 'white',
              color: selectedTurn === 'tarde' ? 'white' : '#374151',
              border: selectedTurn === 'tarde' ? '2px solid #6366f1' : '2px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🌙 Turno Tarde
          </button>
        </div>

        {/* Progress */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
            Progreso Turno {selectedTurn === 'mañana' ? '🌅' : '🌙'}: {completedCount}/{filteredTasks.length} completadas ({Math.round(progress)}%)
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
            ✍️ Firmadas: {signedCount}/{filteredTasks.length} • ⏳ Pendientes de firma: {completedCount - signedCount}
          </p>
          <div style={{ backgroundColor: '#e5e7eb', borderRadius: '8px', height: '8px' }}>
            <div style={{ backgroundColor: '#10b981', height: '100%', width: `${progress}%`, borderRadius: '8px' }} />
          </div>
        </div>

        {/* Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.map(task => (
            <div key={task.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: task.signed ? '2px solid #059669' : task.completed ? '2px solid #fbbf24' : '1px solid #e5e7eb'
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
                
                <div style={{ textAlign: 'right' }}>
                  {task.signed ? (
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold' }}>
                      ✍️ Firmado
                      {task.signedBy && <div style={{ fontSize: '10px', color: '#6b7280' }}>por {task.signedBy}</div>}
                    </div>
                  ) : task.completed ? (
                    <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>
                      ⏳ Pendiente de firma
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      ⭕ Pendiente
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeChecklist;
