import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Package, Wrench, Users, Building, Send, CheckCircle, Camera, Upload, Image, Plus, ArrowRight, ChevronRight } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
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
        has_images: selectedImages.length > 0,
        auto_notify: selectedType.autoNotify,
        notified_at: new Date().toISOString()
      };

      const { data: savedIncident, error } = await supabase
        .from('checklist_incidents')
        .insert([incidentData])
        .select()
        .single();

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        onIncidentCreated?.(savedIncident);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al guardar la incidencia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      {/* SUCCESS STATE */}
      {showSuccess ? (
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
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
        /* MAIN MODAL */
        /* MAIN MODAL */
        <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.05] flex flex-col transition-all">
          {/* Header */}
          <div className="relative px-10 py-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
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
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight pl-2">
                {step === 'type' ? '¿Qué ha ocurrido?' : 'Detalles de la incidencia'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors group z-10"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-10">
            {step === 'type' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {INCIDENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type);
                      setStep('details');
                    }}
                    className="group relative p-12 h-full rounded-[2rem] border-none bg-white text-left transition-all duration-300 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-2 overflow-hidden flex flex-col"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          {type.icon}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                          <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-gray-900" />
                        </div>
                      </div>
                      <div className="mt-auto">
                        <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:translate-x-1 transition-transform">{type.name}</h3>
                        <p className="text-base font-medium text-gray-500 leading-relaxed group-hover:text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                {/* Type Selection Summary (Full Width) */}
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedType?.gradient} flex items-center justify-center shadow-md`}>
                      {selectedType?.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{selectedType?.name}</div>
                      <div className="text-sm text-gray-500 font-bold uppercase tracking-wide">
                        {selectedType?.department}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('type')}
                    className="text-base font-bold text-blue-600 hover:text-blue-700 px-6 py-3 hover:bg-blue-50 rounded-2xl transition-colors"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left Column: Description (8/12) */}
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <label className="block text-lg font-extrabold text-gray-900 mb-3">Descripción del problema</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el problema detalladamente..."
                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none resize-none font-medium placeholder-gray-400 text-lg leading-relaxed shadow-sm min-h-[200px]"
                        autoFocus
                      />
                    </div>

                    {/* Images moved to left column for better flow */}
                    <div>
                      <label className="block text-xl font-extrabold text-gray-900 mb-4">Fotografías (Opcional)</label>
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {imagePreviewUrls.map((url, idx) => (
                          <div key={idx} className="relative w-40 h-40 flex-shrink-0 animate-in fade-in zoom-in duration-200 group">
                            <img src={url} alt="Preview" className="w-full h-full object-cover rounded-3xl border border-gray-100 shadow-sm" />
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors scale-0 group-hover:scale-100"
                            >
                              <X size={16} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                        {selectedImages.length < 3 && (
                          <label className="flex flex-col items-center justify-center w-40 h-40 rounded-3xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                              <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-wide">Añadir Foto</span>
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
                      <div className="flex flex-col gap-2">
                        {[
                          { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-700 border-green-200' },
                          { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                          { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                          { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-700 border-red-200' }
                        ].map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setPriority(p.value as any)}
                            className={`w-full py-3 px-5 rounded-xl text-base font-bold transition-all border-2 flex items-center justify-between ${priority === p.value
                              ? `${p.color} border-current shadow-sm ring-2 ring-offset-2 ring-${p.color.split('-')[1]}-200 transform scale-[1.02]`
                              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            <span>{p.label}</span>
                            {priority === p.value && <div className="w-2.5 h-2.5 rounded-full bg-current shadow-sm"></div>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inventory moved to sidebar */}
                    {selectedType?.requiresInventory && (
                      <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
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
                              className="w-full p-4 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={inventoryQuantity}
                              onChange={(e) => setInventoryQuantity(parseInt(e.target.value) || 1)}
                              className="w-full p-4 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-center font-bold"
                            />
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
          {
            step === 'details' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                <button
                  onClick={() => setStep('type')}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!description.trim() || isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-3 px-10 py-5 rounded-[1.5rem] text-white font-black text-xl transition-all shadow-2xl ${!description.trim() ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'hover:-translate-y-1 active:scale-95'
                    }`}
                  style={{
                    background: !description.trim() ? '' : (selectedType ? `linear-gradient(135deg, ${selectedType.color}, #000)` : '#111827'),
                    boxShadow: !description.trim() ? '' : (selectedType ? `0 20px 40px -10px ${selectedType.color}40` : '0 20px 40px -10px rgba(0,0,0,0.2)')
                  }}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Enviar Reporte <Send size={20} /></>
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
