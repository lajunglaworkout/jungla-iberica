import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useShiftAssignment } from '../../hooks/useShiftAssignment';
import CenterSelector from './shift/CenterSelector';
import QuickAssignment from './shift/QuickAssignment';
import ShiftCalendar from './shift/ShiftCalendar';
import CurrentAssignments from './shift/CurrentAssignments';
import BulkAssignmentModal from './shift/BulkAssignmentModal';

const ShiftAssignmentSystem: React.FC = () => {
  const {
    // State
    selectedCenter,
    setSelectedCenter,
    centers,
    shifts,
    employees,
    assignments,
    currentMonth,
    setCurrentMonth,
    loading,
    quickAssignData,
    setQuickAssignData,
    error,
    setError,
    showBulkAssignment,
    setShowBulkAssignment,
    selectedEmployeeIds,
    setSelectedEmployeeIds,
    showDeleteConfirm,
    setShowDeleteConfirm,
    selectedAssignments,
    setSelectedAssignments,
    showBulkDeleteConfirm,
    setShowBulkDeleteConfirm,
    bulkAssignmentData,
    setBulkAssignmentData,
    selectedDays,
    setSelectedDays,
    // Handlers
    loadShifts,
    handleQuickAssign,
    handleCreateShift,
    handleClearCache,
    handleRemoveAssignment,
    confirmDelete,
    confirmBulkDelete,
    createBulkAssignments,
    resetBulkAssignment
  } = useShiftAssignment();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          color: '#059669',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          🎯 Sistema de Asignación de Turnos
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
            <button
              onClick={() => setError(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        <CenterSelector
          centers={centers}
          selectedCenter={selectedCenter}
          onSelectCenter={setSelectedCenter}
        />

        <QuickAssignment
          shifts={shifts}
          employees={employees}
          centers={centers}
          selectedCenter={selectedCenter}
          selectedEmployeeIds={selectedEmployeeIds}
          setSelectedEmployeeIds={setSelectedEmployeeIds}
          quickAssignData={quickAssignData}
          setQuickAssignData={setQuickAssignData}
          loading={loading}
          onQuickAssign={handleQuickAssign}
          onCreateShift={handleCreateShift}
          onClearCache={handleClearCache}
          onOpenBulkAssignment={() => setShowBulkAssignment(true)}
        />

        {/* Modal de Programación por Fechas */}
        {showBulkAssignment && (
          <BulkAssignmentModal
            shifts={shifts}
            employees={employees}
            selectedCenter={selectedCenter}
            loading={loading}
            bulkAssignmentData={bulkAssignmentData}
            setBulkAssignmentData={setBulkAssignmentData}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            onClose={() => setShowBulkAssignment(false)}
            onReset={resetBulkAssignment}
            onCreateBulk={createBulkAssignments}
          />
        )}

        <ShiftCalendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          assignments={assignments}
          shifts={shifts}
          employees={employees}
          selectedCenter={selectedCenter}
        />

        <CurrentAssignments
          assignments={assignments}
          shifts={shifts}
          centers={centers}
          selectedCenter={selectedCenter}
          loading={loading}
          selectedAssignments={selectedAssignments}
          setSelectedAssignments={setSelectedAssignments}
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          showBulkDeleteConfirm={showBulkDeleteConfirm}
          setShowBulkDeleteConfirm={setShowBulkDeleteConfirm}
          onRemoveAssignment={handleRemoveAssignment}
          onConfirmDelete={confirmDelete}
          onConfirmBulkDelete={confirmBulkDelete}
        />
      </div>
    </div>
  );
};

export default ShiftAssignmentSystem;
