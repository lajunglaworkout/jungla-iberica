// src/components/hr/HolidayList.tsx - Lista de Festivos
import React from 'react';
import { Calendar } from 'lucide-react';
import { Holiday } from '../../services/holidayService';

interface HolidayListProps {
  holidays: Holiday[];
}

const HolidayList: React.FC<HolidayListProps> = ({ holidays }) => {
  const getBadge = (type: string) => {
    const styles = {
      national: { bg: '#fee2e2', color: '#991b1b', label: '🇪🇸 Nacional' },
      regional: { bg: '#fef3c7', color: '#92400e', label: '🏛️ Regional' },
      local: { bg: '#dbeafe', color: '#1e40af', label: '🏪 Local' }
    };
    return styles[type as keyof typeof styles] || styles.local;
  };

  // Filtrar solo festivos del año actual y eliminar duplicados
  const currentYear = new Date().getFullYear();
  const uniqueHolidays = holidays
    .filter(h => h.date.startsWith(currentYear.toString()))
    .reduce((acc, current) => {
      // Eliminar duplicados por fecha y nombre
      const exists = acc.find(h => h.date === current.date && h.name === current.name);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as Holiday[])
    .sort((a, b) => a.date.localeCompare(b.date)); // Ordenar por fecha

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
          📅 Festivos {currentYear}
        </h2>
        <span style={{ 
          fontSize: '14px', 
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          padding: '6px 12px',
          borderRadius: '6px',
          fontWeight: '500'
        }}>
          {uniqueHolidays.length} festivos
        </span>
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {uniqueHolidays.map(holiday => {
          const badge = getBadge(holiday.type);
          return (
            <div key={holiday.id} style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              border: '2px solid #fca5a5',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                  {holiday.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  📅 {new Date(holiday.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </div>
              <span style={{
                padding: '6px 12px',
                backgroundColor: badge.bg,
                color: badge.color,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HolidayList;
