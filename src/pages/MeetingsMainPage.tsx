import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getUserAccessibleDepartments } from '../config/departmentPermissions';
import MeetingsDepartmentView from '../components/meetings/MeetingsDepartmentView';

interface MeetingsMainPageProps {
  onBack?: () => void;
  userEmail?: string;
  userName?: string;
}

export const MeetingsMainPage: React.FC<MeetingsMainPageProps> = ({
  onBack,
  userEmail = 'carlossuarezparra@gmail.com',
  userName = 'Carlos Suárez'
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [accessibleDepartments, setAccessibleDepartments] = useState<any[]>([]);

  useEffect(() => {
    const departments = getUserAccessibleDepartments(userEmail);
    setAccessibleDepartments(departments);
  }, [userEmail]);

  if (selectedDepartment) {
    return (
      <MeetingsDepartmentView
        departmentId={selectedDepartment}
        userEmail={userEmail}
        userName={userName}
        onBack={() => setSelectedDepartment(null)}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <ArrowLeft size={24} color="#374151" />
          </button>
        )}
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            📅 Reuniones
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '8px 0 0 0'
          }}>
            Bienvenido, {userName}
          </p>
        </div>
      </div>

      {/* Grid de Departamentos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {accessibleDepartments.map(department => {
          const IconComponent = department.icon;
          return (
            <button
              key={department.id}
              onClick={() => setSelectedDepartment(department.id)}
              style={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'center'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: department.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <IconComponent size={32} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 8px 0'
                }}>
                  {department.name}
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {department.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {accessibleDepartments.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '16px' }}>
            No tienes acceso a ningún departamento
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingsMainPage;
