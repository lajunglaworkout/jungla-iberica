import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { moduleService, lessonService, blockService, downloadableService, academyTaskService } from '../services/academyService';
import { AcademyModule, AcademyLesson } from '../types/academy';
import { ui } from '../utils/ui';
import {
    LessonBlock,
    EditingDownloadable,
    ActiveModalField,
    LessonSortMode,
    TaskPriority
} from '../components/academy/Contenidos/sections/ContenidosTypes';

export function useContenidosView() {
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

    const [activeModalField, setActiveModalField] = useState<ActiveModalField>('none');

    // Downloadable Content Modal State
    const [downloadableModalOpen, setDownloadableModalOpen] = useState(false);
    const [editingDownloadable, setEditingDownloadable] = useState<EditingDownloadable | null>(null);
    const [downloadablePromptText, setDownloadablePromptText] = useState('');

    // Lesson Sort Mode
    const [lessonSortMode, setLessonSortMode] = useState<LessonSortMode>('order');

    // Toast State
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Task Creation State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('normal');

    const [editorVideoUrl, setEditorVideoUrl] = useState('');
    const [editorPptUrl, setEditorPptUrl] = useState('');
    const [editorDownloadables, setEditorDownloadables] = useState<EditingDownloadable[]>([]);
    const [editorFileUrl, setEditorFileUrl] = useState(''); // Legacy fallback

    const fileInputRef = useRef<HTMLInputElement>(null);

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

            await academyTaskService.create({
                title: newTaskTitle,
                description: newTaskDescription,
                priority: newTaskPriority,
                status: 'pending',
                assigned_to: userData.user?.id,
                created_by: `block_${editingBlock.id}`, // Traceability
                lesson_related: selectedLesson.id,
                progress: 0,
                created_at: new Date().toISOString()
            });

            setShowTaskModal(false);
            setNewTaskTitle('');
            setNewTaskDescription('');
            ui.success('✅ Tarea creada y vinculada correctamente');
        } catch (error) {
            console.error('Error creating task:', error);
            ui.error('Error al crear la tarea vinculada');
        }
    };

    // Auto-hide toast
    useEffect(() => {
        if (showSuccessToast) {
            const timer = setTimeout(() => setShowSuccessToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessToast]);

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
        const data = await downloadableService.getByBlock(blockId);
        setEditorDownloadables(data || []);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editingBlock) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${editingBlock.lesson_id}/${editingBlock.id}/${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('academy-files')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('academy-files')
                .getPublicUrl(fileName);

            setEditorFileUrl(publicUrl);
            ui.success('Archivo subido correctamente');
        } catch (error) {
            console.error('Error uploading file:', error);
            ui.error('Error al subir el archivo');
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
            const lesson = await lessonService.create({
                module_id: targetModuleId,
                title: newLessonTitle,
                order: (lessons[targetModuleId]?.length || 0) + 1,
                status: 'planned'
            });

            const defaultBlocks = [
                { lesson_id: lesson.id, block_number: 1, title: 'Bloque 1: Concepto' },
                { lesson_id: lesson.id, block_number: 2, title: 'Bloque 2: Valor' },
                { lesson_id: lesson.id, block_number: 3, title: 'Bloque 3: Acción' }
            ];

            await blockService.createMany(defaultBlocks);

            loadLessons(targetModuleId);
            setShowAddLessonModal(false);
            setTargetModuleId(null);
            setNewLessonTitle('');
        } catch (error) {
            console.error('Error creating lesson:', error);
            ui.error('Error al crear la lección');
        }
    };

    const initiateEditLesson = (lesson: AcademyLesson, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingLesson(lesson);
        setEditLessonTitle(lesson.title);
        setEditLessonOrder(lesson.order);
        setShowEditLessonModal(true);
    };

    const confirmEditLesson = async () => {
        if (!editingLesson || !editLessonTitle.trim()) return;

        try {
            await lessonService.update(editingLesson.id, { title: editLessonTitle, order: editLessonOrder });

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
            ui.error('Error al actualizar la lección');
        }
    };

    const deleteLesson = async (lesson: AcademyLesson, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!await ui.confirm(`¿Estás seguro de que deseas eliminar la lección "${lesson.title}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await blockService.deleteByLesson(lesson.id);
            await lessonService.delete(lesson.id);

            setLessons(prev => ({
                ...prev,
                [lesson.module_id]: prev[lesson.module_id].filter(l => l.id !== lesson.id)
            }));

            setBlocks(prev => {
                const newBlocks = { ...prev };
                delete newBlocks[lesson.id];
                return newBlocks;
            });
        } catch (error) {
            console.error('Error deleting lesson:', error);
            ui.error('Error al eliminar la lección');
        }
    };

    // Module color theming - Jungle Palette
    const getModuleTheme = (moduleTitle: string) => {
        const themes: Record<string, { primary: string; light: string; border: string }> = {
            'RRHH': { primary: '#059669', light: '#ecfdf5', border: '#34d399' },
            'Gestión Empresarial': { primary: '#65a30d', light: '#f7fee7', border: '#a3e635' },
            'Gestión Laboral': { primary: '#0d9488', light: '#f0fdfa', border: '#5eead4' },
            'Marketing': { primary: '#4d7c0f', light: '#f7fee7', border: '#84cc16' },
            'Finanzas': { primary: '#16a34a', light: '#dcfce7', border: '#4ade80' },
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
            const data = await moduleService.getAll();
            setModules(data || []);

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
            const data = await lessonService.getByModule(moduleId);
            setLessons(prev => ({ ...prev, [moduleId]: data || [] }));

            if (data) {
                data.forEach(lesson => loadBlocks(lesson.id));
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    };

    const loadBlocks = async (lessonId: string) => {
        try {
            const data = await blockService.getByLesson(lessonId);
            setBlocks(prev => ({ ...prev, [lessonId]: data || [] }));
        } catch (error) {
            console.error('Error loading blocks:', error);
        }
    };

    const openLessonEditor = (lesson: AcademyLesson) => {
        setSelectedLesson(lesson);
        if (!blocks[lesson.id]) {
            loadBlocks(lesson.id);
        }
    };

    const openBlockEditor = (block: LessonBlock) => {
        setEditingBlock(block);
        setEditorTitle(block.title || '');
        setEditorContent(block.content || '');

        setEditorKeyPoints(block.key_points || '');
        setEditorFullContent(block.full_content || block.content || '');
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

        let status: LessonBlock['production_status'] = 'not_started';
        if (currentProgress > 0 && currentProgress < 40) status = 'content_created';
        else if (currentProgress >= 40 && currentProgress < 75) status = 'prompts_ready';
        else if (currentProgress >= 75 && currentProgress < 90) status = 'recording';
        else if (currentProgress >= 90 && currentProgress < 100) status = 'editing';
        else if (currentProgress === 100) status = 'completed';

        try {
            await blockService.update(editingBlock.id, {
                title: editorTitle,
                content: editorFullContent,

                key_points: editorKeyPoints,
                full_content: editorFullContent,
                genspark_prompt: editorGensparkPrompt,
                video_url: editorVideoUrl,
                ppt_url: editorPptUrl,
                progress_percentage: currentProgress,
                production_status: status,
                concepto: editorConcepto,
                valor: editorValor,
                accion: editorAccion
            });

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
                            production_status: status,
                            concepto: editorConcepto,
                            valor: editorValor,
                            accion: editorAccion
                        }
                        : b
                )
            }));

            setShowSuccessToast(true);
        } catch (error) {
            console.error('Error saving block:', error);
            ui.error('Error al guardar el bloque');
        }
    };

    return {
        // State
        modules,
        lessons,
        blocks,
        loading,
        showAddLessonModal,
        setShowAddLessonModal,
        targetModuleId,
        newLessonTitle,
        setNewLessonTitle,
        showEditLessonModal,
        setShowEditLessonModal,
        editingLesson,
        editLessonTitle,
        setEditLessonTitle,
        editLessonOrder,
        setEditLessonOrder,
        selectedLesson,
        setSelectedLesson,
        editingBlock,
        setEditingBlock,
        editorTitle,
        setEditorTitle,
        editorContent,
        setEditorContent,
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
        activeModalField,
        setActiveModalField,
        downloadableModalOpen,
        setDownloadableModalOpen,
        editingDownloadable,
        setEditingDownloadable,
        downloadablePromptText,
        setDownloadablePromptText,
        lessonSortMode,
        setLessonSortMode,
        showSuccessToast,
        showTaskModal,
        setShowTaskModal,
        newTaskTitle,
        setNewTaskTitle,
        newTaskDescription,
        setNewTaskDescription,
        newTaskPriority,
        setNewTaskPriority,
        editorVideoUrl,
        setEditorVideoUrl,
        editorPptUrl,
        setEditorPptUrl,
        editorDownloadables,
        editorFileUrl,
        fileInputRef,
        // Actions
        openTaskModal,
        handleCreateTask,
        calculateProgress,
        loadDownloadables,
        handleFileUpload,
        initiateAddLesson,
        confirmAddLesson,
        initiateEditLesson,
        confirmEditLesson,
        deleteLesson,
        getModuleTheme,
        loadModules,
        loadLessons,
        loadBlocks,
        openLessonEditor,
        openBlockEditor,
        saveBlock,
    };
}
