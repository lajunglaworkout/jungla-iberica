// src/components/AppWithProfileSelector.tsx - App con selector de perfiles
import React, { useState, useEffect } from 'react';
import ProfileSelector from './auth/ProfileSelector';
import CenterProfile from './centers/CenterProfile';
import CenterSessionManager from './auth/CenterSessionManager';
import { SessionProvider } from '../contexts/SessionContext';
import { DataProvider } from '../contexts/DataContext';
import App from '../App';

interface CenterData {
  id: number;
  name: string;
  location: string;
  type: string;
}

const AppWithProfileSelector: React.FC = () => {
  const [profileType, setProfileType] = useState<'employee' | 'center' | null>(null);
  const [centerData, setCenterData] = useState<CenterData | null>(null);

  useEffect(() => {
    // Verificar si hay una sesión de centro guardada
    const savedSession = localStorage.getItem('centerSession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        if (sessionData.type === 'center' && sessionData.centerData) {
          setProfileType('center');
          setCenterData(sessionData.centerData);
        }
      } catch (error) {
        console.error('Error recuperando sesión:', error);
        localStorage.removeItem('centerSession');
      }
    }
  }, []);

  const handleProfileSelect = (type: 'employee' | 'center', data?: CenterData) => {
    setProfileType(type);
    if (type === 'center' && data) {
      setCenterData(data);
    }
  };

  const handleBackToSelector = () => {
    setProfileType(null);
    setCenterData(null);
  };

  // Si no se ha seleccionado perfil, mostrar selector
  if (!profileType) {
    return <ProfileSelector onSelectProfile={handleProfileSelect} />;
  }

  // Si es perfil de centro, mostrar interfaz de centro
  if (profileType === 'center' && centerData) {
    return (
      <CenterSessionManager onLogout={handleBackToSelector}>
        <CenterProfile
          centerId={centerData.id}
          centerName={centerData.name}
          centerLocation={centerData.location}
        />
      </CenterSessionManager>
    );
  }

  // Si es perfil de empleado, mostrar app normal
  return (
    <SessionProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </SessionProvider>
  );
};

export default AppWithProfileSelector;
