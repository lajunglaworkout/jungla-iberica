// src/components/hr/ChecklistModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import ChecklistCompleteSystem from '../ChecklistCompleteSystem';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  centerId?: string;
  centerName?: string;
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({ 
  isOpen, 
  onClose, 
  employeeName, 
  centerId = "9", 
  centerName = "Centro Sevilla" 
}) => {
  if (!isOpen) return null;

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
        padding: '24px',
        maxWidth: '800px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Check-list Diario - {employeeName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>
        
        <ChecklistCompleteSystem 
          centerId={centerId}
          centerName={centerName}
        />
      </div>
    </div>
  );
};

export default ChecklistModal;
