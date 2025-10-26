import React, { useState } from 'react';
import { Download, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Task {
  id?: string;
  title: string;
  assignedTo: string | string[];
  deadline: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
}

interface MeetingResultsPanelProps {
  transcript: string;
  minutes: string;
  tasks: Task[];
  meetingTitle: string;
  participants: string[];
  employees: any[];
  onTasksUpdate?: (tasks: Task[]) => void;
  onClose?: () => void;
}

export const MeetingResultsPanel: React.FC<MeetingResultsPanelProps> = ({
  transcript,
  minutes,
  tasks,
  meetingTitle,
  participants,
  employees,
  onTasksUpdate,
  onClose
}) => {
  const [editingTasks, setEditingTasks] = useState<Task[]>(tasks);
  const [isEditing, setIsEditing] = useState(false);

  // Exportar acta como PDF
  const handleExportPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${meetingTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 20px; }
            .section { margin-bottom: 20px; }
            .meta { color: #6b7280; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            pre { background-color: #f9fafb; padding: 12px; border-radius: 6px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>${meetingTitle}</h1>
          <div class="meta">
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            <p><strong>Participantes:</strong> ${participants.join(', ')}</p>
          </div>

          <div class="section">
            <h2>📋 Acta de Reunión</h2>
            <pre>${minutes}</pre>
          </div>

          <div class="section">
            <h2>📝 Transcripción</h2>
            <pre>${transcript}</pre>
          </div>

          <div class="section">
            <h2>✅ Tareas Asignadas</h2>
            <table>
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th>Asignado a</th>
                  <th>Fecha Límite</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                ${editingTasks.map(task => `
                  <tr>
                    <td>${task.title}</td>
                    <td>${task.assignedTo}</td>
                    <td>${task.deadline}</td>
                    <td>${task.priority}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(element.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Guardar reunión en Supabase
  const handleSaveMeeting = async () => {
    try {
      // Guardar tareas en la tabla tareas
      const tasksToSave: any[] = [];
      
      editingTasks.forEach(task => {
        const assignedPeople = Array.isArray(task.assignedTo) 
          ? task.assignedTo 
          : task.assignedTo ? [task.assignedTo] : [];
        
        // Si no hay personas asignadas, no guardar la tarea
        if (assignedPeople.length === 0) {
          console.warn('⚠️ Tarea sin asignar:', task.title);
          return;
        }
        
        // Crear una tarea para cada persona asignada
        assignedPeople.forEach(person => {
          if (person && person.trim()) {
            tasksToSave.push({
              titulo: task.title,
              descripcion: `Acta: ${minutes.substring(0, 200)}...`,
              asignado_a: person.trim(),
              creado_por: 'Sistema',
              prioridad: task.priority || 'media',
              estado: 'pendiente',
              fecha_limite: task.deadline,
              verificacion_requerida: true
            });
          }
        });
      });

      console.log('📝 Tareas a guardar:', tasksToSave);

      if (tasksToSave.length > 0) {
        const { error } = await supabase
          .from('tareas')
          .insert(tasksToSave);

        if (error) {
          console.error('❌ Error guardando tareas:', error);
          alert('Error al guardar las tareas: ' + error.message);
          return;
        }
        console.log('✅ Tareas guardadas correctamente');
      } else {
        console.warn('⚠️ No hay tareas para guardar');
      }

      alert('✅ Reunión y tareas guardadas correctamente');
      onTasksUpdate?.(editingTasks);
      // Cerrar el modal después de guardar
      setTimeout(() => {
        onClose?.();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la reunión');
    }
  };

  const handleTaskChange = (index: number, field: string, value: string) => {
    const updated = [...editingTasks];
    if (field === 'assignedTo' && value.startsWith('[')) {
      // Es un JSON de múltiples asignados
      updated[index] = { ...updated[index], [field]: JSON.parse(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditingTasks(updated);
  };

  const handleRemoveTask = (index: number) => {
    setEditingTasks(editingTasks.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    setEditingTasks([...editingTasks, {
      title: '',
      assignedTo: '',
      deadline: '',
      priority: 'media'
    }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleExportPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Download size={16} />
          Descargar PDF
        </button>

        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isEditing ? '#ef4444' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Edit2 size={16} />
          {isEditing ? 'Cancelar' : 'Editar Tareas'}
        </button>

        {isEditing && (
          <button
            onClick={handleSaveMeeting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Save size={16} />
            Guardar Reunión
          </button>
        )}
      </div>

      {/* Acta */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>📋 Acta de Reunión</h3>
        <pre style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          maxHeight: '300px',
          fontSize: '12px',
          color: '#374151'
        }}>
          {minutes}
        </pre>
      </div>

      {/* Transcripción */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>📝 Transcripción</h3>
        <pre style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          maxHeight: '300px',
          fontSize: '12px',
          color: '#374151'
        }}>
          {transcript}
        </pre>
      </div>

      {/* Tareas */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>✅ Tareas Asignadas ({editingTasks.length})</h3>

        {editingTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6b7280',
            backgroundColor: 'white',
            borderRadius: '6px'
          }}>
            No hay tareas asignadas
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {editingTasks.map((task, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '12px'
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                      placeholder="Título de la tarea"
                      style={{
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        multiple
                        value={Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : [])}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          handleTaskChange(index, 'assignedTo', JSON.stringify(selected));
                        }}
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          minHeight: '80px'
                        }}
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.email}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={task.deadline}
                        onChange={(e) => handleTaskChange(index, 'deadline', e.target.value)}
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        value={task.priority}
                        onChange={(e) => handleTaskChange(index, 'priority', e.target.value as any)}
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                      </select>
                      <button
                        onClick={() => handleRemoveTask(index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                      {task.title}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      <div>
                        👤 {Array.isArray(task.assignedTo) 
                          ? task.assignedTo.join(', ') 
                          : task.assignedTo}
                      </div>
                      <div>📅 {task.deadline}</div>
                      <div>
                        Prioridad:{' '}
                        <span style={{
                          backgroundColor: task.priority === 'critica' ? '#fee2e2' : task.priority === 'alta' ? '#fef3c7' : '#dbeafe',
                          color: task.priority === 'critica' ? '#dc2626' : task.priority === 'alta' ? '#92400e' : '#1e40af',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isEditing && (
          <button
            onClick={handleAddTask}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            <Plus size={14} />
            Añadir Tarea
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingResultsPanel;
