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
import { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS, MAINTENANCE_STATUS, TASK_PRIORITY } from '../../types/maintenance';
import maintenanceService from '../../services/maintenanceService';

interface InspectionStepByStepProps {
  userEmail: string;
  userName: string;
  centerName: string;
  centerId: string;
  onBack: () => void;
}

const InspectionStepByStep: React.FC<InspectionStepByStepProps> = ({
  userEmail,
  userName,
  centerName,
  centerId,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(0); // 0 = inicio, 1-9 = zonas, 10 = resumen
  const [selectedCenter, setSelectedCenter] = useState({ id: centerId, name: centerName });
  const [inspectionData, setInspectionData] = useState<any>({});

  // Centros disponibles
  const availableCenters = [
    { id: 'sevilla', name: 'Centro Sevilla' },
    { id: 'jerez', name: 'Centro Jerez' },
    { id: 'puerto', name: 'Centro Puerto' }
  ];

  // Inicializar datos de inspección
  useEffect(() => {
    const items: any = {};
    
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
    
    setInspectionData((prev: any) => ({ ...prev, ...items }));
  }, []);

  // Actualizar item de inspección
  const updateInspectionItem = (itemId: string, updates: any) => {
    setInspectionData((prev: any) => ({
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
      console.log(' Enviando inspección...');
      
      // Preparar datos de la inspección
      const inspectionDate = new Date();
      const inspectionMonth = inspectionDate.toISOString().substring(0, 7); // "2025-09"
      
      // Calcular estadísticas
      const allItems = Object.values(inspectionData) as any[];
      const itemsOk = allItems.filter((item: any) => item.status === 'bien').length;
      const itemsRegular = allItems.filter((item: any) => item.status === 'regular').length;
      const itemsBad = allItems.filter((item: any) => item.status === 'mal').length;
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
        const itemData = item as any;
        
        return {
          id: `${Date.now()}_${itemId}`,
          inspection_id: '', // Se asignará después de crear la inspección
          zone_id: zoneId,
          zone_name: zone?.name || 'Zona desconocida',
          concept_id: conceptId,
          concept_name: concept?.name || 'Concepto desconocido',
          status: itemData.status || 'bien',
          observations: itemData.observations || '',
          task_to_perform: itemData.task_to_perform || '',
          task_priority: itemData.task_priority || 'baja',
          task_status: 'pendiente' as const,
          photos_required: itemData.photos_required || false,
          photo_urls: itemData.photo_urls || [],
          photos_deterioro: itemData.photo_urls || [],
          is_critical_for_checklist: itemData.status === 'mal',
          can_close_task: false,
          beni_notified: false,
          created_at: inspectionDate.toISOString(),
          updated_at: inspectionDate.toISOString()
        };
      });

      // Enviar a Supabase usando el servicio
      const { default: maintenanceService } = await import('../../services/maintenanceService');
      const result = await maintenanceService.createInspection({
        inspection,
        items
      });

      if (result.success) {
        console.log(' Inspección enviada correctamente');
        alert(' Inspección enviada correctamente');
        onBack(); // Volver al dashboard
      } else {
        console.error('Error enviando inspección:', result.error);
        alert('Error enviando inspección: ' + result.error);
      }

    } catch (error) {
      console.error('Error en handleSubmitInspection:', error);
      alert('Error enviando inspección');
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
        }}>Inspección Mensual de Mantenimiento</h2>
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
            onChange={(e) => setInspectionData((prev: any) => ({ 
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
          {MAINTENANCE_ZONES.map((zone: any) => (
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
                  {MAINTENANCE_CONCEPTS.filter((c: any) => c.zone_id === zone.id).length} conceptos
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
    const zoneConcepts = MAINTENANCE_CONCEPTS.filter((c: any) => c.zone_id === zone.id);
    
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
          {zoneConcepts.map((concept: any) => {
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
    const items = Object.values(inspectionData).filter((item: any) => item && typeof item === 'object' && item.status);
    const bien = items.filter((item: any) => item.status === 'bien').length;
    const regular = items.filter((item: any) => item.status === 'regular').length;
    const mal = items.filter((item: any) => item.status === 'mal').length;
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
            onChange={(e) => setInspectionData((prev: any) => ({ ...prev, notes: e.target.value }))}
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

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '24px',
      height: '100%',
      overflow: 'auto'
    }}>
      {/* Barra de progreso */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Progreso de Inspección
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#059669'
          }}>
            {getProgress()}%
          </span>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          height: '8px'
        }}>
          <div style={{
            backgroundColor: '#059669',
            height: '8px',
            borderRadius: '9999px',
            width: `${getProgress()}%`,
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {currentStep === 0 && renderStartStep()}
        {currentStep > 0 && currentStep <= MAINTENANCE_ZONES.length && renderZoneStep(currentStep - 1)}
        {currentStep === MAINTENANCE_ZONES.length + 1 && renderSummaryStep()}
      </div>
    </div>
  );
};

export default InspectionStepByStep;
