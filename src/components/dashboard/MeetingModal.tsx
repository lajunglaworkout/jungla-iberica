import React, { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { MeetingModal as RealMeetingModal } from '../meetings/MeetingModal';
import { DEPARTMENTS_CONFIG } from '../../config/departmentPermissions';
import { X, Users } from 'lucide-react';

interface Props {
  onClose: () => void;
}

// Departamentos que tienen flujo de reunión completo en MeetingModal
const MEETING_DEPARTMENTS = [
  'direccion', 'rrhh', 'contabilidad', 'logistica',
  'mantenimiento', 'operaciones', 'procedimientos',
  'marketing', 'ventas', 'eventos',
];

export const MeetingModal: React.FC<Props> = ({ onClose }) => {
  const { employee } = useSession();
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Departamentos del usuario que tienen soporte en el modal de reuniones
  const userDepts: { id: string; name: string; color: string }[] = (() => {
    const userDeptIds = employee?.departments?.map(d => d.id) ?? [];
    const candidates = userDeptIds.length > 0 ? userDeptIds : MEETING_DEPARTMENTS;
    return candidates
      .filter(id => MEETING_DEPARTMENTS.includes(id) && DEPARTMENTS_CONFIG[id])
      .map(id => ({
        id,
        name: DEPARTMENTS_CONFIG[id].name,
        color: DEPARTMENTS_CONFIG[id].color,
      }));
  })();

  // Si hay exactamente un departamento disponible, abrirlo directamente
  const autoSingleDept = userDepts.length === 1 ? userDepts[0].id : null;
  const activeDeptId = selectedDeptId ?? autoSingleDept;

  // Step 2: Mostrar el modal de reunión real
  if (activeDeptId) {
    return (
      <RealMeetingModal
        departmentId={activeDeptId}
        userEmail={employee?.email}
        userName={
          employee?.first_name
            ? `${employee.first_name} ${employee.last_name ?? ''}`.trim()
            : undefined
        }
        onClose={onClose}
        onSuccess={onClose}
      />
    );
  }

  // Step 1: Selector de departamento
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '480px',
          maxWidth: '95vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              Nueva Reunión
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
          Selecciona el departamento para la reunión:
        </p>

        {/* Grid de departamentos */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            maxHeight: '360px',
            overflowY: 'auto',
          }}
        >
          {userDepts.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              style={{
                padding: '12px 16px',
                backgroundColor: '#f9fafb',
                border: `2px solid ${dept.color}22`,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${dept.color}15`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = dept.color;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb';
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${dept.color}22`;
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: dept.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                {dept.name}
              </span>
            </button>
          ))}
        </div>

        {userDepts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '20px 0' }}>
            No tienes departamentos asignados con soporte de reuniones.
          </p>
        )}
      </div>
    </div>
  );
};

export default MeetingModal;
