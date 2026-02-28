import React, { useState, useEffect } from 'react';
import {
    Video, Plus, ArrowLeft, Search, Filter, LayoutGrid, List,
    MoreVertical, ExternalLink, PlayCircle, FileText, Edit3, Trash2, X,
    CheckCircle, Clock, Film, Check, Calendar
} from 'lucide-react';
import { onlineContentService } from '../../../services/academyService';
import { OnlineContent, ContentLevel, ContentCategory, ContentStatus } from '../../../types/online';
import { ui } from '../../../utils/ui';


interface OnlineContenidoViewProps {
    onBack: () => void;
}

export const OnlineContenidoView: React.FC<OnlineContenidoViewProps> = ({ onBack }) => {
    const [content, setContent] = useState<OnlineContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'gallery' | 'table'>('table');
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [filterLevel, setFilterLevel] = useState<'all' | ContentLevel>('all');
    const [filterCategory, setFilterCategory] = useState<'all' | ContentCategory>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | ContentStatus>('all');

    // Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<OnlineContent | null>(null);
    const [formData, setFormData] = useState<Partial<OnlineContent>>({});

    // Mock Data Eliminado a petición del usuario.

    // Constants
    const CATEGORIES: { id: ContentCategory; label: string; color: string }[] = [
        { id: 'exercise', label: 'Ejercicio', color: 'text-green-600 bg-green-50 border-green-200' },
        { id: 'community', label: 'Comunidad', color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { id: 'viral', label: 'Viralización', color: 'text-red-600 bg-red-50 border-red-200' },
        { id: 'feedback', label: 'Retroalimentación', color: 'text-purple-600 bg-purple-50 border-purple-200' }
    ];

    const BUYER_PERSONAS = [
        'Joven gym (18-25)',
        'Adulto aburrido (30-45)',
        'Atleta veterano',
        'General / Por definir'
    ];

    const TEAM_MEMBERS = ['Vicente', 'Jesús', 'Diego', 'Carlos'];
    const LOCATIONS = ['Jungla Sevilla', 'Jungla Jerez', 'Jungla Puerto', 'Gimnasio externo', 'Parque', 'Casa'];
    const PLATFORMS = ['Instagram Feed', 'Instagram Reels', 'TikTok', 'Stories'];

    useEffect(() => {
        loadContent();
    }, [filterLevel, filterCategory, filterStatus]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const filters: { level?: string; category?: string; status?: string } = {};
            if (filterLevel !== 'all') filters.level = filterLevel;
            if (filterCategory !== 'all') filters.category = filterCategory;
            if (filterStatus !== 'all') filters.status = filterStatus;

            const data = await onlineContentService.getAll(filters);

            // If we have real data, use it
            if (data && data.length > 0) {
                setContent(data);
            } else {
                setContent([]);
            }
        } catch (error) {
            console.error('Error loading content:', error);
            setContent([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title) return ui.error('El título es obligatorio');

        try {
            const payload = {
                ...formData,
                // Ensure arrays are initialized
                platforms: formData.platforms || [],
                locations: formData.locations || [],
                people: formData.people || [],
                tags: formData.tags || []
            };

            if (editingItem) {
                await onlineContentService.update(editingItem.id, payload);
            } else {
                await onlineContentService.create(payload);
            }

            setShowModal(false);
            setEditingItem(null);
            setFormData({ level: 'common', status: 'idea', gym_compatible: false });
            loadContent();
        } catch (error) {
            console.error('Error saving content:', error);
            ui.error('Error al guardar el contenido');
        }
    };

    const handleDelete = async (id: string) => {
        if (!await ui.confirm('¿Estás seguro de eliminar este contenido?')) return;
        try {
            await onlineContentService.delete(id);
            setContent(content.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting content:', error);
        }
    };

    const handleQuickStatusUpdate = async (item: OnlineContent, type: 'produced' | 'published') => {
        let newStatus: ContentStatus = item.status;

        if (type === 'produced') {
            if (item.status === 'published') return;
            if (item.status === 'ready') {
                newStatus = 'editing';
            } else {
                newStatus = 'ready';
            }
        } else if (type === 'published') {
            if (item.status === 'published') {
                newStatus = 'ready';
            } else {
                newStatus = 'published';
            }
        }

        // Optimistic update for UI
        setContent(content.map(c => c.id === item.id ? { ...c, status: newStatus } : c));

        // If it's a mock item, don't try to update Supabase
        // (Mock logic removed)

        try {
            await onlineContentService.update(item.id, { status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert optimistic update on error
            setContent(content.map(c => c.id === item.id ? { ...c, status: item.status } : c));
            ui.error('Error al actualizar el estado en la base de datos');
        }
    };

    const openModal = (item?: OnlineContent) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                level: 'common',
                status: 'idea',
                gym_compatible: false,
                platforms: [],
                locations: [],
                people: [],
                tags: []
            });
        }
        setShowModal(true);
    };

    const toggleArrayItem = (field: 'platforms' | 'locations' | 'people', value: string) => {
        const current = formData[field] || [];
        const updated = current.includes(value)
            ? current.filter(i => i !== value)
            : [...current, value];
        setFormData({ ...formData, [field]: updated });
    };

    const getStatusStyle = (status: ContentStatus) => {
        switch (status) {
            case 'idea': return { bg: '#fef9c3', border: '#eab308', text: '#854d0e' };
            case 'script': return { bg: '#ffedd5', border: '#f97316', text: '#9a3412' };
            case 'recording': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
            case 'editing': return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' };
            case 'ready': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
            case 'published': return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
            default: return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
        }
    };

    const getCategoryStyle = (categoryId: string) => {
        const category = CATEGORIES.find(c => c.id === categoryId);
        if (!category) return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };

        switch (categoryId) {
            case 'exercise': return { bg: '#dcfce7', border: '#22c55e', text: '#15803d' };
            case 'community': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
            case 'viral': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
            case 'feedback': return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' };
            default: return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
        }
    };

    const calculateCompleteness = (item: OnlineContent) => {
        const fields = [
            item.title,
            item.description,
            item.category || item.buyer_persona,
            item.video_url,
            item.duration,
            item.producer,
            item.scheduled_date
        ];
        const filled = fields.filter(f => f).length;
        return Math.round((filled / fields.length) * 100);
    };

    const filteredContent = content.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            {/* Header - CRM Style (Blue Gradient for Content) */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <Video className="h-8 w-8" />
                            <h1 className="text-3xl font-bold">Biblioteca de Contenido</h1>
                        </div>
                    </div>
                    <p className="text-blue-100 text-lg pl-16 font-light">Gestión de vídeos y recursos digitales</p>
                </div>

                {/* Action Button */}
                <div className="absolute top-8 right-8 z-20">
                    <button
                        onClick={async () => openModal()}
                        style={{
                            backgroundColor: 'white',
                            color: '#1e40af',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        className="hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        Nuevo Contenido
                    </button>
                </div>
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap gap-4 mb-6 px-1">
                {CATEGORIES.map(cat => {
                    const style = getCategoryStyle(cat.id);
                    return (
                        <div key={cat.id} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: style.text }}
                            ></div>
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{cat.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row justify-between gap-6 items-center">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título, descripción..."
                        style={{
                            width: '100%',
                            padding: '14px 14px 14px 44px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            fontSize: '15px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            backgroundColor: '#f9fafb'
                        }}
                        className="focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        value={searchTerm}
                        onChange={async (e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                    <select
                        value={filterLevel}
                        onChange={async (e) => setFilterLevel(e.target.value as 'all' | ContentLevel)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'white',
                            color: '#4b5563',
                            cursor: 'pointer',
                            minWidth: '140px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <option value="all">Nivel: Todos</option>
                        <option value="common">Común</option>
                        <option value="specific">Específico</option>
                    </select>

                    <select
                        value={filterCategory}
                        onChange={async (e) => setFilterCategory(e.target.value as 'all' | ContentCategory)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'white',
                            color: '#4b5563',
                            cursor: 'pointer',
                            minWidth: '160px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <option value="all">Categoría: Todas</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={async (e) => setFilterStatus(e.target.value as 'all' | ContentStatus)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'white',
                            color: '#4b5563',
                            cursor: 'pointer',
                            minWidth: '150px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <option value="all">Estado: Todos</option>
                        <option value="idea">💡 Idea</option>
                        <option value="script">📝 Guion</option>
                        <option value="recording">🎬 Grabación</option>
                        <option value="editing">✂️ Edición</option>
                        <option value="ready">✅ Listo</option>
                        <option value="published">📤 Publicado</option>
                    </select>

                    <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb', margin: '0 8px' }}></div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={async () => setViewMode('gallery')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'gallery' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={async () => setViewMode('table')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid/Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredContent.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Video className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No hay contenido encontrado</h3>
                </div>
            ) : viewMode === 'gallery' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredContent.map(item => {
                        const statusStyle = getStatusStyle(item.status);
                        const categoryStyle = item.category ? getCategoryStyle(item.category) : null;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    border: `3px solid ${statusStyle.border}`,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                className="hover:shadow-lg group cursor-pointer"
                            >
                                <div className="aspect-video bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                    {item.video_url ? (
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center z-10">
                                            <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all drop-shadow-lg" size={48} />
                                        </div>
                                    ) : (
                                        <Film className="text-gray-300 h-12 w-12" />
                                    )}

                                    {/* Status Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        backgroundColor: statusStyle.bg,
                                        color: statusStyle.text,
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        border: `1px solid ${statusStyle.border}`,
                                        zIndex: 20,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {item.status}
                                    </div>

                                    {/* Category Badge */}
                                    {categoryStyle && item.category && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px',
                                            backgroundColor: categoryStyle.bg,
                                            color: categoryStyle.text,
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            border: `1px solid ${categoryStyle.border}`,
                                            zIndex: 20,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {CATEGORIES.find(c => c.id === item.category)?.label}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg" title={item.title}>{item.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10 leading-relaxed">{item.description || 'Sin descripción'}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <Clock size={14} />
                                            {item.duration ? `${item.duration}s` : '--'}
                                        </div>

                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={async (e) => { e.stopPropagation(); openModal(item); }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={async (e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-10">Cat.</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Completado</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha Prevista</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Producido</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Publicado</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {(() => {
                                // Group content by month
                                const groupedContent: { [key: string]: OnlineContent[] } = {};
                                filteredContent.forEach(item => {
                                    const date = item.scheduled_date ? new Date(item.scheduled_date) : null;
                                    const monthKey = date
                                        ? date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
                                        : 'Sin fecha';
                                    // Capitalize first letter
                                    const formattedMonth = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

                                    if (!groupedContent[formattedMonth]) {
                                        groupedContent[formattedMonth] = [];
                                    }
                                    groupedContent[formattedMonth].push(item);
                                });

                                // Sort months (optional, but good for UX) - forcing "Sin fecha" to end or beginning?
                                // For now, iterating object keys might not be sorted. Let's rely on the order of appearance or sort keys.
                                // Since filteredContent is sorted by created_at, the months might appear in that order.
                                // Let's just iterate the groups.

                                return Object.entries(groupedContent).map(([month, items]) => (
                                    <React.Fragment key={month}>
                                        {/* Month Separator */}
                                        <tr className="bg-gray-50/80">
                                            <td colSpan={7} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                {month}
                                            </td>
                                        </tr>

                                        {items.map(item => {
                                            const completeness = calculateCompleteness(item);
                                            const categoryStyle = item.category ? getCategoryStyle(item.category) : { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };

                                            // Scheduled Date Logic
                                            let dateColorClass = 'text-gray-600';
                                            let daysDiff = null;

                                            if (item.scheduled_date) {
                                                const today = new Date();
                                                const scheduled = new Date(item.scheduled_date);
                                                const diffTime = scheduled.getTime() - today.getTime();
                                                daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                if (daysDiff > 10) dateColorClass = 'text-green-600 font-medium';
                                                else if (daysDiff > 5) dateColorClass = 'text-yellow-600 font-medium';
                                                else dateColorClass = 'text-red-600 font-bold';
                                            }

                                            return (
                                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div
                                                            style={{
                                                                width: '10px',
                                                                height: '10px',
                                                                borderRadius: '50%',
                                                                backgroundColor: categoryStyle.text,
                                                                boxShadow: `0 0 0 2px ${categoryStyle.bg}`
                                                            }}
                                                            title={item.category ? CATEGORIES.find(c => c.id === item.category)?.label : 'Sin categoría'}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <div className="text-[15px] font-medium text-gray-900 mb-1">{item.title}</div>
                                                            <div className="flex items-center gap-3">
                                                                {/* Creation Date */}
                                                                <div className="text-xs text-gray-400 flex items-center gap-1" title="Fecha de creación">
                                                                    <Calendar size={10} />
                                                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                                </div>

                                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide ${item.level === 'specific' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                        }`}>
                                                                        {item.level === 'specific' ? 'Específico' : 'Común'}
                                                                    </span>
                                                                    {item.level === 'specific' && item.buyer_persona && (
                                                                        <span className="text-gray-400 font-light">• {item.buyer_persona}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${completeness === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                                    style={{ width: `${completeness}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-400 w-8">{completeness}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {item.scheduled_date ? (
                                                            <div className={`flex items-center gap-2 text-sm ${dateColorClass}`}>
                                                                <Calendar size={14} className={daysDiff !== null && daysDiff <= 5 ? 'text-red-500' : 'text-gray-400'} />
                                                                <span>{new Date(item.scheduled_date).toLocaleDateString()}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-300 italic">Sin fecha</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className="flex justify-center">
                                                            <div
                                                                onClick={async (e) => { e.stopPropagation(); handleQuickStatusUpdate(item, 'produced'); }}
                                                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${['ready', 'published'].includes(item.status)
                                                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm scale-110'
                                                                    : 'bg-white border-gray-300 text-transparent hover:border-blue-400 hover:bg-blue-50'
                                                                    }`}
                                                                title="Marcar como Producido"
                                                            >
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className="flex justify-center">
                                                            <div
                                                                onClick={async (e) => { e.stopPropagation(); handleQuickStatusUpdate(item, 'published'); }}
                                                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${item.status === 'published'
                                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm scale-110'
                                                                    : 'bg-white border-gray-300 text-transparent hover:border-emerald-400 hover:bg-emerald-50'
                                                                    }`}
                                                                title="Marcar como Publicado"
                                                            >
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={async () => openModal(item)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => handleDelete(item.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal - ESTILO CRM ACADEMY (LARGE) */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '1100px',
                        height: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} className="animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 32px',
                            backgroundColor: 'white',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            zIndex: 10
                        }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>
                                    {editingItem ? 'Editar Contenido' : 'Nuevo Contenido'}
                                </h2>
                                <p style={{ color: '#6b7280', fontSize: '15px', marginTop: '4px' }}>
                                    Completa la información para gestionar esta pieza de contenido
                                </p>
                            </div>
                            <button
                                onClick={async () => setShowModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '8px' }}
                                className="hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '32px',
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '32px'
                        }}>
                            {/* Left Column: Main Content */}
                            <div className="space-y-8">
                                {/* Section: Basic Info */}
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
                                        <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                                        Información Principal
                                    </h3>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Título del Contenido</label>
                                            <input
                                                type="text"
                                                value={formData.title || ''}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 18px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    fontSize: '16px',
                                                    outline: 'none',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: '#f9fafb',
                                                    fontWeight: '500'
                                                }}
                                                className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 placeholder-gray-400"
                                                placeholder="Ej: Rutina de fuerza para principiantes"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Descripción / Guion</label>
                                            <textarea
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                rows={6}
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 18px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    fontSize: '15px',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    backgroundColor: '#f9fafb',
                                                    lineHeight: '1.6'
                                                }}
                                                className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 placeholder-gray-400"
                                                placeholder="Describe el contenido, objetivos o pega el guion aquí..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nivel de Acceso</label>
                                                <div className="relative">
                                                    <select
                                                        value={formData.level}
                                                        onChange={e => setFormData({ ...formData, level: e.target.value as ContentLevel })}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 16px',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '12px',
                                                            fontSize: '15px',
                                                            backgroundColor: '#f9fafb',
                                                            appearance: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                        className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 text-gray-900"
                                                    >
                                                        <option value="common">Común (Todos)</option>
                                                        <option value="specific">Específico (Buyer Persona)</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {formData.level === 'specific' ? (
                                                    <>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Buyer Persona</label>
                                                        <div className="relative">
                                                            <select
                                                                value={formData.buyer_persona || ''}
                                                                onChange={e => setFormData({ ...formData, buyer_persona: e.target.value })}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '12px 16px',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '12px',
                                                                    fontSize: '15px',
                                                                    backgroundColor: '#f9fafb',
                                                                    appearance: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                                className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 text-gray-900"
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                {BUYER_PERSONAS.map(bp => <option key={bp} value={bp}>{bp}</option>)}
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Categoría</label>
                                                        <div className="relative">
                                                            <select
                                                                value={formData.category || ''}
                                                                onChange={e => setFormData({ ...formData, category: e.target.value as ContentCategory })}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '12px 16px',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '12px',
                                                                    fontSize: '15px',
                                                                    backgroundColor: '#f9fafb',
                                                                    appearance: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                                className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 text-gray-900"
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Distribution */}
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
                                        <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                                        Distribución y Archivos
                                    </h3>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Enlace del Video / Drive</label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={formData.video_url || ''}
                                                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '14px 18px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '12px',
                                                        fontSize: '15px',
                                                        backgroundColor: '#f9fafb'
                                                    }}
                                                    className="focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-50/50"
                                                    placeholder="https://youtube.com/..."
                                                />
                                                <a
                                                    href={formData.video_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`p-3.5 rounded-xl border border-gray-200 flex items-center justify-center transition-all ${formData.video_url ? 'text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100 cursor-pointer' : 'text-gray-300 bg-gray-50 cursor-not-allowed'}`}
                                                >
                                                    <ExternalLink size={22} />
                                                </a>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Plataformas de Publicación</label>
                                            <div className="flex flex-wrap gap-3">
                                                {PLATFORMS.map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={async () => toggleArrayItem('platforms', p)}
                                                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${formData.platforms?.includes(p)
                                                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.gym_compatible ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                                    {formData.gym_compatible && <Check size={16} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.gym_compatible || false}
                                                    onChange={e => setFormData({ ...formData, gym_compatible: e.target.checked })}
                                                    className="hidden"
                                                />
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-800">Compatible con Gimnasios</span>
                                                    <span className="block text-xs text-gray-500 mt-0.5">Mostrar en pantallas de centros asociados</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Metadata & Status */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Estado y Planificación</h3>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Estado Actual</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '10px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#f9fafb',
                                                        appearance: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 text-gray-900"
                                                >
                                                    <option value="idea">💡 Idea</option>
                                                    <option value="script">📝 Guion</option>
                                                    <option value="recording">🎬 Grabación</option>
                                                    <option value="editing">✂️ Edición</option>
                                                    <option value="ready">✅ Listo</option>
                                                    <option value="published">📤 Publicado</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha Prevista</label>
                                            <input
                                                type="date"
                                                value={formData.scheduled_date || ''}
                                                onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#f9fafb'
                                                }}
                                                className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duración (segundos)</label>
                                            <input
                                                type="number"
                                                value={formData.duration || ''}
                                                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#f9fafb'
                                                }}
                                                className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Equipo</h3>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Productor</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.producer || ''}
                                                    onChange={e => setFormData({ ...formData, producer: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '10px',
                                                        fontSize: '14px',
                                                        backgroundColor: '#f9fafb',
                                                        appearance: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 text-gray-900"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Editor</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.editor || ''}
                                                    onChange={e => setFormData({ ...formData, editor: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '10px',
                                                        fontSize: '14px',
                                                        backgroundColor: '#f9fafb',
                                                        appearance: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    className="focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 text-gray-900"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Ubicaciones</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {LOCATIONS.map(l => (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={async () => toggleArrayItem('locations', l)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all w-full text-left flex items-center justify-between group ${formData.locations?.includes(l)
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                                                    }`}
                                            >
                                                {l}
                                                {formData.locations?.includes(l) && <Check size={12} strokeWidth={3} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '20px 32px',
                            backgroundColor: 'white',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            zIndex: 10
                        }}>
                            <button
                                onClick={async () => setShowModal(false)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                                className="hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                                }}
                                className="hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                {editingItem ? 'Guardar Cambios' : 'Crear Contenido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
