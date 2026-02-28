import React from 'react';
import { DepartmentObjective } from './MeetingModalTypes';

interface ObjectivesSectionProps {
  departmentObjectives: DepartmentObjective[];
  objectiveValues: Record<string, string | number>;
  onSetObjectiveValues: (values: Record<string, string | number>) => void;
}

export const ObjectivesSection: React.FC<ObjectivesSectionProps> = ({
  departmentObjectives,
  objectiveValues,
  onSetObjectiveValues
}) => {
  return (
    <div style={{
      borderTop: '2px solid #e5e7eb',
      margin: '24px 0',
      paddingTop: '24px'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '8px'
      }}>
        🎯 Objetivos para la Próxima Reunión
      </h3>
      <p style={{
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '16px'
      }}>
        Define los valores objetivo que se revisarán en la siguiente reunión
      </p>

      {departmentObjectives.length === 0 ? (
        <div style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          No hay objetivos predefinidos para este departamento
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          {departmentObjectives.map((objective, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px'
              }}
            >
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e40af',
                display: 'block',
                marginBottom: '8px'
              }}>
                {objective.nombre}
                {objective.unidad && (
                  <span style={{ fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>
                    ({objective.unidad})
                  </span>
                )}
              </label>
              <input
                type={objective.tipo === 'texto' ? 'text' : 'number'}
                placeholder={objective.placeholder}
                value={objectiveValues[objective.nombre] || ''}
                onChange={async (e) => onSetObjectiveValues({
                  ...objectiveValues,
                  [objective.nombre]: objective.tipo === 'numero' || objective.tipo === 'porcentaje'
                    ? parseFloat(e.target.value) || 0
                    : e.target.value
                })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {objective.tipo === 'porcentaje' && (
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  Valor entre 0 y 100
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
