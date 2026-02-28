import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Video,
    Image as ImageIcon,
    Play,
    Users,
    Target,
    BarChart3,
    Link,
    X,
    Save,
    Trash2,
    Eye,
    ArrowLeft
} from 'lucide-react';

// ============ TYPES ============
interface MarketingContent {
    id: string;
    title: string;
    category: 'clientes' | 'educativo' | 'humor' | 'viral' | 'postureo' | 'servicios' | 'colaboraciones';
    type: 'video' | 'carrusel' | 'reel' | 'story';
    status: 'pendiente' | 'grabado' | 'editado' | 'programado' | 'publicado';
    filmmaker_id?: string;
    scheduled_date?: string;
    drive_link?: string;
    script?: string;
    created_at: string;
    center_id?: string; // For specific center content
}

// ============ MOCK DATA ============
const MOCK_CONTENT: MarketingContent[] = [
    {
        id: '1',
        title: 'Testimonio Cliente - Transformación 6 meses',
        category: 'clientes',
        type: 'video',
        status: 'grabado',
        filmmaker_id: 'luis',
        scheduled_date: '2025-12-15',
        drive_link: 'https://drive.google.com/file/d/1...',
        script: 'Entrevista con María sobre su proceso de pérdida de peso...',
        created_at: '2025-12-01T10:00:00Z'
    },
    {
        id: '2',
        title: '5 Tips para mejorar tu Sentadilla',
        category: 'educativo',
        type: 'reel',
        status: 'pendiente',
        filmmaker_id: 'maria',
        scheduled_date: '2025-12-20',
        created_at: '2025-12-02T15:30:00Z'
    },
    {
        id: '3',
        title: 'Challenge Burpees - Staff vs Clientes',
        category: 'viral',
        type: 'reel',
        status: 'editado',
        filmmaker_id: 'diego',
        scheduled_date: '2025-12-10',
        drive_link: 'https://drive.google.com/file/d/2...',
        created_at: '2025-11-28T09:15:00Z'
    }
];

const CATEGORIES = [
    { value: 'clientes', label: 'Clientes', color: '#2563eb' },
    { value: 'educativo', label: 'Educativo', color: '#059669' },
    { value: 'humor', label: 'Humor', color: '#f59e0b' },
    { value: 'viral', label: 'Viral', color: '#dc2626' },
    { value: 'postureo', label: 'Postureo', color: '#7c3aed' },
    { value: 'servicios', label: 'Servicios', color: '#0891b2' },
    { value: 'colaboraciones', label: 'Colaboraciones', color: '#db2777' }
];

const FILMMAKERS = [
    { id: 'maria', name: 'María García' },
    { id: 'luis', name: 'Luis Rodríguez' },
    { id: 'diego', name: 'Diego Montilla' },
    { id: 'ana', name: 'Ana Martín' }
];

interface MarketingContenidoViewProps {
    onBack: () => void;
}

