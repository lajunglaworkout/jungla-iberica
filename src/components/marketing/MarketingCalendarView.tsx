import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Publication, CATEGORIAS, FILMMAKERS } from './MarketingConfig';

interface Props {
  publications: Publication[];
  onViewPublication: (pub: Publication) => void;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MarketingCalendarView: React.FC<Props> = ({ publications, onViewPublication }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(day);
    return days;
  };

  const getPublicationsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return publications.filter(pub => pub.fecha_limite === dateStr);
  };

  const getDayColor = (day: number) => {
    const dayPubs = getPublicationsForDate(day);
    if (dayPubs.length === 0) return 'transparent';
    if (dayPubs.some(p => p.prioridad === 'urgente')) return '#fee2e2';
    if (dayPubs.some(p => p.prioridad === 'alta')) return '#fed7aa';
    if (dayPubs.some(p => p.estado === 'pendiente')) return '#fef3c7';
    return '#dcfce7';
  };

  const days = generateCalendarDays();

  return (
    <div>
      {/* Header del calendario */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            📅 Calendario de Publicaciones
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}>
              ←
            </button>
            <h3 style={{ fontSize: '18px', color: '#111827', margin: 0, minWidth: '200px', textAlign: 'center' }}>
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}>
              →
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { color: '#fee2e2', label: 'Urgente' }, { color: '#fed7aa', label: 'Alta' },
            { color: '#fef3c7', label: 'Pendiente' }, { color: '#dcfce7', label: 'Completado' }
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '3px' }}></div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '2fr 1fr' : '1fr', gap: '24px' }}>
        {/* Calendario */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          {/* Días de la semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {DAY_NAMES.map(dayName => (
              <div key={dayName} style={{ textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                {dayName}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {days.map((day, index) => {
              if (day === null) return <div key={index} style={{ height: '80px' }}></div>;
              const dayPublications = getPublicationsForDate(day);
              const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  style={{
                    height: '80px', border: `2px solid ${isToday ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px', backgroundColor: getDayColor(day), cursor: 'pointer',
                    padding: '8px', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: isToday ? '700' : '500', color: isToday ? '#3b82f6' : '#111827' }}>
                    {day}
                  </span>
                  {dayPublications.length > 0 && (
                    <div style={{
                      position: 'absolute', bottom: '4px', right: '4px',
                      backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: '600'
                    }}>
                      {dayPublications.length}
                    </div>
                  )}
                  {dayPublications.slice(0, 2).map((pub, idx) => (
                    <div key={idx} style={{
                      fontSize: '10px', color: '#6b7280', backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      padding: '2px 4px', borderRadius: '3px', marginTop: '2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {pub.titulo.slice(0, 15)}...
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral de detalles */}
        {selectedDate && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>

            {(() => {
              const dayPublications = publications.filter(pub => pub.fecha_limite === selectedDate);
              if (dayPublications.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <Calendar style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No hay publicaciones para este día</p>
                  </div>
                );
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dayPublications.map(pub => {
                    const categoria = CATEGORIAS.find(c => c.value === pub.categoria);
                    const filmmaker = FILMMAKERS.find(f => f.id === pub.filmmaker_asignado);
                    return (
                      <div key={pub.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{categoria?.icon}</span>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>{pub.titulo}</h4>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                          {categoria?.label} • {pub.categoria_publicacion}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '500',
                            backgroundColor: pub.prioridad === 'urgente' ? '#fee2e2' : pub.prioridad === 'alta' ? '#fed7aa' : pub.prioridad === 'media' ? '#fef3c7' : '#f3f4f6',
                            color: pub.prioridad === 'urgente' ? '#dc2626' : pub.prioridad === 'alta' ? '#ea580c' : pub.prioridad === 'media' ? '#d97706' : '#6b7280'
                          }}>
                            {pub.prioridad}
                          </span>
                          <span style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '500', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                            {pub.estado.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>👤 {filmmaker?.name}</div>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => onViewPublication(pub)} style={{ padding: '4px 8px', fontSize: '10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
                            Ver detalles
                          </button>
                          <a href={pub.enlace_drive} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '4px 8px', fontSize: '10px', border: '1px solid #3b82f6', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none' }}>
                            Drive
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingCalendarView;
