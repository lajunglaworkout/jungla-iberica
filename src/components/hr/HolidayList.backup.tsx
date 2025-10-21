// src/components/hr/HolidayList.tsx - Lista de Festivos
import React, { useState } from 'react';
import { Calendar, Plus, Trash2, X } from 'lucide-react';
import { Holiday, holidayService } from '../../services/holidayService';

interface HolidayListProps {
  holidays: Holiday[];
  selectedCenter: number | null;
  onRefresh?: () => void;
}

const HolidayList: React.FC<HolidayListProps> = ({ holidays, selectedCenter, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    type: 'local' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Añadir festivo local
  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date || !selectedCenter) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Verificar si ya existe un festivo en esa fecha
    const existingHoliday = holidays.find(h => h.date === newHoliday.date);
    if (existingHoliday) {
      alert(`Ya existe un festivo en esta fecha: ${existingHoliday.name}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await holidayService.createHoliday({
        name: newHoliday.name,
        date: newHoliday.date,
        type: 'local',
        center_id: selectedCenter.toString(),
        is_active: true
      });

      alert('✅ Festivo local añadido correctamente');
      setShowAddModal(false);
      setNewHoliday({ name: '', date: '', type: 'local' });
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error añadiendo festivo:', error);
      alert('❌ Error al añadir festivo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar festivo (solo locales)
  const handleDeleteHoliday = async (holiday: Holiday) => {
    if (holiday.type !== 'local') {
      alert('⚠️ Solo se pueden eliminar festivos locales');
      return;
    }

    if (!confirm(`¿Eliminar el festivo "${holiday.name}"?`)) {
      return;
    }

    if (!holiday.id) {
      alert('❌ Error: ID de festivo no válido');
      return;
    }

    try {
      await holidayService.deleteHoliday(holiday.id);
      alert('✅ Festivo eliminado correctamente');
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error eliminando festivo:', error);
      alert('❌ Error al eliminar festivo');
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
        >
          <Plus size={16} />
          Añadir Festivo Local
        </button>
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
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ flex: 1 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                
                {holiday.type === 'local' && (
                  <button
                    onClick={() => handleDeleteHoliday(holiday)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    title="Eliminar festivo local"
                  >
                    <Trash2 size={16} color="#dc2626" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HolidayList;
