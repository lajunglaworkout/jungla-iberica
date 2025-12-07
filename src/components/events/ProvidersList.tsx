import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit2, Phone, Mail, Star, X, Check, Search, MapPin, Filter, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';

interface Proveedor {
    id: number;
    nombre: string;
    servicio?: string;
    telefono?: string;
    email?: string;
    valoracion?: number;
    notas?: string;
    categoria?: string;
    center_id?: number | null;
}

interface Center {
    id: number;
    name: string;
}

interface ProvidersListProps {
    onBack: () => void;
}

// Categorías disponibles
const CATEGORIAS = [
    { value: 'todos', label: 'Todos', icon: '📦' },
    { value: 'papeleria', label: 'Papelería', icon: '📝' },
    { value: 'atrezzo', label: 'Atrezzo', icon: '🎭' },
    { value: 'vestuario', label: 'Vestuario', icon: '👕' },
    { value: 'hosteleria', label: 'Hostelería', icon: '🍽️' },
    { value: 'transporte', label: 'Transporte', icon: '🚐' },
    { value: 'audiovisual', label: 'Audiovisual', icon: '🎬' },
    { value: 'decoracion', label: 'Decoración', icon: '🎨' },
    { value: 'imprenta', label: 'Imprenta', icon: '🖨️' },
    { value: 'catering', label: 'Catering', icon: '🍕' },
    { value: 'otros', label: 'Otros', icon: '📋' },
];