export const MarketingContenidoView: React.FC<MarketingContenidoViewProps> = ({ onBack }) => {
    const [contents, setContents] = useState<MarketingContent[]>(MOCK_CONTENT);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<MarketingContent | null>(null);

    // ============ HELPERS ============
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendiente': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'grabado': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'editado': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'programado': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'publicado': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getCategoryColor = (category: string) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat ? cat.color : '#6b7280';
    };

    const getDaysRemaining = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getScheduledDateColor = (days: number) => {
        if (days <= 5) return 'text-red-600 font-bold';
        if (days <= 10) return 'text-yellow-600 font-medium';
        return 'text-green-600';
    };

    // ============ FILTERING ============
    const filteredContents = contents.filter(content => {
        const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
        const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Group by month
    const groupedContents = filteredContents.reduce((groups, content) => {
        const date = content.scheduled_date ? new Date(content.scheduled_date) : new Date(content.created_at);
        const monthKey = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        if (!groups[monthKey]) {
            groups[monthKey] = [];
        }
        groups[monthKey].push(content);
        return groups;
    }, {} as Record<string, MarketingContent[]>);

    // ============ MODAL ============
    const ContentModal = () => {
        const [formData, setFormData] = useState<Partial<MarketingContent>>(
            selectedContent || {
                status: 'pendiente',
                type: 'video',
                category: 'educativo'
            }
        );

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // Logic to save content would go here
            setIsModalOpen(false);
            setSelectedContent(null);
        };

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedContent ? 'Editar Contenido' : 'Nuevo Contenido'}
                                </h2>
                                <p className="text-gray-500 mt-1">Detalles de la publicación y producción</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Main Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Título del Contenido</label>
                                    <input
                                        type="text"
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-lg"
                                        placeholder="Ej: Tutorial Press Banca..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value as MarketingContent['category'] })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as MarketingContent['type'] })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                        >
                                            <option value="video">Video</option>
                                            <option value="reel">Reel / TikTok</option>
                                            <option value="carrusel">Carrusel</option>
                                            <option value="story">Story</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Guion / Descripción</label>
                                    <textarea
                                        value={formData.script || ''}
                                        onChange={e => setFormData({ ...formData, script: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                        placeholder="Escribe aquí el guion, copy o descripción del contenido..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Enlace a Drive / Archivos</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="url"
                                                value={formData.drive_link || ''}
                                                onChange={e => setFormData({ ...formData, drive_link: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                                placeholder="https://drive.google.com/..."
                                            />
                                        </div>
                                        <a
                                            href={formData.drive_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`px - 4 py - 2.5 rounded - lg border border - gray - 200 flex items - center gap - 2 transition - colors ${formData.drive_link ? 'hover:bg-gray-50 text-gray-700' : 'opacity-50 cursor-not-allowed text-gray-400'} `}
                                        >
                                            <Eye className="h-5 w-5" />
                                            Ver
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Metadata & Status */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as MarketingContent['status'] })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="grabado">Grabado</option>
                                            <option value="editado">Editado</option>
                                            <option value="programado">Programado</option>
                                            <option value="publicado">Publicado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Prevista</label>
                                        <input
                                            type="date"
                                            value={formData.scheduled_date || ''}
                                            onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Filmmaker Asignado</label>
                                        <select
                                            value={formData.filmmaker_id || ''}
                                            onChange={e => setFormData({ ...formData, filmmaker_id: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                                        >
                                            <option value="">Sin asignar</option>
                                            {FILMMAKERS.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Validation Warning */}
                                {formData.status === 'publicado' && !formData.drive_link && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700">
                                            Para marcar como <strong>Publicado</strong>, es necesario incluir el enlace al contenido final.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-4 bg-gray-50 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Save className="h-5 w-5" />
                                Guardar Contenido
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Controls Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar contenido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        />
                    </div>

                    {/* Category Legend */}
                    <div className="hidden lg:flex items-center gap-3 px-4 border-l border-gray-200">
                        {CATEGORIES.slice(0, 4).map(cat => (
                            <div key={cat.value} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-xs text-gray-600 font-medium">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm bg-white"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="grabado">Grabado</option>
                        <option value="editado">Editado</option>
                        <option value="programado">Programado</option>
                        <option value="publicado">Publicado</option>
                    </select>

                    <button
                        onClick={() => {
                            setSelectedContent(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contenido</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Filmmaker</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Prevista</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.entries(groupedContents).map(([month, monthContents]) => (
                                <React.Fragment key={month}>
                                    {/* Month Separator */}
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={6} className="px-6 py-2 text-sm font-semibold text-gray-600 border-y border-gray-100">
                                            {month}
                                        </td>
                                    </tr>

                                    {monthContents.map((content) => {
                                        const daysRemaining = getDaysRemaining(content.scheduled_date);
                                        const dateColorClass = daysRemaining !== null ? getScheduledDateColor(daysRemaining) : 'text-gray-500';

                                        return (
                                            <tr key={content.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p - 2 rounded - lg bg - gray - 100 text - gray - 500`}>
                                                            {content.type === 'video' ? <Video className="h-5 w-5" /> :
                                                                content.type === 'reel' ? <Play className="h-5 w-5" /> :
                                                                    <ImageIcon className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                                                                {content.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Creado: {new Date(content.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                        style={{
                                                            backgroundColor: `${getCategoryColor(content.category)} 15`,
                                                            color: getCategoryColor(content.category)
                                                        }}
                                                    >
                                                        {CATEGORIES.find(c => c.value === content.category)?.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium border ${getStatusColor(content.status)} `}>
                                                        {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {content.filmmaker_id ? (
                                                            <>
                                                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                                    {FILMMAKERS.find(f => f.id === content.filmmaker_id)?.name.charAt(0)}
                                                                </div>
                                                                <span className="text-sm text-gray-600">
                                                                    {FILMMAKERS.find(f => f.id === content.filmmaker_id)?.name.split(' ')[0]}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">Sin asignar</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {content.scheduled_date ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-gray-900">
                                                                {new Date(content.scheduled_date).toLocaleDateString()}
                                                            </span>
                                                            {content.status !== 'publicado' && (
                                                                <span className={`text - xs ${dateColorClass} `}>
                                                                    {daysRemaining !== null && daysRemaining <= 0 ? 'Vencido' : `${daysRemaining} días`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {content.drive_link && (
                                                            <a
                                                                href={content.drive_link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Ver en Drive"
                                                            >
                                                                <Link className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedContent(content);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredContents.length === 0 && (
                    <div className="p-12 text-center">
                        <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No se encontraron contenidos</h3>
                        <p className="text-gray-500 mt-1">Intenta ajustar los filtros o crea un nuevo contenido.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && <ContentModal />}
        </div>
    );
};
