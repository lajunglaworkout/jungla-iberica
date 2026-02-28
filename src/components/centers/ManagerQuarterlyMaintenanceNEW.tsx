import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wrench, CheckCircle, AlertTriangle, Camera } from 'lucide-react';
import { MAINTENANCE_ZONES, MAINTENANCE_CONCEPTS } from '../../types/maintenance';

interface MaintenanceItemNEW {
  zone_id: number;
  zone_name: string;
  concept_id: number;
  concept_name: string;
  status: 'bien' | 'regular' | 'mal';
  observations: string;
  photos_required: boolean;
  [key: string]: unknown;
}

interface Props {
  onBack: () => void;
  centerId?: number;
}

const ManagerQuarterlyMaintenanceNEW: React.FC<Props> = ({ onBack }) => {
  const [items, setItems] = useState<MaintenanceItemNEW[]>([]);

  useEffect(() => {
    // Generar items de ejemplo
    const tempItems: MaintenanceItemNEW[] = [];
    MAINTENANCE_ZONES.forEach(zone => {
      const concepts = MAINTENANCE_CONCEPTS.filter(c => c.zone_id === zone.id);
      concepts.forEach(concept => {
        tempItems.push({
          zone_id: zone.id,
          zone_name: zone.name,
          concept_id: concept.id,
          concept_name: concept.name,
          status: 'bien',
          observations: '',
          photos_required: false
        });
      });
    });
    setItems(tempItems);
  }, []);

  const updateItem = (index: number, field: string, value: string | boolean | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { 
        ...item, 
        [field]: value,
        photos_required: field === 'status' ? (value === 'regular' || value === 'mal') : item.photos_required
      } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bien': return '#10b981';
      case 'regular': return '#f59e0b';
      case 'mal': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Agrupar items por zona
  const itemsByZone = items.reduce((acc, item) => {
    if (!acc[item.zone_name]) {
      acc[item.zone_name] = [];
    }
    acc[item.zone_name].push(item);
    return acc;
  }, {} as Record<string, MaintenanceItemNEW[]>);

  return (
    <div style={{
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginBottom: '16px',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            <ArrowLeft size={16} />
            Volver a mis gestiones
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#f59e0b',
              borderRadius: '8px',
              padding: '8px',
              color: 'white'
            }}>
              <Wrench size={24} />
            </div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                🚀 INTERFAZ ACTUALIZADA v3.0 - Revisión Trimestral
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Centro Sevilla - Interfaz por Zonas y Conceptos
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Zonas */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {Object.entries(itemsByZone).map(([zoneName, zoneItems]) => (
            <div
              key={zoneName}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏗️ {zoneName}
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: '#6b7280'
                }}>
                  ({zoneItems.length} conceptos)
                </span>
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                {zoneItems.map((item, index) => {
                  const globalIndex = items.findIndex(i => 
                    i.zone_id === item.zone_id && i.concept_id === item.concept_id
                  );

                  return (
                    <div
                      key={`${item.zone_id}-${item.concept_id}`}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#374151',
                          margin: 0
                        }}>
                          {item.concept_name}
                        </h4>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['bien', 'regular', 'mal'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateItem(globalIndex, 'status', status)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                backgroundColor: item.status === status ? getStatusColor(status) : 'white',
                                color: item.status === status ? 'white' : '#374151',
                                border: `1px solid ${getStatusColor(status)}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {status === 'bien' && <CheckCircle size={14} />}
                              {status !== 'bien' && <AlertTriangle size={14} />}
                              {status.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(item.status === 'regular' || item.status === 'mal') && (
                        <div style={{ marginTop: '12px' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '4px'
                          }}>
                            Observaciones {item.status === 'mal' && '*'}
                          </label>
                          <textarea
                            value={item.observations}
                            onChange={(e) => updateItem(globalIndex, 'observations', e.target.value)}
                            placeholder="Describe el problema encontrado..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px',
                              resize: 'vertical',
                              minHeight: '60px'
                            }}
                          />
                        </div>
                      )}

                      {item.photos_required && (
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
                              fontWeight: '600',
                              color: '#92400e',
                              fontSize: '14px'
                            }}>
                              📸 Fotos obligatorias para estado {item.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                          }}>
                            <div>
                              <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#92400e',
                                marginBottom: '6px'
                              }}>
                                Foto del deterioro:
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                style={{
                                  width: '100%',
                                  padding: '6px',
                                  border: '1px solid #d97706',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  backgroundColor: 'white'
                                }}
                              />
                            </div>
                            
                            <div>
                              <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#92400e',
                                marginBottom: '6px'
                              }}>
                                Foto de reparación:
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                style={{
                                  width: '100%',
                                  padding: '6px',
                                  border: '1px solid #d97706',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  backgroundColor: 'white'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {item.status === 'mal' && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          border: '1px solid #fecaca'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <AlertTriangle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                            <span style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#dc2626'
                            }}>
                              ⚠️ Estado crítico - Se notificará automáticamente a Beni
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerQuarterlyMaintenanceNEW;
