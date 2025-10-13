import React, { useMemo, useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { ArrowLeft, User, Clock, ClipboardList, CheckCircle, Calendar, Shirt, FileText, MessageCircle } from 'lucide-react';
import MobileTimeClock from '../hr/MobileTimeClock';
import TimeclockDashboard from '../hr/TimeclockDashboard';
import DailyOperations from '../hr/DailyOperations';
import EmployeeProfile from '../hr/EmployeeProfile';
import VacationRequest from '../hr/VacationRequest';
import VacationApproval from '../hr/VacationApproval';
import IncidentManagementSystem from '../incidents/IncidentManagementSystem';
import ComingSoon from '../hr/ComingSoon';
import UniformRequestPanel from '../logistics/UniformRequestPanel';
import { LocationType } from '../../types/logistics';

interface EmployeeAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const CenterManagement: React.FC = () => {
  const { employee } = useSession();
  const [activeAction, setActiveAction] = useState<string>('summary');

  const actionCards: EmployeeAction[] = useMemo(() => [
    { id: 'my-profile', title: 'Mi Perfil', description: 'Datos personales', icon: <User /> },
    { id: 'mobile-timeclock', title: 'Fichar', description: 'Escanear QR', icon: <Clock /> },
    { id: 'timeclock', title: 'Historial fichajes', description: 'Ver entradas/salidas', icon: <ClipboardList /> },
    { id: 'daily-operations', title: 'Checklist diaria', description: 'Tareas operativas', icon: <CheckCircle /> },
    { id: 'vacation-request', title: 'Solicitar vacaciones', description: 'Nueva solicitud', icon: <Calendar /> },
    { id: 'vacations', title: 'Estado vacaciones', description: 'Solicitudes enviadas', icon: <Calendar /> },
    { id: 'uniform-request', title: 'Solicitar uniforme', description: 'Vestuario/material', icon: <Shirt /> },
    { id: 'my-documents', title: 'Mis documentos', description: 'Contratos/nóminas', icon: <FileText /> },
    { id: 'hr-contact', title: 'Contactar RRHH', description: 'Soporte y ayuda', icon: <MessageCircle /> }
  ], []);

  if (!employee) return <div>Cargando...</div>;

  const renderSummary = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>
          🏪 Gestión del Centro
        </h1>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '16px' }}>
          Hola {employee.name?.split(' ')[0] || 'Empleado'}, estas son tus gestiones para el centro.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {actionCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveAction(card.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={(event) => {
              const target = event.currentTarget;
              target.style.boxShadow = '0 10px 25px rgba(15, 118, 110, 0.12)';
              target.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(event) => {
              const target = event.currentTarget;
              target.style.boxShadow = 'none';
              target.style.transform = 'translateY(0)';
            }}
          >
            {card.icon}
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                {card.title}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>{card.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderActionContent = () => {
    switch (activeAction) {
      case 'my-profile':
        return (
          <EmployeeProfile
            onBack={() => setActiveAction('summary')}
            currentEmployee={employee as any}
          />
        );
      case 'mobile-timeclock':
        return <MobileTimeClock />;
      case 'timeclock':
        return <TimeclockDashboard />;
      case 'daily-operations':
        return <DailyOperations />;
      case 'vacation-request':
        return (
          <VacationRequest
            onBack={() => setActiveAction('summary')}
            currentEmployee={employee as any}
          />
        );
      case 'vacations':
        return (
          <VacationApproval
            onBack={() => setActiveAction('summary')}
            currentEmployee={employee as any}
          />
        );
      case 'uniform-request':
        return (
          <UniformRequestPanel
            userLocation={employee.centerName?.toLowerCase() as LocationType || 'central'}
            employeeName={employee.name}
            onSubmit={(payload) => {
              console.log('Solicitud de vestuario enviada:', payload);
              alert(`Solicitud enviada a RRHH: ${payload.items.length} prendas por ${payload.reason}`);
              setActiveAction('summary');
            }}
          />
        );
      case 'my-documents':
        return (
          <ComingSoon
            onBack={() => setActiveAction('summary')}
            title="📄 Mis documentos"
            description="Estamos preparando la descarga de contratos y nóminas."
          />
        );
      case 'hr-contact':
        return <IncidentManagementSystem />;
      default:
        return renderSummary();
    }
  };

  return activeAction === 'summary' 
    ? (
      <div style={{ padding: '24px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
        {renderSummary()}
      </div>
    ) 
    : (
      <div style={{ padding: '24px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
        <button
          onClick={() => setActiveAction('summary')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'white',
            color: '#059669',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={18} /> Volver a mis gestiones
        </button>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}
        >
          {renderActionContent()}
        </div>
      </div>
    );
};

export default CenterManagement;
