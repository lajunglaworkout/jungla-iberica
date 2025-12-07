import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
    localizacion?: string;
    estado: string;
}

interface EventCalendarProps {
    onSelectEvent: (eventId: number) => void;
    onBack: () => void;
}

const estadoColors: { [key: string]: string } = {
    planificacion: '#3b82f6',
    confirmado: '#16a34a',
    en_ejecucion: '#f59e0b',
    finalizado: '#6b7280',
    cancelado: '#ef4444'
};

export const EventCalendar: React.FC<EventCalendarProps> = ({ onSelectEvent, onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEventos();
    }, [currentDate]);

    const loadEventos = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
            const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('eventos')
                .select('id, nombre, fecha_evento, localizacion, estado')
                .gte('fecha_evento', firstDay)
                .lte('fecha_evento', lastDay)
                .order('fecha_evento');

            if (error) throw error;
            setEventos(data || []);
        } catch (error) {
            console.error('Error loading eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Lunes = 0
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOfMonth(year, month);

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const getEventosForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return eventos.filter(e => e.fecha_evento === dateStr);
    };

    const days = [];
    for (let i = 0; i < firstDayOffset; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Calendario de Eventos
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1))}
                        style={{ padding: '10px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: 600, minWidth: '180px', textAlign: 'center' }}>
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1))}
                        style={{ padding: '10px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {/* Weekday Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                        <div key={day} style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#6b7280', backgroundColor: '#f9fafb', fontSize: '14px' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {days.map((day, idx) => {
                        const dayEventos = day ? getEventosForDay(day) : [];
                        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                        return (
                            <div
                                key={idx}
                                style={{
                                    minHeight: '100px',
                                    padding: '8px',
                                    backgroundColor: day ? 'white' : '#f9fafb',
                                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid #f3f4f6' : 'none',
                                    borderBottom: '1px solid #f3f4f6'
                                }}
                            >
                                {day && (
                                    <>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            backgroundColor: isToday ? '#10b981' : 'transparent',
                                            color: isToday ? 'white' : '#374151',
                                            fontWeight: isToday ? 600 : 400,
                                            fontSize: '14px',
                                            marginBottom: '4px'
                                        }}>
                                            {day}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {dayEventos.map(evento => (
                                                <button
                                                    key={evento.id}
                                                    onClick={() => onSelectEvent(evento.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: estadoColors[evento.estado] || '#6b7280',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    title={evento.nombre}
                                                >
                                                    {evento.nombre}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                {Object.entries({ 'Planificación': '#3b82f6', 'Confirmado': '#16a34a', 'En Ejecución': '#f59e0b', 'Finalizado': '#6b7280', 'Cancelado': '#ef4444' }).map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color }} />
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventCalendar;
