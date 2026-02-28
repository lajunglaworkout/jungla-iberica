import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import MaintenanceDashboard from './maintenance/MaintenanceDashboardStyled';
import MaintenanceDashboardBeni from './maintenance/MaintenanceDashboardBeni';
import ManagerQuarterlyMaintenance from './centers/ManagerQuarterlyMaintenance';
import InspectionStepByStep from './maintenance/InspectionStepByStep';
import quarterlyMaintenanceService from '../services/quarterlyMaintenanceService';

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'inspection' | 'quarterly'>('dashboard');
  const [centerInfo, setCenterInfo] = useState({
    centerId: 'sevilla',
    centerName: 'Centro Sevilla',
    centerNumId: 9
  });
  const [isBeni, setIsBeni] = useState(false);
  const [hasActiveQuarterly, setHasActiveQuarterly] = useState(false);

  useEffect(() => {
    const detectUserAndLoadData = async () => {
      const email = userEmail.toLowerCase();

      const beniEmail = email.includes('beni') || email.includes('carlossuarezparra');
      setIsBeni(beniEmail);

      if (beniEmail) {
        setCurrentView('quarterly');
        setHasActiveQuarterly(false);
        return;
      }

      let centerId = 'sevilla';
      let centerNumId = 9;
      let centerName = 'Centro Sevilla';

      if (email.includes('jerez') || email.includes('ivan') || email.includes('pablo')) {
        centerId = 'jerez'; centerNumId = 10; centerName = 'Centro Jerez';
      } else if (email.includes('puerto') || email.includes('adrian') || email.includes('guillermo')) {
        centerId = 'puerto'; centerNumId = 11; centerName = 'Centro Puerto';
      } else if (email.includes('sevilla') || email.includes('francisco') || email.includes('fran') || email.includes('salva')) {
        centerId = 'sevilla'; centerNumId = 9; centerName = 'Centro Sevilla';
      }

      setCenterInfo({ centerId, centerName, centerNumId });

      // Solo mostrar revisión trimestral si hay una activa Y la asignación está en curso
      const result = await quarterlyMaintenanceService.getAssignments(centerNumId);

      const activeAssignment = result.success && result.assignments
        ? result.assignments.find((a: Record<string, unknown> & { review?: { status?: string }; status?: string }) =>
            a.review?.status === 'active' &&
            (a.status === 'pending' || a.status === 'in_progress')
          )
        : null;

      if (activeAssignment) {
        console.log('✅ Revisión trimestral activa encontrada:', activeAssignment.id);
        setHasActiveQuarterly(true);
        setCurrentView('quarterly');
      } else {
        setCurrentView('dashboard');
      }
    };

    detectUserAndLoadData();
  }, [userEmail]);

  const handleStartInspection = () => setCurrentView('inspection');
  const handleBackToDashboard = () => setCurrentView('dashboard');
  const handleOpenQuarterly = () => setCurrentView('quarterly');
  const handleCloseQuarterly = () => setCurrentView('dashboard');

  // Cabecera compacta solo para vistas secundarias (inspección / revisión trimestral de encargado)
  const showSubHeader = !isBeni && (currentView === 'inspection' || (currentView === 'quarterly' && hasActiveQuarterly));

  return (
    <div style={{ backgroundColor: '#f9fafb', width: '100%', minHeight: '100%' }}>

      {/* Sub-cabecera solo para vistas de inspección / revisión del encargado */}
      {showSubHeader && (
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleBackToDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
            {currentView === 'inspection' ? '🔍 Nueva Inspección Mensual' : '📋 Revisión Trimestral'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginLeft: 'auto' }}>
            {centerInfo.centerName}
          </span>
        </div>
      )}

      {/* Contenido principal */}
      <div style={{ width: '100%' }}>
        {isBeni ? (
          <MaintenanceDashboardBeni onClose={handleCloseQuarterly} />
        ) : hasActiveQuarterly ? (
          <ManagerQuarterlyMaintenance onBack={handleBackToDashboard} centerId={centerInfo.centerNumId} />
        ) : currentView === 'dashboard' ? (
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
