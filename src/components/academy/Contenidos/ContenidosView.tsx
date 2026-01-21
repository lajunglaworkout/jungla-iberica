import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Filter, MoreVertical,
    FileText, Video, Link as LinkIcon, ChevronDown,
    ChevronRight, Clock, CheckCircle, AlertCircle, ArrowLeft,
    Edit3, Save, X, Upload, Download, HelpCircle, Eye, Trash2,
    Layout, Type, Image as ImageIcon, Sparkles, Zap, Maximize2, Minimize2, CheckSquare
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AcademyModule, AcademyLesson } from '../../../types/academy';

interface ContenidosViewProps {
    onBack: () => void;
}

interface LessonBlock {
    id: string;
    lesson_id: string;
    block_number: number;
    title: string;
    content?: string;
    file_url?: string;
    duration?: number;
    // New fields Phase 6
    main_ideas?: string;
    key_points?: string;
    full_content?: string;
    genspark_prompt?: string;
    video_url?: string;
    ppt_url?: string;
    production_status?: 'not_started' | 'content_created' | 'prompts_ready' | 'recording' | 'editing' | 'completed';
    progress_percentage?: number;
    downloadables?: any[];
    // Strategic Guide Fields
    concepto?: string;
    valor?: string;
    accion?: string;
}

// --- HELPER COMPONENTS ---

const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
        <div className="text-right text-xs text-gray-500 mt-1">{Math.round(progress)}% Completado</div>
    </div>
);

