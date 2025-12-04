import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, Image as ImageIcon, Play, ArrowLeft } from 'lucide-react';

// ============ TYPES ============
interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    type: 'video' | 'carrusel' | 'reel' | 'story';
    status: 'pendiente' | 'grabado' | 'editado' | 'programado' | 'publicado';
    category: string;
}

// ============ MOCK DATA ============
const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: '1',
        title: 'Testimonio Cliente',
        date: '2025-12-15',
        type: 'video',
        status: 'grabado',
        category: 'clientes'
    },
    {
        id: '2',
        title: 'Tips Sentadilla',
        date: '2025-12-20',
        type: 'reel',
        status: 'pendiente',
        category: 'educativo'
    },
    {
        id: '3',
        title: 'Challenge Burpees',
        date: '2025-12-10',
        type: 'reel',
        status: 'editado',
        category: 'viral'
    }
];

const CATEGORY_COLORS: Record<string, string> = {
    clientes: '#2563eb',
    educativo: '#059669',
    humor: '#f59e0b',
    viral: '#dc2626',
    postureo: '#7c3aed',
    servicios: '#0891b2',
    colaboraciones: '#db2777'
};

interface MarketingCalendarioViewProps {
    onBack: () => void;
}

export const MarketingCalendarioView: React.FC<MarketingCalendarioViewProps> = ({ onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // Dec 2025

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        // Adjust for Monday start (0 = Sunday in JS, but we want 0 = Monday)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, firstDay: adjustedFirstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()} -${String(currentDate.getMonth() + 1).padStart(2, '0')} -${String(day).padStart(2, '0')} `;
        return MOCK_EVENTS.filter(e => e.date === dateStr);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-gray-200 border-b border-gray-200">
                    {/* Empty cells for previous month */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty - ${i} `} className="bg-gray-50/30" />
                    ))}

                    {/* Days of current month */}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const events = getEventsForDay(day);
                        const isToday =
                            day === new Date().getDate() &&
                            currentDate.getMonth() === new Date().getMonth() &&
                            currentDate.getFullYear() === new Date().getFullYear();

                        return (
                            <div key={day} className={`p - 2 relative group hover: bg - gray - 50 transition - colors ${isToday ? 'bg-emerald-50/30' : ''} `}>
                                <span className={`
inline - flex items - center justify - center w - 7 h - 7 rounded - full text - sm font - medium mb - 2
                  ${isToday ? 'bg-emerald-600 text-white' : 'text-gray-700'}
`}>
                                    {day}
                                </span>

                                <div className="space-y-1.5 overflow-y-auto max-h-[90px] custom-scrollbar">
                                    {events.map(event => (
                                        <div
                                            key={event.id}
                                            className="text-xs p-1.5 rounded border border-l-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow truncate"
                                            style={{ borderLeftColor: CATEGORY_COLORS[event.category] || '#9ca3af' }}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {event.type === 'video' ? <Video className="h-3 w-3 text-gray-400" /> :
                                                    event.type === 'reel' ? <Play className="h-3 w-3 text-gray-400" /> :
                                                        <ImageIcon className="h-3 w-3 text-gray-400" />}
                                                <span className="font-medium text-gray-900 truncate">{event.title}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Fill remaining cells to complete the grid if needed */}
                    {Array.from({ length: (7 - ((days + firstDay) % 7)) % 7 }).map((_, i) => (
                        <div key={`empty - end - ${i} `} className="bg-gray-50/30" />
                    ))}
                </div>
            </div>
        </div>
    );
};
