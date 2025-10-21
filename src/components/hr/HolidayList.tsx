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

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
        📅 Festivos del Año
      </h2>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {holidays.map(holiday => {
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
