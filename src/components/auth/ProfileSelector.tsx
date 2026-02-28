// src/components/auth/ProfileSelector.tsx - Selector de tipo de perfil
import React, { useState } from 'react';
import { User, Building2, Smartphone, Monitor, ArrowRight } from 'lucide-react';
import CenterLogin from './CenterLogin';
import { useIsMobile } from '../../hooks/useIsMobile';

interface CenterData {
  id: number;
  name: string;
  location: string;
  type: string;
}

interface ProfileSelectorProps {
  onSelectProfile: (type: 'employee' | 'center', data?: CenterData) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelectProfile }) => {
  const isMobile = useIsMobile();
  const [selectedType, setSelectedType] = useState<'employee' | 'center' | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [showCenterLogin, setShowCenterLogin] = useState(false);

  const centers = [
    { id: 1, name: 'Almacén Central', location: 'Sevilla - Almacén', type: 'warehouse' },
    { id: 9, name: 'Centro Sevilla', location: 'Sevilla - Gimnasio', type: 'gym' },
    { id: 10, name: 'Centro Jerez', location: 'Jerez - Gimnasio', type: 'gym' },
    { id: 11, name: 'Centro Puerto', location: 'Puerto de Santa María - Gimnasio', type: 'gym' }
  ];

  const handleContinue = () => {
    if (selectedType === 'employee') {
      onSelectProfile('employee');
    } else if (selectedType === 'center') {
      setShowCenterLogin(true);
    }
  };

  const handleCenterLoginSuccess = (centerData: CenterData) => {
    onSelectProfile('center', centerData);
  };

  // Si se está mostrando el login de centro
  if (showCenterLogin) {
    return (
      <CenterLogin
        onBack={() => setShowCenterLogin(false)}
        onLoginSuccess={handleCenterLoginSuccess}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏢</div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#111827' }}>
            La Jungla Ibérica
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
            Selecciona el tipo de perfil para continuar
          </p>
        </div>

        {/* Profile Type Selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Employee Profile */}
          <button
            onClick={() => {
              setSelectedType('employee');
              setSelectedCenter(null);
            }}
            style={{
              padding: '32px',
              backgroundColor: selectedType === 'employee' ? '#059669' : 'white',
              color: selectedType === 'employee' ? 'white' : '#374151',
              border: selectedType === 'employee' ? '3px solid #059669' : '3px solid #e5e7eb',
              borderRadius: '16px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              boxShadow: selectedType === 'employee' ? '0 8px 16px rgba(5, 150, 105, 0.2)' : '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Smartphone size={48} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              👤 Empleado
            </h3>
            <p style={{ fontSize: '16px', margin: '0 0 16px 0', opacity: 0.8 }}>
              Acceso personal para empleados
            </p>
            <ul style={{
              textAlign: 'left',
              fontSize: '14px',
              margin: 0,
              paddingLeft: '20px',
              opacity: 0.9
            }}>
              <li>Fichar entrada/salida</li>
              <li>Ver mi perfil y documentos</li>
              <li>Solicitar vacaciones/uniformes</li>
              <li>Checklist diaria</li>
              <li>Contactar RRHH</li>
            </ul>
          </button>

          {/* Center Profile */}
          <button
            onClick={() => {
              setSelectedType('center');
              setSelectedCenter(null);
            }}
            style={{
              padding: '32px',
              backgroundColor: selectedType === 'center' ? '#3b82f6' : 'white',
              color: selectedType === 'center' ? 'white' : '#374151',
              border: selectedType === 'center' ? '3px solid #3b82f6' : '3px solid #e5e7eb',
              borderRadius: '16px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              boxShadow: selectedType === 'center' ? '0 8px 16px rgba(59, 130, 246, 0.2)' : '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Monitor size={48} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              🏢 Centro
            </h3>
            <p style={{ fontSize: '16px', margin: '0 0 16px 0', opacity: 0.8 }}>
              Pantalla de fichaje para centros
            </p>
            <ul style={{
              textAlign: 'left',
              fontSize: '14px',
              margin: 0,
              paddingLeft: '20px',
              opacity: 0.9
            }}>
              <li>Mostrar QR de fichaje</li>
              <li>Ver empleados presentes</li>
              <li>Estadísticas del centro</li>
              <li>Sistema de fichaje seguro</li>
              <li>Pantalla completa para tablet</li>
            </ul>
          </button>
        </div>


        {/* Continue Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            style={{
              padding: '16px 32px',
              backgroundColor: !selectedType ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: !selectedType ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto',
              transition: 'all 0.2s ease'
            }}
          >
            {selectedType === 'center' ? 'Iniciar Sesión' : 'Continuar'}
            <ArrowRight size={20} />
          </button>

          {selectedType && (
            <p style={{
              margin: '16px 0 0 0',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {selectedType === 'employee'
                ? '📱 Accederás al panel de empleado'
                : '🏢 Te pediremos las credenciales del centro'
              }
            </p>
          )}
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: '48px',
          padding: '20px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>
            💡 ¿Cuál elegir?
          </h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', lineHeight: '1.5' }}>
            <strong>Empleado:</strong> Si eres un trabajador que necesita fichar, ver nóminas, solicitar vacaciones, etc.<br />
            <strong>Centro:</strong> Si vas a configurar una tablet/pantalla fija en la entrada del centro para que los empleados fichen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;
