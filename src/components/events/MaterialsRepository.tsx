import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Search, Image, FileVideo, File, Link2, X, Check, FolderOpen, ChevronRight, Calendar, ArrowLeft, Building2, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';

interface Material {
    id: number;
    evento_id?: number;
    tipo: string;
    nombre: string;
    descripcion?: string;
    url_archivo?: string;
    tamano_kb?: number;
    created_at: string;
    center_id?: number | null;
}

interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
}

interface MaterialsRepositoryProps {
    onBack: () => void;
}

const tipoIcons: { [key: string]: React.ElementType } = {
    imagen: Image,
    video: FileVideo,
    documento: FileText,
    enlace: Link2,
    otro: File
};

const tipoColors: { [key: string]: string } = {
    imagen: '#16a34a',
    video: '#dc2626',
    documento: '#2563eb',
    enlace: '#8b5cf6',
    otro: '#6b7280'
};

type ViewMode = 'main' | 'upload' | 'download' | 'event-materials';

export const MaterialsRepository: React.FC<MaterialsRepositoryProps> = ({ onBack }) => {
    const { employee } = useSession();
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('main');
    const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<Partial<Material>>({ tipo: 'documento' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Check if user is admin
    const isAdmin = employee?.role === 'Director' || employee?.role === 'CEO' || employee?.role === 'Admin' ||
        employee?.email === 'eventoseljungla@gmail.com';
    const userCenterId = employee?.center_id;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: eventosData } = await supabase
                .from('eventos')
                .select('id, nombre, fecha_evento')
                .order('fecha_evento', { ascending: false });
            setEventos(eventosData || []);

            const { data: materialesData } = await supabase
                .from('evento_materiales')
                .select('*')
                .order('created_at', { ascending: false });
            setMateriales(materialesData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!formData.nombre) {
            setFormData({ ...formData, nombre: file.name.split('.')[0] });
        }

        setUploading(true);
        try {
            const fileName = `materiales/${Date.now()}_${file.name}`;
            const { error } = await supabase.storage.from('eventos').upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('eventos').getPublicUrl(fileName);
            setFormData({ ...formData, url_archivo: publicUrl, tamano_kb: Math.round(file.size / 1024) });
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('❌ Error al subir archivo. Asegúrate de que existe el bucket "eventos" en Supabase Storage.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.nombre) {
            alert('El nombre es obligatorio');
            return;
        }

        try {
            await supabase.from('evento_materiales').insert([{
                ...formData,
                center_id: isAdmin ? null : userCenterId,
                created_by: Number(employee?.id)
            }]);
            loadData();
            setFormData({ tipo: 'documento' });
            setViewMode('main');
            alert('✅ Material subido correctamente');
        } catch (error) {
            console.error('Error saving material:', error);
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este material?')) return;
        try {
            await supabase.from('evento_materiales').delete().eq('id', id);
            loadData();
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatSize = (kb?: number) => {
        if (!kb) return '';
        if (kb < 1024) return `${kb} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const getEventoNombre = (eventoId?: number) => {
        if (!eventoId) return 'General';
        return eventos.find(e => e.id === eventoId)?.nombre || 'Evento';
    };

    // Filter materials based on view
    const getFilteredMaterials = () => {
        let filtered = materiales;

        // Filter by event
        if (viewMode === 'event-materials' && selectedEventoId) {
            filtered = filtered.filter(m => m.evento_id === selectedEventoId);
        } else if (viewMode === 'download' && !selectedEventoId) {
            // General materials only
            filtered = filtered.filter(m => !m.evento_id);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(m =>
                m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Center filter for non-admins
        if (!isAdmin && userCenterId) {
            filtered = filtered.filter(m => !m.center_id || m.center_id === userCenterId);
        }

        return filtered;
    };

    // Count materials by event
    const getMaterialsCountByEvento = (eventoId: number) => {
        return materiales.filter(m => m.evento_id === eventoId).length;
    };

    const generalMaterialsCount = materiales.filter(m => !m.evento_id).length;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%' }} />
            </div>
        );
    }

    // Main view with two cards
    if (viewMode === 'main') {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Materiales y Recursos</h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>{materiales.length} archivos almacenados</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {/* Upload Card */}
                    <button
                        onClick={() => setViewMode('upload')}
                        style={{
                            padding: '40px 32px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '2px solid #e5e7eb',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'none'; }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#ecfdf5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Upload size={36} color="#10b981" />
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                            📤 Subir Material
                        </h3>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                            Sube facturas, fotos o documentos.<br />
                            Puedes asociarlos a un evento.
                        </p>
                    </button>

                    {/* Download Card */}
                    <button
                        onClick={() => setViewMode('download')}
                        style={{
                            padding: '40px 32px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '2px solid #e5e7eb',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'none'; }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Download size={36} color="#3b82f6" />
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                            📥 Descargar Material
                        </h3>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                            Accede a carteles, plantillas y<br />
                            materiales de eventos.
                        </p>
                    </button>
                </div>

                {/* Quick Stats */}
                <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{generalMaterialsCount}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Material General</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{materiales.length - generalMaterialsCount}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>En Eventos</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#6b7280' }}>{eventos.length}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Eventos</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Upload view
    if (viewMode === 'upload') {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <button
                    onClick={() => { setViewMode('main'); setFormData({ tipo: 'documento' }); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}
                >
                    <ArrowLeft size={18} /> Volver
                </button>

                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ecfdf5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Upload size={24} color="#10b981" />
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#047857' }}>Subir Material</h2>
                        </div>
                    </div>

                    <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
                        {/* File Upload Options */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Subir archivo</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                style={{ display: 'none' }}
                            />

                            {/* Two buttons row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {/* File picker button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{
                                        padding: '32px 16px',
                                        border: '2px dashed #d1d5db',
                                        borderRadius: '12px',
                                        backgroundColor: '#f9fafb',
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Upload size={28} color={uploading ? '#9ca3af' : '#10b981'} />
                                    <span style={{ fontWeight: 500, fontSize: '14px', color: uploading ? '#9ca3af' : '#374151' }}>
                                        Seleccionar archivo
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>PDF, JPG, PNG...</span>
                                </button>

                                {/* Camera button */}
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{
                                        padding: '32px 16px',
                                        border: '2px dashed #60a5fa',
                                        borderRadius: '12px',
                                        backgroundColor: '#eff6ff',
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Camera size={28} color={uploading ? '#9ca3af' : '#3b82f6'} />
                                    <span style={{ fontWeight: 500, fontSize: '14px', color: uploading ? '#9ca3af' : '#374151' }}>
                                        Abrir cámara
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Foto de factura</span>
                                </button>
                            </div>

                            {uploading && (
                                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef9c3', borderRadius: '8px', textAlign: 'center' }}>
                                    <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid #eab308', borderTop: '2px solid transparent', borderRadius: '50%', margin: '0 auto 8px' }} />
                                    <span style={{ fontSize: '13px', color: '#854d0e' }}>Subiendo archivo a Supabase...</span>
                                </div>
                            )}

                            {formData.url_archivo && !uploading && (
                                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Check size={18} color="#16a34a" />
                                        <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 500 }}>
                                            Archivo subido {formatSize(formData.tamano_kb) && `(${formatSize(formData.tamano_kb)})`}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setFormData({ ...formData, url_archivo: undefined, tamano_kb: undefined })}
                                        style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <X size={16} color="#16a34a" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Nombre del material *</label>
                            <input
                                type="text"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                placeholder="Factura proveedor, Cartel evento..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Asociar a evento (opcional)</label>
                            <select
                                value={formData.evento_id || ''}
                                onChange={(e) => setFormData({ ...formData, evento_id: e.target.value ? Number(e.target.value) : undefined })}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Sin asociar (material general)</option>
                                {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Tipo</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {Object.entries(tipoColors).map(([tipo, color]) => {
                                    const Icon = tipoIcons[tipo] || File;
                                    return (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo })}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 12px',
                                                border: `2px solid ${formData.tipo === tipo ? color : '#e5e7eb'}`,
                                                borderRadius: '8px',
                                                backgroundColor: formData.tipo === tipo ? `${color}15` : 'white',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                color: formData.tipo === tipo ? color : '#6b7280',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            <Icon size={16} /> {tipo}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Descripción (opcional)</label>
                            <textarea
                                value={formData.descripcion || ''}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '80px' }}
                                placeholder="Notas sobre este material..."
                            />
                        </div>
                    </div>

                    <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => { setViewMode('main'); setFormData({ tipo: 'documento' }); }}
                            style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!formData.nombre}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: formData.nombre ? '#10b981' : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: formData.nombre ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Check size={18} /> Guardar Material
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Download view - event selection or general
    if (viewMode === 'download') {
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <button
                    onClick={() => setViewMode('main')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}
                >
                    <ArrowLeft size={18} /> Volver
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Download size={24} color="#3b82f6" />
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>Descargar Material</h2>
                </div>

                {/* General Materials Card */}
                <button
                    onClick={() => { setSelectedEventoId(null); setViewMode('event-materials'); }}
                    style={{
                        width: '100%',
                        padding: '20px 24px',
                        marginBottom: '16px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '2px solid #10b981',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FolderOpen size={24} color="#10b981" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>📂 Documentación General</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Materiales sin asociar a eventos</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ padding: '6px 12px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                            {generalMaterialsCount} archivos
                        </span>
                        <ChevronRight size={20} color="#9ca3af" />
                    </div>
                </button>

                {/* Events List */}
                <h3 style={{ margin: '32px 0 16px', fontSize: '14px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                    Materiales por Evento
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {eventos.map(evento => {
                        const count = getMaterialsCountByEvento(evento.id);
                        return (
                            <button
                                key={evento.id}
                                onClick={() => { setSelectedEventoId(evento.id); setViewMode('event-materials'); }}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Calendar size={18} color="#6b7280" />
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#111827' }}>{evento.nombre}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(evento.fecha_evento)}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {count > 0 ? (
                                        <span style={{ padding: '4px 10px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                                            {count} archivos
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Sin materiales</span>
                                    )}
                                    <ChevronRight size={18} color="#9ca3af" />
                                </div>
                            </button>
                        );
                    })}

                    {eventos.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                            No hay eventos creados
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Event materials view
    if (viewMode === 'event-materials') {
        const filtered = getFilteredMaterials();
        const title = selectedEventoId ? getEventoNombre(selectedEventoId) : 'Documentación General';

        return (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button
                    onClick={() => { setViewMode('download'); setSelectedEventoId(null); setSearchTerm(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}
                >
                    <ArrowLeft size={18} /> Volver a eventos
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
                        <p style={{ color: '#6b7280', margin: '4px 0 0' }}>{filtered.length} archivos</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 12px 10px 40px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '250px' }}
                        />
                    </div>
                </div>

                {/* Materials Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {filtered.map(material => {
                        const Icon = tipoIcons[material.tipo] || File;
                        const color = tipoColors[material.tipo] || '#6b7280';
                        return (
                            <div key={material.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                <div style={{ height: '100px', backgroundColor: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <Icon size={40} color={color} />
                                    <span style={{ position: 'absolute', top: '8px', right: '8px', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 600, backgroundColor: color, color: 'white', textTransform: 'uppercase' }}>
                                        {material.tipo}
                                    </span>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#111827' }}>{material.nombre}</h3>
                                    {material.descripcion && (
                                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                                            {material.descripcion.substring(0, 60)}{material.descripcion.length > 60 ? '...' : ''}
                                        </p>
                                    )}
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>
                                        {formatDate(material.created_at)} {formatSize(material.tamano_kb) && `· ${formatSize(material.tamano_kb)}`}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {material.url_archivo && (
                                            <a
                                                href={material.url_archivo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '10px',
                                                    backgroundColor: color,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    fontSize: '13px',
                                                    fontWeight: 500
                                                }}
                                            >
                                                <Download size={16} /> Descargar
                                            </a>
                                        )}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(material.id)}
                                                style={{ padding: '10px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} color="#dc2626" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                        <FolderOpen size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: '#374151', margin: '0 0 8px' }}>No hay materiales</h3>
                        <p style={{ color: '#6b7280' }}>
                            {selectedEventoId ? 'Este evento no tiene materiales subidos' : 'No hay documentación general'}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default MaterialsRepository;
