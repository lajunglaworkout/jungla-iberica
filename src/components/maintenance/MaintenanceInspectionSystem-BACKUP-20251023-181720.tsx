import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  User, 
  MapPin, 
  Clock,
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  Upload,
  Eye
} from 'lucide-react';
import { 
  MAINTENANCE_ZONES, 
  MAINTENANCE_CONCEPTS, 
  MAINTENANCE_STATUS,
  TASK_PRIORITY,
  MAINTENANCE_CALENDAR,
  getNextInspectionDate,
  requiresPhotos,
  canCloseTask
} from '../../types/maintenance';
import type { 
  MaintenanceInspection, 
  MaintenanceInspectionItem,
  MaintenanceZone,
  MaintenanceConcept
} from '../../types/maintenance';
import maintenanceService from '../../services/maintenanceService';

interface MaintenanceInspectionSystemProps {
  userEmail: string;
  userName: string;
  centerName: string;
  centerId: string;
  onClose?: () => void;
}

interface InspectionFormData {
  inspector_name: string;
  inspector_email: string;
  inspection_date: string;
  notes: string;
  items: Record<string, MaintenanceInspectionItem>;
}

const MaintenanceInspectionSystem: React.FC<MaintenanceInspectionSystemProps> = ({
  userEmail,
  userName,
  centerName,
  centerId,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentZone, setCurrentZone] = useState<MaintenanceZone | null>(null);
  const [inspectionData, setInspectionData] = useState<InspectionFormData>({
    inspector_name: userName,
    inspector_email: userEmail,
    inspection_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentItemForPhoto, setCurrentItemForPhoto] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'deterioro' | 'reparacion'>('deterioro');

  // Obtener conceptos para la zona actual
  const getCurrentZoneConcepts = (): MaintenanceConcept[] => {
    if (!currentZone) return [];
    return MAINTENANCE_CONCEPTS.filter(concept => concept.zone_id === currentZone.id);
  };

  // Inicializar items de inspección
  useEffect(() => {
    const initializeItems = () => {
      const items: Record<string, MaintenanceInspectionItem> = {};
      
      MAINTENANCE_ZONES.forEach(zone => {
        const concepts = MAINTENANCE_CONCEPTS.filter(c => c.zone_id === zone.id);
        concepts.forEach(concept => {
          const itemId = `${zone.id}_${concept.id}`;
          items[itemId] = {
            id: itemId,
            inspection_id: '',
            zone_id: zone.id,
            zone_name: zone.name,
            concept_id: concept.id,
            concept_name: concept.name,
            status: 'bien',
            observations: '',
            task_to_perform: '',
            task_status: 'pendiente',
            task_priority: 'media',
            photos_deterioro: [],
            photos_reparacion: [],
            photos_required: false,
            can_close_task: true,
            beni_notified: false,
            is_critical_for_checklist: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
      });
      
      setInspectionData(prev => ({ ...prev, items }));
    };

    initializeItems();
  }, []);

  // Establecer zona actual basada en el paso
  useEffect(() => {
    if (currentStep === 0) {
      setCurrentZone(null);
    } else if (currentStep <= MAINTENANCE_ZONES.length) {
      setCurrentZone(MAINTENANCE_ZONES[currentStep - 1]);
    } else {
      setCurrentZone(null);
    }
  }, [currentStep]);

  // Actualizar item de inspección
  const updateInspectionItem = (itemId: string, updates: Partial<MaintenanceInspectionItem>) => {
    setInspectionData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: {
          ...prev.items[itemId],
          ...updates,
          updated_at: new Date().toISOString()
        }
      }
    }));
  };

  // Manejar cambio de estado
  const handleStatusChange = (itemId: string, status: 'bien' | 'regular' | 'mal') => {
    const photosRequired = requiresPhotos(status);
    const isCritical = status === 'mal';
    
    updateInspectionItem(itemId, {
      status,
      photos_required: photosRequired,
      is_critical_for_checklist: isCritical,
      beni_notified: isCritical
    });
  };

  // Subir foto real con Supabase
  const handlePhotoUpload = async (itemId: string, type: 'deterioro' | 'reparacion', file: File) => {
    try {
      console.log(`📸 Subiendo foto de ${type} para item ${itemId}`);
      
      const result = await maintenanceService.uploadMaintenancePhoto(file, itemId, type);
      
      if (result.success && result.url) {
        const currentItem = inspectionData.items[itemId];
        const updatedPhotos = type === 'deterioro' 
          ? [...currentItem.photos_deterioro, result.url]
          : [...(currentItem.photos_reparacion || []), result.url];
        
        updateInspectionItem(itemId, {
          [type === 'deterioro' ? 'photos_deterioro' : 'photos_reparacion']: updatedPhotos,
          can_close_task: type === 'reparacion' ? true : canCloseTask(updatedPhotos.length > 0)
        });
        
        console.log(`✅ Foto subida correctamente: ${result.url}`);
      } else {
        console.error('❌ Error subiendo foto:', result.error);
        alert('Error al subir la foto. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('❌ Error en handlePhotoUpload:', error);
      alert('Error al subir la foto. Inténtalo de nuevo.');
    }
  };

  // Calcular progreso
  const getProgress = () => {
    const totalSteps = MAINTENANCE_ZONES.length + 2; // +2 para inicio y resumen
    return Math.round((currentStep / totalSteps) * 100);
  };

  // Obtener estadísticas de la inspección
  const getInspectionStats = () => {
    const items = Object.values(inspectionData.items);
    const total = items.length;
    const bien = items.filter(item => item.status === 'bien').length;
    const regular = items.filter(item => item.status === 'regular').length;
    const mal = items.filter(item => item.status === 'mal').length;
    const score = total > 0 ? Math.round(((bien * 100 + regular * 60 + mal * 20) / total)) : 0;
    
    return { total, bien, regular, mal, score };
  };

  // Enviar inspección
  const handleSubmitInspection = async () => {
    setIsSubmitting(true);
    
    try {
      const stats = getInspectionStats();
      
      const inspection: Omit<MaintenanceInspection, 'id'> = {
        center_id: centerId,
        center_name: centerName,
        inspector_name: inspectionData.inspector_name,
        inspector_email: inspectionData.inspector_email,
        inspection_date: inspectionData.inspection_date,
        inspection_month: inspectionData.inspection_date.substring(0, 7),
        inspection_year: new Date(inspectionData.inspection_date).getFullYear(),
        status: 'completed',
        total_items: stats.total,
        items_ok: stats.bien,
        items_regular: stats.regular,
        items_bad: stats.mal,
        overall_score: stats.score,
        notes: inspectionData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const items = Object.values(inspectionData.items);
      
      console.log('📊 Enviando inspección a Supabase...', inspection);
      console.log('📋 Items de inspección:', items);
      
      // Enviar a Supabase usando el servicio
      const result = await maintenanceService.createInspection({
        inspection,
        items
      });
      
      if (result.success) {
        alert('✅ Inspección enviada correctamente');
        console.log('✅ Inspección creada con ID:', result.data?.id);
        if (onClose) onClose();
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('❌ Error enviando inspección:', error);
      alert('❌ Error al enviar la inspección. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar paso de inicio
  const renderStartStep = () => (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <Calendar style={{
            width: '64px',
            height: '64px',
            color: '#059669',
            margin: '0 auto 16px',
            display: 'block'
          }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Calendar size={32} style={{ color: '#059669' }} />
            Inspección Trimestral de Mantenimiento
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            Centro {centerName} - {new Date(inspectionData.inspection_date).toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-500 mr-3" />
              <span className="text-gray-700">Inspector</span>
            </div>
            <span className="font-medium">{inspectionData.inspector_name}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-500 mr-3" />
              <span className="text-gray-700">Centro</span>
            </div>
            <span className="font-medium">{centerName}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-3" />
              <span className="text-gray-700">Fecha</span>
            </div>
            <input
              type="date"
              value={inspectionData.inspection_date}
              onChange={(e) => setInspectionData(prev => ({ 
                ...prev, 
                inspection_date: e.target.value 
              }))}
              className="border border-gray-300 rounded px-3 py-1"
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Zonas a inspeccionar:</h3>
          <div className="grid grid-cols-3 gap-3">
            {MAINTENANCE_ZONES.map((zone, index) => (
              <div key={zone.id} className="flex items-center text-sm text-blue-800">
                <span className="mr-2">{zone.icon}</span>
                <span>{zone.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(1)}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          Comenzar Inspección
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );

  // Renderizar paso de zona
  const renderZoneStep = () => {
    if (!currentZone) return null;
    
    const concepts = getCurrentZoneConcepts();
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header de zona */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mr-4"
                style={{ backgroundColor: currentZone.color }}
              >
                {currentZone.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentZone.name}</h2>
                <p className="text-gray-600">{currentZone.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Zona {currentStep} de {MAINTENANCE_ZONES.length}</div>
              <div className="text-lg font-semibold text-gray-900">
                {concepts.length} conceptos
              </div>
            </div>
          </div>

          {/* Lista de conceptos */}
          <div className="space-y-6">
            {concepts.map((concept) => {
              const itemId = `${currentZone.id}_${concept.id}`;
              const item = inspectionData.items[itemId];
              
              return (
                <div key={concept.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{concept.name}</h3>
                      <p className="text-sm text-gray-600">{concept.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {Object.entries(MAINTENANCE_STATUS).map(([status, config]) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(itemId, status as any)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item.status === status
                              ? 'text-white'
                              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: item.status === status ? config.color : undefined
                          }}
                        >
                          {config.icon} {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={item.observations}
                      onChange={(e) => updateInspectionItem(itemId, { observations: e.target.value })}
                      placeholder="Describe el estado actual..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Tarea a realizar (si no está en BIEN) */}
                  {item.status !== 'bien' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarea a realizar
                      </label>
                      <textarea
                        value={item.task_to_perform}
                        onChange={(e) => updateInspectionItem(itemId, { task_to_perform: e.target.value })}
                        placeholder="Describe la tarea necesaria..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Fotos obligatorias */}
                  {item.photos_required && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Camera className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">
                          Fotos obligatorias para estado {MAINTENANCE_STATUS[item.status].label}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            setCurrentItemForPhoto(itemId);
                            setPhotoType('deterioro');
                            setShowPhotoModal(true);
                          }}
                          className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Subir Foto ({item.photos_deterioro.length})
                        </button>
                        
                        {item.photos_deterioro.length > 0 && (
                          <span className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Fotos subidas
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alertas */}
                  {item.status === 'mal' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-red-800">
                          ⚠️ Estado crítico - Se notificará automáticamente a Beni
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navegación */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Anterior
            </button>
            
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === MAINTENANCE_ZONES.length ? 'Ver Resumen' : 'Siguiente Zona'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar resumen final
  const renderSummaryStep = () => {
    const stats = getInspectionStats();
    const criticalItems = Object.values(inspectionData.items).filter(item => item.status === 'mal');
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen de Inspección</h2>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.bien}</div>
              <div className="text-sm text-gray-600">En Buen Estado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.regular}</div>
              <div className="text-sm text-gray-600">Estado Regular</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.mal}</div>
              <div className="text-sm text-gray-600">Estado Crítico</div>
            </div>
          </div>

          {/* Puntuación general */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Puntuación General</h3>
                <p className="text-gray-600">Basada en el estado de todos los elementos</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ 
                  color: stats.score >= 80 ? '#10b981' : stats.score >= 60 ? '#f59e0b' : '#ef4444' 
                }}>
                  {stats.score}
                </div>
                <div className="text-sm text-gray-600">de 100</div>
              </div>
            </div>
          </div>

          {/* Items críticos */}
          {criticalItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Items Críticos ({criticalItems.length})
              </h3>
              <div className="space-y-3">
                {criticalItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <div className="font-medium text-gray-900">{item.zone_name}</div>
                      <div className="text-sm text-gray-600">{item.concept_name}</div>
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      Se notificará a Beni automáticamente
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas generales */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas generales de la inspección
            </label>
            <textarea
              value={inspectionData.notes}
              onChange={(e) => setInspectionData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Añade comentarios generales sobre la inspección..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={4}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Revisar Zonas
            </button>
            
            <button
              onClick={handleSubmitInspection}
              disabled={isSubmitting}
              className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Inspección
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de fotos (simplificado)
  const renderPhotoModal = () => {
    if (!showPhotoModal || !currentItemForPhoto) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Subir Foto</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Selecciona una foto del deterioro</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handlePhotoUpload(currentItemForPhoto, photoType, file);
                  setShowPhotoModal(false);
                }
              }}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
            >
              Seleccionar Foto
            </label>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
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
            transition: 'width 0.3s ease',
            width: `${getProgress()}%`
          }}></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        {currentStep === 0 && renderStartStep()}
        {currentStep > 0 && currentStep <= MAINTENANCE_ZONES.length && renderZoneStep()}
        {currentStep === MAINTENANCE_ZONES.length + 1 && renderSummaryStep()}
      </div>

      {/* Modal de fotos */}
      {renderPhotoModal()}
    </div>
  );
};

export default MaintenanceInspectionSystem;
