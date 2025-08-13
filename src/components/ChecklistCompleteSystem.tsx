import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, AlertTriangle, Clock, Camera, Upload, MessageSquare,
  Wrench, Package, Droplets, Zap, Thermometer, DollarSign, Users,
  MapPin, Calendar, User, Loader2, X, Send, Eye, Plus, Edit,
  BarChart3, TrendingUp, Activity, Filter, Search, Download,
  Settings, Bell, Menu, ChevronRight, Star, Award, Target,
  Home, Building2, UserCheck, ClipboardList, FileText, Smartphone
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';

// ====== INTERFACES ======
interface DailyChecklist {
  id?: string;
  fecha: string;
  centro_id: string;
  empleado_id: string;
  turno: 'apertura' | 'tarde' | 'cierre';
  tareas: ChecklistTask[];
  estado: 'pendiente' | 'en_progreso' | 'completado';
  created_at?: string;
  updated_at?: string;
}

interface ChecklistTask {
  id?: string;
  categoria: string;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'completado' | 'incidencia';
  tiene_incidencia: boolean;
  incidencia?: OperationalIncident;
  orden: number;
  tipo?: 'apertura' | 'limpieza' | 'cierre' | 'mantenimiento';
  verificado_por?: string;
  fecha_verificacion?: string;
  notas?: string;
}

interface OperationalIncident {
  id?: string;
  tipo: 'falta_producto' | 'equipo_averiado' | 'limpieza_deficiente' | 'problema_personal' | 'otro';
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'abierta' | 'en_proceso' | 'resuelta';
  fotos?: string[];
  reportado_por: string;
  asignado_a?: string;
  fecha_reporte: string;
  fecha_resolucion?: string;
  acciones_tomadas?: string;
  checklist_id?: string;
  tarea_id?: string;
}

// ====== DATOS DE CONFIGURACIÓN ======
const INCIDENT_TYPES = {
  falta_producto: { label: 'Falta de Producto', color: '#ef4444', icon: Package },
  equipo_averiado: { label: 'Equipo Averiado', color: '#f59e0b', icon: Wrench },
  limpieza_deficiente: { label: 'Limpieza Deficiente', color: '#3b82f6', icon: Droplets },
  problema_personal: { label: 'Problema con Personal', color: '#8b5cf6', icon: Users },
  otro: { label: 'Otro', color: '#6b7280', icon: AlertTriangle }
};

