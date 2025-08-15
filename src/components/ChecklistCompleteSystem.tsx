import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';

// Interfaces para tipos de datos
interface Task {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  completado: boolean;
  responsable?: string;
}

interface ChecklistData {
  apertura: Task[];
  limpieza: Task[];
  cierre: Task[];
  incidencias: any[];
}

interface ChecklistCompleteSystemProps {
  centerId?: string;
  centerName?: string;
}

const ChecklistCompleteSystem: React.FC<ChecklistCompleteSystemProps> = ({ centerId, centerName }) => {
  const { employee, userRole } = useSession();
  
  // ESTRUCTURA CORRECTA DE DATOS CON TIPOS
  const [checklist, setChecklist] = useState<ChecklistData>({
    apertura: [],
    limpieza: [],
    cierre: [],
    incidencias: []
  });
  
  const [loading, setLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedTaskForIncident, setSelectedTaskForIncident] = useState<Task | null>(null);
  const [observaciones, setObservaciones] = useState('');
  
  // Estados para firmas digitales
  const [firmaApertura, setFirmaApertura] = useState({
    empleadoId: null,
    empleadoNombre: '',
    hora: null,
    firmado: false
  });
  
  const [firmaCierre, setFirmaCierre] = useState({
    empleadoId: null,
    empleadoNombre: '',
    hora: null,
    firmado: false
  });

  // TAREAS REALES DE LA JUNGLA
  const getDefaultTasks = (): ChecklistData => {
    return {
      apertura: [
        {
          id: 'ap1',
          titulo: 'Avisar apertura vía WhatsApp',
          descripcion: 'Enviar mensaje de apertura del centro para que quede constancia',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap2',
          titulo: 'Encender pantallas y equipo de música',
          descripcion: 'Activar todas las pantallas necesarias para el entrenamiento y el sistema de audio',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap3',
          titulo: 'Vuelta de reconocimiento de instalaciones',
          descripcion: 'Revisar rápidamente todas las instalaciones del centro',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap4',
          titulo: 'Revisar preparación de sala y pizarras',
          descripcion: 'Comprobar que la sala está preparada para el entrenamiento del día y las pizarras están actualizadas',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap5',
          titulo: 'Apertura de puertas y portón principal',
          descripcion: 'Abrir las puertas para la llegada de clientes (lluvia o frío solo puerta pequeña)',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap6',
          titulo: 'Actualizar listado de pagos',
          descripcion: 'Actualizar el listado de pagos realizados durante la jornada',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap7',
          titulo: 'Comprobar máquina de agua',
          descripcion: 'Verificar capacidad de la máquina de agua y recargar si es necesario',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap8',
          titulo: 'Revisión de baños',
          descripcion: 'Retirar bolsas de basura, comprobar grifos cerrados, dejar puertas abiertas para ventilación',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap9',
          titulo: 'Encender aire central',
          descripcion: 'Activar el aire central si es necesario o si los clientes lo solicitan',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap10',
          titulo: 'Activar música',
          descripcion: 'Poner música ambiental para el centro',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ap11',
          titulo: 'Preparar zona funcional y calistenia',
          descripcion: 'A la llegada del segundo entrenador, preparar la zona para funcional y calistenia',
          estado: 'pendiente',
          completado: false
        }
      ],
      limpieza: [
        {
          id: 'lz1',
          titulo: 'Zona 1 - Caucho t.inf',
          responsable: '',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'lz2',
          titulo: 'Zona 2 - Cubo lima',
          responsable: '',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'lz3',
          titulo: 'Zona 3 - Interior barras',
          responsable: '',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'lz4',
          titulo: 'Zona 4 - Cubo negro',
          responsable: '',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'lz5',
          titulo: 'Zona 5 - Recepción / Entrada',
          responsable: '',
          estado: 'pendiente',
          completado: false
        }
      ],
      cierre: [
        {
          id: 'ci1',
          titulo: 'Redactar entrenamiento del día siguiente',
          descripcion: 'Escribir en las pizarras el entrenamiento para el día siguiente',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci2',
          titulo: 'Montaje de zonas de entrenamiento',
          descripcion: 'Montar las zonas según los bloques dispuestos en la pizarra',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci3',
          titulo: 'Recogida de material',
          descripcion: 'Recoger material tanto en zona interior como exterior',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci4',
          titulo: 'Actualizar listado de pagos',
          descripcion: 'Actualizar pagos realizados durante la jornada',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci5',
          titulo: 'Comprobar máquina de agua',
          descripcion: 'Verificar capacidad y recargar si es necesario',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci6',
          titulo: 'Revisión de baños',
          descripcion: 'Retirar basura, comprobar grifos, dejar puertas abiertas',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci7',
          titulo: 'Revisión de duchas',
          descripcion: 'Comprobar anomalías, que no quede nadie, secar exceso de agua',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci8',
          titulo: 'Vuelta de reconocimiento final',
          descripcion: 'No dejar desechos (agua, papeles, prendas). Recepción y sala despejados',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci9',
          titulo: 'Apagar material electrónico',
          descripcion: 'Apagar todo excepto luces exteriores y cuadro de luz',
          estado: 'pendiente',
          completado: false
        },
        {
          id: 'ci10',
          titulo: 'Cerrar centro y tirar basura',
          descripcion: 'Asegurar correcto cierre del centro y tirar la basura',
          estado: 'pendiente',
          completado: false
        }
      ],
      incidencias: []
    };
  };

  // Cargar tareas por defecto SI no hay checklist previo
  useEffect(() => {
    loadInitialData();
  }, [centerId]);

  const loadInitialData = async () => {
    console.log('📋 Cargando checklist para centro:', centerName, centerId);
    
    // Intentar cargar de BD
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('daily_checklists')
      .select('*')
      .eq('center_id', centerId)
      .eq('date', today)
      .single();

    if (existing && existing.tasks) {
      try {
        const parsedTasks = typeof existing.tasks === 'string' ? JSON.parse(existing.tasks) : existing.tasks;
        setChecklist(parsedTasks);
        console.log('✅ Checklist cargado desde BD:', parsedTasks);
      } catch (e) {
        console.log('⚠️ Error parseando tareas, usando por defecto');
        const defaultTasks = getDefaultTasks();
        setChecklist(defaultTasks);
      }
    } else {
      // IMPORTANTE: Cargar las tareas por defecto
      const defaultTasks = getDefaultTasks();
      console.log('📝 Cargando tareas por defecto:', defaultTasks);
      setChecklist(defaultTasks);
    }
    setLoading(false);
  };

  // Función para marcar/desmarcar tarea
  const handleToggleTask = (seccion: keyof ChecklistData, tareaId: string) => {
    console.log('✅ Cambiando estado de tarea:', seccion, tareaId);
    
    setChecklist(prev => ({
      ...prev,
      [seccion]: (prev[seccion] as Task[]).map(tarea => 
        tarea.id === tareaId 
          ? { ...tarea, completado: !tarea.completado, estado: !tarea.completado ? 'completado' : 'pendiente' }
          : tarea
      )
    }));

    // Auto-guardar en BD
    updateChecklistInDB();
  };

  // Función para reportar incidencia
  const handleReportIncident = (tarea: Task) => {
    setSelectedTaskForIncident(tarea);
    setShowIncidentModal(true);
  };

  // Función para asignar responsable
  const handleAssignResponsable = (tareaId: string, responsable: string) => {
    setChecklist(prev => ({
      ...prev,
      limpieza: prev.limpieza.map(tarea => 
        tarea.id === tareaId 
          ? { ...tarea, responsable }
          : tarea
      )
    }));
  };

  // Auto-guardar en BD
  const updateChecklistInDB = async () => {
    console.log('💾 Auto-guardando checklist...');
    // Implementar guardado en Supabase aquí
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('daily_checklists')
        .upsert({
          center_id: centerId,
          date: today,
          employee_id: employee?.id,
          tasks: JSON.stringify(checklist),
          status: 'en_progreso',
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('❌ Error guardando:', error);
      } else {
        console.log('✅ Checklist guardado');
      }
    } catch (error) {
      console.error('❌ Error en updateChecklistInDB:', error);
    }
  };

  // RENDERIZADO CORRECTO de las tareas
  const renderTasks = (tasks: Task[], section: string) => {
    console.log('🔍 Renderizando tareas:', section, tasks?.length);
    
    if (!tasks || tasks.length === 0) {
      return <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No hay tareas en esta sección</p>;
    }

    return tasks.map((tarea: Task, index: number) => (
      <div key={tarea.id || index} style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px',
        backgroundColor: tarea.completado ? '#f0fdf4' : 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '8px'
      }}>
        <input
          type="checkbox"
          checked={tarea.completado || false}
          onChange={() => handleToggleTask(section as keyof ChecklistData, tarea.id)}
          style={{
            width: '20px',
            height: '20px',
            marginRight: '12px',
            cursor: 'pointer'
          }}
        />
        
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontWeight: '500',
            textDecoration: tarea.completado ? 'line-through' : 'none',
            color: tarea.completado ? '#6b7280' : '#111827',
            margin: '0 0 4px 0'
          }}>
            {index + 1}. {tarea.titulo}
          </p>
          {tarea.descripcion && (
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: '0 0 8px 0'
            }}>
              {tarea.descripcion}
            </p>
          )}
          
          {/* Campo de responsable para limpieza */}
          {section === 'limpieza' && (
            <input
              type="text"
              placeholder="Nombre del responsable"
              value={tarea.responsable || ''}
              onChange={(e) => handleAssignResponsable(tarea.id, e.target.value)}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                width: '200px'
              }}
            />
          )}
        </div>

        {/* Botón de reportar incidencia */}
        <button
          onClick={() => handleReportIncident(tarea)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '8px'
          }}
        >
          ⚠️ Reportar
        </button>
      </div>
    ));
  };

  const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  // Debug logs
  console.log('Estado del checklist:', checklist);
  console.log('Tareas apertura:', checklist.apertura?.length);
  console.log('Tareas limpieza:', checklist.limpieza?.length);
  console.log('Tareas cierre:', checklist.cierre?.length);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ height: '48px', width: '48px', animation: 'spin 1s linear infinite', color: '#059669' }} />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando checklist...</p>
        </div>
      )}

      {!employee && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626', fontSize: '18px' }}>No hay sesión de empleado activa</p>
        </div>
      )}

      {employee && !loading && (
        <>
          {/* Header */}
          <div style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>📋 Hoja de Tareas Diarias - {centerName}</h1>
            <p style={{ fontSize: '18px', margin: '0', opacity: 0.9 }}>📅 Fecha: {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p style={{ fontSize: '16px', margin: '8px 0 0 0', opacity: 0.8 }}>👤 Empleado: {employee?.name || 'No identificado'}</p>
          </div>

          {/* SECCIÓN APERTURA */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              color: '#059669', 
              borderBottom: '2px solid #059669', 
              paddingBottom: '8px',
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              📂 APERTURA
            </h2>
            {renderTasks(checklist.apertura, 'apertura')}
            
            {/* Botón de firma apertura */}
            <div style={{ marginTop: '16px' }}>
              <button style={buttonStyle}>
                ✍️ Firmar Apertura
              </button>
            </div>
          </div>

          {/* SECCIÓN LIMPIEZA */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              color: '#059669', 
              borderBottom: '2px solid #059669', 
              paddingBottom: '8px',
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              🧹 LIMPIEZA DE ZONAS
            </h2>
            {renderTasks(checklist.limpieza, 'limpieza')}
          </div>

          {/* SECCIÓN CIERRE */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              color: '#059669', 
              borderBottom: '2px solid #059669', 
              paddingBottom: '8px',
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              🔒 CIERRE
            </h2>
            {renderTasks(checklist.cierre, 'cierre')}
            
            {/* Botón de firma cierre */}
            <div style={{ marginTop: '16px' }}>
              <button style={buttonStyle}>
                ✍️ Firmar Cierre
              </button>
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              color: '#059669', 
              borderBottom: '2px solid #059669', 
              paddingBottom: '8px',
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              📝 OBSERVACIONES
            </h2>
            <textarea 
              style={{ 
                width: '100%', 
                minHeight: '150px', 
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Escribir observaciones o incidencias aquí..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          {/* Botón final para completar todo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <button 
              style={{
                padding: '16px 32px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '400px'
              }}
            >
              ✅ COMPLETAR Y ENVIAR CHECKLIST DEL DÍA
            </button>
          </div>
        </>
      )}

      {/* Modal de incidencias */}
      {showIncidentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3>Reportar Incidencia</h3>
            <p>Tarea: {selectedTaskForIncident?.titulo}</p>
            <button 
              onClick={() => setShowIncidentModal(false)}
              style={buttonStyle}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistCompleteSystem;
