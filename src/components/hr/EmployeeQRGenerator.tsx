// src/components/hr/EmployeeQRGenerator.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Clock } from 'lucide-react';
import QRGenerator from './QRGenerator';
import { useSession } from '../../contexts/SessionContext';

interface EmployeeQRGeneratorProps {
  onBack: () => void;
}

const EmployeeQRGenerator: React.FC<EmployeeQRGeneratorProps> = ({ onBack }) => {
  const { employee } = useSession();
  const [centerInfo, setCenterInfo] = useState<{id: number, name: string} | null>(null);

  useEffect(() => {
    // Mapear el centro del empleado
    const getCenterInfo = () => {
      const centerName = employee?.centerName?.toLowerCase() || 'central';
      
      const centerMap: Record<string, {id: number, name: string}> = {
        'central': { id: 1, name: 'Almacén Central' },
        'sevilla': { id: 9, name: 'Centro Sevilla' },
        'jerez': { id: 10, name: 'Centro Jerez' },
        'puerto': { id: 11, name: 'Centro Puerto' }
      };

      return centerMap[centerName] || centerMap['central'];
    };

    setCenterInfo(getCenterInfo());
  }, [employee]);

  if (!employee || !centerInfo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Cargando información del empleado...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={onBack}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f3f4f6', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            🔒 Mi QR Personal
          </h1>
        </div>

        {/* Info del empleado */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              borderRadius: '12px', 
              padding: '12px',
              border: '2px solid #0ea5e9'
            }}>
              <User size={24} color="#0ea5e9" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {employee.name}
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {centerInfo.name}
              </p>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #fbbf24', 
            borderRadius: '8px', 
            padding: '12px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
            <strong>Importante:</strong> Este QR es personal y único para ti. Se renueva cada 30 segundos por seguridad.
          </div>
        </div>

        {/* QR Generator personalizado */}
        <QRGenerator 
          centerId={centerInfo.id}
          centerName={centerInfo.name}
          employeeId={employee.id?.toString()}
          employeeName={employee.name}
        />

        {/* Instrucciones */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#111827'
          }}>
            📱 Cómo usar tu QR personal:
          </h4>
          <ol style={{ 
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            color: '#374151',
            lineHeight: '1.6'
          }}>
            <li>Abre la app de La Jungla en tu móvil</li>
            <li>Ve a "Fichar Entrada/Salida"</li>
            <li>Escanea este QR con la cámara</li>
            <li>Confirma tu ubicación cuando se solicite</li>
            <li>¡Fichaje completado automáticamente!</li>
          </ol>
          
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#166534'
          }}>
            💡 <strong>Consejo:</strong> Mantén esta pantalla abierta durante tu jornada para fichar rápidamente.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeQRGenerator;
