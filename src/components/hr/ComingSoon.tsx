// src/components/hr/ComingSoon.tsx - Componente para funcionalidades en desarrollo
import React from 'react';
import { ArrowLeft, Clock, Wrench } from 'lucide-react';

interface ComingSoonProps {
  onBack: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  onBack, 
  title, 
  description,
  icon = <Wrench size={48} />
}) => {
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        marginBottom: '32px'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      {/* Contenido */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px 32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ 
          color: '#6b7280', 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          {title}
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px', 
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          {description}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 24px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          color: '#92400e',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <Clock size={16} />
          Funcionalidad en desarrollo
        </div>

        <div style={{ marginTop: '32px' }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#9ca3af',
            margin: 0
          }}>
            Esta funcionalidad estará disponible próximamente. <br />
            Mientras tanto, puedes usar las otras opciones del portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
