import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Package, Wrench, Users, Building, Send, CheckCircle, Camera, Upload, Image, Plus, ArrowRight, ChevronRight } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import { supabase } from '../../lib/supabase';
import { notifyIncident } from '../../services/notificationService';

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
  gradient: string;
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
    icon: <Wrench className="w-6 h-6 text-white" />,
    color: '#ef4444',
    gradient: 'from-red-500 to-orange-500',
    requiresInventory: false,
    autoNotify: ['mantenimiento@lajungla.com'],
    description: 'Averías, roturas o fallos técnicos'
  },
  {
    id: 'logistics',
    name: 'Material',
    department: 'Logística',
    responsible: 'Encargado de Logística',
    icon: <Package className="w-6 h-6 text-white" />,
    color: '#059669',
    gradient: 'from-emerald-500 to-teal-500',
    requiresInventory: true,
    autoNotify: ['pedidoslajungla@gmail.com'],
    description: 'Falta de stock o reposición'
  },
  {
    id: 'hr',
    name: 'Personal',
    department: 'RRHH',
    responsible: 'Responsable de RRHH',
    icon: <Users className="w-6 h-6 text-white" />,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-500',
    requiresInventory: false,
    autoNotify: ['rrhhlajungla@gmail.com'],
    description: 'Gestión de equipo y turnos'
  },
  {
    id: 'security',
    name: 'Urgente',
    department: 'Dirección',
    responsible: 'Director',
    icon: <AlertTriangle className="w-6 h-6 text-white" />,
    color: '#dc2626',
    gradient: 'from-rose-600 to-red-600',
    requiresInventory: false,
    autoNotify: ['carlossuarezparra@gmail.com'],
    description: 'Accidentes o seguridad'
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
  const [step, setStep] = useState<'type' | 'details'>('type');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('type');
      setSelectedType(null);
      setDescription(initialDescription);
      setPriority('media');
      setInventoryItem('');
      setInventoryQuantity(1);
      setShowSuccess(false);
      setSelectedImages([]);
      setImagePreviewUrls([]);
    }
  }, [isOpen, initialDescription]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const maxImages = 3;
    const newFiles = files.slice(0, maxImages - selectedImages.length);
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) return;
    setIsSubmitting(true);

    try {
      let uploadedImageUrls: string[] = [];

      // 1. Upload images if selected
      if (selectedImages.length > 0) {
        setIsSubmitting(true); // Ensure loading state

        const uploadPromises = selectedImages.map(async (file) => {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `incidents/${centerId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('maintenance-photos')
              .upload(filePath, file);

            if (uploadError) {
              console.error('Upload error details:', uploadError);
              throw new Error(`Error subiendo imagen: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
              .from('maintenance-photos')
              .getPublicUrl(filePath);

            return publicUrl;
          } catch (error) {
            console.error('Error uploading image:', error);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        uploadedImageUrls = results.filter((url): url is string => url !== null);
        console.log('📸 Imágenes subidas:', uploadedImageUrls);
      }

      const incidentData = {
        center_id: centerId,
        center_name: centerName,
        reporter_id: employee?.id || undefined,
        reporter_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Usuario',
        incident_type: selectedType.id as 'maintenance' | 'logistics' | 'hr' | 'security',
        department: selectedType.department,
        responsible: selectedType.responsible,
        title: description.substring(0, 100),
        description: description,
        priority: priority,
        status: 'abierta' as const,
        inventory_item: selectedType.requiresInventory ? inventoryItem || undefined : undefined,
        inventory_quantity: selectedType.requiresInventory ? inventoryQuantity : undefined,
        has_images: uploadedImageUrls.length > 0,
        image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        auto_notify: selectedType.autoNotify,
        notified_at: new Date().toISOString()
      };

      console.log('💾 Guardando: image_urls=', incidentData.image_urls);

      const { data: savedIncident, error } = await supabase
        .from('checklist_incidents')
        .insert([incidentData])
        .select()
        .single();

      console.log('✅ Incidencia guardada respuesta:', savedIncident, 'Error:', error);

      if (error) throw error;

      // Enviar notificación a los encargados
      if (savedIncident) {
        await notifyIncident({
          incidentId: savedIncident.id,
          centerId: parseInt(centerId),
          category: selectedType.name,
          description: description,
          priority: priority === 'critica' ? 'urgent' : priority === 'alta' ? 'high' : priority === 'media' ? 'normal' : 'low',
          reporterName: employee ? `${employee.first_name} ${employee.last_name || ''}` : 'Franquiciado'
        });
      }

      setShowSuccess(true);
      setTimeout(() => {
        onIncidentCreated?.(savedIncident);
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(error.message || 'Error al guardar la incidencia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white md:bg-slate-900/80 md:backdrop-blur-xl md:flex md:items-center md:justify-center overflow-y-auto md:overflow-hidden animate-in fade-in duration-300 overscroll-y-auto">
      {/* SUCCESS STATE */}
      {showSuccess ? (
        <div key="success-view" className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Reportado!</h3>
          <p className="text-gray-500 mb-6">Hemos notificado al equipo de {selectedType?.department}.</p>
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
            Cerrando...
          </div>
        </div>
      ) : (
        /* MAIN MODAL */
        <div key="form-view" className="w-full min-h-screen relative bg-white md:min-h-0 md:rounded-[2rem] md:max-w-5xl md:h-auto md:max-h-[90vh] md:shadow-[0_0_80px_rgba(0,0,0,0.35)] md:ring-1 md:ring-black/[0.05] md:flex md:flex-col md:transition-all">
          {/* Header */}
          <div className="relative px-5 py-4 md:px-10 md:py-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
            <div className="pr-12">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm whitespace-nowrap">
                  {centerName}
                </div>
                {step === 'details' && (
                  <span className="text-gray-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-left-2 whitespace-nowrap">
                    <ChevronRight size={14} /> <span className="font-semibold text-gray-500">{selectedType?.name}</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight pl-2">
                <span className="text-xs text-blue-500 font-mono bg-blue-50 px-2 py-1 rounded ml-2">v3.4 IMAGE-FIX</span>
              </h2>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors group z-10"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 pb-32 md:p-10 md:pb-10 md:overflow-y-auto scroll-smooth">
            {step === 'type' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full pb-20 md:pb-0">
                {INCIDENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type);
                      setStep('details');
                    }}
                    className="group relative p-6 md:p-12 h-auto min-h-[160px] md:h-full rounded-3xl md:rounded-[2rem] border-none bg-white text-left transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden flex flex-col shrink-0"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4 md:mb-6">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          {type.icon}
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-gray-900" />
                        </div>
                      </div>
                      <div className="mt-auto">
                        <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-1 md:mb-2 group-hover:translate-x-1 transition-transform">{type.name}</h3>
                        <p className="text-sm md:text-base font-medium text-gray-500 leading-relaxed group-hover:text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 duration-300 pb-20 md:pb-0">
                {/* Type Selection Summary (Full Width) */}
                <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 md:gap-6">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${selectedType?.gradient} flex items-center justify-center shadow-md shrink-0`}>
                      {selectedType?.icon}
                    </div>
                    <div>
                      <div className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">{selectedType?.name}</div>
                      <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wide">
                        {selectedType?.department}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('type')}
                    className="text-sm md:text-base font-bold text-blue-600 hover:text-blue-700 px-3 py-2 md:px-6 md:py-3 hover:bg-blue-50 rounded-xl md:rounded-2xl transition-colors"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                  {/* Left Column: Description (8/12) */}
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <label className="block text-lg font-extrabold text-gray-900 mb-3">Descripción del problema</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el problema detalladamente..."
                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none resize-none font-medium placeholder-gray-400 text-base md:text-lg leading-relaxed shadow-sm min-h-[160px] md:min-h-[200px]"
                        autoFocus
                      />
                    </div>

                    {/* Images moved to left column for better flow */}
                    <div>
                      <label className="block text-lg md:text-xl font-extrabold text-gray-900 mb-4">Fotografías (Opcional)</label>
                      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {imagePreviewUrls.map((url, idx) => (
                          <div key={idx} className="relative w-28 h-28 md:w-40 md:h-40 flex-shrink-0 animate-in fade-in zoom-in duration-200 group">
                            <img src={url} alt="Preview" className="w-full h-full object-cover rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm" />
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors scale-100 active:scale-90"
                            >
                              <X size={16} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                        {selectedImages.length < 3 && (
                          <label className="flex flex-col items-center justify-center w-28 h-28 md:w-40 md:h-40 rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group shrink-0 bg-gray-50/50">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mb-1 md:mb-2 group-hover:scale-110 transition-transform shadow-sm">
                              <Camera className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-wide">Añadir Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageSelect}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Priority & Inventory (4/12) */}
                  <div className="md:col-span-4 space-y-6">
                    <div>
                      <label className="block text-lg font-extrabold text-gray-900 mb-3">Nivel de Urgencia</label>
                      <div className="grid grid-cols-2 md:flex md:flex-col gap-2 md:gap-3">
                        {[
                          { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-700 border-green-200' },
                          { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                          { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                          { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-700 border-red-200' }
                        ].map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setPriority(p.value as any)}
                            className={`w-full py-3 px-4 md:px-5 rounded-xl text-sm md:text-base font-bold transition-all border-2 flex items-center justify-center md:justify-between ${priority === p.value
                              ? `${p.color} border-current shadow-sm ring-2 ring-offset-2 ring-${p.color.split('-')[1]}-200 transform scale-[1.02]`
                              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            <span>{p.label}</span>
                            {priority === p.value && <div className="hidden md:block w-2.5 h-2.5 rounded-full bg-current shadow-sm"></div>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inventory moved to sidebar */}
                    {selectedType?.requiresInventory && (
                      <div className="p-5 md:p-6 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
                        <h4 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5" /> Inventario
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Artículo</label>
                            <input
                              type="text"
                              value={inventoryItem}
                              onChange={(e) => setInventoryItem(e.target.value)}
                              placeholder="Nombre..."
                              className="w-full p-4 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-blue-900 placeholder-blue-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Cantidad</label>
                            <div className="flex items-center gap-3 bg-white border border-blue-200 rounded-2xl p-2">
                              <button
                                onClick={() => setInventoryQuantity(Math.max(1, inventoryQuantity - 1))}
                                className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                              >
                                <Minus size={18} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={inventoryQuantity}
                                onChange={(e) => setInventoryQuantity(parseInt(e.target.value) || 1)}
                                className="flex-1 w-full bg-transparent text-center font-bold text-lg outline-none text-blue-900"
                              />
                              <button
                                onClick={() => setInventoryQuantity(inventoryQuantity + 1)}
                                className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
            }
          </div >

          {/* Footer */}
          {step === 'details' && (
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex gap-3 md:gap-4 shrink-0 pb-8 md:pb-6">
              <button
                onClick={() => setStep('type')}
                className="px-4 py-3 md:px-6 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-6 py-4 md:px-10 md:py-5 rounded-[1rem] md:rounded-[1.5rem] text-white font-black text-lg md:text-xl transition-all shadow-2xl ${!description.trim() ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'hover:-translate-y-1 active:scale-95'
                  }`}
                style={{
                  background: !description.trim() ? '' : (selectedType ? `linear-gradient(135deg, ${selectedType.color}, #000)` : '#111827'),
                  boxShadow: !description.trim() ? '' : (selectedType ? `0 20px 40px -10px ${selectedType.color}40` : '0 20px 40px -10px rgba(0,0,0,0.2)')
                }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Enviar <span className="hidden md:inline">Reporte</span> <Send size={18} className="md:w-5 md:h-5" /></>
                )}
              </button>
            </div>
          )
          }
        </div >
      )}
    </div >
  );
};

export default SmartIncidentModal;