export const ProvidersList: React.FC<ProvidersListProps> = ({ onBack }) => {
    const { employee } = useSession();
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('todos');
    const [filterCentro, setFilterCentro] = useState<'todos' | 'comunes' | number>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Proveedor | null>(null);
    const [formData, setFormData] = useState<Partial<Proveedor>>({ categoria: 'otros' });

    // Check if user is admin (can see all and create common providers)
    const isAdmin = employee?.role === 'Director' || employee?.role === 'CEO' || employee?.role === 'Admin' ||
        employee?.email === 'eventoseljungla@gmail.com'; // Antonio

    // Get user's center (for encargados)
    const userCenterId = employee?.center_id;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load centers
            const { data: centersData } = await supabase
                .from('centers')
                .select('id, name')
                .order('name');
            setCenters(centersData || []);

            // Load proveedores
            const { data, error } = await supabase
                .from('proveedores')
                .select('*')
                .order('nombre');
            if (error) throw error;
            setProveedores(data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.nombre) {
            alert('El nombre es obligatorio');
            return;
        }

        try {
            const dataToSave = {
                ...formData,
                center_id: formData.center_id || null, // null = común
                created_by: Number(employee?.id)
            };

            if (editing) {
                await supabase.from('proveedores').update(dataToSave).eq('id', editing.id);
            } else {
                await supabase.from('proveedores').insert([dataToSave]);
            }
            loadData();
            closeModal();
        } catch (error) {
            console.error('Error saving proveedor:', error);
            alert('Error al guardar');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este proveedor?')) return;
        try {
            await supabase.from('proveedores').delete().eq('id', id);
            loadData();
        } catch (error) {
            console.error('Error deleting proveedor:', error);
        }
    };

    const openModal = (proveedor?: Proveedor) => {
        if (proveedor) {
            setEditing(proveedor);
            setFormData({ ...proveedor });
        } else {
            setEditing(null);
            setFormData({ categoria: 'otros', center_id: isAdmin ? null : userCenterId });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setFormData({ categoria: 'otros' });
    };

    // Filter proveedores
    const filteredProveedores = proveedores.filter(p => {
        // Search filter
        const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.servicio?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchSearch) return false;

        // Category filter
        if (filterCategoria !== 'todos' && p.categoria !== filterCategoria) return false;

        // Center filter
        if (filterCentro === 'comunes') {
            return !p.center_id; // Only show common providers
        } else if (filterCentro !== 'todos') {
            // Show common providers (null) + specific center
            return !p.center_id || p.center_id === filterCentro;
        }

        // For non-admin users, show only their center + common
        if (!isAdmin && userCenterId) {
            return !p.center_id || p.center_id === userCenterId;
        }

        return true;
    });

    const getCenterName = (centerId?: number | null) => {
        if (!centerId) return 'Común';
        return centers.find(c => c.id === centerId)?.name || 'Desconocido';
    };

    const getCategoriaInfo = (cat?: string) => {
        return CATEGORIAS.find(c => c.value === cat) || CATEGORIAS[CATEGORIAS.length - 1];
    };

    const renderStars = (rating?: number) => {
        return [...Array(5)].map((_, idx) => (
            <Star
                key={idx}
                size={14}
                fill={idx < (rating || 0) ? '#f59e0b' : 'none'}
                color={idx < (rating || 0) ? '#f59e0b' : '#d1d5db'}
            />
        ));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #10b981', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        Directorio de Proveedores
                    </h2>
                    <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
                        {filteredProveedores.length} de {proveedores.length} proveedores
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={20} />
                    Nuevo Proveedor
                </button>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Buscar proveedores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* Center Filter (only for admins) */}
                {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={18} color="#6b7280" />
                        <select
                            value={filterCentro}
                            onChange={(e) => setFilterCentro(e.target.value === 'todos' ? 'todos' : e.target.value === 'comunes' ? 'comunes' : Number(e.target.value))}
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                fontSize: '14px',
                                minWidth: '160px'
                            }}
                        >
                            <option value="todos">Todos los centros</option>
                            <option value="comunes">Solo comunes</option>
                            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                overflowX: 'auto',
                paddingBottom: '8px'
            }}>
                {CATEGORIAS.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setFilterCategoria(cat.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: filterCategoria === cat.value ? '2px solid #10b981' : '1px solid #e5e7eb',
                            backgroundColor: filterCategoria === cat.value ? '#ecfdf5' : 'white',
                            color: filterCategoria === cat.value ? '#047857' : '#6b7280',
                            fontWeight: filterCategoria === cat.value ? 600 : 400,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px'
                        }}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Providers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>
                {filteredProveedores.map(proveedor => {
                    const catInfo = getCategoriaInfo(proveedor.categoria);
                    return (
                        <div
                            key={proveedor.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '20px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '18px' }}>{catInfo.icon}</span>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                                            {proveedor.nombre}
                                        </h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {proveedor.servicio && (
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{proveedor.servicio}</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => openModal(proveedor)}
                                        style={{ padding: '6px', backgroundColor: '#dbeafe', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        <Edit2 size={14} color="#2563eb" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(proveedor.id)}
                                        style={{ padding: '6px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={14} color="#dc2626" />
                                    </button>
                                </div>
                            </div>

                            {/* Tags: Category + Center */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '3px 8px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    color: '#6b7280'
                                }}>
                                    {catInfo.label}
                                </span>
                                <span style={{
                                    padding: '3px 8px',
                                    backgroundColor: proveedor.center_id ? '#dbeafe' : '#d1fae5',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    color: proveedor.center_id ? '#1e40af' : '#047857'
                                }}>
                                    {proveedor.center_id ? `📍 ${getCenterName(proveedor.center_id)}` : '🌐 Común'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                {proveedor.telefono && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                                        <Phone size={14} color="#6b7280" />
                                        {proveedor.telefono}
                                    </div>
                                )}
                                {proveedor.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                                        <Mail size={14} color="#6b7280" />
                                        {proveedor.email}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {renderStars(proveedor.valoracion)}
                            </div>

                            {proveedor.notas && (
                                <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                                    {proveedor.notas}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredProveedores.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <Package size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: '#374151', margin: '0 0 8px' }}>No hay proveedores</h3>
                    <p style={{ color: '#6b7280' }}>
                        {filterCategoria !== 'todos' ? `No hay proveedores en la categoría "${getCategoriaInfo(filterCategoria).label}"` : 'Añade tu primer proveedor'}
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                                {editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <button onClick={closeModal} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '20px', display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre || ''}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    placeholder="Nombre del proveedor"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Categoría</label>
                                    <select
                                        value={formData.categoria || 'otros'}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    >
                                        {CATEGORIAS.filter(c => c.value !== 'todos').map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Centro</label>
                                    <select
                                        value={formData.center_id || ''}
                                        onChange={(e) => setFormData({ ...formData, center_id: e.target.value ? Number(e.target.value) : null })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        disabled={!isAdmin}
                                    >
                                        {isAdmin && <option value="">🌐 Común (todos)</option>}
                                        {centers.map(c => <option key={c.id} value={c.id}>📍 {c.name}</option>)}
                                    </select>
                                    {!isAdmin && (
                                        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                            Los encargados solo pueden crear proveedores para su centro
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Servicio</label>
                                <input
                                    type="text"
                                    value={formData.servicio || ''}
                                    onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    placeholder="Descripción del servicio"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.telefono || ''}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Valoración</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, valoracion: star })}
                                            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Star
                                                size={24}
                                                fill={(formData.valoracion || 0) >= star ? '#f59e0b' : 'none'}
                                                color={(formData.valoracion || 0) >= star ? '#f59e0b' : '#d1d5db'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Notas</label>
                                <textarea
                                    value={formData.notas || ''}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '80px' }}
                                    placeholder="Observaciones..."
                                />
                            </div>
                        </div>

                        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={closeModal}
                                style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Check size={18} /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProvidersList;
