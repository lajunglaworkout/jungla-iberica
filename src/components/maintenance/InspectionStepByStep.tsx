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
  availableCenters?: Array<{ id: string; name: string }>;
  onBack: () => void;
}

const InspectionStepByStep: React.FC<InspectionStepByStepProps> = ({
  userEmail,
  userName,
  centerName,
  centerId,
  availableCenters: providedCenters,
  onBack
}) => {
  // Centros disponibles (usar prop o solo el actual)
  const availableCenters = providedCenters || [{ id: centerId, name: centerName }];

  const [currentStep, setCurrentStep] = useState(0); // 0 = inicio, 1-9 = zonas, 10 = resumen
  const [selectedCenter, setSelectedCenter] = useState(
    (centerId && centerName)
      ? { id: centerId, name: centerName }
      : (availableCenters.length > 0 ? availableCenters[0] : { id: '', name: '' })
  );
  const [inspectionData, setInspectionData] = useState<any>({});
  const [inspectionId, setInspectionId] = useState<string | null>(null);

  // Inicializar datos de inspección
  useEffect(() => {
    const initializeInspection = async () => {
      // 1. Inicializar estructura vacía
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

      // 2. Iniciar/Cargar inspección desde BD
      if (selectedCenter && selectedCenter.id) {
        try {
          const result = await maintenanceService.startInspection(selectedCenter.id, userName);
          if (result.success && result.inspectionId) {
            setInspectionId(result.inspectionId);

            // Cargar items existentes
            const itemsResult = await maintenanceService.getInspectionItems(result.inspectionId);
            if (itemsResult.success && itemsResult.data) {
              itemsResult.data.forEach(dbItem => {
                const key = `${dbItem.zone_id}_${dbItem.concept_id}`;
                if (items[key]) {
                  items[key] = {
                    ...items[key],
                    uuid: dbItem.id, // Guardar ID de BD
                    status: dbItem.status,
                    observations: dbItem.observations,
                    task_to_perform: dbItem.task_to_perform,
                    task_priority: dbItem.task_priority,
                    photos_required: dbItem.photos_required,
                    photos_deterioro: dbItem.photos_deterioro || [],
                    photos_reparacion: dbItem.photos_reparacion || []
                  };
                }
              });
            }
          }
        } catch (error) {
          console.error('Error initializing inspection:', error);
        }
      }

      setInspectionData(items);
    };

    initializeInspection();
  }, [selectedCenter, userName]);

  // Actualizar item de inspección
  const updateInspectionItem = (itemId: string, updates: any) => {
    setInspectionData((prev: any) => {
      const currentItem = prev[itemId];
      const newItem = { ...currentItem, ...updates };

      // Guardar en BD si tenemos UUID (debounce simple: guardar siempre por ahora)
      if (currentItem.uuid) {
        maintenanceService.updateInspectionItemProgress(currentItem.uuid, updates)
          .catch(err => console.error('Error saving item progress:', err));
      }

      return {
        ...prev,
        [itemId]: newItem
      };
    });
  };

  // Calcular progreso
  const getProgress = () => {
    const totalSteps = MAINTENANCE_ZONES.length + 2; // zonas + inicio + resumen
    return Math.round((currentStep / totalSteps) * 100);
  };

  const handleSubmitInspection = async () => {
    if (!inspectionId) {
      alert('Error: No hay ID de inspección activo');
      return;
    }

    try {
      console.log(' Enviando inspección...');

      // Preparar datos de la inspección
      const allItems = Object.values(inspectionData) as any[];
      const itemsOk = allItems.filter((item: any) => item.status === 'bien').length;
      const itemsRegular = allItems.filter((item: any) => item.status === 'regular').length;
      const itemsBad = allItems.filter((item: any) => item.status === 'mal').length;
      const totalItems = allItems.length;
      const overallScore = Math.round(((itemsOk * 100) + (itemsRegular * 60) + (itemsBad * 20)) / totalItems);

      const summaryData = {
        total_items: totalItems,
        items_ok: itemsOk,
        items_regular: itemsRegular,
        items_bad: itemsBad,
        overall_score: overallScore,
        notes: ''
      };

      // Completar inspección usando el servicio
      const result = await maintenanceService.completeInspection(inspectionId, summaryData);

      if (result.success) {
        console.log(' Inspección enviada correctamente');
        alert('✅ Inspección finalizada y guardada correctamente');
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
    <div style={{ maxWidth: window.innerWidth < 768 ? '100%' : '1000px', margin: '0 auto', padding: window.innerWidth < 768 ? '0' : '0' }}>
      {/* Header Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        padding: '40px',
        marginBottom: '32px',
        textAlign: 'center',
        border: '1px solid #f3f4f6'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#ecfdf5',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)'
        }}>
          <Calendar style={{ width: '40px', height: '40px', color: '#059669' }} />
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>Inspección Mensual de Mantenimiento</h2>

        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '32px'
        }}>
          {selectedCenter.name} • {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </p>

        {/* Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          textAlign: 'left'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <User style={{ width: '18px', height: '18px', color: '#6b7280', marginRight: '8px' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inspector</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{userName}</div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <MapPin style={{ width: '18px', height: '18px', color: '#6b7280', marginRight: '8px' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Centro</span>
            </div>
            <select
              value={selectedCenter.id.toString()}
              onChange={(e) => {
                const center = availableCenters.find(c => c.id.toString() === e.target.value);
                if (center) setSelectedCenter(center);
              }}
              style={{
                width: '100%',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: 0,
                margin: 0
              }}
            >
              {availableCenters.map(center => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Calendar style={{ width: '18px', height: '18px', color: '#6b7280', marginRight: '8px' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</span>
            </div>
            <input
              type="date"
              value={inspectionData.inspection_date || ''}
              onChange={(e) => setInspectionData((prev: any) => ({ ...prev, inspection_date: e.target.value }))}
              style={{
                width: '100%',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </div>

      {/* Zones Grid */}
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#374151',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          backgroundColor: '#e5e7eb',
          borderRadius: '50%',
          fontSize: '12px',
          marginRight: '10px'
        }}>{MAINTENANCE_ZONES.length}</span>
        Zonas a Inspeccionar
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {MAINTENANCE_ZONES.map((zone: any) => (
          <div key={zone.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
            }}
          >
            <div style={{
              fontSize: '24px',
              marginRight: '16px',
              filter: 'grayscale(0.2)'
            }}>{zone.icon}</div>
            <div>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>{zone.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {MAINTENANCE_CONCEPTS.filter((c: any) => c.zone_id === zone.id).length} puntos de control
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrentStep(1)}
        style={{
          width: '100%',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '18px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#059669';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#10b981';
          e.currentTarget.style.transform = 'none';
        }}
      >
        Comenzar Inspección
        <ArrowRight style={{ width: '24px', height: '24px', marginLeft: '12px' }} />
      </button>
    </div>
  );

  // Renderizar paso de zona
  const renderZoneStep = (zoneIndex: number) => {
    const zone = MAINTENANCE_ZONES[zoneIndex];
    const zoneConcepts = MAINTENANCE_CONCEPTS.filter((c: any) => c.zone_id === zone.id);

    return (
      <div style={{ maxWidth: window.innerWidth < 768 ? '100%' : '1000px', margin: '0 auto' }}>
        {/* Zone Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '32px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #f3f4f6',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: zone.color + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              fontSize: '24px',
              flexShrink: 0,
              boxShadow: `0 4px 12px ${zone.color}20`
            }}>
              {zone.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 4px 0',
                letterSpacing: '-0.02em',
                wordBreak: 'normal',
                overflowWrap: 'anywhere',
                whiteSpace: 'normal',
                hyphens: 'auto'
              }}>{zone.name}</h2>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '14px'
              }}>{zone.description}</p>
            </div>
          </div>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '100px',
            fontSize: '13px',
            color: '#4b5563',
            fontWeight: '600',
            border: '1px solid #e5e7eb',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}>
            Zona {zoneIndex + 1} / {MAINTENANCE_ZONES.length}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {zoneConcepts.map((concept: any) => {
            const itemId = `${zone.id}_${concept.id}`;
            const item = inspectionData[itemId];
            const isProblem = item?.status !== 'bien';

            return (
              <div key={itemId} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: isProblem ? '1px solid #fecaca' : '1px solid #f3f4f6',
                boxShadow: isProblem ? '0 4px 12px rgba(220, 38, 38, 0.05)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                padding: '24px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: window.innerWidth < 768 ? 'column' : 'row', // FIX BUG 2: Column on mobile
                  alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  marginBottom: isProblem ? '24px' : '0',
                  gap: window.innerWidth < 768 ? '12px' : '16px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0,
                    wordBreak: 'break-word', // FIX BUG 1: Prevent title truncation
                    whiteSpace: 'normal',
                    lineHeight: '1.4'
                  }}>{concept.name}</h3>

                  <div style={{
                    display: 'flex',
                    backgroundColor: '#f3f4f6',
                    padding: '4px',
                    borderRadius: '12px',
                    gap: '4px',
                    width: window.innerWidth < 768 ? '100%' : 'auto' // Full width on mobile
                  }}>
                    {Object.entries(MAINTENANCE_STATUS).map(([statusKey, statusValue]) => {
                      const isActive = item?.status === statusKey;
                      return (
                        <button
                          key={statusKey}
                          onClick={() => handleStatusChange(itemId, statusKey)}
                          style={{
                            flex: window.innerWidth < 768 ? 1 : 'none', // Equal width buttons on mobile
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: window.innerWidth < 768 ? '12px' : '13px', // Smaller font on mobile
                            fontWeight: '600',
                            backgroundColor: isActive ? statusValue.color : 'transparent',
                            color: isActive ? 'white' : '#6b7280',
                            transition: 'all 0.2s',
                            boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                            whiteSpace: 'nowrap',
                            minHeight: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {statusValue.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isProblem && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid #f3f4f6',
                    animation: 'fadeIn 0.3s ease-in-out'
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Observaciones del problema
                      </label>
                      <textarea
                        placeholder="Describe detalladamente el problema detectado..."
                        value={item?.observations || ''}
                        onChange={(e) => updateInspectionItem(itemId, { observations: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '12px',
                          fontSize: '15px',
                          minHeight: '100px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          backgroundColor: '#f9fafb',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '20px',
                      marginBottom: '24px'
                    }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          Acción Correctiva Sugerida
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Reparar soldadura, sustituir pieza..."
                          value={item?.task_to_perform || ''}
                          onChange={(e) => updateInspectionItem(itemId, { task_to_perform: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '10px',
                            fontSize: '15px',
                            backgroundColor: '#f9fafb'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          Prioridad de Reparación
                        </label>
                        <select
                          value={item?.task_priority || 'baja'}
                          onChange={(e) => updateInspectionItem(itemId, { task_priority: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '10px',
                            fontSize: '15px',
                            backgroundColor: '#f9fafb',
                            cursor: 'pointer'
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
                        backgroundColor: '#fffbeb',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px dashed #f59e0b'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', color: '#b45309' }}>
                          <Camera style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                          <span style={{ fontWeight: '600' }}>Evidencia Fotográfica Requerida</span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '16px'
                        }}>
                          {/* Foto Deterioro */}
                          <div style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}>
                            <div style={{ marginBottom: '8px', color: '#64748b' }}>Foto del Problema</div>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ width: '100%' }}
                            />
                          </div>

                          {/* Foto Reparación (Opcional en este punto) */}
                          <div style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}>
                            <div style={{ marginBottom: '8px', color: '#64748b' }}>Foto Solución (Si aplica)</div>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ width: '100%' }}
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
          flexDirection: window.innerWidth < 768 ? 'column-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          gap: '16px'
        }}>
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            style={{
              backgroundColor: 'white',
              color: '#374151',
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              transition: 'all 0.2s',
              width: window.innerWidth < 768 ? '100%' : 'auto'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Anterior
          </button>

          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.2s',
              width: window.innerWidth < 768 ? '100%' : 'auto'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {zoneIndex === MAINTENANCE_ZONES.length - 1 ? 'Ver Resumen' : 'Siguiente Zona'}
            <ArrowRight style={{ width: '20px', height: '20px', marginLeft: '8px' }} />
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

    const getScoreColor = (s: number) => {
      if (s >= 80) return '#10b981'; // Green
      if (s >= 60) return '#f59e0b'; // Yellow
      return '#ef4444'; // Red
    };

    return (
      <div style={{ maxWidth: window.innerWidth < 768 ? '100%' : '1000px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '40px',
            letterSpacing: '-0.02em'
          }}>📊 Resumen de Inspección</h2>

          {/* Score Circle */}
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: `12px solid ${getScoreColor(score)}20`,
            borderTopColor: getScoreColor(score),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 40px',
            transform: 'rotate(-45deg)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ transform: 'rotate(45deg)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: getScoreColor(score), lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>PUNTUACIÓN</div>
            </div>
          </div>

          {/* Estadísticas generales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              padding: '24px',
              backgroundColor: '#ecfdf5',
              borderRadius: '16px',
              border: '1px solid #a7f3d0',
              transition: 'transform 0.2s'
            }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>{bien}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#047857', letterSpacing: '0.05em' }}>BIEN</div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: '#fffbeb',
              borderRadius: '16px',
              border: '1px solid #fde68a',
              transition: 'transform 0.2s'
            }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#d97706', marginBottom: '4px' }}>{regular}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#b45309', letterSpacing: '0.05em' }}>REGULAR</div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: '#fef2f2',
              borderRadius: '16px',
              border: '1px solid #fecaca',
              transition: 'transform 0.2s'
            }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#dc2626', marginBottom: '4px' }}>{mal}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#b91c1c', letterSpacing: '0.05em' }}>CRÍTICO</div>
            </div>
          </div>

          {/* Notas adicionales */}
          <div style={{ marginBottom: '40px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '12px'
            }}>Notas adicionales</label>
            <textarea
              placeholder="Añade cualquier observación general sobre la inspección..."
              value={inspectionData.notes || ''}
              onChange={(e) => setInspectionData((prev: any) => ({ ...prev, notes: e.target.value }))}
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '15px',
                minHeight: '120px',
                resize: 'vertical',
                fontFamily: 'inherit',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{
                backgroundColor: 'white',
                color: '#374151',
                padding: '16px 32px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Volver
            </button>

            <button
              onClick={handleSubmitInspection}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '16px 48px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              <CheckCircle style={{ width: '24px', height: '24px', marginRight: '12px' }} />
              Finalizar Inspección
            </button>
          </div>
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
