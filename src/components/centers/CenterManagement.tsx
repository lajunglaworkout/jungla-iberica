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
import EmployeeQRGenerator from '../hr/EmployeeQRGenerator';
import ChecklistCompleteSystem from '../ChecklistCompleteSystem';
import DocumentManagement from '../hr/DocumentManagement';
import QRScanner from '../hr/QRScanner';
import CenterQRDisplay from '../hr/CenterQRDisplay';
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
  const [showVacationNotifications, setShowVacationNotifications] = useState(false);

  // Función para obtener el nombre del centro
  const getCenterName = (centerId?: number): string => {
    const centerNames: { [key: number]: string } = {
      1: 'Almacén Central',
      9: 'Centro Sevilla',
      10: 'Centro Jerez',
      11: 'Centro Puerto'
    };
    return centerNames[centerId || 9] || 'Centro Sevilla';
  };

  const actionCards: EmployeeAction[] = useMemo(() => [
    { id: 'my-profile', title: 'Mi Perfil', description: 'Ver y editar datos personales', icon: <User size={24} /> },
    { id: 'qr-scanner', title: 'Fichar (Escanear QR)', description: 'Escanear QR del centro', icon: <Clock size={24} /> },
    { id: 'mobile-timeclock', title: 'Mi QR Personal', description: 'Generar mi QR único', icon: <Clock size={24} /> },
    { id: 'timeclock', title: 'Historial de Fichajes', description: 'Ver entradas y salidas', icon: <ClipboardList size={24} /> },
    { id: 'daily-operations', title: 'Checklist Diaria', description: 'Tareas y operaciones del día', icon: <CheckCircle size={24} /> },
    { id: 'vacation-request', title: 'Solicitar Vacaciones', description: 'Nueva solicitud de vacaciones', icon: <Calendar size={24} /> },
    { id: 'vacations', title: 'Mis Vacaciones', description: 'Estado de solicitudes', icon: <Calendar size={24} /> },
    { id: 'uniform-request', title: 'Solicitar Uniformes', description: 'Vestuario y material', icon: <Shirt size={24} /> },
    { id: 'my-documents', title: 'Mis Documentos', description: 'Contratos y nóminas', icon: <FileText size={24} /> },
    { id: 'hr-contact', title: 'Contactar RRHH', description: 'Soporte y consultas', icon: <MessageCircle size={24} /> }
  ], []);

  if (!employee) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px',
            animation: 'spin 1s linear infinite'
          }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando información...</p>
        </div>
      </div>
    );
  }

  const renderSummary = () => (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header con gradiente */}
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 10px 40px rgba(5, 150, 105, 0.2)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '12px', 
            padding: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            🏪
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>
              Gestión del Centro
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '16px', opacity: 0.95 }}>
              Hola {employee.name?.split(' ')[0] || 'Empleado'}, bienvenido a tu panel de gestión
            </p>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas optimizado */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {actionCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveAction(card.id)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}
            onMouseEnter={(event) => {
              const target = event.currentTarget;
              target.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.15)';
              target.style.transform = 'translateY(-8px)';
              target.style.borderColor = '#10b981';
            }}
            onMouseLeave={(event) => {
              const target = event.currentTarget;
              target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              target.style.transform = 'translateY(0)';
              target.style.borderColor = '#e5e7eb';
            }}
          >
            {/* Icono con fondo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              color: '#059669',
              transition: 'all 0.3s ease'
            }}>
              {card.icon}
            </div>
            
            {/* Contenido */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                color: '#111827', 
                marginBottom: '6px',
                lineHeight: '1.4'
              }}>
                {card.title}
              </div>
              <div style={{ 
                color: '#6b7280', 
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {card.description}
              </div>
            </div>

            {/* Indicador de acción */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }} />
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
      case 'qr-scanner':
        return (
          <QRScanner
            onBack={() => setActiveAction('summary')}
          />
        );
      case 'mobile-timeclock':
        return (
          <EmployeeQRGenerator
            onBack={() => setActiveAction('summary')}
          />
        );
      case 'timeclock':
        return <TimeclockDashboard />;
      case 'daily-operations':
        return (
          <div>
            <button
              onClick={() => setActiveAction('summary')}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← Volver
            </button>
            
            <ChecklistCompleteSystem
              centerId={employee?.center_id?.toString() || '9'}
              centerName={getCenterName(Number(employee?.center_id) || 9)}
            />
          </div>
        );
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
              alert(`Solicitud enviada a Logística: ${payload.items.length} prendas por ${payload.reason}`);
              setActiveAction('summary');
            }}
          />
        );
      case 'my-documents':
        return (
          <DocumentManagement
            onBack={() => setActiveAction('summary')}
            currentEmployee={employee}
            isEmployee={true}
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
      <div style={{ 
        padding: '32px', 
        backgroundColor: '#f9fafb', 
        minHeight: '100vh' 
      }}>
        {renderSummary()}
      </div>
    ) 
    : (
      <div style={{ 
        padding: '32px', 
        backgroundColor: '#f9fafb', 
        minHeight: '100vh',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <button
          onClick={() => setActiveAction('summary')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            color: '#059669',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '24px',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0fdf4';
            e.currentTarget.style.transform = 'translateX(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          }}
        >
          <ArrowLeft size={20} /> Volver a mis gestiones
        </button>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}
        >
          {renderActionContent()}
        </div>
      </div>
    );
};

export default CenterManagement;
