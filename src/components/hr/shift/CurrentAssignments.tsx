import React from 'react';
import { Users } from 'lucide-react';
import { ShiftLocal, CenterLocal, AssignmentWithDetails } from './ShiftTypes';

interface CurrentAssignmentsProps {
  assignments: AssignmentWithDetails[];
  shifts: ShiftLocal[];
  centers: CenterLocal[];
  selectedCenter: number;
  loading: boolean;
  selectedAssignments: Set<number>;
  setSelectedAssignments: React.Dispatch<React.SetStateAction<Set<number>>>;
  showDeleteConfirm: { show: boolean; assignment: AssignmentWithDetails | null };
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<{ show: boolean; assignment: AssignmentWithDetails | null }>>;
  showBulkDeleteConfirm: boolean;
  setShowBulkDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  onRemoveAssignment: (assignment: AssignmentWithDetails) => void;
  onConfirmDelete: () => void;
  onConfirmBulkDelete: () => void;
}

const CurrentAssignments: React.FC<CurrentAssignmentsProps> = ({
  assignments,
  shifts,
  centers,
  selectedCenter,
  loading,
  selectedAssignments,
  setSelectedAssignments,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showBulkDeleteConfirm,
  setShowBulkDeleteConfirm,
  onRemoveAssignment,
  onConfirmDelete,
  onConfirmBulkDelete
}) => {
  const centerAssignments = assignments.filter(a => {
    const shift = shifts.find(s => s.id === a.shift_id);
    return shift?.center_id === selectedCenter;
  });

  // Debug para centerAssignments
  console.log(`[CENTER_ASSIGNMENTS_DEBUG] Filtrando asignaciones para centro ${selectedCenter}:`);
  console.log(`[CENTER_ASSIGNMENTS_DEBUG] Total assignments: ${assignments.length}`);
  console.log(`[CENTER_ASSIGNMENTS_DEBUG] Total shifts: ${shifts.length}`);
  console.log(`[CENTER_ASSIGNMENTS_DEBUG] Center assignments filtradas: ${centerAssignments.length}`);
  if (assignments.length > 0 && centerAssignments.length === 0) {
    console.log(`[CENTER_ASSIGNMENTS_DEBUG] ⚠️ PROBLEMA: Hay assignments (${assignments.length}) pero ninguna para centro ${selectedCenter}`);
    console.log(`[CENTER_ASSIGNMENTS_DEBUG] Shifts disponibles:`, shifts.map(s => ({ id: s.id, name: s.name, center_id: s.center_id })));
    console.log(`[CENTER_ASSIGNMENTS_DEBUG] Assignments sample:`, assignments.slice(0, 3).map(a => ({
      shift_id: a.shift_id,
      shift_center_id: a.shift_center_id,
      employee: a.employee_name
    })));
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: '0', color: '#059669' }}>
          📋 Asignaciones Actuales - {centers.find(c => c.id === selectedCenter)?.name || 'Centro'}
        </h3>
        {selectedAssignments.size > 0 && (
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🗑️ Eliminar Seleccionadas ({selectedAssignments.size})
          </button>
        )}
      </div>

      {centerAssignments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280',
          borderRadius: '8px'
        }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No hay asignaciones para este centro</p>
          <p style={{ fontSize: '14px' }}>Usa el panel de asignación rápida para comenzar</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedAssignments.size === centerAssignments.length && centerAssignments.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignments(new Set(centerAssignments.map(a => a.id).filter((id): id is number => id !== undefined)));
                      } else {
                        setSelectedAssignments(new Set());
                      }
                    }}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Empleado</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Turno</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Horario</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Desde</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Hasta</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {centerAssignments.map((assignment, index) => (
                <tr key={`${assignment.employee_id}-${assignment.shift_id}-${index}`} style={{
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: assignment.id && selectedAssignments.has(assignment.id) ? '#f0f9ff' : 'transparent'
                }}>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="checkbox"
                      checked={assignment.id ? selectedAssignments.has(assignment.id) : false}
                      onChange={(e) => {
                        const newSelected = new Set(selectedAssignments);
                        if (e.target.checked && assignment.id) {
                          newSelected.add(assignment.id);
                        } else if (assignment.id) {
                          newSelected.delete(assignment.id);
                        }
                        setSelectedAssignments(newSelected);
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px' }}>{assignment.employee_name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontWeight: 'bold' }}>{assignment.shift_name}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {assignment.shift_start_time} - {assignment.shift_end_time}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(assignment.date).toLocaleDateString('es-ES')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    Indefinido
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div
                      onClick={() => {
                        console.log('🖱️ CLICK DETECTADO en Eliminar', {
                          assignment_id: assignment.id,
                          loading
                        });
                        if (loading) {
                          console.log('⚠️ Click ignorado: loading=true');
                          return;
                        }
                        onRemoveAssignment(assignment);
                      }}
                      style={{
                        display: 'inline-block',
                        padding: '8px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: loading ? 0.5 : 1,
                        position: 'relative',
                        zIndex: 999,
                        userSelect: 'none',
                        pointerEvents: loading ? 'none' : 'auto'
                      }}
                    >
                      Eliminar
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm.show && (
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
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>⚠️ Confirmar Eliminación</h3>
            <p style={{ margin: '0 0 16px 0' }}>
              ¿Estás seguro de que quieres eliminar esta asignación?
            </p>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <strong>Empleado:</strong> {showDeleteConfirm.assignment?.employee_name}<br />
              <strong>Turno:</strong> {showDeleteConfirm.assignment?.shift_name}<br />
              <strong>Fecha:</strong> {showDeleteConfirm.assignment ? new Date(showDeleteConfirm.assignment.date).toLocaleDateString('es-ES') : ''}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm({ show: false, assignment: null })}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmDelete}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación múltiple */}
      {showBulkDeleteConfirm && (
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
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>⚠️ Confirmar Eliminación Múltiple</h3>
            <p style={{ margin: '0 0 16px 0' }}>
              ¿Estás seguro de que quieres eliminar <strong>{selectedAssignments.size}</strong> asignaciones seleccionadas?
            </p>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmBulkDelete}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Eliminar {selectedAssignments.size} Asignaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentAssignments;