// ====== TAREAS POR DEFECTO ======
const getDefaultTasks = (turno: 'apertura' | 'tarde' | 'cierre'): ChecklistTask[] => {
  const tareas: { [key: string]: ChecklistTask[] } = {
    apertura: [
      // Sistema y Seguridad
      { categoria: 'Sistema y Seguridad', titulo: 'Desactivar alarma', orden: 1, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Encender luces generales', orden: 2, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Revisar cámaras de seguridad', orden: 3, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Abrir puertas de emergencia', orden: 4, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      
      // Equipamiento
      { categoria: 'Equipamiento', titulo: 'Encender sistema de sonido', orden: 5, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Equipamiento', titulo: 'Revisar equipos de cardio', orden: 6, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Equipamiento', titulo: 'Comprobar máquinas de musculación', orden: 7, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Equipamiento', titulo: 'Verificar funcionamiento de aire acondicionado', orden: 8, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      
      // Limpieza
      { categoria: 'Limpieza', titulo: 'Limpiar área de recepción', orden: 9, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza', titulo: 'Desinfectar vestuarios', orden: 10, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza', titulo: 'Limpiar espejos', orden: 11, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza', titulo: 'Reponer papel y jabón en baños', orden: 12, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      
      // Administrativo
      { categoria: 'Administrativo', titulo: 'Revisar reservas del día', orden: 13, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Administrativo', titulo: 'Preparar caja registradora', orden: 14, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Administrativo', titulo: 'Actualizar pizarra de clases', orden: 15, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false }
    ],
    tarde: [
      // Limpieza
      { categoria: 'Limpieza', titulo: 'Limpiar y desinfectar equipos', orden: 1, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza', titulo: 'Vaciar papeleras', orden: 2, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza', titulo: 'Limpiar vestuarios (revisión)', orden: 3, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza', titulo: 'Reponer toallas limpias', orden: 4, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      
      // Mantenimiento
      { categoria: 'Mantenimiento', titulo: 'Revisar nivel de cloro en piscina', orden: 5, tipo: 'mantenimiento', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Mantenimiento', titulo: 'Comprobar temperatura del agua', orden: 6, tipo: 'mantenimiento', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Mantenimiento', titulo: 'Lubricar máquinas (si aplica)', orden: 7, tipo: 'mantenimiento', estado: 'pendiente', tiene_incidencia: false },
      
      // Atención al Cliente
      { categoria: 'Atención al Cliente', titulo: 'Seguimiento de nuevos socios', orden: 8, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Atención al Cliente', titulo: 'Revisar libro de sugerencias', orden: 9, tipo: 'apertura', estado: 'pendiente', tiene_incidencia: false }
    ],
    cierre: [
      // Limpieza Final
      { categoria: 'Limpieza Final', titulo: 'Limpieza profunda de baños', orden: 1, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza Final', titulo: 'Aspirar y fregar suelos', orden: 2, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza Final', titulo: 'Desinfectar todos los equipos', orden: 3, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Limpieza Final', titulo: 'Limpiar y ordenar zona de pesas', orden: 4, tipo: 'limpieza', estado: 'pendiente', tiene_incidencia: false },
      
      // Sistema y Seguridad
      { categoria: 'Sistema y Seguridad', titulo: 'Apagar equipos de cardio', orden: 5, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Apagar sistema de sonido', orden: 6, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Cerrar ventanas', orden: 7, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Apagar luces', orden: 8, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Activar alarma', orden: 9, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Sistema y Seguridad', titulo: 'Cerrar con llave', orden: 10, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      
      // Administrativo
      { categoria: 'Administrativo', titulo: 'Cuadre de caja', orden: 11, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Administrativo', titulo: 'Backup del sistema', orden: 12, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false },
      { categoria: 'Administrativo', titulo: 'Preparar informe del día', orden: 13, tipo: 'cierre', estado: 'pendiente', tiene_incidencia: false }
    ]
  };
  
  return tareas[turno] || [];
};

// ====== COMPONENTES ======

// Modal para crear incidencias
const CreateIncidentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  task: ChecklistTask;
  checklist: DailyChecklist | null;
  onSave: (incidentData: any) => void;
}> = ({ isOpen, onClose, task, checklist, onSave }) => {
  const [formData, setFormData] = useState<OperationalIncident>({
    tipo: 'otro',
    descripcion: '',
    prioridad: 'media',
    estado: 'abierta',
    fotos: [],
    reportado_por: '',
    fecha_reporte: new Date().toISOString(),
    checklist_id: checklist?.id,
    tarea_id: task.id
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.descripcion.trim()) {
      alert('Por favor describe la incidencia');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Aquí iría la lógica para subir imágenes a Supabase Storage
      // y obtener las URLs
      
      await onSave({
        ...formData,
        fotos: imagePreviews // Por ahora usamos los previews
      });
      
      onClose();
    } catch (error) {
      console.error('Error al guardar incidencia:', error);
      alert('Error al guardar la incidencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            Reportar Incidencia
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Tarea: <strong>{task.titulo}</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Categoría: <strong>{task.categoria}</strong>
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Tipo de Incidencia
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              tipo: e.target.value as OperationalIncident['tipo']
            }))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            {Object.entries(INCIDENT_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Describe detalladamente la incidencia..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Prioridad
          </label>
          <select
            value={formData.prioridad}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              prioridad: e.target.value as OperationalIncident['prioridad']
            }))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Fotos (opcional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Camera size={16} />
            Añadir Fotos
          </button>
          
          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={preview} 
                    alt={`Preview ${index}`}
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.descripcion.trim()}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: isSubmitting ? '#9ca3af' : '#dc2626',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Guardando...
              </>
            ) : (
              <>
                <Send size={16} />
                Reportar Incidencia
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de tarea individual
const TaskItem: React.FC<{
  task: ChecklistTask;
  onToggle: () => void;
  onCreateIncident: () => void;
  isCleaningTask?: boolean;
}> = ({ task, onToggle, onCreateIncident, isCleaningTask = false }) => {
  const getStatusColor = () => {
    if (task.estado === 'completado') return '#10b981';
    if (task.tiene_incidencia) return '#ef4444';
    return '#6b7280';
  };

  const getStatusIcon = () => {
    if (task.estado === 'completado') return <CheckCircle size={20} />;
    if (task.tiene_incidencia) return <AlertTriangle size={20} />;
    return <Clock size={20} />;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '8px',
      marginBottom: '8px',
      border: `1px solid ${getStatusColor()}20`
    }}>
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginRight: '12px',
          color: getStatusColor()
        }}
      >
        {getStatusIcon()}
      </button>
      
      <div style={{ flex: 1 }}>
        <p style={{ 
          margin: 0, 
          fontSize: '14px',
          textDecoration: task.estado === 'completado' ? 'line-through' : 'none',
          color: task.estado === 'completado' ? '#9ca3af' : '#1f2937'
        }}>
          {task.titulo}
        </p>
        {task.descripcion && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            {task.descripcion}
          </p>
        )}
        {task.tiene_incidencia && task.incidencia && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#fef2f2',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <p style={{ margin: 0, color: '#dc2626', fontWeight: '500' }}>
              Incidencia: {INCIDENT_TYPES[task.incidencia.tipo]?.label}
            </p>
            <p style={{ margin: '4px 0 0 0', color: '#7f1d1d' }}>
              {task.incidencia.descripcion}
            </p>
          </div>
        )}
      </div>
      
      {!isCleaningTask && task.estado !== 'completado' && (
        <button
          onClick={onCreateIncident}
          style={{
            padding: '6px 12px',
            backgroundColor: task.tiene_incidencia ? '#fef2f2' : '#fff7ed',
            color: task.tiene_incidencia ? '#dc2626' : '#ea580c',
            border: `1px solid ${task.tiene_incidencia ? '#fca5a5' : '#fed7aa'}`,
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertTriangle size={14} />
          {task.tiene_incidencia ? 'Ver' : 'Reportar'}
        </button>
      )}
    </div>
  );
};

// Componente de sección del checklist
const ChecklistSection: React.FC<{
  titulo: string;
  tareas: ChecklistTask[];
  onTaskToggle: (taskId: string) => void;
  onCreateIncident: (task: ChecklistTask) => void;
  color?: string;
  isCleaningSection?: boolean;
}> = ({ titulo, tareas, onTaskToggle, onCreateIncident, color = '#3b82f6', isCleaningSection = false }) => {
  const completadas = tareas.filter(t => t.estado === 'completado').length;
  const total = tareas.length;
  const porcentaje = total > 0 ? (completadas / total) * 100 : 0;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `2px solid ${color}20`
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
          {titulo}
        </h3>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {completadas} de {total} completadas
            </span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: color }}>
              {porcentaje.toFixed(0)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${porcentaje}%`,
              height: '100%',
              backgroundColor: color,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
      
      <div>
        {tareas.map((tarea) => (
          <TaskItem
            key={tarea.id || `${tarea.categoria}-${tarea.orden}`}
            task={tarea}
            onToggle={() => onTaskToggle(tarea.id || `${tarea.categoria}-${tarea.orden}`)}
            onCreateIncident={() => onCreateIncident(tarea)}
            isCleaningTask={isCleaningSection}
          />
        ))}
      </div>
    </div>
  );
};

// ====== COMPONENTE PRINCIPAL ======
const ChecklistCompleteSystem: React.FC = () => {
  // Estados
  const { employee, userRole } = useSession();
  const [selectedShift, setSelectedShift] = useState<'apertura' | 'tarde' | 'cierre'>('apertura');
  const [checklist, setChecklist] = useState<DailyChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ChecklistTask | null>(null);
  const [centros, setCentros] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [employee, selectedShift]);

  const loadInitialData = async () => {
    if (!employee) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Cargar o crear checklist del día
      const today = new Date().toISOString().split('T')[0];
      
      // Intentar cargar checklist existente
      const { data: existingChecklist, error: checklistError } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('fecha', today)
        .eq('empleado_id', employee.id)
        .eq('turno', selectedShift)
        .single();

      if (existingChecklist) {
        setChecklist(existingChecklist);
      } else {
        // Crear nuevo checklist
        const newChecklist: DailyChecklist = {
          fecha: today,
          centro_id: employee.center_id || '',
          empleado_id: employee.id || '',
          turno: selectedShift,
          tareas: getDefaultTasks(selectedShift),
          estado: 'pendiente'
        };
        
        const { data: createdChecklist, error: createError } = await supabase
          .from('daily_checklists')
          .insert([newChecklist])
          .select()
          .single();

        if (createdChecklist) {
          setChecklist(createdChecklist);
        }
      }

      // Cargar centros
      const { data: centrosData } = await supabase
        .from('centros')
        .select('*')
        .order('nombre');
      
      if (centrosData) {
        setCentros(centrosData);
      }

      // Cargar empleados
      const { data: empleadosData } = await supabase
        .from('empleados')
        .select('*')
        .order('nombre');
      
      if (empleadosData) {
        setEmpleados(empleadosData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de estado de tarea
  const handleTaskToggle = (taskId: string) => {
    if (!checklist) return;

    setChecklist(prev => {
      if (!prev) return null;
      
      const updatedTareas = prev.tareas.map(tarea => {
        const tareaKey = tarea.id || `${tarea.categoria}-${tarea.orden}`;
        if (tareaKey === taskId) {
          return {
            ...tarea,
            estado: (tarea.estado === 'completado' ? 'pendiente' : 'completado') as 'pendiente' | 'completado' | 'incidencia'
          };
        }
        return tarea;
      });

      // Actualizar en la base de datos
      const checklistToUpdate = { ...prev, tareas: updatedTareas };
      updateChecklistInDB(checklistToUpdate);
      
      return checklistToUpdate;
    });
  };

  // Actualizar checklist en la base de datos
  const updateChecklistInDB = async (updatedChecklist: DailyChecklist) => {
    if (!updatedChecklist.id) return;

    try {
      await supabase
        .from('daily_checklists')
        .update({
          tareas: updatedChecklist.tareas,
          estado: getChecklistStatus(updatedChecklist.tareas),
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedChecklist.id);
    } catch (error) {
      console.error('Error actualizando checklist:', error);
    }
  };

  // Obtener estado del checklist basado en las tareas
  const getChecklistStatus = (tareas: ChecklistTask[]): 'pendiente' | 'en_progreso' | 'completado' => {
    const completadas = tareas.filter(t => t.estado === 'completado').length;
    const total = tareas.length;
    
    if (completadas === 0) return 'pendiente';
    if (completadas === total) return 'completado';
    return 'en_progreso';
  };

  // Manejar creación de incidencia
  const handleCreateIncident = (task: ChecklistTask) => {
    setSelectedTask(task);
    setShowIncidentModal(true);
  };

  // Guardar incidencia
  const handleSaveIncident = async (incidentData: OperationalIncident) => {
    if (!checklist || !selectedTask) return;

    // Actualizar la tarea con la incidencia
    setChecklist(prev => {
      if (!prev) return null;
      
      const updatedTareas = prev.tareas.map(tarea => {
        const tareaKey = tarea.id || `${tarea.categoria}-${tarea.orden}`;
        const selectedKey = selectedTask.id || `${selectedTask.categoria}-${selectedTask.orden}`;
        
        if (tareaKey === selectedKey) {
          return {
            ...tarea,
            tiene_incidencia: true,
            incidencia: incidentData,
            estado: 'incidencia' as const
          };
        }
        return tarea;
      });

      // Actualizar en la base de datos
      const checklistToUpdate = { ...prev, tareas: updatedTareas };
      updateChecklistInDB(checklistToUpdate);
      
      return checklistToUpdate;
    });

    // Guardar incidencia en la base de datos
    try {
      await supabase
        .from('operational_incidents')
        .insert([incidentData]);
    } catch (error) {
      console.error('Error guardando incidencia:', error);
    }
  };

  // Obtener tareas por categoría
  const getTasksByCategory = (categoria: string) => {
    return checklist?.tareas.filter(t => t.categoria === categoria) || [];
  };

  // Obtener icono del turno
  const getTurnoIcon = (turno: string) => {
    switch (turno) {
      case 'apertura': return '🌅';
      case 'tarde': return '☀️';
      case 'cierre': return '🌙';
      default: return '📋';
    }
  };

  // Obtener label del turno
  const getTurnoLabel = (turno: string) => {
    switch (turno) {
      case 'apertura': return 'Apertura';
      case 'tarde': return 'Tarde';
      case 'cierre': return 'Cierre';
      default: return turno;
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
        <p>No se pudo cargar la información del empleado</p>
      </div>
    );
  }

  const session = { user: { user_metadata: { role: userRole } } };
  const roleName = typeof userRole === 'string' 
    ? userRole 
    : (userRole && typeof userRole === 'object' && 'name' in userRole) 
      ? (userRole as { name: string }).name 
      : '';

  // Render principal
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                <ClipboardList className="inline mr-2" />
                Checklist Diario
              </h1>
              <p style={{ color: '#6b7280' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Empleado</p>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{employee.nombre}</p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>{roleName}</p>
            </div>
          </div>
        </div>

        {/* Selector de turno */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '12px' }}>
            Selecciona el turno:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {(['apertura', 'tarde', 'cierre'] as const).map((turno) => (
              <button
                key={turno}
                onClick={() => setSelectedShift(turno)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: selectedShift === turno ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  backgroundColor: selectedShift === turno ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{getTurnoIcon(turno)}</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: selectedShift === turno ? '#3b82f6' : '#6b7280' }}>
                  {getTurnoLabel(turno)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Secciones del checklist */}
        {selectedShift === 'apertura' && (
          <>
            <ChecklistSection
              titulo="Sistema y Seguridad"
              tareas={getTasksByCategory('Sistema y Seguridad')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#ef4444"
            />
            <ChecklistSection
              titulo="Equipamiento"
              tareas={getTasksByCategory('Equipamiento')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#f59e0b"
            />
            <ChecklistSection
              titulo="Limpieza"
              tareas={getTasksByCategory('Limpieza')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#3b82f6"
              isCleaningSection={true}
            />
            <ChecklistSection
              titulo="Administrativo"
              tareas={getTasksByCategory('Administrativo')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#8b5cf6"
            />
          </>
        )}

        {selectedShift === 'tarde' && (
          <>
            <ChecklistSection
              titulo="Limpieza"
              tareas={getTasksByCategory('Limpieza')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#3b82f6"
              isCleaningSection={true}
            />
            <ChecklistSection
              titulo="Mantenimiento"
              tareas={getTasksByCategory('Mantenimiento')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#f59e0b"
            />
            <ChecklistSection
              titulo="Atención al Cliente"
              tareas={getTasksByCategory('Atención al Cliente')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#10b981"
            />
          </>
        )}

        {selectedShift === 'cierre' && (
          <>
            <ChecklistSection
              titulo="Limpieza Final"
              tareas={getTasksByCategory('Limpieza Final')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#3b82f6"
              isCleaningSection={true}
            />
            <ChecklistSection
              titulo="Sistema y Seguridad"
              tareas={getTasksByCategory('Sistema y Seguridad')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#ef4444"
            />
            <ChecklistSection
              titulo="Administrativo"
              tareas={getTasksByCategory('Administrativo')}
              onTaskToggle={handleTaskToggle}
              onCreateIncident={handleCreateIncident}
              color="#8b5cf6"
            />
          </>
        )}

        {/* Botón de enviar/completar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          {checklist && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                Progreso del checklist
              </p>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {checklist.tareas.filter(t => t.estado === 'completado').length} / {checklist.tareas.length}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                tareas completadas
              </p>
            </div>
          )}
          
          <button
            onClick={() => alert('Checklist enviado correctamente')}
            disabled={!checklist || checklist.tareas.filter(t => t.estado === 'completado').length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: checklist && checklist.tareas.filter(t => t.estado === 'completado').length > 0 ? '#10b981' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: checklist && checklist.tareas.filter(t => t.estado === 'completado').length > 0 ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send size={20} />
            {checklist && checklist.tareas.every(t => t.estado === 'completado') 
              ? 'Completar Checklist' 
              : 'Enviar Progreso'}
          </button>
        </div>

        {/* Modal de completado */}
        {checklist && checklist.tareas.every(t => t.estado === 'completado') && (
          <div style={{
            backgroundColor: '#dcfce7',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '16px',
            textAlign: 'center',
            border: '2px solid #86efac'
          }}>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>
              ¡Excelente trabajo!
            </h3>
            <p style={{ color: '#166534' }}>
              Has completado todas las tareas del turno de {getTurnoLabel(selectedShift)}
            </p>
          </div>
        )}
      </div>

      {/* Modal de incidencias */}
      {showIncidentModal && selectedTask && (
        <CreateIncidentModal
          isOpen={showIncidentModal}
          onClose={() => {
            setShowIncidentModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          checklist={checklist}
          onSave={handleSaveIncident}
        />
      )}
    </div>
  );
};

// Export
export default ChecklistCompleteSystem;