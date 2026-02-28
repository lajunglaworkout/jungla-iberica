import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { checklistIncidentService, ChecklistIncident } from '../../services/checklistIncidentService';
import { useSession } from '../../contexts/SessionContext';
import { ui } from '../../utils/ui';


interface IncidentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: string;
  userEmail: string;
  showOverdueOnly?: boolean;
}

const IncidentManagementModal: React.FC<IncidentManagementModalProps> = ({
  isOpen,
  onClose,
  department,
  userEmail,
  showOverdueOnly = false
}) => {
  const { employee } = useSession();
  const [incidents, setIncidents] = useState<ChecklistIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<ChecklistIncident | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadIncidents();
    }
  }, [isOpen]);

  const loadIncidents = async () => {
    setIsLoading(true);
    console.log('🔍 Cargando incidencias para departamento:', department);
    console.log('👤 Usuario actual:', employee?.email, 'Rol:', employee?.role);
    console.log('⏰ Mostrar solo vencidas:', showOverdueOnly);

    try {
      let data;

      // Si se solicitan solo incidencias vencidas
      if (showOverdueOnly) {
        console.log('⏰ Cargando SOLO incidencias vencidas');
        data = await checklistIncidentService.getOverdueIncidents();
      } else {
        // Lógica original
        // Definir usuarios con visión global (Directores y CEO)
        // 🔧 REFACTORIZADO: Usar roles en lugar de emails hardcodeados
        const isCEO = employee?.role === 'superadmin' || userRole === 'superadmin';
        const isDirector = employee?.role === 'admin' || userRole === 'admin';
        const isOwner = isCEO || isDirector;

        if (isOwner) {
          // PROPIETARIOS (CEO, Beni, Vicente) → Visión global de TODAS las incidencias
          console.log('👑 Propietario - cargando TODAS las incidencias para visión global');
          data = await checklistIncidentService.getPendingIncidents();
        } else if (department) {
          // Otros usuarios (directores, managers) → Solo su departamento
          console.log('👤 Usuario departamental - filtrando por:', department);
          data = await checklistIncidentService.getIncidentsByDepartment(department);
        } else {
          // Fallback: sin departamento específico
          console.log('⚠️ Usuario sin departamento - cargando todas');
          data = await checklistIncidentService.getPendingIncidents();
        }
      }

      console.log('📋 Incidencias cargadas:', data);
      console.log('📋 Número de incidencias:', data.length);
      setIncidents(data);
    } catch (error) {
      console.error('❌ Error cargando incidencias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllIncidents = async () => {
    try {
      await checklistIncidentService.clearAllIncidents();
      setIncidents([]);
      setSelectedIncident(null);
      console.log('✅ Todas las incidencias han sido borradas');
    } catch (error) {
      console.error('Error borrando incidencias:', error);
    }
  };

  const createTestIncident = async () => {
    try {
      await checklistIncidentService.createTestIncident();
      await loadIncidents(); // Recargar la lista
      console.log('✅ Incidencia de prueba creada');
    } catch (error) {
      console.error('Error creando incidencia de prueba:', error);
    }
  };

  const handleCloseIncident = async (incidentId: number) => {
    if (!response.trim()) {
      ui.info('Por favor, proporciona una descripción de la solución antes de cerrar la incidencia.');
      return;
    }

    try {
      // Usar el nuevo método que requiere verificación
      await checklistIncidentService.closeIncidentWithVerification(
        incidentId,
        response,
        employee?.name || 'Sistema'
      );

      // Recargar incidencias
      await loadIncidents();

      // Limpiar formulario
      setResponse('');
      setSelectedIncident(null);

      ui.success('✅ Incidencia cerrada y enviada para verificación del empleado que la reportó.');
    } catch (error) {
      console.error('Error cerrando incidencia:', error);
      ui.error('Error al cerrar la incidencia');
    }
  };

  // Agregar clase al body para prevenir scroll - DEBE estar antes del return condicional
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Modal funcionando correctamente

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-4 h-[95vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'white',
          zIndex: 1000000
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header estilo CRM moderno */}
        <div style={{
          background: 'linear-gradient(to right, #22c55e, #16a34a)',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0',
                  color: 'white'
                }}>
                  Gestión de Incidencias
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(219, 234, 254, 0.8)',
                  margin: 0
                }}>
                  {employee?.role === 'admin' ? 'Todas las incidencias' : department} • {incidents.length} incidencias pendientes
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={clearAllIncidents}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🗑️</span>
                <span>Limpiar</span>
              </button>
              <button
                onClick={createTestIncident}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>➕</span>
                <span>Crear Prueba</span>
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '24px', height: '24px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Lista de incidencias - Estilo CRM moderno */}
          <div style={{
            width: '50%',
            backgroundColor: '#f9fafb',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '24px',
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>Lista de Incidencias</h2>
                  <p style={{
                    color: '#6b7280',
                    margin: 0,
                    fontSize: '14px'
                  }}>Gestiona las incidencias pendientes del sistema</p>
                </div>
                <div style={{
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {incidents.length} pendientes
                </div>
              </div>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 0'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid #3b82f6',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ marginLeft: '12px', color: '#6b7280' }}>Cargando incidencias...</span>
                </div>
              ) : incidents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <CheckCircle style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#111827',
                    margin: '0 0 8px 0'
                  }}>No hay incidencias pendientes</h3>
                  <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>¡Excelente! No hay incidencias que requieran atención.</p>
                  <button
                    onClick={createTestIncident}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Crear incidencia de prueba
                  </button>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    style={{
                      position: 'relative',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: selectedIncident?.id === incident.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedIncident?.id === incident.id
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(59, 130, 246, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Indicador de selección */}
                    {selectedIncident?.id === incident.id && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: 'white' }} />
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontWeight: '600',
                          color: '#111827',
                          fontSize: '18px',
                          lineHeight: '1.4',
                          margin: '0 0 12px 0'
                        }}>
                          {incident.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: incident.priority === 'critica' ? '#fef2f2' :
                              incident.priority === 'alta' ? '#fff7ed' :
                                incident.priority === 'media' ? '#fefce8' : '#f0fdf4',
                            color: incident.priority === 'critica' ? '#dc2626' :
                              incident.priority === 'alta' ? '#ea580c' :
                                incident.priority === 'media' ? '#ca8a04' : '#16a34a',
                            border: `1px solid ${incident.priority === 'critica' ? '#fecaca' :
                              incident.priority === 'alta' ? '#fed7aa' :
                                incident.priority === 'media' ? '#fef3c7' : '#bbf7d0'}`
                          }}>
                            🚨 {incident.priority?.toUpperCase()}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #e5e7eb'
                          }}>
                            📋 {incident.department}
                          </span>
                          {(() => {
                            const timeRemaining = checklistIncidentService.getTimeRemaining(incident);
                            const isOverdue = checklistIncidentService.isIncidentOverdue(incident);
                            const maxTime = checklistIncidentService.getMaxResponseTime(incident.priority);

                            if (isOverdue) {
                              return (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }}>
                                  ⏰ VENCIDA
                                </span>
                              );
                            } else if (timeRemaining <= 2) {
                              return (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  backgroundColor: '#fff7ed',
                                  color: '#ea580c',
                                  border: '1px solid #fed7aa'
                                }}>
                                  ⚠️ {Math.floor(timeRemaining)}h restantes
                                </span>
                              );
                            } else {
                              return (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  backgroundColor: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0'
                                }}>
                                  ⏱️ {Math.floor(timeRemaining)}h de {maxTime}h
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>

                    <p style={{
                      color: '#6b7280',
                      marginBottom: '16px',
                      lineHeight: '1.6',
                      fontSize: '14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{incident.description}</p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                        }}>
                          <span style={{
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '14px'
                          }}>
                            {incident.reporter_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p style={{
                            fontWeight: '600',
                            color: '#111827',
                            fontSize: '13px',
                            margin: '0 0 2px 0'
                          }}>{incident.reporter_name}</p>
                          <p style={{
                            color: '#6b7280',
                            fontSize: '11px',
                            margin: 0
                          }}>🏢 {incident.center_name}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          color: '#6b7280',
                          fontSize: '11px',
                          margin: '0 0 2px 0',
                          fontWeight: '500'
                        }}>
                          📅 {incident.created_at ? new Date(incident.created_at).toLocaleDateString('es-ES') : ''}
                        </p>
                        <p style={{
                          color: '#9ca3af',
                          fontSize: '10px',
                          margin: 0
                        }}>
                          🕐 {incident.created_at ? new Date(incident.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de detalles - Estilo CRM moderno */}
          <div style={{
            width: '50%',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #e5e7eb'
          }}>
            {selectedIncident ? (
              <>
                {/* Header moderno */}
                <div style={{
                  background: 'linear-gradient(to right, #22c55e, #16a34a)',
                  padding: '24px',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: '0 0 12px 0' }}>{selectedIncident.title}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'white' }}>
                        <span style={{ fontSize: '14px', opacity: 0.9 }}>👤 {selectedIncident.reporter_name}</span>
                        <span style={{ fontSize: '14px', opacity: 0.9 }}>🏢 {selectedIncident.center_name}</span>
                        <span style={{ fontSize: '14px', opacity: 0.9 }}>
                          📅 {selectedIncident.created_at ? new Date(selectedIncident.created_at).toLocaleDateString('es-ES') : ''}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginLeft: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        🚨 {selectedIncident.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido moderno */}
                <div style={{
                  flex: 1,
                  padding: '24px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        marginRight: '12px'
                      }}></span>
                      Descripción del Problema
                    </h3>
                    <div style={{
                      background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
                      borderLeft: '4px solid #22c55e',
                      padding: '24px',
                      borderRadius: '0 12px 12px 0'
                    }}>
                      <p style={{
                        color: '#374151',
                        lineHeight: '1.6',
                        fontSize: '16px',
                        margin: 0
                      }}>{selectedIncident.description}</p>
                    </div>
                  </div>

                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        marginRight: '12px'
                      }}></span>
                      Información del Reporte
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{
                        backgroundColor: 'white',
                        border: '2px solid #f3f4f6',
                        borderRadius: '12px',
                        padding: '20px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#22c55e',
                            borderRadius: '50%',
                            marginRight: '8px'
                          }}></div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>🏢 Centro</span>
                        </div>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#111827',
                          margin: 0
                        }}>{selectedIncident.center_name}</p>
                      </div>
                      <div style={{
                        backgroundColor: 'white',
                        border: '2px solid #f3f4f6',
                        borderRadius: '12px',
                        padding: '20px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#8b5cf6',
                            borderRadius: '50%',
                            marginRight: '8px'
                          }}></div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>📋 Departamento</span>
                        </div>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#111827',
                          margin: 0
                        }}>{selectedIncident.department}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#f59e0b',
                        borderRadius: '50%',
                        marginRight: '12px'
                      }}></span>
                      Solución y Respuesta
                    </h3>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Describe detalladamente cómo se resolvió la incidencia, las acciones tomadas y cualquier seguimiento necesario..."
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        backgroundColor: '#fafafa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#22c55e';
                        e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.1)';
                        e.target.style.backgroundColor = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#fafafa';
                      }}
                      rows={5}
                    />
                  </div>
                </div>

                {/* Footer moderno */}
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                      onClick={() => selectedIncident.id && handleCloseIncident(selectedIncident.id)}
                      style={{
                        flex: 1,
                        padding: '16px 24px',
                        background: 'linear-gradient(to right, #22c55e, #16a34a)',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        fontSize: '16px',
                        boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 15px rgba(34, 197, 94, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 6px rgba(34, 197, 94, 0.2)';
                      }}
                    >
                      <CheckCircle style={{ width: '24px', height: '24px' }} />
                      <span>✅ Cerrar Incidencia</span>
                    </button>
                    <button
                      onClick={() => setSelectedIncident(null)}
                      style={{
                        padding: '16px 24px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontWeight: '600',
                        border: '2px solid #d1d5db',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Selecciona una incidencia</h3>
                  <p className="text-gray-500">Elige una incidencia de la lista para ver los detalles y gestionarla</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return modalContent;
};

export default IncidentManagementModal;
