// src/components/hr/DailyOperations.tsx
import React from 'react';
import { useSession } from '../../contexts/SessionContext';
import EmployeeOperations from './EmployeeOperations';

const DailyOperations: React.FC = () => {
  const { employee } = useSession();

  if (!employee) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>No se pudo cargar la información del empleado</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Mi Operativa Diaria
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>
            Fichaje, check-lists y tareas del día
          </p>
        </div>
        
        <EmployeeOperations employee={employee as any} />
      </div>
    </div>
  );
};

export default DailyOperations;
