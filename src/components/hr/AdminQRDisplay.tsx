// src/components/hr/AdminQRDisplay.tsx - Panel de administración para mostrar QR del centro
import React, { useState } from 'react';
import { ArrowLeft, Monitor, Smartphone, Settings } from 'lucide-react';
import CenterQRDisplay from './CenterQRDisplay';

interface AdminQRDisplayProps {
  onBack: () => void;
}

const AdminQRDisplay: React.FC<AdminQRDisplayProps> = ({ onBack }) => {
  const [selectedCenter, setSelectedCenter] = useState<number>(9); // Sevilla por defecto
  const [displayMode, setDisplayMode] = useState<'setup' | 'display'>('setup');

  const centers = [
    { id: 1, name: 'Almacén Central', location: 'Sevilla - Almacén' },
    { id: 9, name: 'Centro Sevilla', location: 'Sevilla - Gimnasio' },
    { id: 10, name: 'Centro Jerez', location: 'Jerez - Gimnasio' },
    { id: 11, name: 'Centro Puerto', location: 'Puerto de Santa María - Gimnasio' }
  ];

  const selectedCenterInfo = centers.find(c => c.id === selectedCenter);

  if (displayMode === 'display' && selectedCenterInfo) {
    return (
      <CenterQRDisplay
        centerInfo={selectedCenterInfo}
        fullscreen={true}
        onBack={() => setDisplayMode('setup')}
      />
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            📺 Pantalla de Fichaje
          </h1>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
            🎯 ¿Cómo funciona el fichaje?
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '2px solid #0ea5e9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Monitor size={24} color="#0ea5e9" />
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  Opción 1: Tablet/Pantalla del Centro
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Coloca una tablet en la entrada del centro</li>
                <li>Muestra el QR del centro en pantalla completa</li>
                <li>Los empleados escanean con su móvil</li>
                <li>QR se renueva cada 30 segundos automáticamente</li>
              </ul>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '2px solid #10b981'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Smartphone size={24} color="#10b981" />
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  Opción 2: QR Personal del Empleado
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Cada empleado genera su QR personal</li>
                <li>QR único e intransferible por empleado</li>
                <li>Se renueva cada 30 segundos</li>
                <li>Mayor seguridad y trazabilidad</li>
              </ul>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <strong>💡 Recomendación:</strong> Para mayor comodidad, usa la Opción 1 (tablet en el centro). 
            Para mayor seguridad, usa la Opción 2 (QR personal).
          </div>
        </div>

        {/* Center Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
            🏢 Seleccionar Centro
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {centers.map(center => (
              <button
                key={center.id}
                onClick={() => setSelectedCenter(center.id)}
                style={{
                  padding: '16px',
                  backgroundColor: selectedCenter === center.id ? '#059669' : 'white',
                  color: selectedCenter === center.id ? 'white' : '#374151',
                  border: selectedCenter === center.id ? '2px solid #059669' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {center.name}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {center.location}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {selectedCenterInfo && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Centro seleccionado: {selectedCenterInfo.name}
            </h3>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setDisplayMode('display')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Monitor size={20} />
                Mostrar QR en Pantalla Completa
              </button>
              
              <button
                onClick={() => {
                  const newWindow = window.open(
                    `/qr-display?center=${selectedCenter}`,
                    '_blank',
                    'fullscreen=yes,scrollbars=no,menubar=no,toolbar=no'
                  );
                  if (newWindow) {
                    newWindow.focus();
                  } else {
                    alert('Permite ventanas emergentes para abrir en nueva ventana');
                  }
                }}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Settings size={20} />
                Abrir en Nueva Ventana
              </button>
            </div>

            <p style={{ 
              margin: '16px 0 0 0', 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              💡 Tip: Usa "Nueva Ventana" para mostrar en una tablet dedicada
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQRDisplay;
