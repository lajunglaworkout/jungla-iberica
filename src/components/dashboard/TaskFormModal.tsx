import React, { useState, useEffect } from 'react';
import { Task } from '../../types/dashboard';
import { X, Save, Trash2, Repeat, Calendar as CalendarIcon, Clock, Tag, Flag, MapPin, FileText, User, CheckCircle, ClipboardCheck, Users } from 'lucide-react';
import { 
  DEPARTMENTS, 
  CENTERS, 
  getDepartmentResponsible, 
  createMeetingAlert, 
  getAssignmentResponsible,
  getAvailableAssignmentOptions,
  canUserCreateMeetings,
  AssignmentType 
} from '../../config/departments';

interface TaskFormModalProps {
  task: Partial<Task>;
  isCreatingMeeting?: boolean;
  currentUserEmail?: string;
  onSave: (task: Task) => void;
  onDelete?: () => void;
  onClose: () => void;
  onRecurrenceClick: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  task,
  isCreatingMeeting = false,
  currentUserEmail = 'carlossuarezparra@gmail.com', // Por defecto CEO
  onSave,
  onDelete,
  onClose,
  onRecurrenceClick
}) => {
  const [formData, setFormData] = useState<Partial<Task>>(task);
  
  // Obtener opciones disponibles según el usuario actual
  const availableOptions = getAvailableAssignmentOptions(currentUserEmail);
  const userCanCreateMeetings = canUserCreateMeetings(currentUserEmail);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  // Asegurar que la categoría sea 'meeting' cuando se está creando una reunión
  useEffect(() => {
    if (isCreatingMeeting && formData.category !== 'meeting') {
      setFormData(prev => ({ 
        ...prev, 
        category: 'meeting',
        priority: 'high',
        isRecurring: true,
        meetingType: 'weekly',
        assignmentType: 'corporativo' // Por defecto departamento corporativo
      }));
    }
  }, [isCreatingMeeting, formData.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: formData.id || `task-${Date.now()}`,
      title: formData.title || 'Nueva tarea',
      description: formData.description,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      startTime: formData.startTime || '09:00',
      endTime: formData.endTime,
      isRecurring: formData.isRecurring || false,
      recurrenceRule: formData.recurrenceRule,
      category: formData.category || 'task',
      meetingType: formData.category === 'meeting' ? (formData.meetingType || 'weekly') : undefined,
      department: formData.department, // Mantener compatibilidad hacia atrás
      assignmentType: formData.assignmentType,
      assignmentId: formData.assignmentId,
      priority: formData.priority || 'medium',
      status: formData.status || 'pending',
      assignedTo: formData.assignedTo,
      location: formData.location,
      notes: formData.notes,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: formData.createdBy || 'current-user-id'
    };

    // Si es una reunión y tiene asignación, crear alerta para el responsable
    if (newTask.category === 'meeting' && newTask.assignmentType && newTask.assignmentId) {
      const responsible = getAssignmentResponsible(newTask.assignmentType, newTask.assignmentId);
      
      if (responsible) {
        const alert = {
          id: `meeting-${Date.now()}`,
          title: `Nueva Reunión: ${newTask.title}`,
          description: `Se ha programado una reunión para el ${newTask.startDate} a las ${newTask.startTime}. ${newTask.description ? `Agenda: ${newTask.description}` : ''}`,
          type: 'info' as const,
          priority: 'high' as const,
          createdAt: new Date().toISOString(),
          isRead: false,
          actionRequired: true,
          dueDate: `${newTask.startDate}T${newTask.startTime}:00.000Z`,
          targetEmail: responsible.email,
          targetName: responsible.name,
          assignmentType: newTask.assignmentType,
          assignmentId: newTask.assignmentId
        };
        
        console.log('🔔 Alerta creada para reunión:', alert);
        // TODO: Implementar envío real de alerta
      }
    }

    onSave(newTask);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meeting':
        return <CalendarIcon size={16} />;
      case 'review':
        return <FileText size={16} />;
      case 'audit':
        return <ClipboardCheck size={16} />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  // Verificar permisos para crear reuniones
  if (isCreatingMeeting && !userCanCreateMeetings) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Permisos Insuficientes</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
            <h3>No tienes permisos para crear reuniones</h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Solo los directores de departamento y encargados de centro pueden crear reuniones.
            </p>
            <button className="btn btn-secondary" onClick={onClose}>
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {task.id 
              ? (isCreatingMeeting || task.category === 'meeting' ? 'Editar Reunión' : 'Editar Tarea')
              : (isCreatingMeeting ? 'Nueva Reunión' : 'Nueva Tarea')
            }
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder={isCreatingMeeting || task.category === 'meeting' 
                ? "Nombre de la reunión" 
                : "¿Qué necesitas hacer?"
              }
              required
            />
          </div>

          {(isCreatingMeeting || formData.category === 'meeting') && (
            <>
              <div style={{ 
                padding: '0.75rem', 
                background: '#f0f7ff', 
                borderRadius: '6px', 
                border: '1px solid #1976d2',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CalendarIcon size={16} />
                <span style={{ fontWeight: '500', color: '#1976d2' }}>
                  Esta es una reunión estratégica
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="description">Agenda de la reunión</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Describe los temas a tratar en la reunión..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Selector de tipo de asignación */}
              <div className="form-group">
                <label><Users size={14} /> Asignar reunión a</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="assignmentType"
                      value="corporativo"
                      checked={formData.assignmentType === 'corporativo'}
                      onChange={handleChange}
                    />
                    🏢 Departamento Corporativo
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="assignmentType"
                      value="centro"
                      checked={formData.assignmentType === 'centro'}
                      onChange={handleChange}
                    />
                    🏪 Centro Específico
                  </label>
                </div>

                {/* Selector específico según el tipo */}
                {formData.assignmentType === 'corporativo' && (
                  <select
                    name="assignmentId"
                    value={formData.assignmentId || ''}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Selecciona un departamento</option>
                    {availableOptions.departments.map(dept => (
                      <option key={dept.id} value={dept.name}>
                        {dept.icon} {dept.name}
                      </option>
                    ))}
                  </select>
                )}

                {formData.assignmentType === 'centro' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {availableOptions.centers.map(center => (
                      <div key={center.id}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#374151', 
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {center.icon} {center.name}
                        </div>
                        <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {center.employees
                            .filter(employee => availableOptions.employees.some(availEmp => availEmp.id === employee.id))
                            .map(employee => (
                            <label 
                              key={employee.id}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                cursor: 'pointer',
                                padding: '0.25rem',
                                borderRadius: '4px',
                                backgroundColor: formData.assignmentId === employee.id ? '#f0f9ff' : 'transparent'
                              }}
                            >
                              <input
                                type="radio"
                                name="assignmentId"
                                value={employee.id}
                                checked={formData.assignmentId === employee.id}
                                onChange={handleChange}
                              />
                              <span style={{ fontSize: '0.875rem' }}>
                                <strong>{employee.name}</strong> - {employee.position}
                                {employee.role === 'manager' && <span style={{ color: '#059669' }}> 👨‍💼</span>}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Información del responsable */}
                {formData.assignmentType && formData.assignmentId && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#f0f9ff',
                    borderRadius: '6px',
                    border: '1px solid #0ea5e9',
                    fontSize: '0.875rem'
                  }}>
                    {(() => {
                      const responsible = getAssignmentResponsible(formData.assignmentType, formData.assignmentId);
                      if (!responsible) return null;
                      
                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Users size={16} />
                            <strong>Responsable de la reunión:</strong>
                          </div>
                          <div><strong>Nombre:</strong> {responsible.name}</div>
                          <div><strong>Email:</strong> {responsible.email}</div>
                          <div><strong>Cargo:</strong> {responsible.description}</div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label><CalendarIcon size={14} /> Fecha</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><Clock size={14} /> Hora de inicio</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><Clock size={14} /> Hora de fin (opcional)</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {!isCreatingMeeting && task.category !== 'meeting' && (
            <div className="form-group">
              <label><Tag size={14} /> Categoría</label>
              <div className="category-selector">
                {['task', 'meeting', 'review', 'audit'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-btn ${formData.category === cat ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat as any }))}
                  >
                    {getCategoryIcon(cat)}
                    {cat === 'task' && 'Tarea'}
                    {cat === 'meeting' && 'Reunión'}
                    {cat === 'review' && 'Revisión'}
                    {cat === 'audit' && 'Auditoría'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(isCreatingMeeting || formData.category === 'meeting') && (
            <div className="form-group">
              <label><CalendarIcon size={14} /> Tipo de Reunión</label>
              <div className="meeting-type-selector">
                {['weekly', 'monthly'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`meeting-type-btn ${formData.meetingType === type ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, meetingType: type as 'weekly' | 'monthly' }))}
                  >
                    {type === 'weekly' && '📅 Semanal'}
                    {type === 'monthly' && '🗓️ Mensual'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label><Flag size={14} /> Prioridad</label>
            <div className="priority-selector">
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`priority-btn ${level} ${formData.priority === level ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, priority: level as any }))}
                >
                  {level === 'low' && 'Baja'}
                  {level === 'medium' && 'Media'}
                  {level === 'high' && 'Alta'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label><User size={14} /> Asignar a</label>
            <select
              name="assignedTo"
              value={formData.assignedTo || ''}
              onChange={handleChange}
            >
              <option value="">Yo mismo</option>
              <option value="team1">Equipo de Marketing</option>
              <option value="team2">Equipo de Ventas</option>
              <option value="team3">Equipo de Operaciones</option>
            </select>
          </div>

          <div className="form-group">
            <label><MapPin size={14} /> Ubicación (opcional)</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="Ej: Oficina central, Sala de juntas..."
            />
          </div>

          <div className="form-group">
            <label><FileText size={14} /> Notas (opcional)</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Añade detalles importantes sobre esta tarea..."
            ></textarea>
          </div>

          <div className="form-group">
            <div className="form-check">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring || false}
                onChange={(e) => {
                  const isRecurring = e.target.checked;
                  setFormData(prev => ({
                    ...prev,
                    isRecurring,
                    recurrenceRule: isRecurring 
                      ? (prev.recurrenceRule || { 
                          pattern: 'weekly', 
                          interval: 1,
                          daysOfWeek: [new Date(formData.startDate || new Date()).getDay()]
                        })
                      : undefined
                  }));
                }}
              />
              <label htmlFor="isRecurring">Es una tarea recurrente</label>
              
              {formData.isRecurring && (
                <button 
                  type="button" 
                  className="btn-link"
                  onClick={onRecurrenceClick}
                >
                  <Repeat size={14} /> Configurar recurrencia
                </button>
              )}
            </div>
          </div>

          <div className="modal-actions">
            {onDelete && (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={onDelete}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            )}
            <div className="spacer"></div>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
