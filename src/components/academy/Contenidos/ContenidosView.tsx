import React from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useContenidosView } from '../../../hooks/useContenidosView';
import { ContenidosViewProps } from './sections/ContenidosTypes';
import { ModulesGrid } from './sections/ModulesGrid';
import { AddLessonModal, EditLessonModal, LessonDetailModal } from './sections/LessonModals';
import { BlockEditor } from './sections/BlockEditor';

export const ContenidosView: React.FC<ContenidosViewProps> = ({ onBack }) => {
    const {
        modules,
        lessons,
        blocks,
        loading,
        showAddLessonModal,
        setShowAddLessonModal,
        newLessonTitle,
        setNewLessonTitle,
        showEditLessonModal,
        setShowEditLessonModal,
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
        openTaskModal,
        handleCreateTask,
        calculateProgress,
        loadDownloadables,
        initiateAddLesson,
        confirmAddLesson,
        initiateEditLesson,
        confirmEditLesson,
        deleteLesson,
        getModuleTheme,
        openLessonEditor,
        openBlockEditor,
        saveBlock,
    } = useContenidosView();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
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
            <ModulesGrid
                modules={modules}
                lessons={lessons}
                blocks={blocks}
                loading={loading}
                lessonSortMode={lessonSortMode}
                setLessonSortMode={setLessonSortMode}
                getModuleTheme={getModuleTheme}
                openLessonEditor={openLessonEditor}
                initiateAddLesson={initiateAddLesson}
                initiateEditLesson={initiateEditLesson}
                deleteLesson={deleteLesson}
            />

            {/* Modals */}
            <AddLessonModal
                showAddLessonModal={showAddLessonModal}
                newLessonTitle={newLessonTitle}
                setNewLessonTitle={setNewLessonTitle}
                setShowAddLessonModal={setShowAddLessonModal}
                confirmAddLesson={confirmAddLesson}
            />

            <EditLessonModal
                showEditLessonModal={showEditLessonModal}
                editLessonTitle={editLessonTitle}
                setEditLessonTitle={setEditLessonTitle}
                editLessonOrder={editLessonOrder}
                setEditLessonOrder={setEditLessonOrder}
                setShowEditLessonModal={setShowEditLessonModal}
                confirmEditLesson={confirmEditLesson}
            />

            <LessonDetailModal
                selectedLesson={selectedLesson}
                blocks={blocks}
                setSelectedLesson={setSelectedLesson}
                openBlockEditor={openBlockEditor}
            />

            {/* Full-Screen Block Editor */}
            <BlockEditor
                editingBlock={editingBlock}
                setEditingBlock={setEditingBlock}
                editorTitle={editorTitle}
                setEditorTitle={setEditorTitle}
                editorKeyPoints={editorKeyPoints}
                setEditorKeyPoints={setEditorKeyPoints}
                editorFullContent={editorFullContent}
                setEditorFullContent={setEditorFullContent}
                editorGensparkPrompt={editorGensparkPrompt}
                setEditorGensparkPrompt={setEditorGensparkPrompt}
                editorConcepto={editorConcepto}
                setEditorConcepto={setEditorConcepto}
                editorValor={editorValor}
                setEditorValor={setEditorValor}
                editorAccion={editorAccion}
                setEditorAccion={setEditorAccion}
                editorVideoUrl={editorVideoUrl}
                setEditorVideoUrl={setEditorVideoUrl}
                editorPptUrl={editorPptUrl}
                setEditorPptUrl={setEditorPptUrl}
                editorDownloadables={editorDownloadables}
                activeModalField={activeModalField}
                setActiveModalField={setActiveModalField}
                downloadableModalOpen={downloadableModalOpen}
                setDownloadableModalOpen={setDownloadableModalOpen}
                editingDownloadable={editingDownloadable}
                setEditingDownloadable={setEditingDownloadable}
                downloadablePromptText={downloadablePromptText}
                setDownloadablePromptText={setDownloadablePromptText}
                showTaskModal={showTaskModal}
                setShowTaskModal={setShowTaskModal}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskDescription={newTaskDescription}
                setNewTaskDescription={setNewTaskDescription}
                newTaskPriority={newTaskPriority}
                setNewTaskPriority={setNewTaskPriority}
                calculateProgress={calculateProgress}
                loadDownloadables={loadDownloadables}
                saveBlock={saveBlock}
                openTaskModal={openTaskModal}
                handleCreateTask={handleCreateTask}
            />

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 z-[100]">
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                    <div>
                        <h4 className="font-bold text-sm">Guardado con éxito</h4>
                        <p className="text-xs text-emerald-100">Los cambios se han actualizado correctamente.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContenidosView;
