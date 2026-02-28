import React from 'react';
import { Loader } from 'lucide-react';
import { TaskCompletionModal } from './TaskCompletionModal';
import { MeetingModalProps } from './MeetingModalTypes';
import { PreviousTasksSection } from './PreviousTasksSection';
import { RecurringTasksSection } from './RecurringTasksSection';
import { ObjectivesSection } from './ObjectivesSection';
import { TranscriptionSection } from './TranscriptionSection';
import { ActaPreviewModal } from './ActaPreviewModal';
import { NextMeetingScheduler } from './NextMeetingScheduler';
import { useMeetingModal } from '../../hooks/useMeetingModal';

export const MeetingModal: React.FC<MeetingModalProps> = ({
  departmentId,
  meeting,
  userEmail,
  userName,
  participants,
  preselectedLeadId,
  onClose,
  onSuccess
}) => {
  const {
    meetingType, setMeetingType,
    previousTasks,
    previousTasksCompleted,
    previousTasksReasons,
    recurringTasks,
    recurringTasksCompleted,
    taskNotes,
    departmentObjectives,
    objectiveValues, setObjectiveValues,
    manualTranscript, setManualTranscript,
    showRecorder, setShowRecorder,
    employees,
    loadingTasks,
    generatingActa,
    showCompletionModal, setShowCompletionModal,
    selectedTaskForCompletion, setSelectedTaskForCompletion,
    taskFilter, setTaskFilter,
    generatedMinutes, setGeneratedMinutes,
    generatedTasks, setGeneratedTasks,
    showActaPreview, setShowActaPreview,
    showNextMeetingScheduler, setShowNextMeetingScheduler,
    isEditingActa, setIsEditingActa,
    nextMeetingDate, setNextMeetingDate,
    nextMeetingTime, setNextMeetingTime,
    leads,
    selectedLeadId, setSelectedLeadId,
    loadingLeads,
    isSaving,
    loadPreviousTasks,
    handleTaskNoteChange,
    handleTogglePreviousTaskCompleted,
    handlePreviousTaskReasonChange,
    handleRecurringTaskNoteChange,
    handleAddManualTask,
    handleRemoveRecurringTask,
    handleToggleRecurringTaskCompleted,
    handleGenerateActa,
    handleSaveAfterReview
  } = useMeetingModal({ departmentId, meeting, userEmail, participants, preselectedLeadId, onClose, onSuccess });

  return (
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
        width: '95%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {meeting?.title || 'Nueva Reunión'}
            </h2>
            {participants && participants.length > 0 && (
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                👥 Participantes: {participants.join(', ')}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
          >
            ×
          </button>
        </div>

        {/* Selector de Tipo de Reunión */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Tipo de Reunión
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['FISICA', 'VIDEOLLAMADA'] as const).map(type => (
              <button
                key={type}
                onClick={async () => setMeetingType(type)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: meetingType === type ? '#3b82f6' : 'white',
                  color: meetingType === type ? 'white' : '#6b7280',
                  border: `2px solid ${meetingType === type ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {type === 'FISICA' ? '🏢 Reunión Física' : '📹 Videollamada'}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Lead (solo para ventas) */}
        {(departmentId === 'ventas' || departmentId === 'sales') && (
          <div style={{ padding: '16px 24px', backgroundColor: '#f0f9ff', borderBottom: '1px solid #bfdbfe' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e40af', marginBottom: '8px' }}>
              🎯 Lead Asociado a la Reunión
            </label>
            {loadingLeads ? (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Cargando leads...</p>
            ) : leads.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>No hay leads disponibles</p>
            ) : (
              <select
                value={selectedLeadId}
                onChange={async (e) => setSelectedLeadId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}
              >
                <option value="">-- Seleccionar lead (opcional) --</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nombre} {lead.empresa ? `(${lead.empresa})` : ''} - {lead.proyecto_nombre || 'Sin proyecto'}
                  </option>
                ))}
              </select>
            )}
            {selectedLeadId && (
              <p style={{ fontSize: '11px', color: '#1e40af', marginTop: '6px', marginBottom: 0 }}>
                ✅ Esta reunión se registrará automáticamente en el historial del lead
              </p>
            )}
          </div>
        )}

        {/* Contenido Principal */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <PreviousTasksSection
            previousTasks={previousTasks}
            previousTasksCompleted={previousTasksCompleted}
            previousTasksReasons={previousTasksReasons}
            taskNotes={taskNotes}
            taskFilter={taskFilter}
            loadingTasks={loadingTasks}
            onSetTaskFilter={setTaskFilter}
            onTogglePreviousTaskCompleted={handleTogglePreviousTaskCompleted}
            onPreviousTaskReasonChange={handlePreviousTaskReasonChange}
            onTaskNoteChange={handleTaskNoteChange}
            onOpenCompletionModal={(task) => {
              setSelectedTaskForCompletion(task);
              setShowCompletionModal(true);
            }}
          />

          <RecurringTasksSection
            recurringTasks={recurringTasks}
            recurringTasksCompleted={recurringTasksCompleted}
            onToggleRecurringTaskCompleted={handleToggleRecurringTaskCompleted}
            onRecurringTaskNoteChange={handleRecurringTaskNoteChange}
            onRemoveRecurringTask={handleRemoveRecurringTask}
            onAddManualTask={handleAddManualTask}
          />

          <ObjectivesSection
            departmentObjectives={departmentObjectives}
            objectiveValues={objectiveValues}
            onSetObjectiveValues={setObjectiveValues}
          />

          <TranscriptionSection
            manualTranscript={manualTranscript}
            showRecorder={showRecorder}
            meeting={meeting}
            participants={participants}
            departmentId={departmentId}
            onManualTranscriptChange={setManualTranscript}
            onShowRecorder={setShowRecorder}
            onRecordingComplete={(transcript) => setManualTranscript(transcript)}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {meetingType === 'FISICA' ? '🏢 Reunión Física' : '📹 Videollamada'}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{ backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancelar
            </button>

            <button
              onClick={handleGenerateActa}
              disabled={generatingActa}
              style={{
                backgroundColor: generatingActa ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: generatingActa ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: generatingActa ? 0.7 : 1
              }}
            >
              {generatingActa ? (
                <><Loader size={16} className="animate-spin" /> GENERANDO ACTA...</>
              ) : (
                <>✅ GENERAR ACTA Y ASIGNAR TAREAS</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Completación de Tarea */}
      {showCompletionModal && selectedTaskForCompletion && userEmail && userName && (
        <TaskCompletionModal
          isOpen={showCompletionModal}
          taskId={selectedTaskForCompletion.id}
          taskTitle={selectedTaskForCompletion.titulo}
          userEmail={userEmail}
          userName={userName}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedTaskForCompletion(null);
          }}
          onSuccess={() => {
            if (selectedTaskForCompletion) {
              handleTogglePreviousTaskCompleted(selectedTaskForCompletion.id);
            }
            loadPreviousTasks();
          }}
        />
      )}

      {/* Modal de Preview del Acta */}
      {showActaPreview && (
        <ActaPreviewModal
          meeting={meeting}
          generatedMinutes={generatedMinutes}
          generatedTasks={generatedTasks}
          isEditingActa={isEditingActa}
          isSaving={isSaving}
          employees={employees}
          onClose={() => setShowActaPreview(false)}
          onCloseModal={onClose}
          onSuccess={onSuccess}
          onSetGeneratedMinutes={setGeneratedMinutes}
          onSetGeneratedTasks={setGeneratedTasks}
          onSetIsEditingActa={setIsEditingActa}
          onSave={handleSaveAfterReview}
        />
      )}

      {/* Modal de Programación de Siguiente Reunión */}
      {showNextMeetingScheduler && (
        <NextMeetingScheduler
          meeting={meeting}
          departmentId={departmentId}
          participants={participants}
          userEmail={userEmail}
          nextMeetingDate={nextMeetingDate}
          nextMeetingTime={nextMeetingTime}
          onSetNextMeetingDate={setNextMeetingDate}
          onSetNextMeetingTime={setNextMeetingTime}
          onClose={() => setShowNextMeetingScheduler(false)}
          onSuccess={onSuccess}
          onCloseModal={onClose}
        />
      )}
    </div>
  );
};

export default MeetingModal;
