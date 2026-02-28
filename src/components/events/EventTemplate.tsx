import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEventTemplate } from '../../hooks/useEventTemplate';
import { EventTemplateProps } from './template/EventTemplateTypes';
import { FichaTecnicaSection } from './template/FichaTecnicaSection';
import { ServiciosAdicionalesSection } from './template/ServiciosAdicionalesSection';
import { AsistentesSection } from './template/AsistentesSection';
import { EncuestasSection } from './template/EncuestasSection';
import { ChecklistSection } from './template/ChecklistSection';
import { ContabilidadSection } from './template/ContabilidadSection';
import { ResultadoFinalSection } from './template/ResultadoFinalSection';
import { InformeFinalSection } from './template/InformeFinalSection';

export const EventTemplate: React.FC<EventTemplateProps> = ({ eventId, onBack }) => {
    const {
        evento,
        setEvento,
        gastos,
        setGastos,
        informe,
        setInforme,
        encuestaResumen,
        participantes,
        participantesCount,
        loading,
        saving,
        uploadingFactura,
        fileInputRefs,
        showParticipantesModal,
        setShowParticipantesModal,
        quickAddName,
        setQuickAddName,
        quickAddEmail,
        setQuickAddEmail,
        quickAddTelefono,
        setQuickAddTelefono,
        showCapacityWarning,
        setShowCapacityWarning,
        addingParticipante,
        quickAddHaPagado,
        setQuickAddHaPagado,
        encuestas,
        showEncuestaForm,
        setShowEncuestaForm,
        selectedParticipanteId,
        setSelectedParticipanteId,
        encuestaForm,
        setEncuestaForm,
        savingEncuesta,
        checklist,
        participantesSinEncuesta,
        totalGastos,
        totalIngresos,
        balance,
        handleSaveEvento,
        addGasto,
        removeGasto,
        handleUploadFactura,
        saveGastos,
        removeParticipante,
        toggleAsistencia,
        saveParticipantes,
        quickAddParticipante,
        confirmExpandCapacity,
        saveInforme,
        handleParticipanteSelectForEncuesta,
        saveEncuesta,
        toggleChecklistItem,
    } = useEventTemplate(eventId);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div
                        className="animate-spin"
                        style={{
                            width: '48px',
                            height: '48px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #10b981',
                            borderRadius: '50%',
                            margin: '0 auto',
                        }}
                    />
                    <p style={{ color: '#6b7280', marginTop: '16px' }}>Cargando evento...</p>
                </div>
            </div>
        );
    }

    if (!evento) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Evento no encontrado</div>;
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '10px',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={20} color="#374151" />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                            {evento.nombre}
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                            Plantilla del Evento
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSaveEvento}
                    disabled={saving}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.2s',
                    }}
                >
                    <Save size={18} />
                    Guardar Cambios
                </button>
            </div>

            <FichaTecnicaSection evento={evento} setEvento={setEvento} />

            <ServiciosAdicionalesSection />

            <AsistentesSection
                evento={evento}
                participantes={participantes}
                showCapacityWarning={showCapacityWarning}
                setShowCapacityWarning={setShowCapacityWarning}
                showParticipantesModal={showParticipantesModal}
                setShowParticipantesModal={setShowParticipantesModal}
                quickAddName={quickAddName}
                setQuickAddName={setQuickAddName}
                quickAddEmail={quickAddEmail}
                setQuickAddEmail={setQuickAddEmail}
                quickAddTelefono={quickAddTelefono}
                setQuickAddTelefono={setQuickAddTelefono}
                quickAddHaPagado={quickAddHaPagado}
                setQuickAddHaPagado={setQuickAddHaPagado}
                addingParticipante={addingParticipante}
                saving={saving}
                quickAddParticipante={quickAddParticipante}
                confirmExpandCapacity={confirmExpandCapacity}
                toggleAsistencia={toggleAsistencia}
                removeParticipante={removeParticipante}
                saveParticipantes={saveParticipantes}
            />

            <EncuestasSection
                encuestas={encuestas}
                encuestaResumen={encuestaResumen}
                participantes={participantes}
                participantesSinEncuesta={participantesSinEncuesta}
                showEncuestaForm={showEncuestaForm}
                setShowEncuestaForm={setShowEncuestaForm}
                selectedParticipanteId={selectedParticipanteId}
                setSelectedParticipanteId={setSelectedParticipanteId}
                encuestaForm={encuestaForm}
                setEncuestaForm={setEncuestaForm}
                savingEncuesta={savingEncuesta}
                handleParticipanteSelectForEncuesta={handleParticipanteSelectForEncuesta}
                saveEncuesta={saveEncuesta}
            />

            <ChecklistSection
                checklist={checklist}
                toggleChecklistItem={toggleChecklistItem}
            />

            <ContabilidadSection
                gastos={gastos}
                setGastos={setGastos}
                totalGastos={totalGastos}
                saving={saving}
                uploadingFactura={uploadingFactura}
                fileInputRefs={fileInputRefs}
                addGasto={addGasto}
                removeGasto={removeGasto}
                handleUploadFactura={handleUploadFactura}
                saveGastos={saveGastos}
            />

            <ResultadoFinalSection
                participantesCount={participantesCount}
                totalIngresos={totalIngresos}
                totalGastos={totalGastos}
                balance={balance}
                informe={informe}
                setInforme={setInforme}
                encuestaResumen={encuestaResumen}
            />

            <InformeFinalSection
                informe={informe}
                setInforme={setInforme}
                participantesCount={participantesCount}
                balance={balance}
                encuestaResumen={encuestaResumen}
                saving={saving}
                saveInforme={saveInforme}
            />
        </div>
    );
};

export default EventTemplate;
