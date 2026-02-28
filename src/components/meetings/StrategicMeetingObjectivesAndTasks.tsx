/**
 * StrategicMeetingObjectivesAndTasks — paso 3 del wizard: objetivos y tareas.
 * Extraído de StrategicMeetingSystem.tsx.
 */
import React, { useState } from 'react';
import { Target, CheckCircle, Plus, Flag } from 'lucide-react';
import { type MeetingData, type LeadershipMember } from './StrategicMeetingConfig';

interface StrategicMeetingObjectivesAndTasksProps {
  meetingData: MeetingData;
  setMeetingData: React.Dispatch<React.SetStateAction<MeetingData>>;
  realEmployees: LeadershipMember[];
}

const StrategicMeetingObjectivesAndTasks: React.FC<StrategicMeetingObjectivesAndTasksProps> = ({
  meetingData,
  setMeetingData,
  realEmployees,
}) => {
  const [newObjective, setNewObjective] = useState('');
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', deadline: '', priority: 'media' });

  const addObjective = () => {
    if (newObjective.trim()) {
      setMeetingData(prev => ({
        ...prev,
        objectives: [...prev.objectives, { id: Date.now(), title: newObjective, status: 'pending' }],
      }));
      setNewObjective('');
    }
  };

  const addTask = () => {
    if (newTask.title.trim() && newTask.assignedTo && newTask.deadline) {
      setMeetingData(prev => ({
        ...prev,
        tasks: [...prev.tasks, { id: Date.now(), ...newTask }],
      }));
      setNewTask({ title: '', assignedTo: '', deadline: '', priority: 'media' });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Objetivos y Tareas
        </h2>
        <p style={{ color: '#6b7280' }}>Define los objetivos a alcanzar y las tareas específicas</p>
      </div>

      {/* Objetivos */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Target style={{ height: '20px', width: '20px', color: '#059669' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Objetivos Estratégicos</h3>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="Ej: Aumentar retención de clientes en un 15%"
            style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            onKeyPress={(e) => e.key === 'Enter' && addObjective()}
          />
          <button
            onClick={addObjective}
            style={{ padding: '12px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {meetingData.objectives.map((objective, index) => (
            <div key={objective.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>{index + 1}.</span>
              <span style={{ flex: 1, fontSize: '14px', color: '#111827' }}>{objective.title}</span>
              <button
                onClick={() => setMeetingData(prev => ({ ...prev, objectives: prev.objectives.filter(obj => obj.id !== objective.id) }))}
                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tareas */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle style={{ height: '20px', width: '20px', color: '#059669' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Tareas Específicas</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título de la tarea"
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
          <select
            value={newTask.assignedTo}
            onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">Asignar a...</option>
            {realEmployees.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            min={new Date().toISOString().split('T')[0]}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
              style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
            <button
              onClick={addTask}
              style={{ padding: '10px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {meetingData.tasks.map((task) => (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <Flag style={{
                height: '16px', width: '16px',
                color: task.priority === 'critica' ? '#ef4444' : task.priority === 'alta' ? '#f97316' : task.priority === 'media' ? '#f59e0b' : '#6b7280',
              }} />
              <span style={{ flex: 1, fontSize: '14px', color: '#111827' }}>{task.title}</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {realEmployees.find(m => m.id === task.assignedTo)?.name}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {new Date(task.deadline).toLocaleDateString('es-ES')}
              </span>
              <button
                onClick={() => setMeetingData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== task.id) }))}
                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategicMeetingObjectivesAndTasks;
