import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import MaintenanceDashboard from './maintenance/MaintenanceDashboardStyled';
import InspectionStepByStep from './maintenance/InspectionStepByStep';
import maintenanceService from '../services/maintenanceService';

interface MaintenanceModuleProps {
  userEmail: string;
  userName: string;
  onBack: () => void;
}

const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({
  userEmail,
  userName,
  onBack
}) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'inspection'>('dashboard');
  const [centerInfo, setCenterInfo] = useState({
    centerId: 'sevilla',
    centerName: 'Centro Sevilla'
  });

  // Detectar centro basado en el email del usuario
  useEffect(() => {
    const detectCenter = () => {
      const email = userEmail.toLowerCase();
      
      if (email.includes('jerez') || email.includes('ivan') || email.includes('pablo')) {
        setCenterInfo({ centerId: 'jerez', centerName: 'Centro Jerez' });
      } else if (email.includes('puerto') || email.includes('adrian') || email.includes('guillermo')) {
        setCenterInfo({ centerId: 'puerto', centerName: 'Centro Puerto' });
      } else if (email.includes('sevilla') || email.includes('francisco') || email.includes('salva')) {
        setCenterInfo({ centerId: 'sevilla', centerName: 'Centro Sevilla' });
      } else {
        // Por defecto Sevilla para usuarios de marca/central
        setCenterInfo({ centerId: 'sevilla', centerName: 'Centro Sevilla' });
      }
    };

    detectCenter();
  }, [userEmail]);

  const handleStartInspection = () => {
    setCurrentView('inspection');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const renderHeader = () => (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onBack}
            style={{
              marginRight: '16px',
              padding: '8px',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              {currentView === 'dashboard' ? 'Mantenimiento' : 'Nueva Inspección'}
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '4px 0 0 0'
            }}>
              {centerInfo.centerName} - {userName}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentView === 'inspection' && (
            <button
              onClick={handleBackToDashboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                color: '#6b7280',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <BarChart3 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Dashboard
            </button>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            <Clock style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {renderHeader()}
      
      <div style={{ 
        flex: 1,
        overflow: 'auto',
        maxHeight: 'calc(100vh - 120px)'
      }}>
        {currentView === 'dashboard' ? (
          <MaintenanceDashboard
            userEmail={userEmail}
            userName={userName}
            centerName={centerInfo.centerName}
            centerId={centerInfo.centerId}
            onStartInspection={handleStartInspection}
          />
        ) : (
          <InspectionStepByStep
            userEmail={userEmail}
            userName={userName}
            centerName={centerInfo.centerName}
            centerId={centerInfo.centerId}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default MaintenanceModule;