const CollapsibleSection = ({
    title,
    children,
    icon,
    defaultExpanded = true,
    rightElement
}: {
    title: string,
    children: React.ReactNode,
    icon?: React.ReactNode,
    defaultExpanded?: boolean,
    rightElement?: React.ReactNode
}) => {


    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={`border rounded-xl mb-5 bg-white shadow-sm overflow-hidden transition-all duration-300 
            ${expanded ? 'border-emerald-500/30 ring-4 ring-emerald-50/50' : 'border-gray-100 hover:border-emerald-200'}`}>
            <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-emerald-50/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${expanded ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                        {icon}
                    </div>
                    <h3 className={`font-bold text-base transition-colors ${expanded ? 'text-emerald-950' : 'text-gray-700'}`}>
                        {title}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    {rightElement}
                    <div className={`p-1 rounded-full transition-all duration-300 ${expanded ? 'bg-emerald-100 rotate-180' : 'bg-transparent'}`}>
                        <ChevronDown className={`h-5 w-5 transition-colors ${expanded ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="p-5 border-t border-emerald-50/50 animate-in slide-in-from-top-2 duration-300 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

const FileUpload = ({
    blockId,
    fileType,
    onUploadComplete,
    existingUrl,
    onDelete
}: {
    blockId: string,
    fileType: 'video' | 'ppt',
    onUploadComplete: (url: string) => void,
    existingUrl?: string,
    onDelete: () => void
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            // 1. Validar tamaño
            const maxSize = fileType === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`Archivo demasiado grande. Máximo ${maxSize / 1024 / 1024}MB`);
                return;
            }

            // 2. Validar tipo
            const validTypes = fileType === 'video'
                ? ['video/mp4', 'video/quicktime', 'video/webm']
                : ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf'];

            if (!validTypes.includes(file.type) && !file.name.endsWith('.pptx') && !file.name.endsWith('.ppt')) {
                // Relaxed check for PPT as mime types vary
            }

            // 3. Subir a Storage
            const bucket = fileType === 'video' ? 'academy-videos' : 'academy-presentations';
            const fileName = `${blockId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // 4. Obtener URL pública
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            // 5. Actualizar bloque
            const fieldName = fileType === 'video' ? 'video_url' : 'ppt_url';
            await supabase
                .from('academy_lesson_blocks')
                .update({ [fieldName]: urlData.publicUrl })
                .eq('id', blockId);

            onUploadComplete(urlData.publicUrl);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir el archivo: ' + (error as Error).message);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="group border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 bg-white">
            {existingUrl ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`p-3 rounded-lg ${fileType === 'video' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {fileType === 'video' ? <Video className="h-6 w-6" /> : <Layout className="h-6 w-6" />}
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-xs font-bold uppercase text-gray-600 tracking-wider mb-0.5">Archivo Subido</span>
                            <a href={existingUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-900 hover:text-emerald-700 hover:underline truncate max-w-[200px] transition-colors">
                                {existingUrl.split('/').pop()}
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                        title="Eliminar archivo"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                <>
                    {uploading ? (
                        <div className="space-y-3 py-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="text-sm font-bold text-emerald-900 animate-pulse">Subiendo archivo...</p>
                        </div>
                    ) : (
                        <div className="relative py-4 group-hover:scale-[1.02] transition-transform duration-300">
                            <input
                                type="file"
                                accept={fileType === 'video' ? '.mp4,.mov,.webm' : '.ppt,.pptx,.pdf'}
                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="pointer-events-none">
                                <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                                    <Upload className="h-8 w-8 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                                </div>
                                <p className="text-sm font-bold text-gray-800 mb-1">
                                    Click o arrastra tu {fileType === 'video' ? 'Video' : 'Presentación'}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {fileType === 'video' ? 'MP4, MOV (Máx 500MB)' : 'PDF, PPTX (Máx 50MB)'}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Simplified DownloadableManager for now, fully functional logic inside main component or this
const DownloadableManager = ({
    blockId,
    downloadables,
    onUpdate,
    onOpenContentModal
}: {
    blockId: string,
    downloadables: any[],
    onUpdate: () => void,
    onOpenContentModal: (downloadable: { id: string; name: string; prompt_generation: string }) => void
}) => {
    // Logic to add/remove downloadables
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('pdf');

    const addDownloadable = async () => {
        if (!newName) return;
        try {
            // We need to insert into academy_block_downloadables
            // Check if table exists first? Assume yes after migration script.
            const { error } = await supabase
                .from('academy_block_downloadables')
                .insert({
                    block_id: blockId,
                    name: newName,
                    type: newType,
                    status: 'pending'
                });

            if (error) throw error;
            onUpdate();
            setIsAdding(false);
            setNewName('');
        } catch (err) {
            console.error(err);
            alert('Error al crear descargable');
        }
    };

    return (
        <div className="space-y-4">
            {downloadables.map(d => (
                <div key={d.id} className="border border-emerald-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-extrabold uppercase p-1.5 bg-slate-100 rounded text-slate-700 tracking-wider">
                                {d.type}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1.5
                                ${d.status === 'uploaded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {d.status === 'uploaded' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {d.status === 'uploaded' ? 'Listo' : 'Pendiente'}
                            </span>
                            <button
                                onClick={async () => {
                                    if (confirm('¿Borrar descargable?')) {
                                        await supabase.from('academy_block_downloadables').delete().eq('id', d.id);
                                        onUpdate();
                                    }
                                }}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content Button - Opens Modal */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2 block">
                            📝 Contenido Texto Plano
                        </label>
                        <button
                            onClick={() => onOpenContentModal({
                                id: d.id,
                                name: d.name,
                                prompt_generation: d.prompt_generation || ''
                            })}
                            className="w-full text-left p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition-all group/btn"
                        >
                            {d.prompt_generation ? (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                                            {d.prompt_generation.substring(0, 120)}
                                            {d.prompt_generation.length > 120 ? '...' : ''}
                                        </p>
                                        <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1 group-hover/btn:underline">
                                            <Maximize2 className="h-3 w-3" /> Editar contenido
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">Añadir contenido de texto plano...</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* File Upload Section - Mini version */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {d.file_url ? (
                            <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-2">
                                <Download className="h-4 w-4" /> Ver Archivo Final
                            </a>
                        ) : (
                            <label className="cursor-pointer text-xs font-bold bg-white border border-gray-300 hover:border-emerald-400 hover:text-emerald-800 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm w-full justification-center">
                                <Upload className="h-3 w-3" /> Subir Archivo Final
                                <input type="file" className="hidden" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const fileName = `${d.id}_${file.name}`;
                                        const { data } = await supabase.storage.from('academy-downloadables').upload(fileName, file);
                                        if (data) {
                                            const { data: url } = supabase.storage.from('academy-downloadables').getPublicUrl(fileName);
                                            await supabase.from('academy_block_downloadables').update({ file_url: url.publicUrl, status: 'uploaded' }).eq('id', d.id);
                                            onUpdate();
                                        }
                                    }
                                }} />
                            </label>
                        )}
                    </div>
                </div>
            ))}

            {isAdding ? (
                <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 animate-in fade-in">
                    <input
                        type="text"
                        placeholder="Nombre del recurso (ej: Plantilla Excel)"
                        className="w-full p-2 border border-emerald-300 rounded mb-2"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <select
                            value={newType}
                            onChange={e => setNewType(e.target.value)}
                            className="p-2 border border-emerald-300 rounded"
                        >
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="word">Word</option>
                            <option value="image">Imagen</option>
                        </select>
                        <button onClick={addDownloadable} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Añadir</button>
                        <button onClick={() => setIsAdding(false)} className="text-gray-500 px-4 py-2">Cancelar</button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="h-4 w-4" /> Añadir Material Descargable
                </button>
            )}
        </div>
    );
};


export const ContenidosView: React.FC<ContenidosViewProps> = ({ onBack }) => {
    const [modules, setModules] = useState<AcademyModule[]>([]);
    const [lessons, setLessons] = useState<Record<string, AcademyLesson[]>>({});
    const [blocks, setBlocks] = useState<Record<string, LessonBlock[]>>({});
    const [loading, setLoading] = useState(true);

    // UI State
    const [showAddLessonModal, setShowAddLessonModal] = useState(false);
    const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState('');

    // Edit/Delete Lesson State
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<AcademyLesson | null>(null);
    const [editLessonTitle, setEditLessonTitle] = useState('');
    const [editLessonOrder, setEditLessonOrder] = useState<number>(1);

    // Editor State
    const [selectedLesson, setSelectedLesson] = useState<AcademyLesson | null>(null);
    const [editingBlock, setEditingBlock] = useState<LessonBlock | null>(null);
    const [editorTitle, setEditorTitle] = useState('');
    const [editorContent, setEditorContent] = useState('');

    const [editorKeyPoints, setEditorKeyPoints] = useState('');
    const [editorFullContent, setEditorFullContent] = useState('');
    const [editorGensparkPrompt, setEditorGensparkPrompt] = useState('');

    // Strategic Guide Fields
    const [editorConcepto, setEditorConcepto] = useState('');
    const [editorValor, setEditorValor] = useState('');
    const [editorAccion, setEditorAccion] = useState('');

    const [activeModalField, setActiveModalField] = useState<'none' | 'prompt' | 'points' | 'content'>('none');

    // Downloadable Content Modal State
    const [downloadableModalOpen, setDownloadableModalOpen] = useState(false);
    const [editingDownloadable, setEditingDownloadable] = useState<{ id: string; name: string; prompt_generation: string } | null>(null);
    const [downloadablePromptText, setDownloadablePromptText] = useState('');

    // Lesson Sort Mode
    const [lessonSortMode, setLessonSortMode] = useState<'order' | 'completed' | 'pending'>('order');

    // Toast State
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Task Creation State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

    const openTaskModal = () => {
        if (!editingBlock || !selectedLesson) return;
        setNewTaskTitle(`Revisar: ${editingBlock.title}`);
        setNewTaskDescription(`Revisión requerida para el bloque ${editingBlock.block_number} de la lección "${selectedLesson.title}".\n\n- Revisar contenido\n- Verificar adjuntos`);
        setNewTaskPriority('normal');
        setShowTaskModal(true);
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim() || !editingBlock || !selectedLesson) return;

        try {
            const { data: userData } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('academy_tasks')
                .insert([{
                    title: newTaskTitle,
                    description: newTaskDescription,
                    priority: newTaskPriority,
                    status: 'pending',
                    assigned_to: userData.user?.id,
                    created_by: `block_${editingBlock.id}`, // Traceability
                    block_related: editingBlock.id,
                    lesson_related: selectedLesson.id,
                    progress: 0,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            setShowTaskModal(false);
            setNewTaskTitle('');
            setNewTaskDescription('');
            // Optional: Show a specific toast for task creation, but success toast is fine for now
            alert('✅ Tarea creada y vinculada correctamente');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error al crear la tarea vinculada');
        }
    };

    // Auto-hide toast
    useEffect(() => {
        if (showSuccessToast) {
            const timer = setTimeout(() => setShowSuccessToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessToast]);
    const [editorVideoUrl, setEditorVideoUrl] = useState('');
    const [editorPptUrl, setEditorPptUrl] = useState('');
    const [editorDownloadables, setEditorDownloadables] = useState<any[]>([]);
    const [editorFileUrl, setEditorFileUrl] = useState(''); // Legacy fallback


    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Helper Functions
    const calculateProgress = () => {
        let progress = 0;
        if (editorKeyPoints && editorFullContent) progress += 40;
        if (editorGensparkPrompt) progress += 10;
        if (editorDownloadables.length > 0) {
            const withPrompts = editorDownloadables.filter(d => d.prompt_generation).length;
            progress += Math.floor((withPrompts / editorDownloadables.length) * 15);
            const uploaded = editorDownloadables.filter(d => d.status === 'uploaded').length;
            progress += Math.floor((uploaded / editorDownloadables.length) * 15);
        }
        if (editorVideoUrl) progress += 10;
        if (editorPptUrl) progress += 10;
        return Math.min(100, progress);
    };

    const loadDownloadables = async (blockId: string) => {
        const { data } = await supabase
            .from('academy_block_downloadables')
            .select('*')
            .eq('block_id', blockId)
            .order('order', { ascending: true });
        setEditorDownloadables(data || []);
    };


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editingBlock) return;

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${editingBlock.lesson_id}/${editingBlock.id}/${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('academy-files')
                .upload(fileName, file);

            if (error) throw error;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('academy-files')
                .getPublicUrl(fileName);

            // 3. Update State
            setEditorFileUrl(publicUrl);
            alert('Archivo subido correctamente');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir el archivo');
        }
    };



    const initiateAddLesson = (moduleId: string) => {
        setTargetModuleId(moduleId);
        setNewLessonTitle('');
        setShowAddLessonModal(true);
    };

    const confirmAddLesson = async () => {
        if (!targetModuleId || !newLessonTitle.trim()) return;

        try {
            // 1. Create Lesson
            const { data: lesson, error: lessonError } = await supabase
                .from('academy_lessons')
                .insert([{
                    module_id: targetModuleId,
                    title: newLessonTitle,
                    order: (lessons[targetModuleId]?.length || 0) + 1,
                    status: 'planned'
                }])
                .select()
                .single();

            if (lessonError) throw lessonError;

            // 2. Create 3 Default Blocks
            const defaultBlocks = [
                { lesson_id: lesson.id, block_number: 1, title: 'Bloque 1: Concepto' },
                { lesson_id: lesson.id, block_number: 2, title: 'Bloque 2: Valor' },
                { lesson_id: lesson.id, block_number: 3, title: 'Bloque 3: Acción' }
            ];

            const { error: blocksError } = await supabase
                .from('academy_lesson_blocks')
                .insert(defaultBlocks);

            if (blocksError) throw blocksError;

            // Refresh and Close
            loadLessons(targetModuleId);
            setShowAddLessonModal(false);
            setTargetModuleId(null);
            setNewLessonTitle('');
        } catch (error) {
            console.error('Error creating lesson:', error);
            alert('Error al crear la lección');
        }
    };

    const initiateEditLesson = (lesson: AcademyLesson, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the lesson editor
        setEditingLesson(lesson);
        setEditLessonTitle(lesson.title);
        setEditLessonOrder(lesson.order);
        setShowEditLessonModal(true);
    };

    const confirmEditLesson = async () => {
        if (!editingLesson || !editLessonTitle.trim()) return;

        try {
            const { error } = await supabase
                .from('academy_lessons')
                .update({ title: editLessonTitle, order: editLessonOrder })
                .eq('id', editingLesson.id);

            if (error) throw error;

            // Update local state
            setLessons(prev => ({
                ...prev,
                [editingLesson.module_id]: prev[editingLesson.module_id].map(l =>
                    l.id === editingLesson.id ? { ...l, title: editLessonTitle, order: editLessonOrder } : l
                )
            }));

            setShowEditLessonModal(false);
            setEditingLesson(null);
            setEditLessonTitle('');
            setEditLessonOrder(1);
        } catch (error) {
            console.error('Error updating lesson:', error);
            alert('Error al actualizar la lección');
        }
    };

    const deleteLesson = async (lesson: AcademyLesson, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the lesson editor

        if (!confirm(`¿Estás seguro de que deseas eliminar la lección "${lesson.title}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            // First delete all blocks
            const { error: blocksError } = await supabase
                .from('academy_lesson_blocks')
                .delete()
                .eq('lesson_id', lesson.id);

            if (blocksError) throw blocksError;

            // Then delete the lesson
            const { error: lessonError } = await supabase
                .from('academy_lessons')
                .delete()
                .eq('id', lesson.id);

            if (lessonError) throw lessonError;

            // Update local state
            setLessons(prev => ({
                ...prev,
                [lesson.module_id]: prev[lesson.module_id].filter(l => l.id !== lesson.id)
            }));

            // Remove blocks from state
            setBlocks(prev => {
                const newBlocks = { ...prev };
                delete newBlocks[lesson.id];
                return newBlocks;
            });
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Error al eliminar la lección');
        }
    };

    // Module color theming - Jungle Palette
    const getModuleTheme = (moduleTitle: string) => {
        const themes: Record<string, { primary: string; light: string; border: string }> = {
            // Emerald (Standard Jungle)
            'RRHH': { primary: '#059669', light: '#ecfdf5', border: '#34d399' },
            // Lime (Vibrant Jungle)
            'Gestión Empresarial': { primary: '#65a30d', light: '#f7fee7', border: '#a3e635' },
            // Teal (River Jungle)
            'Gestión Laboral': { primary: '#0d9488', light: '#f0fdfa', border: '#5eead4' },
            // Olive/Moss (Deep Jungle)
            'Marketing': { primary: '#4d7c0f', light: '#f7fee7', border: '#84cc16' },
            // Green (Fresh Jungle)
            'Finanzas': { primary: '#16a34a', light: '#dcfce7', border: '#4ade80' },
            // Default Forest
            'default': { primary: '#047857', light: '#ecfdf5', border: '#6ee7b7' }
        };
        return themes[moduleTitle] || themes['default'];
    };

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('academy_modules')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            setModules(data || []);

            // Load lessons for all modules
            if (data) {
                data.forEach(module => loadLessons(module.id));
            }
        } catch (error) {
            console.error('Error loading modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLessons = async (moduleId: string) => {
        try {
            const { data, error } = await supabase
                .from('academy_lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order', { ascending: true });

            if (error) throw error;
            setLessons(prev => ({ ...prev, [moduleId]: data || [] }));

            // Load blocks for these lessons
            if (data) {
                data.forEach(lesson => loadBlocks(lesson.id));
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    };

    const loadBlocks = async (lessonId: string) => {
        try {
            const { data, error } = await supabase
                .from('academy_lesson_blocks')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('block_number', { ascending: true });

            if (error) throw error;
            setBlocks(prev => ({ ...prev, [lessonId]: data || [] }));
        } catch (error) {
            console.error('Error loading blocks:', error);
        }
    };

    const openLessonEditor = (lesson: AcademyLesson) => {
        setSelectedLesson(lesson);
        // Ensure blocks are loaded
        if (!blocks[lesson.id]) {
            loadBlocks(lesson.id);
        }
    };



    const openBlockEditor = (block: LessonBlock) => {
        setEditingBlock(block);
        setEditorTitle(block.title || '');
        // Map new fields or fallback to content if migrating
        setEditorContent(block.content || '');

        setEditorKeyPoints(block.key_points || '');
        setEditorFullContent(block.full_content || block.content || ''); // Fallback to content if full_content empty
        setEditorGensparkPrompt(block.genspark_prompt || '');
        setEditorVideoUrl(block.video_url || '');
        setEditorPptUrl(block.ppt_url || '');

        // Strategic Guide Fields
        setEditorConcepto(block.concepto || '');
        setEditorValor(block.valor || '');
        setEditorAccion(block.accion || '');

        loadDownloadables(block.id);
    };

    const saveBlock = async () => {
        if (!editingBlock) return;

        const currentProgress = calculateProgress();

        // Determine status based on progress
        let status = 'not_started';
        if (currentProgress > 0 && currentProgress < 40) status = 'content_created';
        else if (currentProgress >= 40 && currentProgress < 75) status = 'prompts_ready';
        else if (currentProgress >= 75 && currentProgress < 90) status = 'recording';
        else if (currentProgress >= 90 && currentProgress < 100) status = 'editing';
        else if (currentProgress === 100) status = 'completed';

        try {
            const { error } = await supabase
                .from('academy_lesson_blocks')
                .update({
                    title: editorTitle,
                    content: editorFullContent, // Sync legacy content field with full content

                    key_points: editorKeyPoints,
                    full_content: editorFullContent,
                    genspark_prompt: editorGensparkPrompt,
                    video_url: editorVideoUrl,
                    ppt_url: editorPptUrl,
                    progress_percentage: currentProgress,
                    production_status: status,
                    // Strategic Guide Fields
                    concepto: editorConcepto,
                    valor: editorValor,
                    accion: editorAccion
                })
                .eq('id', editingBlock.id);

            if (error) throw error;

            // Update local state
            setBlocks(prev => ({
                ...prev,
                [editingBlock.lesson_id]: prev[editingBlock.lesson_id].map(b =>
                    b.id === editingBlock.id
                        ? {
                            ...b,
                            title: editorTitle,
                            content: editorFullContent,

                            key_points: editorKeyPoints,
                            full_content: editorFullContent,
                            genspark_prompt: editorGensparkPrompt,
                            video_url: editorVideoUrl,
                            ppt_url: editorPptUrl,
                            progress_percentage: currentProgress,
                            production_status: status as any,
                            concepto: editorConcepto,
                            valor: editorValor,
                            accion: editorAccion
                        }
                        : b
                )
            }));

            setShowSuccessToast(true);
            // alert('Guardado correctamente'); // Optional feedback
            // setEditingBlock(null); // Don't close editor on save, just save
        } catch (error) {
            console.error('Error saving block:', error);
            alert('Error al guardar el bloque');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header Section - CRM Style */}
            <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                borderRadius: '16px',
                padding: '24px 32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-8 w-8" />
                            <h1 className="text-2xl font-bold">Mapa de Contenidos</h1>
                        </div>
                    </div>
                    <p className="text-emerald-100 text-base pl-16">Gestión integral del plan de estudios</p>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-6"></div>
                        <p className="text-gray-500 text-lg">Cargando estructura del curso...</p>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No hay módulos definidos</h3>
                        <p className="text-gray-500">Ejecuta el script de inicialización para comenzar.</p>
                    </div>
                ) : (
                    modules.map((module) => {
                        const theme = getModuleTheme(module.title);
                        return (
                            <div
                                key={module.id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    border: `1px solid ${theme.border}`,
                                    borderLeft: `6px solid ${theme.primary}`,
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                                }}
                                className="transition-all hover:shadow-md"
                            >
                                {/* Module Header */}
                                <div style={{
                                    padding: '16px 24px',
                                    borderBottom: `1px solid ${theme.light}`,
                                    backgroundColor: theme.light,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '2px' }}>{module.title}</h3>
                                        <p style={{ color: '#6b7280', fontSize: '13px' }}>{module.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span style={{
                                            padding: '6px 12px',
                                            backgroundColor: 'white',
                                            border: `1px solid ${theme.primary}`,
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: theme.primary
                                        }}>
                                            {lessons[module.id]?.length || 0} Lecciones
                                        </span>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Sort Selector */}
                                    {(lessons[module.id]?.length || 0) > 1 && (
                                        <div className="flex justify-end mb-2">
                                            <select
                                                value={lessonSortMode}
                                                onChange={(e) => setLessonSortMode(e.target.value as 'order' | 'completed' | 'pending')}
                                                className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                                            >
                                                <option value="order">📋 Por orden numérico</option>
                                                <option value="completed">✅ Completadas primero</option>
                                                <option value="pending">⏳ Pendientes primero</option>
                                            </select>
                                        </div>
                                    )}

                                    {lessons[module.id]?.length === 0 ? (
                                        <div className="p-12 text-center text-gray-400 italic">
                                            No hay lecciones en este módulo.
                                        </div>
                                    ) : (
                                        [...(lessons[module.id] || [])]
                                            .sort((a, b) => {
                                                if (lessonSortMode === 'completed') {
                                                    const aCompleted = a.status === 'completed' ? 1 : 0;
                                                    const bCompleted = b.status === 'completed' ? 1 : 0;
                                                    return bCompleted - aCompleted || a.order - b.order;
                                                } else if (lessonSortMode === 'pending') {
                                                    const aCompleted = a.status === 'completed' ? 1 : 0;
                                                    const bCompleted = b.status === 'completed' ? 1 : 0;
                                                    return aCompleted - bCompleted || a.order - b.order;
                                                }
                                                return a.order - b.order;
                                            })
                                            .map((lesson, lessonIndex) => {
                                                const lessonBlocks = blocks[lesson.id] || [];
                                                const completedBlocks = lessonBlocks.filter(b => b.content).length;
                                                const totalBlocks = 3;
                                                const lessonNumber = `${module.order}.${lessonIndex + 1}`;

                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        style={{
                                                            backgroundColor: 'white',
                                                            border: '2px solid #e5e7eb',
                                                            borderRadius: '12px',
                                                            padding: '20px 24px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                                        }}
                                                        className="hover:shadow-md hover:border-emerald-300 group"
                                                        onClick={() => openLessonEditor(lesson)}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <div className="flex items-center gap-6">
                                                                <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                                    {lessonNumber}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                                        {lesson.title}
                                                                    </h4>
                                                                    <div className="flex items-center gap-3 mt-2">
                                                                        {/* Block Indicators */}
                                                                        <div className="flex gap-1.5">
                                                                            {[1, 2, 3].map(num => {
                                                                                const block = lessonBlocks.find(b => b.block_number === num);
                                                                                const hasContent = block?.content;
                                                                                return (
                                                                                    <div
                                                                                        key={num}
                                                                                        className={`h-2 w-8 rounded-full transition-all ${hasContent ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-gray-200'}`}
                                                                                        title={`Bloque ${num}: ${hasContent ? 'Completado' : 'Vacío'}`}
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <span className="text-xs font-medium text-gray-400 ml-2">
                                                                            {completedBlocks}/{totalBlocks} Bloques
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                {/* Edit and Delete buttons */}
                                                                <button
                                                                    onClick={(e) => initiateEditLesson(lesson, e)}
                                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                    title="Editar lección"
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => deleteLesson(lesson, e)}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                    title="Eliminar lección"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>

                                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${lesson.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {lesson.status === 'completed' ? 'Completado' : 'En Desarrollo'}
                                                                </span>
                                                                <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">
                                                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>

                                {/* Add Lesson Button */}
                                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                                    <button
                                        onClick={() => initiateAddLesson(module.id)}
                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-3 font-semibold text-base group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        Añadir Lección al Módulo {module.title}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Lesson Modal - ESTILO CRM */}
            {
                showAddLessonModal && (
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
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            {/* Modal Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Nueva Lección</h2>
                                <button
                                    onClick={() => setShowAddLessonModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Content with colored background like CRM */}
                            <div style={{
                                padding: '16px 24px',
                                backgroundColor: '#f9fafb',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Título de la Lección
                                </label>
                                <input
                                    type="text"
                                    value={newLessonTitle}
                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: 'white'
                                    }}
                                    placeholder="Ej: Introducción a RRHH"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmAddLesson()}
                                />
                            </div>

                            {/* Footer with buttons */}
                            <div style={{
                                padding: '16px 24px',
                                backgroundColor: '#f9fafb',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <button
                                    onClick={() => setShowAddLessonModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmAddLesson}
                                    disabled={!newLessonTitle.trim()}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: newLessonTitle.trim() ? 'pointer' : 'not-allowed',
                                        opacity: newLessonTitle.trim() ? 1 : 0.5
                                    }}
                                >
                                    ✓ Crear Lección
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Lesson Modal - ESTILO CRM */}
            {
                showEditLessonModal && (
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
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Editar Lección</h2>
                                <button
                                    onClick={() => setShowEditLessonModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{
                                padding: '16px 24px',
                                backgroundColor: '#f9fafb',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Título de la Lección
                                </label>
                                <input
                                    type="text"
                                    value={editLessonTitle}
                                    onChange={(e) => setEditLessonTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: 'white'
                                    }}
                                    placeholder="Ej: Introducción a RRHH"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmEditLesson()}
                                />
                            </div>

                            {/* Order Input */}
                            <div style={{
                                padding: '16px 24px',
                                backgroundColor: '#f9fafb',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Orden de la Lección
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={editLessonOrder}
                                    onChange={(e) => setEditLessonOrder(parseInt(e.target.value) || 1)}
                                    style={{
                                        width: '100px',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: 'white'
                                    }}
                                />
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                                    Menor número = aparece primero en la lista
                                </p>
                            </div>

                            <div style={{
                                padding: '16px 24px',
                                backgroundColor: '#f9fafb',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <button
                                    onClick={() => setShowEditLessonModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmEditLesson}
                                    disabled={!editLessonTitle.trim()}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: editLessonTitle.trim() ? 'pointer' : 'not-allowed',
                                        opacity: editLessonTitle.trim() ? 1 : 0.5
                                    }}
                                >
                                    ✓ Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Lesson Detail Modal - ESTILO CRM MEJORADO */}
            {
                selectedLesson && (
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
                        zIndex: 50,
                        padding: '24px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '1200px',
                            maxHeight: '95vh',
                            overflow: 'hidden',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                        {selectedLesson.title}
                                    </h2>
                                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                        Gestiona los 3 bloques de contenido estratégico de esta lección
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedLesson(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Blocks Grid with proper spacing */}
                            <div style={{
                                padding: '24px',
                                overflowY: 'auto',
                                flex: 1,
                                backgroundColor: '#f9fafb'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '24px'
                                }}>
                                    {blocks[selectedLesson.id]?.map((block) => {
                                        const hasContent = block.content && block.content.length > 0;
                                        return (
                                            <div
                                                key={block.id}
                                                style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${hasContent ? '#d1fae5' : '#e5e7eb'}`,
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                            >
                                                {/* Block Header with colored background */}
                                                <div style={{
                                                    padding: '16px',
                                                    backgroundColor: hasContent ? '#d1fae5' : '#f9fafb',
                                                    borderBottom: `1px solid ${hasContent ? '#a7f3d0' : '#e5e7eb'}`
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: hasContent ? '#047857' : '#6b7280',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}>
                                                            Bloque {block.block_number}
                                                        </span>
                                                        {hasContent && (
                                                            <div style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                backgroundColor: '#10b981',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '12px'
                                                            }}>
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 style={{
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#111827',
                                                        margin: 0
                                                    }}>
                                                        {block.title || `Bloque ${block.block_number}`}
                                                    </h3>
                                                </div>

                                                {/* Block Content */}
                                                <div style={{ padding: '16px', flex: 1 }}>
                                                    <p style={{
                                                        fontSize: '14px',
                                                        color: hasContent ? '#374151' : '#9ca3af',
                                                        fontStyle: hasContent ? 'normal' : 'italic',
                                                        margin: 0,
                                                        lineHeight: '1.5',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 4,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {block.content || 'Este bloque aún no tiene contenido. Haz clic en el botón inferior para comenzar a redactar.'}
                                                    </p>

                                                    {block.file_url && (
                                                        <div style={{
                                                            marginTop: '12px',
                                                            padding: '8px 12px',
                                                            backgroundColor: '#d1fae5',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            color: '#047857',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            🔗 Recurso adjunto disponible
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                                                    <button
                                                        onClick={() => openBlockEditor(block)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            backgroundColor: hasContent ? 'white' : '#10b981',
                                                            color: hasContent ? '#374151' : 'white',
                                                            border: hasContent ? '1px solid #d1d5db' : 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        ✏️ {hasContent ? 'Editar Contenido' : 'Añadir Contenido'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* FULL SCREEN BLOCK EDITOR - ESTILO CRM CON 3 COLUMNAS */}
            {
                editingBlock && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#f9fafb',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            backgroundColor: 'white',
                            borderBottom: '1px solid #e5e7eb',
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button
                                    onClick={() => setEditingBlock(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <ArrowLeft style={{ height: '20px', width: '20px' }} />
                                </button>
                                <div>
                                    <h1 style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        margin: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
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
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#eff6ff',
                                        color: '#3b82f6',
                                        border: '1px solid #bfdbfe',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <CheckSquare style={{ height: '16px', width: '16px' }} />
                                    Nueva Tarea
                                </button>

                                <button
                                    onClick={() => setEditingBlock(null)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <ArrowLeft style={{ height: '16px', width: '16px' }} />
                                    Volver atrás
                                </button>
                                <button
                                    onClick={saveBlock}
                                    style={{
                                        padding: '8px 20px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Save style={{ height: '16px', width: '16px' }} />
                                    Guardar
                                </button>
                            </div>
                        </div>

                        {/* Body con 3 columnas - ESTILO CRM */}
                        {/* Body con 3 columnas - ESTILO CRM */}
                        {/* EDIT MODE - NEW LAYOUT (PHASE 6) */}
                        <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

                            {/* Progress Bar & Status Header */}
                            {/* Progress Bar & Status Header - PREMIUM JUNGLE STYLE */}
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

                                {/* COLUMN 1: STRATEGIC GUIDE (25%) - CARD STYLE */}
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

                                {/* COLUMN 2: CONTENT CREATION (50%) - CLEAN CANVAS */}
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


                                    <CollapsibleSection title="⭐ Puntos Más Importantes" icon={<CheckCircle className="h-5 w-5 text-amber-600" />}>
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

                                    <CollapsibleSection title="📝 Contenido Completo (Guion)" icon={<FileText className="h-5 w-5 text-emerald-600" />}>
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

                                {/* COLUMN 3: ASSETS & FILES (25%) - TOOLS PANEL */}
                                <div className="col-span-3 bg-slate-50/80 border-l border-emerald-100 overflow-y-auto p-6 custom-scrollbar backdrop-blur-sm">

                                    {/* Prompt for PPT */}
                                    <div className="mb-6">
                                        <CollapsibleSection
                                            title="🎨 Crear Presentación (Genspark)"
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
                                                <div className="absolute inset-x-0 -top-2 h-2 bg-gradient-to-b from-purple-50 to-transparent pointer-events-none"></div>
                                                <textarea
                                                    value={editorGensparkPrompt}
                                                    onChange={(e) => setEditorGensparkPrompt(e.target.value)}
                                                    className="w-full min-h-[120px] p-4 text-sm border border-purple-100 rounded-xl mb-3 bg-purple-50/50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none text-slate-800 leading-relaxed"
                                                    placeholder="Prompt para generar la presentación..."
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(editorGensparkPrompt); alert('Copiado!'); }}
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
                                                        Ir a Genspark <LinkIcon className="h-3 w-3" />
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

                                    {/* Final Adjustments */}
                                    <div className="space-y-8">
                                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            🎬 Archivos Finales
                                        </h3>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Video Grabado (.mp4)</label>
                                            <FileUpload
                                                blockId={editingBlock.id}
                                                fileType="video"
                                                existingUrl={editorVideoUrl}
                                                onUploadComplete={(url) => setEditorVideoUrl(url)}
                                                onDelete={async () => {
                                                    if (confirm('¿Borrar video?')) {
                                                        await supabase.from('academy_lesson_blocks').update({ video_url: null }).eq('id', editingBlock.id);
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
                                                    if (confirm('¿Borrar presentación?')) {
                                                        await supabase.from('academy_lesson_blocks').update({ ppt_url: null }).eq('id', editingBlock.id);
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

                    </div>
                )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 z-[100]">
                    <CheckCircle className="h-6 w-6" />
                    <div>
                        <h4 className="font-bold text-sm">¡Guardado con éxito!</h4>
                        <p className="text-xs text-emerald-100">Los cambios se han actualizado correctamente.</p>
                    </div>
                </div>
            )}

            {/* Generic Expanded Editor Modal */}
            {activeModalField !== 'none' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 lg:p-8">
                    <div className={`bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden
                        ${activeModalField === 'prompt' ? 'border-t-4 border-purple-500' :
                            activeModalField === 'points' ? 'border-t-4 border-amber-500' : 'border-t-4 border-emerald-500'}`}>

                        {/* Modal Header */}
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

                        {/* Modal Body */}
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

                            {/* Modal Footer */}
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

            {/* DOWNLOADABLE CONTENT MODAL */}
            {downloadableModalOpen && editingDownloadable && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 lg:p-8">
                    <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border-t-4 border-emerald-500">

                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-emerald-100 text-emerald-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        📝 Contenido: {editingDownloadable.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Escribe el contenido en texto plano para este material descargable.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setDownloadableModalOpen(false);
                                        setEditingDownloadable(null);
                                        setDownloadablePromptText('');
                                    }}
                                    className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
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

                            {/* Modal Footer */}
                            <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 z-10">
                                <button
                                    onClick={() => {
                                        setDownloadableModalOpen(false);
                                        setEditingDownloadable(null);
                                        setDownloadablePromptText('');
                                    }}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cerrar (Esc)
                                </button>
                                <button
                                    onClick={async () => {
                                        if (editingDownloadable) {
                                            await supabase
                                                .from('academy_block_downloadables')
                                                .update({ prompt_generation: downloadablePromptText })
                                                .eq('id', editingDownloadable.id);

                                            // Reload downloadables if editingBlock exists
                                            if (editingBlock) {
                                                loadDownloadables(editingBlock.id);
                                            }

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

            {/* TASK CREATION MODAL */}
            {showTaskModal && (
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
                    zIndex: 200 // Higher than block editor
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
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
                                            onClick={() => setNewTaskPriority(p as any)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${newTaskPriority === p
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {p === 'low' ? 'Baja' : p === 'normal' ? 'Normal' : p === 'high' ? 'Alta' : 'Urgente'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateTask}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm"
                            >
                                Crear Tarea
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

