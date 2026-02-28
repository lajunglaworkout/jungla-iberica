import React from 'react';
import { ArrowLeft, Save, CheckSquare, Edit3, Sparkles, CheckCircle, FileText, Clock, Maximize2, Download, X } from 'lucide-react';
import { blockService } from '../../../../services/academyService';
import { ui } from '../../../../utils/ui';
import { LessonBlock, ActiveModalField, EditingDownloadable, TaskPriority } from './ContenidosTypes';
import { ProgressBar, CollapsibleSection } from './HelperComponents';
import { FileUpload } from './FileUpload';
import { DownloadableManager } from './DownloadableManager';

interface BlockEditorProps {
    editingBlock: LessonBlock | null;
    setEditingBlock: (b: LessonBlock | null) => void;
    editorTitle: string;
    setEditorTitle: (v: string) => void;
    editorKeyPoints: string;
    setEditorKeyPoints: (v: string) => void;
    editorFullContent: string;
    setEditorFullContent: (v: string) => void;
    editorGensparkPrompt: string;
    setEditorGensparkPrompt: (v: string) => void;
    editorConcepto: string;
    setEditorConcepto: (v: string) => void;
    editorValor: string;
    setEditorValor: (v: string) => void;
    editorAccion: string;
    setEditorAccion: (v: string) => void;
    editorVideoUrl: string;
    setEditorVideoUrl: (v: string) => void;
    editorPptUrl: string;
    setEditorPptUrl: (v: string) => void;
    editorDownloadables: EditingDownloadable[];
    activeModalField: ActiveModalField;
    setActiveModalField: (v: ActiveModalField) => void;
    downloadableModalOpen: boolean;
    setDownloadableModalOpen: (v: boolean) => void;
    editingDownloadable: EditingDownloadable | null;
    setEditingDownloadable: (v: EditingDownloadable | null) => void;
    downloadablePromptText: string;
    setDownloadablePromptText: (v: string) => void;
    showTaskModal: boolean;
    setShowTaskModal: (v: boolean) => void;
    newTaskTitle: string;
    setNewTaskTitle: (v: string) => void;
    newTaskDescription: string;
    setNewTaskDescription: (v: string) => void;
    newTaskPriority: string;
    setNewTaskPriority: (v: TaskPriority) => void;
    calculateProgress: () => number;
    loadDownloadables: (blockId: string) => void;
    saveBlock: () => void;
    openTaskModal: () => void;
    handleCreateTask: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
    editingBlock,
    setEditingBlock,
    editorTitle,
    setEditorTitle,
    editorKeyPoints,
    setEditorKeyPoints,
    editorFullContent,
    setEditorFullContent,
    editorGensparkPrompt,
    setEditorGensparkPrompt,
    editorConcepto,
    setEditorConcepto,
    editorValor,
    setEditorValor,
    editorAccion,
    setEditorAccion,
    editorVideoUrl,
    setEditorVideoUrl,
    editorPptUrl,
    setEditorPptUrl,
    editorDownloadables,
    activeModalField,
    setActiveModalField,
    downloadableModalOpen,
    setDownloadableModalOpen,
    editingDownloadable,
    setEditingDownloadable,
    downloadablePromptText,
    setDownloadablePromptText,
    showTaskModal,
    setShowTaskModal,
    newTaskTitle,
    setNewTaskTitle,
    newTaskDescription,
    setNewTaskDescription,
    newTaskPriority,
    setNewTaskPriority,
    calculateProgress,
    loadDownloadables,
    saveBlock,
    openTaskModal,
    handleCreateTask,
}) => {
    if (!editingBlock) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#f9fafb', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: 'white', borderBottom: '1px solid #e5e7eb',
                padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => setEditingBlock(null)}
                        style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                    >
                        <ArrowLeft style={{ height: '20px', width: '20px' }} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Bloque {editingBlock.block_number}
                            <span style={{ color: '#d1d5db' }}>|</span>
                            <span style={{ color: '#10b981' }}>{editingBlock.title || 'Sin Título'}</span>
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                            Editando contenido del bloque
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={openTaskModal}
                        style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <CheckSquare style={{ height: '16px', width: '16px' }} />
                        Nueva Tarea
                    </button>

                    <button
                        onClick={() => setEditingBlock(null)}
                        style={{ padding: '8px 16px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <ArrowLeft style={{ height: '16px', width: '16px' }} />
                        Volver atrás
                    </button>
                    <button
                        onClick={saveBlock}
                        style={{ padding: '8px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Save style={{ height: '16px', width: '16px' }} />
                        Guardar
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-b border-emerald-100 px-6 py-5">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-emerald-600" />
                            <span className="opacity-60 text-emerald-700 font-medium text-sm uppercase tracking-wider mr-1">Editando:</span>
                            {editingBlock.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Estado de Producción</span>
                                <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border
                                    ${calculateProgress() >= 100 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                        calculateProgress() > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {calculateProgress() >= 100 ? 'Completado' : calculateProgress() > 0 ? 'En Progreso' : 'Sin Empezar'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <ProgressBar progress={calculateProgress()} />
                </div>

                <div className="flex-1 overflow-hidden grid grid-cols-12 gap-0 bg-slate-50/50">
                    {/* COLUMN 1: STRATEGIC GUIDE (25%) */}
                    <div className="hidden lg:block col-span-3 bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 overflow-y-auto p-5 custom-scrollbar h-full">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 pl-1">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            Guía Estratégica
                        </h3>

                        <div className="space-y-5">
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-sm font-bold shadow-sm group-hover:scale-110 transition-transform">1</span>
                                    <h4 className="font-bold text-gray-800 text-sm">Concepto</h4>
                                </div>
                                <textarea
                                    value={editorConcepto}
                                    onChange={(e) => setEditorConcepto(e.target.value)}
                                    className="w-full text-xs text-slate-700 leading-relaxed p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none min-h-[80px]"
                                    placeholder="Define la idea central. ¿Qué deben aprender exactamente en este bloque?"
                                />
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-sm font-bold shadow-sm group-hover:scale-110 transition-transform">2</span>
                                    <h4 className="font-bold text-gray-800 text-sm">Valor</h4>
                                </div>
                                <textarea
                                    value={editorValor}
                                    onChange={(e) => setEditorValor(e.target.value)}
                                    className="w-full text-xs text-slate-700 leading-relaxed p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none min-h-[80px]"
                                    placeholder="¿Por qué es útil? ¿Qué beneficio práctico obtienen al ver esto?"
                                />
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-sm font-bold shadow-sm group-hover:scale-110 transition-transform">3</span>
                                    <h4 className="font-bold text-gray-800 text-sm">Acción</h4>
                                </div>
                                <textarea
                                    value={editorAccion}
                                    onChange={(e) => setEditorAccion(e.target.value)}
                                    className="w-full text-xs text-slate-700 leading-relaxed p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none min-h-[80px]"
                                    placeholder="Pasos concretos. ¿Qué deben hacer diferente después de ver este video?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2: CONTENT CREATION (50%) */}
                    <div className="col-span-6 bg-white overflow-y-auto p-8 custom-scrollbar relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

                        {/* Block Title Input */}
                        <div className="mb-10 group">
                            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3 group-focus-within:text-emerald-700 transition-colors">
                                Título del Bloque
                            </label>
                            <input
                                type="text"
                                value={editorTitle}
                                onChange={(e) => setEditorTitle(e.target.value)}
                                className="w-full text-3xl font-bold text-gray-900 border-none border-b-2 border-emerald-200 focus:border-emerald-600 focus:ring-0 px-0 py-3 placeholder-gray-400 transition-all bg-transparent"
                                placeholder="Escribe el título aquí..."
                            />
                            <div className="flex gap-4 mt-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-slate-600">
                                    <Clock className="h-3 w-3" /> Duración estimada: 4 min
                                </span>
                            </div>
                        </div>

                        {/* Collapsible Content Sections */}
                        <CollapsibleSection title="Puntos Más Importantes" icon={<CheckCircle className="h-5 w-5 text-amber-600" />}>
                            <div className="bg-amber-50/50 p-1 rounded-xl border border-amber-100/50 relative group/field">
                                <button
                                    onClick={() => setActiveModalField('points')}
                                    className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-lg text-amber-600 hover:text-amber-700 shadow-sm border border-amber-100 transition-all opacity-0 group-hover/field:opacity-100 z-10"
                                    title="Pantalla completa"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                                <textarea
                                    value={editorKeyPoints}
                                    onChange={(e) => setEditorKeyPoints(e.target.value)}
                                    className="w-full min-h-[160px] p-5 text-sm border-0 bg-transparent focus:ring-0 focus:outline-none transition-all resize-none placeholder-amber-400/70 text-amber-900 leading-relaxed font-medium"
                                    placeholder="Resume aquí los 3-5 conceptos clave que el alumno debe recordar para siempre..."
                                />
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Contenido Completo (Guion)" icon={<FileText className="h-5 w-5 text-emerald-600" />}>
                            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm relative group/field">
                                <button
                                    onClick={() => setActiveModalField('content')}
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 shadow-sm border border-emerald-100 transition-all opacity-0 group-hover/field:opacity-100 z-10"
                                    title="Pantalla completa"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                                <textarea
                                    value={editorFullContent}
                                    onChange={(e) => setEditorFullContent(e.target.value)}
                                    className="w-full min-h-[500px] p-6 text-base leading-relaxed border-0 bg-transparent focus:ring-0 focus:outline-none transition-all font-mono text-gray-800 placeholder-gray-400"
                                    placeholder="Escribe aquí el guion completo..."
                                />
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* COLUMN 3: ASSETS & FILES (25%) */}
                    <div className="col-span-3 bg-slate-50/80 border-l border-emerald-100 overflow-y-auto p-6 custom-scrollbar backdrop-blur-sm">
                        {/* Prompt for PPT */}
                        <div className="mb-6">
                            <CollapsibleSection
                                title="Crear Presentación (Genspark)"
                                icon={<Sparkles className="h-5 w-5 text-purple-600" />}
                                defaultExpanded={true}
                            >
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveModalField('prompt')}
                                        className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-lg text-purple-600 hover:text-purple-700 shadow-sm border border-purple-100 transition-all z-10"
                                        title="Pantalla completa"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </button>
                                    <textarea
                                        value={editorGensparkPrompt}
                                        onChange={(e) => setEditorGensparkPrompt(e.target.value)}
                                        className="w-full min-h-[120px] p-4 text-sm border border-purple-100 rounded-xl mb-3 bg-purple-50/50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none text-slate-800 leading-relaxed"
                                        placeholder="Prompt para generar la presentación..."
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(editorGensparkPrompt); ui.info('Copiado!'); }}
                                            className="text-xs bg-white border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 font-bold text-gray-600 transition-all shadow-sm"
                                        >
                                            Copiar
                                        </button>
                                        <a
                                            href="https://genspark.ai"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs bg-purple-200 text-slate-900 border border-purple-300 px-4 py-2 rounded-lg hover:bg-purple-300 hover:shadow-md font-bold flex items-center gap-2 transition-all shadow-sm"
                                        >
                                            Ir a Genspark
                                        </a>
                                    </div>
                                </div>
                            </CollapsibleSection>
                        </div>

                        {/* Downloadables */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 pl-1">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Download className="h-4 w-4" /> Materiales
                                </h3>
                            </div>
                            <DownloadableManager
                                blockId={editingBlock.id}
                                downloadables={editorDownloadables}
                                onUpdate={() => loadDownloadables(editingBlock.id)}
                                onOpenContentModal={(d) => {
                                    setEditingDownloadable(d);
                                    setDownloadablePromptText(d.prompt_generation);
                                    setDownloadableModalOpen(true);
                                }}
                            />
                        </div>

                        <hr className="border-gray-200/50 my-8" />

                        {/* Final Files */}
                        <div className="space-y-8">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                Archivos Finales
                            </h3>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Video Grabado (.mp4)</label>
                                <FileUpload
                                    blockId={editingBlock.id}
                                    fileType="video"
                                    existingUrl={editorVideoUrl}
                                    onUploadComplete={(url) => setEditorVideoUrl(url)}
                                    onDelete={async () => {
                                        if (await ui.confirm('¿Borrar video?')) {
                                            await blockService.update(editingBlock.id, { video_url: null });
                                            setEditorVideoUrl('');
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Presentación (.ppt/pdf)</label>
                                <FileUpload
                                    blockId={editingBlock.id}
                                    fileType="ppt"
                                    existingUrl={editorPptUrl}
                                    onUploadComplete={(url) => setEditorPptUrl(url)}
                                    onDelete={async () => {
                                        if (await ui.confirm('¿Borrar presentación?')) {
                                            await blockService.update(editingBlock.id, { ppt_url: null });
                                            setEditorPptUrl('');
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-8 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <p className="text-xs text-emerald-800 flex items-start gap-2">
                                <span className="mt-0.5">ℹ️</span>
                                <span>
                                    <strong>Tip:</strong> Los archivos se subirán a Supabase Storage y los enlaces se validarán automáticamente.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generic Expanded Editor Modal */}
            {activeModalField !== 'none' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 lg:p-8">
                    <div className={`bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden
                        ${activeModalField === 'prompt' ? 'border-t-4 border-purple-500' :
                            activeModalField === 'points' ? 'border-t-4 border-amber-500' : 'border-t-4 border-emerald-500'}`}>

                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm
                                    ${activeModalField === 'prompt' ? 'bg-purple-100 text-purple-600' :
                                        activeModalField === 'points' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {activeModalField === 'prompt' && <Sparkles className="h-6 w-6" />}
                                    {activeModalField === 'points' && <CheckCircle className="h-6 w-6" />}
                                    {activeModalField === 'content' && <FileText className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {activeModalField === 'prompt' && 'Prompt de Genspark'}
                                        {activeModalField === 'points' && 'Puntos Más Importantes'}
                                        {activeModalField === 'content' && 'Contenido Completo (Guion)'}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {activeModalField === 'prompt' && 'Edita el prompt con comodidad y detalle.'}
                                        {activeModalField === 'points' && 'Define los conceptos clave con claridad.'}
                                        {activeModalField === 'content' && 'Escribe el guion completo sin distracciones.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveModalField('none')}
                                    className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50/30">
                            <div className="flex-1 p-8 overflow-y-auto">
                                <div className={`w-full h-full min-h-[500px] p-8 rounded-xl border shadow-sm text-lg leading-relaxed resize-none font-medium focus-within:ring-4 focus-within:ring-opacity-20 transition-all bg-white
                                ${activeModalField === 'prompt' ? 'border-purple-100 focus-within:border-purple-400 focus-within:ring-purple-500 text-slate-700 font-mono' :
                                        activeModalField === 'points' ? 'border-amber-100 focus-within:border-amber-400 focus-within:ring-amber-500 text-amber-900' :
                                            'border-emerald-100 focus-within:border-emerald-400 focus-within:ring-emerald-500 text-slate-800 font-serif'}`}>
                                    <textarea
                                        value={
                                            activeModalField === 'prompt' ? editorGensparkPrompt :
                                                activeModalField === 'points' ? editorKeyPoints :
                                                    editorFullContent
                                        }
                                        onChange={(e) => {
                                            if (activeModalField === 'prompt') setEditorGensparkPrompt(e.target.value);
                                            if (activeModalField === 'points') setEditorKeyPoints(e.target.value);
                                            if (activeModalField === 'content') setEditorFullContent(e.target.value);
                                        }}
                                        className="w-full h-full bg-transparent border-none focus:ring-0 resize-none outline-none"
                                        placeholder="Escribe aquí..."
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 z-10">
                                <button
                                    onClick={() => setActiveModalField('none')}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cerrar (Esc)
                                </button>
                                <button
                                    onClick={() => setActiveModalField('none')}
                                    className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform hover:translate-y-[-2px] hover:shadow-xl
                                    ${activeModalField === 'prompt' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' :
                                            activeModalField === 'points' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' :
                                                'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                                >
                                    Guardar y Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Downloadable Content Modal */}
            {downloadableModalOpen && editingDownloadable && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 lg:p-8 pointer-events-auto">
                    <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border-t-4 border-emerald-500">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-emerald-100 text-emerald-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Contenido: {editingDownloadable.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Escribe el contenido en texto plano para este material descargable.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setDownloadableModalOpen(false); setEditingDownloadable(null); setDownloadablePromptText(''); }}
                                    className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50/30">
                            <div className="flex-1 p-8 overflow-y-auto">
                                <div className="w-full h-full min-h-[500px] p-8 rounded-xl border shadow-sm text-lg leading-relaxed resize-none font-medium focus-within:ring-4 focus-within:ring-opacity-20 transition-all bg-white border-emerald-100 focus-within:border-emerald-400 focus-within:ring-emerald-500">
                                    <textarea
                                        value={downloadablePromptText}
                                        onChange={(e) => setDownloadablePromptText(e.target.value)}
                                        className="w-full h-full bg-transparent border-none focus:ring-0 resize-none outline-none text-slate-800 font-mono"
                                        placeholder="Escribe aquí el contenido en texto plano del material descargable..."
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 z-10">
                                <button
                                    onClick={() => { setDownloadableModalOpen(false); setEditingDownloadable(null); setDownloadablePromptText(''); }}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (editingDownloadable) {
                                            const { downloadableService: ds } = await import('../../../../services/academyService');
                                            await ds.update(editingDownloadable.id, { prompt_generation: downloadablePromptText });
                                            if (editingBlock) loadDownloadables(editingBlock.id);
                                            setDownloadableModalOpen(false);
                                            setEditingDownloadable(null);
                                            setDownloadablePromptText('');
                                        }
                                    }}
                                    className="px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform hover:translate-y-[-2px] hover:shadow-xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                                >
                                    Guardar y Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Nueva Tarea Vinculada</h3>
                            <button onClick={() => setShowTaskModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>

                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    rows={4}
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                <div className="flex gap-2">
                                    {['low', 'normal', 'high', 'urgent'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setNewTaskPriority(p as TaskPriority)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${newTaskPriority === p ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {p === 'low' ? 'Baja' : p === 'normal' ? 'Normal' : p === 'high' ? 'Alta' : 'Urgente'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancelar</button>
                            <button onClick={handleCreateTask} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm">Crear Tarea</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
