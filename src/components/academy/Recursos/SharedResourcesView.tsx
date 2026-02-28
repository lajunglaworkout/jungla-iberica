import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Search, Plus, Filter, Copy,
    Check, Edit3, Trash2, Library, Sparkles,
    FileText, X, Save
} from 'lucide-react';
import { sharedContentService } from '../../../services/academyService';
import { AcademySharedContent, SharedContentType } from '../../../types/academy';
import { useSession } from '../../../contexts/SessionContext';
import { ui } from '../../../utils/ui';


interface SharedResourcesViewProps {
    onBack: () => void;
}

export const SharedResourcesView: React.FC<SharedResourcesViewProps> = ({ onBack }) => {
    const { user } = useSession();
    const [resources, setResources] = useState<AcademySharedContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'prompt' | 'guide' | 'resource'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Editor State
    const [showEditor, setShowEditor] = useState(false);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [editingResource, setEditingResource] = useState<AcademySharedContent | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'prompt' as SharedContentType,
        category: '',
        tags: ''
    });

    // Copy Feedback
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        setLoading(true);
        try {
            const data = await sharedContentService.getAll();
            setResources(data || []);
        } catch (error) {
            console.error('Error loading resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            type: 'prompt',
            category: '',
            tags: ''
        });
        setEditingResource(null);
        setEditorMode('create');
    };

    const handleOpenEditor = (resource?: AcademySharedContent) => {
        if (resource) {
            setEditorMode('edit');
            setEditingResource(resource);
            setFormData({
                title: resource.title,
                content: resource.content,
                type: resource.type,
                category: resource.category || '',
                tags: resource.tags ? resource.tags.join(', ') : ''
            });
        } else {
            resetForm();
        }
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) return;

        try {
            const payload = {
                title: formData.title,
                content: formData.content,
                type: formData.type,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                updated_at: new Date().toISOString()
            };

            if (editorMode === 'create') {
                const data = await sharedContentService.create({
                    ...payload,
                    created_by: user?.id,
                    is_public: true
                });

                if (data) setResources([data, ...resources]);
            } else if (editingResource) {
                await sharedContentService.update(editingResource.id, payload);
                setResources(resources.map(r => r.id === editingResource.id ? { ...r, ...payload } : r));
            }

            setShowEditor(false);
            resetForm();
        } catch (error) {
            console.error('Error saving resource:', error);
            ui.error('Error al guardar el recurso');
        }
    };

    const handleDelete = async (id: string) => {
        if (!await ui.confirm('¿Seguro que quieres eliminar este recurso?')) return;
        try {
            await sharedContentService.delete(id);
            setResources(resources.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const filteredResources = resources.filter(r => {
        const matchesTab = activeTab === 'all' || r.type === activeTab;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'prompt': return <Sparkles className="h-5 w-5 text-purple-600" />;
            case 'guide': return <Library className="h-5 w-5 text-amber-600" />;
            default: return <FileText className="h-5 w-5 text-emerald-600" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'prompt': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'guide': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <Library className="h-8 w-8" />
                            <h1 className="text-3xl font-bold">Biblioteca de Recursos</h1>
                        </div>
                    </div>
                    <p className="text-indigo-100 text-lg pl-14 max-w-2xl">
                        Repositorio central de prompts, guías de estilo y recursos compartidos para el equipo.
                    </p>
                </div>
                <Sparkles className="absolute right-0 bottom-0 opacity-10 w-64 h-64 transform translate-y-1/4 translate-x-1/4" />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                    {['all', 'prompt', 'guide', 'resource'].map((tab) => (
                        <button
                            key={tab}
                            onClick={async () => setActiveTab(tab as 'all' | 'prompt' | 'guide' | 'resource')}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${activeTab === tab
                                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {tab === 'all' && 'Todos'}
                            {tab === 'prompt' && '✨ Prompts'}
                            {tab === 'guide' && '📚 Guías'}
                            {tab === 'resource' && '📄 Otros'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar recursos..."
                            value={searchQuery}
                            onChange={async (e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={async () => handleOpenEditor()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm transition-all hover:scale-105"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                    <div key={resource.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col group">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getTypeColor(resource.type)}`}>
                                    {resource.type}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={async () => handleOpenEditor(resource)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button onClick={async () => handleDelete(resource.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                            <div className="relative bg-slate-50 rounded-lg p-3 group/code border border-gray-100">
                                <p className="text-sm text-slate-600 font-mono line-clamp-3 leading-relaxed">
                                    {resource.content}
                                </p>
                                <button
                                    onClick={async () => handleCopy(resource.content, resource.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-white shadow-sm rounded border border-gray-200 hover:bg-gray-50 transition-all opacity-0 group-hover/code:opacity-100"
                                    title="Copiar contenido"
                                >
                                    {copiedId === resource.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                                </button>
                            </div>

                            {resource.tags && resource.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {resource.tags.map(tag => (
                                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-between items-center">
                            <span className="text-xs text-gray-400">
                                {new Date(resource.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                                {resource.category}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {showEditor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editorMode === 'create' ? 'Nuevo Recurso' : 'Editar Recurso'}
                            </h2>
                            <button onClick={async () => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={async (e) => setFormData({ ...formData, type: e.target.value as SharedContentType })}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="prompt">✨ Prompt</option>
                                        <option value="guide">📚 Guía</option>
                                        <option value="resource">📄 Recurso</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={async (e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Ej: Marketing, Copywriting"
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={async (e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Nombre del recurso..."
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex-1 flex flex-col min-h-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                                <textarea
                                    value={formData.content}
                                    onChange={async (e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Escribe o pega el contenido aquí..."
                                    className="w-full flex-1 border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={async (e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="gpt4, style, email..."
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={async () => setShowEditor(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                            >
                                Guardar Recurso
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
