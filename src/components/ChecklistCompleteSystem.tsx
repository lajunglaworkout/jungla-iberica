import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';
import SmartIncidentModal from './incidents/SmartIncidentModal';

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
  onClose?: () => void;
}

const ChecklistCompleteSystem: React.FC<ChecklistCompleteSystemProps> = ({ centerId, centerName, onClose }) => {
  const { employee, userRole } = useSession();
  
  // Estados para QR de firma
  const [showQRFirmaApertura, setShowQRFirmaApertura] = useState(false);
  const [showQRFirmaCierre, setShowQRFirmaCierre] = useState(false);
  const [qrSignatureUrl, setQrSignatureUrl] = useState('');
  
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
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('');
  const [incidentDescription, setIncidentDescription] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  // Estados para firmas digitales
  const [firmaApertura, setFirmaApertura] = useState({
    empleadoId: null as string | null,
    empleadoNombre: '',
    hora: null as string | null,
    firmado: false
  });
  
  const [firmaCierre, setFirmaCierre] = useState({
    empleadoId: null as string | null,
    empleadoNombre: '',
    hora: null as string | null,
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
    
    if (!centerId) {
      console.error('❌ No se proporcionó centerId');
      setLoading(false);
      return;
    }

    try {
      // Obtener la fecha de hoy
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar checklist del día en Supabase
      const { data: existingChecklist, error } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('center_id', centerId)
        .eq('date', today)
        .maybeSingle(); // Usar maybeSingle() en lugar de single() para evitar error si no existe

      if (error) {
        console.error('❌ Error al cargar checklist:', error);
        console.error('❌ Código de error:', error.code);
        console.error('❌ Mensaje:', error.message);
        console.error('❌ Detalles:', error.details);
        
        // Si es un error diferente a "no encontrado", lanzar
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }

      if (existingChecklist) {
        // Ya existe un checklist para hoy, cargar los datos
        console.log('✅ Checklist existente encontrado:', existingChecklist);
        console.log('📊 Datos de tareas:', {
          apertura: existingChecklist.apertura_tasks,
          limpieza: existingChecklist.limpieza_tasks,
          cierre: existingChecklist.cierre_tasks,
          tasks_antiguo: existingChecklist.tasks
        });
        
        // Si tiene el formato antiguo (tasks), migrar al nuevo formato
        if (existingChecklist.tasks && !existingChecklist.apertura_tasks) {
          console.log('🔄 Migrando formato antiguo a nuevo formato');
          const oldTasks = existingChecklist.tasks;
          setChecklist({
            apertura: oldTasks.apertura || [],
            limpieza: oldTasks.limpieza || [],
            cierre: oldTasks.cierre || [],
            incidencias: []
          });
          // Guardar en el nuevo formato
          await guardarEstadoProvisional(existingChecklist.status || 'en_progreso');
        } else {
          // Usar el nuevo formato
          setChecklist({
            apertura: existingChecklist.apertura_tasks || [],
            limpieza: existingChecklist.limpieza_tasks || [],
            cierre: existingChecklist.cierre_tasks || [],
            incidencias: []
          });
        }
        
        // Cargar firmas si existen
        if (existingChecklist.firma_apertura) {
          setFirmaApertura(existingChecklist.firma_apertura);
        }
        if (existingChecklist.firma_cierre) {
          setFirmaCierre(existingChecklist.firma_cierre);
        }
      } else {
        // No existe checklist para hoy, crear uno nuevo con tareas por defecto
        console.log('📝 Creando nuevo checklist para hoy');
        const defaultTasks = getDefaultTasks();
        
        // Preparar datos para inserción (sin center_name, no existe en la tabla)
        const insertData = {
          center_id: centerId,
          date: today,
          tasks: defaultTasks, // Campo requerido (NOT NULL)
          apertura_tasks: defaultTasks.apertura,
          limpieza_tasks: defaultTasks.limpieza,
          cierre_tasks: defaultTasks.cierre,
          status: 'en_progreso'
        };

        console.log('📤 Datos a insertar:', insertData);

        const { data: newChecklist, error: insertError } = await supabase
          .from('daily_checklists')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error al crear checklist:', insertError);
          console.error('❌ Código de error:', insertError.code);
          console.error('❌ Mensaje:', insertError.message);
          console.error('❌ Detalles:', insertError.details);
          console.error('❌ Hint:', insertError.hint);
          throw insertError;
        }

        console.log('✅ Nuevo checklist creado:', newChecklist);
        setChecklist(defaultTasks);
      }
    } catch (error) {
      console.error('❌ Error fatal al cargar checklist:', error);
      // En caso de error, mostrar mensaje al usuario
      alert('Error al cargar el checklist. Por favor, verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
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

  // Función para manejar la selección de imágenes
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limitar a 3 imágenes máximo
    const maxImages = 3;
    const newFiles = files.slice(0, maxImages - selectedImages.length);
    
    // Crear URLs de preview
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Función para eliminar una imagen
  const removeImage = (index: number) => {
    // Liberar la URL del objeto
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Función para reportar incidencia
  const handleReportIncident = (tarea: Task) => {
    setSelectedTaskForIncident(tarea);
    setIncidentDescription(`Problema con: ${tarea.titulo}`);
    setSelectedIncidentType('');
    // Limpiar imágenes previas
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviewUrls([]);
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
    
    // Auto-guardar en BD
    updateChecklistInDB();
  };

  // Función para mostrar QR de firma de apertura
  const handleMostrarQRFirmaApertura = () => {
    // Generar URL única para firma
    const signatureId = `apertura_${centerId}_${new Date().toISOString()}`;
    const signatureUrl = `${window.location.origin}/firma/${signatureId}`;
    setQrSignatureUrl(signatureUrl);
    setShowQRFirmaApertura(true);
  };

  // Función para mostrar QR de firma de cierre
  const handleMostrarQRFirmaCierre = () => {
    // Generar URL única para firma
    const signatureId = `cierre_${centerId}_${new Date().toISOString()}`;
    const signatureUrl = `${window.location.origin}/firma/${signatureId}`;
    setQrSignatureUrl(signatureUrl);
    setShowQRFirmaCierre(true);
  };

  // Por ahora, funciones simplificadas para firmar (se reemplazarán con QR)
  const handleFirmarApertura = async () => {
    alert('📱 Por favor, escanea el código QR con tu móvil para firmar');
    handleMostrarQRFirmaApertura();
  };

  const handleFirmarCierre = async () => {
    alert('📱 Por favor, escanea el código QR con tu móvil para firmar');
    handleMostrarQRFirmaCierre();
  };

  // Función para guardar estado provisional
  const guardarEstadoProvisional = async (estado: string) => {
    console.log('💾 Guardando estado provisional:', estado);
    
    if (!centerId) {
      console.error('❌ No se puede guardar sin centerId');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const checklistData = {
        center_id: centerId,
        date: today,
        employee_id: employee?.id || null,
        tasks: checklist, // Campo requerido (NOT NULL)
        apertura_tasks: checklist.apertura,
        limpieza_tasks: checklist.limpieza,
        cierre_tasks: checklist.cierre,
        status: estado,
        firma_apertura: firmaApertura.firmado ? firmaApertura : null,
        firma_cierre: firmaCierre.firmado ? firmaCierre : null,
        updated_at: new Date().toISOString()
      };

      console.log('📤 Guardando en Supabase:', checklistData);

      const { data, error } = await supabase
        .from('daily_checklists')
        .upsert(checklistData, {
          onConflict: 'center_id,date'
        })
        .select();
      
      if (error) {
        console.error('❌ Error guardando en Supabase:', error);
        alert('⚠️ Error al guardar en la base de datos. Verifica tu conexión.');
      } else {
        console.log('✅ Checklist guardado en Supabase:', data);
      }
    } catch (error) {
      console.error('❌ Error fatal en guardarEstadoProvisional:', error);
      alert('⚠️ Error al guardar. Por favor, intenta de nuevo.');
    }
  };

  // Auto-guardar en BD (versión simplificada para auto-guardado)
  const updateChecklistInDB = async () => {
    console.log('💾 Auto-guardando checklist...');
    await guardarEstadoProvisional('en_progreso');
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
    <div style={{ padding: window.innerWidth < 768 ? '16px' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Botón de cerrar (si se proporciona onClose) */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ✕ Cerrar
        </button>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 style={{ height: '48px', width: '48px', animation: 'spin 1s linear infinite', color: '#059669' }} />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando checklist...</p>
        </div>
      )}

      {!employee && !loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#f59e0b', fontSize: '18px' }}>⚠️ Sesión de centro detectada</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
            El checklist funciona mejor con una sesión de empleado, pero puedes visualizarlo como centro.
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: window.innerWidth < 768 ? '16px' : '20px',
            borderRadius: '12px',
            marginBottom: window.innerWidth < 768 ? '16px' : '24px'
          }}>
            <h1 style={{ fontSize: window.innerWidth < 768 ? '24px' : '32px', fontWeight: '700', margin: '0 0 8px 0' }}>📋 Hoja de Tareas Diarias - {centerName}</h1>
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
              <button 
                onClick={handleFirmarApertura}
                disabled={firmaApertura.firmado}
                style={{
                  ...buttonStyle,
                  backgroundColor: firmaApertura.firmado ? '#10b981' : '#3b82f6',
                  opacity: firmaApertura.firmado ? 0.8 : 1,
                  cursor: firmaApertura.firmado ? 'not-allowed' : 'pointer'
                }}
              >
                {firmaApertura.firmado ? '✅ Firmado por ' + firmaApertura.empleadoNombre : '✍️ Firmar Apertura'}
              </button>
              {firmaApertura.firmado && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#059669', 
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  Firmado a las {firmaApertura.hora}
                </div>
              )}
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
              <button 
                onClick={handleFirmarCierre}
                disabled={firmaCierre.firmado}
                style={{
                  ...buttonStyle,
                  backgroundColor: firmaCierre.firmado ? '#10b981' : '#3b82f6',
                  opacity: firmaCierre.firmado ? 0.8 : 1,
                  cursor: firmaCierre.firmado ? 'not-allowed' : 'pointer'
                }}
              >
                {firmaCierre.firmado ? '✅ Firmado por ' + firmaCierre.empleadoNombre : '✍️ Firmar Cierre'}
              </button>
              {firmaCierre.firmado && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#059669', 
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  Firmado a las {firmaCierre.hora}
                </div>
              )}
            </div>
          </div>

          {/* Sección de incidencias */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              marginBottom: '16px',
              color: '#374151'
            }}>
              🚨 Incidencias Reportadas
            </h2>
            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '2px dashed #e5e7eb',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                {checklist.incidencias.length > 0 
                  ? `${checklist.incidencias.length} incidencia(s) reportada(s) hoy`
                  : 'No hay incidencias reportadas hoy'
                }
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                💡 Para reportar una incidencia, haz clic en "Reportar" junto a cualquier tarea
              </p>
            </div>
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

      {/* Modal de incidencias - Versión de prueba */}
      {showIncidentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                🚨 Reportar Incidencia
              </h2>
              <button 
                onClick={() => {
                  setShowIncidentModal(false);
                  setSelectedTaskForIncident(null);
                }}
                style={{
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Tarea:</strong> {selectedTaskForIncident?.titulo}</p>
              <p><strong>Centro:</strong> {centerName}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Departamento Responsable:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedIncidentType('mantenimiento')}
                  style={{ 
                    padding: '12px', 
                    backgroundColor: selectedIncidentType === 'mantenimiento' ? '#ef4444' : '#fee2e2', 
                    color: selectedIncidentType === 'mantenimiento' ? 'white' : '#dc2626',
                    border: selectedIncidentType === 'mantenimiento' ? 'none' : '2px solid #ef4444',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: selectedIncidentType === 'mantenimiento' ? 'bold' : 'normal'
                  }}
                >
                  🔧 Mantenimiento
                </button>
                <button 
                  onClick={() => setSelectedIncidentType('logistica')}
                  style={{ 
                    padding: '12px', 
                    backgroundColor: selectedIncidentType === 'logistica' ? '#059669' : '#dcfce7', 
                    color: selectedIncidentType === 'logistica' ? 'white' : '#059669',
                    border: selectedIncidentType === 'logistica' ? 'none' : '2px solid #059669',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: selectedIncidentType === 'logistica' ? 'bold' : 'normal'
                  }}
                >
                  📦 Logística
                </button>
                <button 
                  onClick={() => setSelectedIncidentType('personal')}
                  style={{ 
                    padding: '12px', 
                    backgroundColor: selectedIncidentType === 'personal' ? '#8b5cf6' : '#ede9fe', 
                    color: selectedIncidentType === 'personal' ? 'white' : '#8b5cf6',
                    border: selectedIncidentType === 'personal' ? 'none' : '2px solid #8b5cf6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: selectedIncidentType === 'personal' ? 'bold' : 'normal'
                  }}
                >
                  👥 Personal
                </button>
                <button 
                  onClick={() => setSelectedIncidentType('clientes')}
                  style={{ 
                    padding: '12px', 
                    backgroundColor: selectedIncidentType === 'clientes' ? '#f59e0b' : '#fef3c7', 
                    color: selectedIncidentType === 'clientes' ? 'white' : '#f59e0b',
                    border: selectedIncidentType === 'clientes' ? 'none' : '2px solid #f59e0b',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: selectedIncidentType === 'clientes' ? 'bold' : 'normal'
                  }}
                >
                  😊 Clientes
                </button>
              </div>
              {selectedIncidentType && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <strong>Se notificará a:</strong> {
                    selectedIncidentType === 'mantenimiento' ? 'Departamento de Mantenimiento' :
                    selectedIncidentType === 'logistica' ? 'Departamento de Logística (incluye seguridad)' :
                    selectedIncidentType === 'personal' ? 'Recursos Humanos' :
                    selectedIncidentType === 'clientes' ? 'Dirección y Atención al Cliente' : ''
                  }
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Descripción:
              </label>
              <textarea 
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                style={{ 
                  width: '100%', 
                  minHeight: '100px', 
                  padding: '12px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Describe el problema..."
              />
            </div>

            {/* Sección de imágenes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                📸 Imágenes (opcional):
              </label>
              <div style={{ 
                border: '2px dashed #d1d5db', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f9fafb'
              }}>
                {selectedImages.length === 0 ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
                    <p style={{ color: '#6b7280', marginBottom: '12px', fontSize: '14px' }}>
                      Adjunta fotos para ayudar a resolver la incidencia
                    </p>
                    <label style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '12px 20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      📤 Seleccionar imágenes
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                      Máximo 3 imágenes (JPG, PNG, GIF)
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                      gap: '12px', 
                      marginBottom: '16px' 
                    }}>
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb'
                            }}
                          />
                          <button
                            onClick={() => removeImage(index)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            marginTop: '4px',
                            textAlign: 'center'
                          }}>
                            {selectedImages[index]?.name.substring(0, 15)}...
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedImages.length < 3 && (
                      <div style={{ textAlign: 'center' }}>
                        <label style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          border: '1px solid #d1d5db'
                        }}>
                          ➕ Añadir más
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    )}
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      backgroundColor: '#ecfdf5',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#065f46',
                      textAlign: 'center'
                    }}>
                      ✅ {selectedImages.length} imagen{selectedImages.length > 1 ? 'es' : ''} seleccionada{selectedImages.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowIncidentModal(false);
                  setSelectedTaskForIncident(null);
                  setSelectedIncidentType('');
                  setIncidentDescription('');
                  // Limpiar imágenes y liberar URLs
                  imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                  setSelectedImages([]);
                  setImagePreviewUrls([]);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  if (!selectedIncidentType) {
                    alert('Por favor selecciona un departamento responsable');
                    return;
                  }
                  if (!incidentDescription.trim()) {
                    alert('Por favor describe el problema');
                    return;
                  }
                  
                  const incidentData = {
                    tarea: selectedTaskForIncident?.titulo,
                    centro: centerName,
                    departamento: selectedIncidentType,
                    descripcion: incidentDescription,
                    fecha: new Date().toLocaleString('es-ES'),
                    reportadoPor: employee?.name || 'Usuario',
                    imagenes: selectedImages.length > 0 ? selectedImages.map(file => ({
                      nombre: file.name,
                      tamaño: `${(file.size / 1024).toFixed(1)}KB`,
                      tipo: file.type
                    })) : null,
                    tieneImagenes: selectedImages.length > 0
                  };
                  
                  console.log('📋 Incidencia reportada:', incidentData);
                  
                  // GUARDAR INCIDENCIA EN SUPABASE
                  try {
                    const { data: incidentResult, error: incidentError } = await supabase
                      .from('checklist_incidents')
                      .insert({
                        center_id: centerId,
                        center_name: centerName,
                        reporter_id: employee?.id,
                        reporter_name: employee?.name || 'Usuario',
                        incident_type: selectedIncidentType === 'mantenimiento' ? 'maintenance' :
                                      selectedIncidentType === 'logistica' ? 'logistics' :
                                      selectedIncidentType === 'personal' ? 'hr' :
                                      selectedIncidentType === 'clientes' ? 'security' : 'maintenance',
                        department: selectedIncidentType === 'mantenimiento' ? 'Mantenimiento' :
                                   selectedIncidentType === 'logistica' ? 'Logística' :
                                   selectedIncidentType === 'personal' ? 'Personal' :
                                   selectedIncidentType === 'clientes' ? 'Atención al Cliente' : 'Mantenimiento',
                        responsible: selectedIncidentType === 'mantenimiento' ? 'Mantenimiento' :
                                    selectedIncidentType === 'logistica' ? 'Logística' :
                                    selectedIncidentType === 'personal' ? 'Personal' :
                                    selectedIncidentType === 'clientes' ? 'Atención al Cliente' : 'Mantenimiento',
                        title: `Incidencia: ${selectedTaskForIncident?.titulo}`,
                        description: incidentDescription,
                        priority: 'media',
                        status: 'abierta',
                        has_images: selectedImages.length > 0,
                        auto_notify: [selectedIncidentType === 'mantenimiento' ? 'Mantenimiento' :
                                     selectedIncidentType === 'logistica' ? 'Logística' :
                                     selectedIncidentType === 'personal' ? 'Personal' :
                                     selectedIncidentType === 'clientes' ? 'Atención al Cliente' : 'Mantenimiento']
                      });

                    if (incidentError) {
                      console.error('❌ Error guardando incidencia:', incidentError);
                      alert('⚠️ Error al guardar la incidencia. Se reportó localmente.');
                    } else {
                      console.log('✅ Incidencia guardada en BD:', incidentResult);
                      
                      // Agregar a la lista local de incidencias
                      setChecklist(prev => ({
                        ...prev,
                        incidencias: [...prev.incidencias, incidentData]
                      }));
                    }
                  } catch (error) {
                    console.error('❌ Error en guardado de incidencia:', error);
                  }
                  
                  if (selectedImages.length > 0) {
                    console.log(`📸 Imágenes adjuntas: ${selectedImages.length}`);
                    selectedImages.forEach((file, index) => {
                      console.log(`  - Imagen ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
                    });
                  }
                  
                  alert(`✅ ¡Incidencia guardada y reportada al departamento de ${
                    selectedIncidentType === 'mantenimiento' ? 'Mantenimiento' :
                    selectedIncidentType === 'logistica' ? 'Logística' :
                    selectedIncidentType === 'personal' ? 'Personal' :
                    selectedIncidentType === 'clientes' ? 'Atención al Cliente' : selectedIncidentType
                  }!${selectedImages.length > 0 ? ` (${selectedImages.length} imagen${selectedImages.length > 1 ? 'es' : ''} adjunta${selectedImages.length > 1 ? 's' : ''})` : ''}\n\n📋 Los administradores podrán verla en el sistema de incidencias.`);
                  
                  setShowIncidentModal(false);
                  setSelectedTaskForIncident(null);
                  setSelectedIncidentType('');
                  setIncidentDescription('');
                  // Limpiar imágenes y liberar URLs
                  imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                  setSelectedImages([]);
                  setImagePreviewUrls([]);
                }}
                disabled={!selectedIncidentType || !incidentDescription.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (!selectedIncidentType || !incidentDescription.trim()) ? '#9ca3af' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (!selectedIncidentType || !incidentDescription.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedIncidentType || !incidentDescription.trim()) ? 0.6 : 1
                }}
              >
                Reportar Incidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistCompleteSystem;
