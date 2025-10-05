import React, { useState } from 'react';
import { X, AlertTriangle, Package, Wrench, Users, Building, Send, CheckCircle, Camera, Upload, Image, Plus } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
// import { checklistIncidentService } from '../../services/checklistIncidentService';
import { supabase } from '../../lib/supabase';

interface SmartIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerName: string;
  centerId: string;
  initialDescription?: string;
  onIncidentCreated?: (incident: any) => void;
}

interface IncidentType {
  id: string;
  name: string;
  department: string;
  responsible: string;
  icon: React.ReactNode;
  color: string;
  requiresInventory: boolean;
  autoNotify: string[];
  description: string;
}

const INCIDENT_TYPES: IncidentType[] = [
  {
    id: 'maintenance',
    name: 'Mantenimiento',
    department: 'Mantenimiento',
    responsible: 'Responsable de Mantenimiento',
    icon: <Wrench className="w-5 h-5" />,
    color: '#ef4444',
    requiresInventory: false,
    autoNotify: ['mantenimiento@lajungla.com'],
    description: 'Goteras, aire acondicionado, máquinas'
  },
  {
    id: 'logistics',
    name: 'Material/Suministros',
    department: 'Logística',
    responsible: 'Encargado de Logística',
    icon: <Package className="w-5 h-5" />,
    color: '#059669',
    requiresInventory: true,
    autoNotify: ['pedidoslajungla@gmail.com'],
    description: 'Material roto, falta de suministros'
  },
  {
    id: 'hr',
    name: 'Personal',
    department: 'RRHH',
    responsible: 'Responsable de RRHH',
    icon: <Users className="w-5 h-5" />,
    color: '#8b5cf6',
    requiresInventory: false,
    autoNotify: ['rrhhlajungla@gmail.com'],
    description: 'Problemas con empleados'
  },
  {
    id: 'security',
    name: 'Seguridad',
    department: 'Dirección',
    responsible: 'Director',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: '#dc2626',
    requiresInventory: false,
    autoNotify: ['carlossuarezparra@gmail.com'],
    description: 'Accidentes, emergencias'
  }
];

const SmartIncidentModal: React.FC<SmartIncidentModalProps> = ({
  isOpen,
  onClose,
  centerName,
  centerId,
  initialDescription = '',
  onIncidentCreated
}) => {
  const { employee } = useSession();
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [inventoryItem, setInventoryItem] = useState('');
  const [inventoryQuantity, setInventoryQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

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

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) return;

    setIsSubmitting(true);

    try {
      // Preparar datos para la base de datos
      const incidentData = {
        center_id: centerId,
        center_name: centerName,
        reporter_id: employee?.id || undefined,
        reporter_name: employee?.name || 'Usuario',
        incident_type: selectedType.id as 'maintenance' | 'logistics' | 'hr' | 'security',
        department: selectedType.department,
        responsible: selectedType.responsible,
        title: description.substring(0, 100), // Limitar título
        description: description,
        priority: priority,
        status: 'abierta' as const,
        inventory_item: selectedType.requiresInventory ? inventoryItem || undefined : undefined,
        inventory_quantity: selectedType.requiresInventory ? inventoryQuantity : undefined,
        has_images: selectedImages.length > 0,
        auto_notify: selectedType.autoNotify,
        notified_at: new Date().toISOString()
      };

      // Guardar en la base de datos directamente
      const { data: savedIncident, error } = await supabase
        .from('checklist_incidents')
        .insert([incidentData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error guardando incidencia:', error);
        alert('Error al guardar la incidencia. Inténtalo de nuevo.');
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Incidencia guardada en BD:', savedIncident);
      console.log('📧 Notificando a:', selectedType.autoNotify);
      
      if (selectedImages.length > 0) {
        console.log(`📸 Imágenes adjuntas: ${selectedImages.length}`);
        selectedImages.forEach((file, index) => {
          console.log(`  - Imagen ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
        });
        // TODO: Implementar subida de imágenes a storage
      }

      if (selectedType.requiresInventory && inventoryItem) {
        console.log(`📦 Descontando ${inventoryQuantity} de "${inventoryItem}"`);
        // TODO: Implementar descuento automático de inventario
      }

      setShowSuccess(true);
      setTimeout(() => {
        onIncidentCreated?.(savedIncident);
        onClose();
        setShowSuccess(false);
        setSelectedType(null);
        setDescription('');
        setPriority('media');
        setInventoryItem('');
        setInventoryQuantity(1);
        // Limpiar imágenes y liberar URLs
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedImages([]);
        setImagePreviewUrls([]);
      }, 2000);

    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      alert('Error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">¡Incidencia Reportada!</h3>
          <p className="text-gray-600 mb-2">Notificado a <strong>{selectedType?.department}</strong></p>
          {selectedImages.length > 0 && (
            <p className="text-sm text-blue-600">
              📸 {selectedImages.length} imagen{selectedImages.length > 1 ? 'es' : ''} adjunta{selectedImages.length > 1 ? 's' : ''}
            </p>
          )}
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Prioridad:</strong> {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Reportar Incidencia</h2>
            <p className="text-sm text-gray-600">{centerName}</p>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!selectedType ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Tipo de incidencia:</h3>
              <div className="grid grid-cols-2 gap-4">
                {INCIDENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div style={{ color: type.color }}>{type.icon}</div>
                      <span className="font-semibold">{type.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ color: selectedType.color }}>{selectedType.icon}</div>
                  <div>
                    <span className="font-semibold">{selectedType.name}</span>
                    <p className="text-sm text-gray-600">→ {selectedType.department}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedType(null)} className="text-blue-600">
                  Cambiar
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué ha ocurrido..."
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Prioridad</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'baja', label: '🟢 Baja', color: 'bg-green-100 text-green-800 border-green-300' },
                    { value: 'media', label: '🟡 Media', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                    { value: 'alta', label: '🟠 Alta', color: 'bg-orange-100 text-orange-800 border-orange-300' },
                    { value: 'critica', label: '🔴 Crítica', color: 'bg-red-100 text-red-800 border-red-300' }
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value as any)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                        priority === p.value 
                          ? `${p.color} border-opacity-100 shadow-md` 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección de imágenes */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">📸 Imágenes (opcional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {selectedImages.length === 0 ? (
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Adjunta fotos para ayudar a resolver la incidencia</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100">
                        <Upload className="w-4 h-4" />
                        Seleccionar imágenes
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Máximo 3 imágenes (JPG, PNG)</p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      {selectedImages.length < 3 && (
                        <label className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 text-sm">
                          <Plus className="w-4 h-4" />
                          Añadir más
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedType.requiresInventory && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-3">📦 Gestión de Inventario</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Artículo</label>
                      <input
                        type="text"
                        value={inventoryItem}
                        onChange={(e) => setInventoryItem(e.target.value)}
                        placeholder="Ej: Goma elástica 3cm"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={inventoryQuantity}
                        onChange={(e) => setInventoryQuantity(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!description.trim() || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Reportar Incidencia
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartIncidentModal;
