import React from 'react';
import { CenterLocal } from './ShiftTypes';

interface CenterSelectorProps {
  centers: CenterLocal[];
  selectedCenter: number;
  onSelectCenter: (centerId: number) => void;
}

const CenterSelector: React.FC<CenterSelectorProps> = ({ centers, selectedCenter, onSelectCenter }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <h3 style={{ margin: '0 0 15px 0', color: '#059669' }}>📍 Seleccionar Centro</h3>
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {centers.map(center => (
        <button
          key={center.id}
          onClick={() => onSelectCenter(center.id)}
          style={{
            padding: '12px 24px',
            backgroundColor: selectedCenter === center.id ? '#059669' : '#f3f4f6',
            color: selectedCenter === center.id ? 'white' : '#374151',
            border: selectedCenter === center.id ? '2px solid #059669' : '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: selectedCenter === center.id ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ marginRight: '8px', display: 'inline' }}>📍</span>
          {center.name}
        </button>
      ))}
    </div>
  </div>
);

export default CenterSelector;
