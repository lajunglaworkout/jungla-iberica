import React from 'react';
import { Loader } from 'lucide-react';
import { TaskCompletionModal } from './TaskCompletionModal';
import { MeetingModalProps } from './MeetingModalTypes';
import { PreviousTasksSection } from './PreviousTasksSection';
import { RecurringTasksSection } from './RecurringTasksSection';
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
    handleSaveAfterReview,
    previousObjectives,
    objectiveReviews,
    newObjectives,
    handleObjectiveReview,
    handleObjectiveReviewNota,
    handleNewObjectiveChange,
    handleAddNewObjective,
    handleRemoveNewObjective,
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

          {/* ── [0] Objetivos de la reunión anterior ── */}
          {previousObjectives.length > 0 && (
            <div style={{
              marginBottom: '24px',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(245,158,11,0.15)',
            }}>
              <div style={{
                padding: '12px 18px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span style={{ fontSize: '18px' }}>🎯</span>
                <span style={{ fontWeight: '700', fontSize: '15px', color: '#92400e' }}>
                  Objetivos de la reunión anterior
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  background: '#92400e',
                  color: 'white',
                  borderRadius: '20px',
                  padding: '2px 10px',
                  fontWeight: '600',
                }}>
                  {Object.values(objectiveReviews).filter(r => r.conseguido !== null).length}/{previousObjectives.length} revisados
                </span>
              </div>
              <div style={{ padding: '14px 18px', background: 'white', display: 'grid', gap: '12px' }}>
                {previousObjectives.map((obj) => {
                  const r = objectiveReviews[obj.id];
                  const estado = r?.conseguido === true ? 'conseguido' : r?.conseguido === false ? 'no_conseguido' : null;
                  return (
                    <div key={obj.id} style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${estado === 'conseguido' ? '#10b981' : estado === 'no_conseguido' ? '#ef4444' : '#e5e7eb'}`,
                      background: estado === 'conseguido' ? '#f0fdf4' : estado === 'no_conseguido' ? '#fef2f2' : '#f9fafb',
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        "{obj.texto}"
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          onClick={() => handleObjectiveReview(obj.id, true)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: '2px solid #10b981',
                            background: estado === 'conseguido' ? '#10b981' : 'white',
                            color: estado === 'conseguido' ? 'white' : '#10b981',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          ✅ Conseguido
                        </button>
                        <button
                          onClick={() => handleObjectiveReview(obj.id, false)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: '2px solid #ef4444',
                            background: estado === 'no_conseguido' ? '#ef4444' : 'white',
                            color: estado === 'no_conseguido' ? 'white' : '#ef4444',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          ❌ No conseguido
                        </button>
                        {estado !== null && (
                          <input
                            type="text"
                            placeholder="Nota opcional..."
                            value={r?.nota ?? ''}
                            onChange={(e) => handleObjectiveReviewNota(obj.id, e.target.value)}
                            style={{
                              flex: 1,
                              minWidth: '160px',
                              padding: '6px 10px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '13px',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* ── [5] Nuevos objetivos para la próxima reunión ── */}
          <div style={{
            marginTop: '24px',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>🎯</span>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e40af' }}>
                Objetivos para la próxima reunión
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#1e40af' }}>
                La IA los incluirá en el acta y los recordará en la siguiente reunión
              </span>
            </div>
            <div style={{ padding: '14px 18px', background: 'white', display: 'grid', gap: '8px' }}>
              {newObjectives.map((txt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#3b82f6', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>·</span>
                  <input
                    type="text"
                    placeholder={`Objetivo ${idx + 1}... (ej: mejorar retención en Jerez)`}
                    value={txt}
                    onChange={(e) => handleNewObjectiveChange(idx, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {newObjectives.length > 1 && (
                    <button
                      onClick={() => handleRemoveNewObjective(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '0 4px',
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddNewObjective}
                style={{
                  marginTop: '4px',
                  padding: '7px 14px',
                  border: '1.5px dashed #93c5fd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#3b82f6',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                + Añadir objetivo
              </button>
            </div>
          </div>

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
