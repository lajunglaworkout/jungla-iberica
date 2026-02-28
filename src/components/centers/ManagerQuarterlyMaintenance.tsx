import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  MapPin,
  Camera,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS, MAINTENANCE_STATUS, TASK_PRIORITY, MaintenanceZone, MaintenanceConcept } from '../../types/maintenance';
import maintenanceService from '../../services/maintenanceService';

interface InspectionItemState {
  id: string;
  zone_id?: string | number;
  zone_name?: string;
  concept_id?: string | number;
  concept_name?: string;
  status?: 'bien' | 'regular' | 'mal';
  observations?: string;
  task_to_perform?: string;
  task_priority?: string;
  photos_deterioro?: string[];
  photos_reparacion?: string[];
  photos_required?: boolean;
  notes?: string;
  uuid?: string;
  [key: string]: unknown;
}
import quarterlyMaintenanceService from '../../services/quarterlyMaintenanceService';
import { useSession } from '../../contexts/SessionContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ui } from '../../utils/ui';


interface ManagerQuarterlyMaintenanceProps {
  onBack: () => void;
  centerId?: number;
}

const ManagerQuarterlyMaintenance: React.FC<ManagerQuarterlyMaintenanceProps> = ({
  onBack,
  centerId: propCenterId
}) => {
  const { employee } = useSession();
  const isMobile = useIsMobile();
  const userEmail = employee?.email || '';
  const userName = employee?.name || '';
  const centerName = employee?.center_id === '9' ? 'Centro Sevilla' :
    employee?.center_id === '10' ? 'Centro Jerez' :
      employee?.center_id === '11' ? 'Centro Puerto' : 'Centro';
  const centerId = propCenterId?.toString() || employee?.center_id || '9';
  const [currentStep, setCurrentStep] = useState(0); // 0 = inicio, 1-9 = zonas, 10 = resumen
  const [selectedCenter, setSelectedCenter] = useState({ id: centerId, name: centerName });
  const [inspectionData, setInspectionData] = useState<Record<string, InspectionItemState>>({});


  // Centros disponibles
  const availableCenters = [
    { id: 'sevilla', name: 'Centro Sevilla' },
    { id: 'jerez', name: 'Centro Jerez' },
    { id: 'puerto', name: 'Centro Puerto' }
  ];

  // Inicializar datos de inspección
  useEffect(() => {
    const items: Record<string, InspectionItemState> = {};

    MAINTENANCE_ZONES.forEach(zone => {
      const zoneConcepts = MAINTENANCE_CONCEPTS.filter(c => c.zone_id === zone.id);

      zoneConcepts.forEach(concept => {
        const itemId = `${zone.id}_${concept.id}`;
        items[itemId] = {
          id: itemId,
          zone_id: zone.id,
          zone_name: zone.name,
          concept_id: concept.id,
          concept_name: concept.name,
          status: 'bien',
          observations: '',
          task_to_perform: '',
          task_priority: 'baja',
          photos_deterioro: [],
          photos_reparacion: [],
          photos_required: false
        };
      });
    });

    setInspectionData((prev) => ({ ...prev, ...items }));
  }, []);

  // Actualizar item de inspección
  const updateInspectionItem = (itemId: string, updates: Partial<InspectionItemState>) => {
    setInspectionData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        ...updates
      }
    }));
  };

  // Calcular progreso
  const getProgress = () => {
    const totalSteps = MAINTENANCE_ZONES.length + 2; // zonas + inicio + resumen
    return Math.round((currentStep / totalSteps) * 100);
  };

  const handleSubmitInspection = async () => {
    try {
      console.log('🔧 Enviando revisión trimestral...');

      // VALIDAR FOTOS OBLIGATORIAS
      const allItems = Object.values(inspectionData);
      const itemsWithPhotosRequired = allItems.filter((item) =>
        item.status === 'regular' || item.status === 'mal'
      );

      const itemsWithoutPhotos = itemsWithPhotosRequired.filter((item) =>
        !item.photos_deterioro || item.photos_deterioro.length === 0
      );

      if (itemsWithoutPhotos.length > 0) {
        ui.error(`❌ No se puede enviar la revisión.\n\n` +
          `${itemsWithoutPhotos.length} items requieren fotos obligatorias:\n` +
          itemsWithoutPhotos.map((item) => `• ${item.zone_name}: ${item.concept_name}`).join('\n') +
          `\n\nPor favor, sube las fotos de deterioro para todos los items marcados como REGULAR o MAL.`);
        return;
      }

      // Preparar datos de la inspección
      const inspectionDate = new Date();
      const inspectionMonth = inspectionDate.toISOString().substring(0, 7); // "2025-09"

      // Calcular estadísticas
      const itemsOk = allItems.filter((item) => item.status === 'bien').length;
      const itemsRegular = allItems.filter((item) => item.status === 'regular').length;
      const itemsBad = allItems.filter((item) => item.status === 'mal').length;
      const totalItems = allItems.length;
      const overallScore = Math.round(((itemsOk * 100) + (itemsRegular * 60) + (itemsBad * 20)) / totalItems);

      // Crear objeto de inspección
      const inspection = {
        center_id: selectedCenter.id,
        center_name: selectedCenter.name,
        inspector_name: userName,
        inspector_email: userEmail,
        inspection_date: inspectionDate.toISOString(),
        inspection_month: inspectionMonth,
        inspection_year: inspectionDate.getFullYear(),
        status: 'completed' as const,
        total_items: totalItems,
        items_ok: itemsOk,
        items_regular: itemsRegular,
        items_bad: itemsBad,
        overall_score: overallScore,
        notes: '',
        created_at: inspectionDate.toISOString(),
        updated_at: inspectionDate.toISOString()
      };

      // Preparar items de inspección
      const items = Object.entries(inspectionData).map(([itemId, item]) => {
        const [zoneId, conceptId] = itemId.split('_');
        const zone = MAINTENANCE_ZONES.find(z => z.id === zoneId);
        const concept = MAINTENANCE_CONCEPTS.find(c => c.id === conceptId);
        const itemData = item;

        return {
          zone_id: zoneId,
          zone_name: zone?.name || 'Zona desconocida',
          concept_id: conceptId,
          concept_name: concept?.name || 'Concepto desconocido',
          status: itemData.status || 'bien',
          observations: itemData.observations || '',
          task_to_perform: itemData.task_to_perform || '',
          task_priority: itemData.task_priority || 'baja',
          photos_deterioro: itemData.photos_deterioro || [],
          photos_reparacion: itemData.photos_reparacion || [],
          is_critical: itemData.status === 'mal'
        };
      });

      // Buscar la asignación activa para este centro
      const centerNumId = selectedCenter.id === 'sevilla' ? 9 :
        selectedCenter.id === 'jerez' ? 10 :
          selectedCenter.id === 'puerto' ? 11 : 9;

      const assignmentResult = await quarterlyMaintenanceService.getAssignments(centerNumId);

      if (!assignmentResult.success || !assignmentResult.assignments || assignmentResult.assignments.length === 0) {
        ui.error('❌ No se encontró una asignación activa para este centro');
        return;
      }

      const assignment = assignmentResult.assignments[0];

      // Guardar los items de la revisión
      const result = await quarterlyMaintenanceService.saveReviewItems(assignment.id, items);

      if (result.success) {
        // Marcar la asignación como completada
        const completeResult = await quarterlyMaintenanceService.completeAssignment(assignment.id, userEmail);

        if (completeResult.success) {
          ui.success('✅ Revisión trimestral completada y enviada a Beni');
          onBack(); // Volver al dashboard
        } else {
          ui.error('❌ Error completando la revisión');
        }
      } else {
        console.error('Error guardando items:', result.error);
        ui.error();
      }

    } catch (error) {
      console.error('Error en handleSubmitInspection:', error);
      ui.error('Error enviando inspección');
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = (itemId: string, status: string) => {
    const photosRequired = status !== 'bien';

    updateInspectionItem(itemId, {
      status,
      photos_required: photosRequired
    });
  };

  // Renderizar paso de inicio
  const renderStartStep = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '32px'
    }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Calendar style={{
          width: '64px',
          height: '64px',
          color: '#059669',
          margin: '0 auto 16px',
          display: 'block'
        }} />
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>🔧 Revisión Trimestral de Mantenimiento</h2>
        <p style={{
          color: '#6b7280',
          margin: 0
        }}>{selectedCenter.name} - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Información del inspector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <User style={{ width: '20px', height: '20px', color: '#9ca3af', marginRight: '12px' }} />
            <span style={{ color: '#374151' }}>Inspector</span>
          </div>
          <span style={{ fontWeight: '500' }}>{userName}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MapPin style={{ width: '20px', height: '20px', color: '#9ca3af', marginRight: '12px' }} />
            <span style={{ color: '#374151' }}>Centro</span>
          </div>
          <select
            value={selectedCenter.id}
            onChange={(e) => {
              const center = availableCenters.find(c => c.id === e.target.value);
              if (center) {
                setSelectedCenter(center);
              }
            }}
            style={{
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#111827'
            }}
          >
            {availableCenters.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#9ca3af', marginRight: '12px' }} />
            <span style={{ color: '#374151' }}>Fecha</span>
          </div>
          <input
            type="date"
            value={inspectionData.inspection_date}
            onChange={(e) => setInspectionData((prev) => ({
              ...prev,
              inspection_date: e.target.value
            }))}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Zonas a inspeccionar */}
      <div style={{
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #dbeafe'
      }}>
        <h3 style={{
          fontWeight: '600',
          color: '#1e40af',
          marginBottom: '16px',
          margin: '0 0 16px 0'
        }}>📋 Zonas de Inspección ({MAINTENANCE_ZONES.length} zonas)</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {MAINTENANCE_ZONES.map((zone: MaintenanceZone) => (
            <div key={zone.id} style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#1e40af',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #bfdbfe'
            }}>
              <span style={{ marginRight: '8px', fontSize: '18px' }}>{zone.icon}</span>
              <div>
                <div style={{ fontWeight: '500' }}>{zone.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {MAINTENANCE_CONCEPTS.filter((c: MaintenanceConcept) => c.zone_id === zone.id).length} conceptos
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrentStep(1)}
        style={{
          width: '100%',
          backgroundColor: '#059669',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#047857';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#059669';
        }}
      >
        Comenzar Inspección
        <ArrowRight style={{ width: '20px', height: '20px', marginLeft: '8px' }} />
      </button>
    </div>
  );

  // Renderizar paso de zona
  const renderZoneStep = (zoneIndex: number) => {
    const zone = MAINTENANCE_ZONES[zoneIndex];
    const zoneConcepts = MAINTENANCE_CONCEPTS.filter((c: MaintenanceConcept) => c.zone_id === zone.id);

    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: zone.color + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              fontSize: '20px'
            }}>
              {zone.icon}
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>{zone.name}</h2>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>{zone.description}</p>
            </div>
          </div>
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            color: '#1e40af',
            fontWeight: '500'
          }}>
            Zona {zoneIndex + 1} de {MAINTENANCE_ZONES.length}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {zoneConcepts.map((concept: MaintenanceConcept) => {
            const itemId = `${zone.id}_${concept.id}`;
            const item = inspectionData[itemId];

            return (
              <div key={itemId} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>{concept.name}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {Object.entries(MAINTENANCE_STATUS).map(([statusKey, statusValue]) => (
                      <button
                        key={statusKey}
                        onClick={() => handleStatusChange(itemId, statusKey)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '20px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: item?.status === statusKey ? statusValue.color : '#f3f4f6',
                          color: item?.status === statusKey ? 'white' : '#6b7280',
                          transition: 'all 0.2s'
                        }}
                      >
                        {statusValue.label}
                      </button>
                    ))}
                  </div>
                </div>

                {item?.status !== 'bien' && (
                  <div style={{ marginTop: '16px' }}>
                    <textarea
                      placeholder="Describe el problema detectado..."
                      value={item?.observations || ''}
                      onChange={(e) => updateInspectionItem(itemId, { observations: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginTop: '16px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>Tarea a realizar:</label>
                        <input
                          type="text"
                          placeholder="Ej: Reparar soldadura rota"
                          value={item?.task_to_perform || ''}
                          onChange={(e) => updateInspectionItem(itemId, { task_to_perform: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>Prioridad:</label>
                        <select
                          value={item?.task_priority || 'baja'}
                          onChange={(e) => updateInspectionItem(itemId, { task_priority: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          {Object.entries(TASK_PRIORITY).map(([priorityKey, priorityValue]) => (
                            <option key={priorityKey} value={priorityKey}>
                              {priorityValue.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {item?.photos_required && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        border: '1px solid #fbbf24'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <Camera style={{ width: '20px', height: '20px', color: '#d97706', marginRight: '8px' }} />
                          <span style={{
                            fontWeight: '500',
                            color: '#92400e'
                          }}>📸 Fotos obligatorias para este estado</span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#92400e',
                              marginBottom: '8px'
                            }}>Foto del deterioro:</label>
                            <input
                              type="file"
                              accept="image/*"
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d97706',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#92400e',
                              marginBottom: '8px'
                            }}>Foto de reparación:</label>
                            <input
                              type="file"
                              accept="image/*"
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d97706',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Anterior
          </button>

          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#047857';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
          >
            {zoneIndex === MAINTENANCE_ZONES.length - 1 ? 'Ver Resumen' : 'Siguiente'}
            <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
          </button>
        </div>
      </div>
    );
  };

  // Renderizar paso de resumen
  const renderSummaryStep = () => {
    const items = Object.values(inspectionData).filter((item) => item && typeof item === 'object' && item.status);
    const bien = items.filter((item) => item.status === 'bien').length;
    const regular = items.filter((item) => item.status === 'regular').length;
    const mal = items.filter((item) => item.status === 'mal').length;
    const total = items.length;
    const score = total > 0 ? Math.round(((bien * 100 + regular * 50) / total)) : 0;

    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '32px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '24px',
          textAlign: 'center',
          margin: '0 0 24px 0'
        }}>📊 Resumen de Inspección</h2>

        {/* Estadísticas generales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#15803d'
            }}>{bien}</div>
            <div style={{
              fontSize: '14px',
              color: '#166534'
            }}>BIEN</div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#fffbeb',
            borderRadius: '8px',
            border: '1px solid #fed7aa'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#ea580c'
            }}>{regular}</div>
            <div style={{
              fontSize: '14px',
              color: '#c2410c'
            }}>REGULAR</div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#dc2626'
            }}>{mal}</div>
            <div style={{
              fontSize: '14px',
              color: '#b91c1c'
            }}>CRÍTICO</div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2563eb'
            }}>{score}</div>
            <div style={{
              fontSize: '14px',
              color: '#1d4ed8'
            }}>PUNTUACIÓN</div>
          </div>
        </div>

        {/* Notas adicionales */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>Notas adicionales:</label>
          <textarea
            placeholder="Añade cualquier observación general sobre la inspección..."
            value={inspectionData.notes}
            onChange={(e) => setInspectionData((prev) => ({ ...prev, notes: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Anterior
          </button>

          <button
            onClick={handleSubmitInspection}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#047857';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
          >
            <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Enviar Inspección
          </button>
        </div>
      </div>
    );
  };

  const totalSteps = MAINTENANCE_ZONES.length + 2;
  const progress = getProgress();
  const currentZone = currentStep > 0 && currentStep <= MAINTENANCE_ZONES.length
    ? MAINTENANCE_ZONES[currentStep - 1]
    : null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>

      {/* Barra de progreso sticky */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                {currentStep === 0 ? 'Inicio' :
                  currentStep <= MAINTENANCE_ZONES.length ? `Zona ${currentStep}/${MAINTENANCE_ZONES.length}: ${currentZone?.name}` :
                    'Resumen final'}
              </span>
              {currentZone && (
                <span style={{ fontSize: '18px' }}>{currentZone.icon}</span>
              )}
            </div>
            <span style={{
              fontSize: '13px', fontWeight: '700', color: '#059669',
              backgroundColor: '#f0fdf4', padding: '2px 10px', borderRadius: '12px'
            }}>
              {progress}%
            </span>
          </div>
          <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '6px' }}>
            <div style={{
              backgroundColor: progress === 100 ? '#059669' : '#10b981',
              height: '6px', borderRadius: '9999px',
              width: `${progress}%`, transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        {currentStep === 0 && renderStartStep()}
        {currentStep > 0 && currentStep <= MAINTENANCE_ZONES.length && renderZoneStep(currentStep - 1)}
        {currentStep === MAINTENANCE_ZONES.length + 1 && renderSummaryStep()}
      </div>
    </div>
  );
};

export default ManagerQuarterlyMaintenance;
