import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import IncidentCreationModal from './incidents/IncidentCreationModal';
import { devLog } from '../utils/devLogger';
import { checklistHistoryService, upsertDailyChecklist } from '../services/checklistHistoryService';
import { signatureService } from '../services/signatureService';
import QRSignatureModal from './QRSignatureModal';

import { useIsMobile } from '../hooks/useIsMobile';
import { ui } from '../utils/ui';


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
  incidencias: Record<string, unknown>[];
}

interface ChecklistCompleteSystemProps {
  centerId?: string;
  centerName?: string;
  onClose?: () => void;
}

const ChecklistCompleteSystem: React.FC<ChecklistCompleteSystemProps> = ({ centerId, centerName, onClose }) => {
  const { employee, userRole } = useSession();
  const isMobile = useIsMobile();

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

  // Estados para firmas digitales
  const [firmaApertura, setFirmaApertura] = useState({
    empleadoId: null as string | null,
    empleado_nombre: '',
    hora: null as string | null,
    firmado: false
  });

  const [firmaCierre, setFirmaCierre] = useState({
    empleadoId: null as string | null,
    empleado_nombre: '',
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

    if (!centerId || !centerName) {
      console.error('❌ No se proporcionó centerId o centerName');
      setLoading(false);
      return;
    }

    try {
      // 🔄 RESET AUTOMÁTICO: Usar el servicio que crea checklist diario automáticamente
      const todayChecklist = await checklistHistoryService.getTodayChecklist(centerId, centerName);

      if (todayChecklist) {
        console.log('✅ Checklist del día cargado:', todayChecklist);

        // Cargar tareas
        setChecklist({
          apertura: todayChecklist.apertura_tasks || [],
          limpieza: todayChecklist.limpieza_tasks || [],
          cierre: todayChecklist.cierre_tasks || [],
          incidencias: todayChecklist.incidencias || []
        });

        // Cargar firmas si existen
        if (todayChecklist.firma_apertura) {
          setFirmaApertura(todayChecklist.firma_apertura);
        }
        if (todayChecklist.firma_cierre) {
          setFirmaCierre(todayChecklist.firma_cierre);
        }

        // Verificar si hay checklist de ayer sin completar
        const incompleteYesterday = await checklistHistoryService.checkIncompleteYesterday(centerId);
        if (incompleteYesterday) {
          console.log('⚠️ Checklist de ayer sin completar:', incompleteYesterday.date);
          // Opcional: Mostrar alerta al usuario
          // ui.warning(`⚠️ El checklist del ${incompleteYesterday.date} no fue completado`);
        }
      }
    } catch (error) {
      console.error('❌ Error fatal al cargar checklist:', error);
      ui.error('Error al cargar el checklist. Por favor, verifica tu conexión e intenta de nuevo.');
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

    // Auto-guardar en BD
    updateChecklistInDB();
  };

  // Función para mostrar QR de firma de apertura
  const handleMostrarQRFirmaApertura = async () => {
    if (!centerId || !centerName) return;

    // Generar ID único para firma
    const signatureId = `apertura_${centerId}_${Date.now()}`;
    const signatureUrl = `${window.location.origin}/#/firma/${signatureId}`;

    // Crear firma pendiente en BD
    await signatureService.createPendingSignature(
      signatureId,
      centerId,
      centerName,
      'apertura'
    );

    setQrSignatureUrl(signatureUrl);
    setShowQRFirmaApertura(true);
  };

  // Función para mostrar QR de firma de cierre
  const handleMostrarQRFirmaCierre = async () => {
    if (!centerId || !centerName) return;

    // Generar ID único para firma
    const signatureId = `cierre_${centerId}_${Date.now()}`;
    const signatureUrl = `${window.location.origin}/#/firma/${signatureId}`;

    // Crear firma pendiente en BD
    await signatureService.createPendingSignature(
      signatureId,
      centerId,
      centerName,
      'cierre'
    );

    setQrSignatureUrl(signatureUrl);
    setShowQRFirmaCierre(true);
  };

  // SISTEMA HÍBRIDO DE FIRMAS: Detecta automáticamente si hay empleado logueado
  const handleFirmarApertura = async () => {
    // CASO 1: Empleado logueado → Firma directa
    if (employee?.id) {
      console.log('✍️ Firma directa de apertura por empleado:', employee.name);

      const nuevaFirma = {
        firmado: true,
        empleadoId: employee.id,
        empleado_nombre: employee.name || employee.email,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setFirmaApertura(nuevaFirma);

      // Guardar en BD
      await guardarEstadoProvisional('en_progreso');

      ui.success(`✅ Apertura firmada por ${employee.name || employee.email}`);
    }
    // CASO 2: Sin empleado logueado → Mostrar QR
    else {
      console.log('📱 Mostrando QR para firma de apertura');
      ui.info('📱 Por favor, escanea el código QR con tu móvil para firmar');
      handleMostrarQRFirmaApertura();
    }
  };

  const handleFirmarCierre = async () => {
    // CASO 1: Empleado logueado → Firma directa
    if (employee?.id) {
      console.log('✍️ Firma directa de cierre por empleado:', employee.name);

      const nuevaFirma = {
        firmado: true,
        empleadoId: employee.id,
        empleado_nombre: employee.name || employee.email,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setFirmaCierre(nuevaFirma);

      // Guardar en BD
      await guardarEstadoProvisional('completado');

      ui.success(`✅ Cierre firmado por ${employee.name || employee.email}`);
    }
    // CASO 2: Sin empleado logueado → Mostrar QR
    else {
      console.log('📱 Mostrando QR para firma de cierre');
      ui.info('📱 Por favor, escanea el código QR con tu móvil para firmar');
      handleMostrarQRFirmaCierre();
    }
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

      const { success, data, error } = await upsertDailyChecklist(checklistData as unknown as Record<string, unknown>);

      if (!success) {
        console.error('❌ Error guardando en Supabase:', error);
        ui.warning('⚠️ Error al guardar en la base de datos. Verifica tu conexión.');
      } else {
        console.log('✅ Checklist guardado en Supabase:', data);
      }
    } catch (error) {
      console.error('❌ Error fatal en guardarEstadoProvisional:', error);
      ui.warning('⚠️ Error al guardar. Por favor, intenta de nuevo.');
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
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'flex-start',
        padding: '12px',
        backgroundColor: tarea.completado ? '#f0fdf4' : 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '8px',
        gap: '8px'
      }}>
        {/* Contenedor Checkbox + Texto */}
        <div style={{ display: 'flex', flex: 1, gap: '8px', width: '100%' }}>
          <input
            type="checkbox"
            checked={tarea.completado || false}
            onChange={() => handleToggleTask(section as keyof ChecklistData, tarea.id)}
            style={{
              width: '24px',
              height: '24px',
              marginTop: '2px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontWeight: '500',
              textDecoration: tarea.completado ? 'line-through' : 'none',
              color: tarea.completado ? '#6b7280' : '#111827',
              margin: '0 0 4px 0',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.4'
            }}>
              {index + 1}. {tarea.titulo}
            </p>
            {tarea.descripcion && (
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 8px 0',
                whiteSpace: 'normal'
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
                  width: '100%',
                  maxWidth: '200px',
                  boxSizing: 'border-box'
                }}
              />
            )}
          </div>
        </div>

        {/* Botón de reportar incidencia */}
        <button
          onClick={() => handleReportIncident(tarea)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            minHeight: '32px',
            width: isMobile ? '100%' : 'auto',
            marginTop: isMobile ? '4px' : '0',
            alignSelf: isMobile ? 'stretch' : 'flex-start'
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
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
            padding: isMobile ? '16px' : '20px',
            borderRadius: '12px',
            marginBottom: isMobile ? '16px' : '24px'
          }}>
            <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', margin: '0 0 8px 0' }}>📋 Hoja de Tareas Diarias - {centerName}</h1>
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
                {firmaApertura.firmado ? '✅ Firmado por ' + firmaApertura.empleado_nombre : '✍️ Firmar Apertura'}
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

          {/* SECCIÓN CIERRE — Bloqueada si no se ha firmado apertura */}
          {!firmaApertura.firmado ? (
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              border: '2px dashed #d1d5db',
              textAlign: 'center'
            }}>
              <h2 style={{
                color: '#9ca3af',
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '12px'
              }}>
                🔒 CIERRE
              </h2>
              <p style={{ color: '#6b7280', fontSize: '15px' }}>
                ⚠️ Debes firmar la <strong>apertura</strong> antes de acceder a las tareas de cierre.
              </p>
            </div>
          ) : (
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
                {/* Mostrar progreso de tareas */}
                {(() => {
                  const tareasCompletadas = checklist.cierre.filter(t => t.completado).length;
                  const totalTareas = checklist.cierre.length;
                  const puedeEnviar = tareasCompletadas === totalTareas && totalTareas > 0;

                  return (
                    <>
                      {!firmaCierre.firmado && (
                        <div style={{
                          marginBottom: '12px',
                          padding: '12px',
                          backgroundColor: puedeEnviar ? '#ecfdf5' : '#fef3c7',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: puedeEnviar ? '#065f46' : '#92400e'
                        }}>
                          {puedeEnviar
                            ? '✅ Todas las tareas completadas. Puedes firmar el cierre.'
                            : `⚠️ Completa todas las tareas antes de firmar (${tareasCompletadas}/${totalTareas})`
                          }
                        </div>
                      )}
                      <button
                        onClick={handleFirmarCierre}
                        disabled={firmaCierre.firmado || !puedeEnviar}
                        style={{
                          ...buttonStyle,
                          backgroundColor: firmaCierre.firmado ? '#10b981' : (puedeEnviar ? '#3b82f6' : '#9ca3af'),
                          opacity: (firmaCierre.firmado || !puedeEnviar) ? 0.8 : 1,
                          cursor: (firmaCierre.firmado || !puedeEnviar) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {firmaCierre.firmado ? '✅ Firmado por ' + firmaCierre.empleado_nombre : '✍️ Firmar Cierre'}
                      </button>
                    </>
                  );
                })()}
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
          )}

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

          {/* Botón final para completar todo — con validación */}
          {(() => {
            const allApertura = checklist.apertura.every(t => t.completado);
            const allCierre = checklist.cierre.every(t => t.completado);
            const canComplete = firmaApertura.firmado && firmaCierre.firmado && allApertura && allCierre;
            const missingItems: string[] = [];
            if (!firmaApertura.firmado) missingItems.push('firma de apertura');
            if (!allApertura) missingItems.push('tareas de apertura');
            if (!allCierre) missingItems.push('tareas de cierre');
            if (!firmaCierre.firmado) missingItems.push('firma de cierre');

            return (
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                {!canComplete && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#92400e'
                  }}>
                    ⚠️ Falta: {missingItems.join(', ')}
                  </div>
                )}
                <button
                  disabled={!canComplete}
                  onClick={canComplete ? () => guardarEstadoProvisional('completado') : undefined}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: canComplete ? '#059669' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: canComplete ? 'pointer' : 'not-allowed',
                    width: '100%',
                    maxWidth: '400px',
                    opacity: canComplete ? 1 : 0.7
                  }}
                >
                  ✅ COMPLETAR Y ENVIAR CHECKLIST DEL DÍA
                </button>
              </div>
            );
          })()}
        </>
      )}

      {/* BUG-08: Unified Incident Creation Modal */}
      <IncidentCreationModal
        isOpen={showIncidentModal}
        onClose={() => {
          setShowIncidentModal(false);
          setSelectedTaskForIncident(null);
        }}
        centerName={centerName || ''}
        centerId={centerId || ''}
        initialDescription={selectedTaskForIncident ? `Problema con tarea: ${selectedTaskForIncident.titulo}` : ''}
        onIncidentCreated={(incident) => {
          devLog('✅ Incidencia creada desde checklist:', incident);
          setChecklist(prev => ({
            ...prev,
            incidencias: [...prev.incidencias, incident]
          }));
        }}
      />

      {/* Modal QR Firma Apertura */}
      <QRSignatureModal
        isOpen={showQRFirmaApertura}
        onClose={() => setShowQRFirmaApertura(false)}
        signatureUrl={qrSignatureUrl}
        signatureId={qrSignatureUrl.split('/').pop() || ''}
        signatureType="apertura"
        onSignatureCompleted={(employeeName) => {
          const nuevaFirma = {
            firmado: true,
            empleadoId: null as string | null,
            empleado_nombre: employeeName,
            hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          };
          setFirmaApertura(nuevaFirma);
          guardarEstadoProvisional('en_progreso');
          ui.success(`✅ Apertura firmada por ${employeeName}`);
        }}
      />

      {/* Modal QR Firma Cierre */}
      <QRSignatureModal
        isOpen={showQRFirmaCierre}
        onClose={() => setShowQRFirmaCierre(false)}
        signatureUrl={qrSignatureUrl}
        signatureId={qrSignatureUrl.split('/').pop() || ''}
        signatureType="cierre"
        onSignatureCompleted={(employeeName) => {
          const nuevaFirma = {
            firmado: true,
            empleadoId: null as string | null,
            empleado_nombre: employeeName,
            hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          };
          setFirmaCierre(nuevaFirma);
          guardarEstadoProvisional('completado');
          ui.success(`✅ Cierre firmado por ${employeeName}`);
        }}
      />
    </div >
  );
};

export default ChecklistCompleteSystem;
