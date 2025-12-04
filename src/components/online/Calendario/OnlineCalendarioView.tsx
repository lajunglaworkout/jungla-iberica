
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Video, Image as ImageIcon, FileText, Trash2, ArrowLeft, Instagram } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { OnlineCalendarEvent, OnlineContent, ContentCategory } from '../../../types/online';

interface OnlineCalendarioViewProps {
    onBack: () => void;
}

export const OnlineCalendarioView: React.FC<OnlineCalendarioViewProps> = ({ onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<OnlineCalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [contentLibrary, setContentLibrary] = useState<OnlineContent[]>([]);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [editingEvent, setEditingEvent] = useState<OnlineCalendarEvent | null>(null);

    // Form states
    const [selectedContentId, setSelectedContentId] = useState<string>('');
    const [formPlatform, setFormPlatform] = useState('Instagram Feed');
    const [formProfile, setFormProfile] = useState('@lajunglaonline');
    const [formTime, setFormTime] = useState('10:00');
    const [formCaption, setFormCaption] = useState('');
    const [formStatus, setFormStatus] = useState<'scheduled' | 'published'>('scheduled');

    const PROFILES = ['@lajunglaonline', '@lajunglasevilla', '@lajunglajerez', '@lajunglapuerto'];
    const PLATFORMS = ['Instagram Feed', 'Instagram Reels', 'Instagram Stories', 'TikTok'];

    const CATEGORIES: { id: ContentCategory; color: string; bg: string }[] = [
        { id: 'exercise', color: '#16a34a', bg: '#dcfce7' },
        { id: 'community', color: '#2563eb', bg: '#dbeafe' },
        { id: 'viral', color: '#dc2626', bg: '#fee2e2' },
        { id: 'feedback', color: '#9333ea', bg: '#f3e8ff' }
    ];

    useEffect(() => {
        loadEvents();
        loadContentLibrary();
    }, [currentDate]);

    const loadEvents = async () => {
        setLoading(true);
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        try {
            const { data, error } = await supabase
                .from('online_calendar')
                .select('*, content: online_content(*)')
                .gte('scheduled_at', startOfMonth.toISOString())
                .lte('scheduled_at', endOfMonth.toISOString());

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadContentLibrary = async () => {
        try {
            const { data } = await supabase
                .from('online_content')
                .select('*')
                .order('created_at', { ascending: false });
            setContentLibrary(data || []);
        } catch (error) {
            console.error('Error loading content library:', error);
        }
    };

    const handleSaveEvent = async () => {
        if (!selectedDate || !selectedContentId) return;

        const scheduledAt = new Date(selectedDate);
        const [hours, minutes] = formTime.split(':');
        scheduledAt.setHours(parseInt(hours), parseInt(minutes));

        const payload = {
            content_id: selectedContentId,
            platform: formPlatform,
            profile: formProfile,
            scheduled_at: scheduledAt.toISOString(),
            caption: formCaption,
            status: formStatus
        };

        try {
            if (editingEvent) {
                const { error } = await supabase
                    .from('online_calendar')
                    .update(payload)
                    .eq('id', editingEvent.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('online_calendar')
                    .insert([payload]);
                if (error) throw error;
            }

            setShowModal(false);
            setEditingEvent(null);
            loadEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Error al guardar la publicación');
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('¿Eliminar esta publicación programada?')) return;
        try {
            await supabase.from('online_calendar').delete().eq('id', id);
            setEvents(events.filter(e => e.id !== id));
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const openAddModal = (date: Date) => {
        setSelectedDate(date);
        setEditingEvent(null);
        setSelectedContentId('');
        setFormCaption('');
        setFormStatus('scheduled');
        setShowModal(true);
    };

    const openEditModal = (event: OnlineCalendarEvent) => {
        setEditingEvent(event);
        setSelectedDate(new Date(event.scheduled_at));
        setSelectedContentId(event.content_id || '');
        setFormPlatform(event.platform);
        setFormProfile(event.profile || PROFILES[0]);
        setFormCaption(event.caption || '');
        setFormStatus(event.status as any);

        const date = new Date(event.scheduled_at);
        setFormTime(date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0'));

        setShowModal(true);
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        return { days, firstDay: adjustedFirstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDay = (day: number) => {
        return events.filter(e => {
            const date = new Date(e.scheduled_at);
            return date.getDate() === day;
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-violet-600" />
                        Calendario Editorial
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-semibold min-w-[150px] text-center">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
                    {blanksArray.map(i => (
                        <div key={'blank-' + i} className="bg-gray-50 min-h-[120px]"></div>
                    ))}

                    {daysArray.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isToday =
                            day === new Date().getDate() &&
                            currentDate.getMonth() === new Date().getMonth() &&
                            currentDate.getFullYear() === new Date().getFullYear();

                        return (
                            <div
                                key={day}
                                className={"bg-white min-h-[120px] p-2 hover:bg-gray-50 transition-colors cursor-pointer group relative " + (isToday ? 'bg-blue-50' : '')}
                                onClick={() => openAddModal(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={"text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full " + (isToday ? 'bg-blue-600 text-white' : 'text-gray-700')}>
                                        {day}
                                    </span>
                                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {dayEvents.map(event => {
                                        const category = event.content?.category;
                                        const style = CATEGORIES.find(c => c.id === category) || { bg: '#f3f4f6', color: '#374151' };

                                        return (
                                            <div
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                                                className="text-xs p-1.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                                                style={{ backgroundColor: style.bg, color: style.color, borderColor: style.color + '40' }}
                                            >
                                                {event.platform.includes('Instagram') ? <Instagram size={10} /> : <Video size={10} />}
                                                <span className="truncate font-medium">{event.content?.title || 'Sin contenido'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 justify-center text-sm text-gray-600">
                {CATEGORIES.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span>{cat.id === 'exercise' ? 'Ejercicio' : cat.id === 'community' ? 'Comunidad' : cat.id === 'viral' ? 'Viral' : 'Feedback'}</span>
                    </div>
                ))}
            </div>

            {/* Modal - ESTILO CRM ACADEMY */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }} className="animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                {editingEvent ? 'Editar Publicación' : 'Programar Publicación'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', backgroundColor: '#f9fafb' }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha y Hora</label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 px-3 py-2 bg-gray-100 rounded-md border border-gray-200 text-gray-600 font-medium">
                                            {selectedDate?.toLocaleDateString()}
                                        </div>
                                        <input
                                            type="time"
                                            value={formTime}
                                            onChange={e => setFormTime(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contenido</label>
                                    <select
                                        value={selectedContentId}
                                        onChange={e => setSelectedContentId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                    >
                                        <option value="">Seleccionar pieza de contenido...</option>
                                        {contentLibrary.map(content => (
                                            <option key={content.id} value={content.id}>
                                                {content.title} ({content.category || 'Sin cat.'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Plataforma</label>
                                        <select
                                            value={formPlatform}
                                            onChange={e => setFormPlatform(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                        >
                                            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Perfil</label>
                                        <select
                                            value={formProfile}
                                            onChange={e => setFormProfile(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                        >
                                            {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Caption / Texto</label>
                                    <textarea
                                        value={formCaption}
                                        onChange={e => setFormCaption(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                        placeholder="Texto de la publicación..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                                    <div className="flex gap-4 p-3 bg-white border border-gray-200 rounded-md">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formStatus === 'scheduled'}
                                                onChange={() => setFormStatus('scheduled')}
                                                className="text-violet-600 focus:ring-violet-500 h-4 w-4"
                                            />
                                            <span className="text-sm font-medium text-gray-700">⏰ Programado</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formStatus === 'published'}
                                                onChange={() => setFormStatus('published')}
                                                className="text-green-600 focus:ring-green-500 h-4 w-4"
                                            />
                                            <span className="text-sm font-medium text-gray-700">✅ Publicado</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f9fafb',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            {editingEvent ? (
                                <button
                                    onClick={() => handleDeleteEvent(editingEvent.id)}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: '#fee2e2', // Red-100
                                        color: '#b91c1c', // Red-700
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    className="hover:bg-red-200"
                                    title="Eliminar evento"
                                >
                                    <Trash2 size={20} />
                                </button>
                            ) : <div></div>}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                    className="hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveEvent}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#7c3aed', // Violet-600
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                    }}
                                    className="hover:bg-violet-700"
                                >
                                    {editingEvent ? 'Guardar Cambios' : 'Programar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
