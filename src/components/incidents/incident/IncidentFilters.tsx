// src/components/incidents/incident/IncidentFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';
import { type IncidentType } from './IncidentTypes';

interface Props {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  incidentTypes: IncidentType[];
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onTypeChange: (v: string) => void;
}

const inputStyle = {
  padding: '12px 16px',
  border: '2px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: '500' as const,
  backgroundColor: 'white',
  cursor: 'pointer',
  outline: 'none',
};

export const IncidentFilters: React.FC<Props> = ({
  searchTerm, statusFilter, typeFilter, incidentTypes,
  onSearchChange, onStatusChange, onTypeChange,
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
    <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
      <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
      <input
        type="text"
        placeholder="Buscar incidencias..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ ...inputStyle, paddingLeft: '40px', width: '100%', fontWeight: 'normal', cursor: 'text', transition: 'all 0.2s' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
    <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={inputStyle}>
      <option value="all">Todos los estados</option>
      <option value="pending">Pendiente</option>
      <option value="approved">Aprobado</option>
      <option value="rejected">Rechazado</option>
    </select>
    <select value={typeFilter} onChange={(e) => onTypeChange(e.target.value)} style={inputStyle}>
      <option value="all">Todos los tipos</option>
      {incidentTypes.map(type => (
        <option key={type.id} value={type.id.toString()}>{type.name}</option>
      ))}
    </select>
  </div>
);
