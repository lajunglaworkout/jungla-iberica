import React, { useState, useEffect } from 'react';
import { X, BarChart2, Clock, MessageSquare, TrendingUp, Brain, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CXAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Stats {
    total: number;
    pending: number;
    responded: number;
    avgResponseHours: number | null;
    intentCounts: Record<string, number>;
    trainingExamples: number;
    avgConfidence: number | null;
    messagesByDay: { date: string; count: number }[];
}

export const CXAnalyticsModal: React.FC<CXAnalyticsModalProps> = ({ isOpen, onClose }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadStats();
        }
    }, [isOpen]);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Cargar mensajes
            const { data: messages } = await supabase
                .from('inbox_messages')
                .select('status, created_at, reply_sent_at, agent_proposal');

            // Cargar ejemplos de entrenamiento
            const { count: trainingCount } = await supabase
                .from('dataset_attcliente')
                .select('*', { count: 'exact', head: true });

            if (messages) {
                const total = messages.length;
                const pending = messages.filter(m => m.status === 'new').length;
                const responded = messages.filter(m => m.status === 'responded').length;

                // Tiempo promedio de respuesta
                const responseTimes = messages
                    .filter(m => m.reply_sent_at && m.created_at)
                    .map(m => {
                        const created = new Date(m.created_at).getTime();
                        const replied = new Date(m.reply_sent_at).getTime();
                        return (replied - created) / (1000 * 60 * 60); // horas
                    });
                const avgResponseHours = responseTimes.length > 0
                    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                    : null;

                // Conteo por intent
                const intentCounts: Record<string, number> = {};
                messages.forEach(m => {
                    const intent = m.agent_proposal?.intent || 'unknown';
                    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
                });

                // Confianza promedio
                const confidences = messages
                    .filter(m => m.agent_proposal?.confidence)
                    .map(m => m.agent_proposal.confidence);
                const avgConfidence = confidences.length > 0
                    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
                    : null;

                // Mensajes por día (últimos 7 días)
                const dayMap: Record<string, number> = {};
                messages.forEach(m => {
                    const day = new Date(m.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                    dayMap[day] = (dayMap[day] || 0) + 1;
                });
                const messagesByDay = Object.entries(dayMap)
                    .map(([date, count]) => ({ date, count }))
                    .slice(-7);

                setStats({
                    total,
                    pending,
                    responded,
                    avgResponseHours,
                    intentCounts,
                    trainingExamples: trainingCount || 0,
                    avgConfidence,
                    messagesByDay
                });
            }
        } catch (err) {
            console.error('Error loading CX stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const intentLabels: Record<string, string> = {
        billing: '💳 Facturación',
        schedule: '📅 Horarios',
        complaint: '😔 Quejas',
        info_request: 'ℹ️ Información',
        greeting: '👋 Saludos',
        general: '💬 General',
        unknown: '❓ Sin clasificar'
    };

    const intentColors: Record<string, string> = {
        billing: '#f59e0b',
        schedule: '#3b82f6',
        complaint: '#ef4444',
        info_request: '#8b5cf6',
        greeting: '#10b981',
        general: '#6b7280',
        unknown: '#9ca3af'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px 16px 0 0',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <BarChart2 size={24} />
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                            Analytics CX - Atención al Cliente
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Cargando estadísticas...
                        </div>
                    ) : stats ? (
                        <>
                            {/* KPI Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                <KPICard
                                    icon={<MessageSquare size={20} />}
                                    label="Total Mensajes"
                                    value={stats.total.toString()}
                                    color="#3b82f6"
                                />
                                <KPICard
                                    icon={<Clock size={20} />}
                                    label="Pendientes"
                                    value={stats.pending.toString()}
                                    color="#f59e0b"
                                    subtitle={`${((stats.pending / stats.total) * 100).toFixed(0)}%`}
                                />
                                <KPICard
                                    icon={<Users size={20} />}
                                    label="Respondidos"
                                    value={stats.responded.toString()}
                                    color="#10b981"
                                    subtitle={`${((stats.responded / stats.total) * 100).toFixed(0)}%`}
                                />
                                <KPICard
                                    icon={<TrendingUp size={20} />}
                                    label="Tiempo Respuesta"
                                    value={stats.avgResponseHours ? `${stats.avgResponseHours.toFixed(1)}h` : 'N/A'}
                                    color="#8b5cf6"
                                />
                                <KPICard
                                    icon={<Brain size={20} />}
                                    label="Ejemplos IA"
                                    value={stats.trainingExamples.toString()}
                                    color="#ec4899"
                                    subtitle="Dataset"
                                />
                            </div>

                            {/* Intent Distribution */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                                    📊 Distribución por Tema
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {Object.entries(stats.intentCounts)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([intent, count]) => (
                                            <div key={intent} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ width: '140px', fontSize: '14px' }}>
                                                    {intentLabels[intent] || intent}
                                                </span>
                                                <div style={{
                                                    flex: 1,
                                                    height: '24px',
                                                    backgroundColor: '#e5e7eb',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${(count / stats.total) * 100}%`,
                                                        height: '100%',
                                                        backgroundColor: intentColors[intent] || '#6b7280',
                                                        borderRadius: '12px',
                                                        transition: 'width 0.5s ease'
                                                    }} />
                                                </div>
                                                <span style={{
                                                    width: '50px',
                                                    textAlign: 'right',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#374151'
                                                }}>
                                                    {count}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* IA Confidence */}
                            {stats.avgConfidence && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    border: '1px solid #86efac'
                                }}>
                                    <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: '#166534' }}>
                                        🧠 Confianza del Agente IA
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#15803d' }}>
                                        {(stats.avgConfidence * 100).toFixed(0)}%
                                    </p>
                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#166534' }}>
                                        Promedio de confianza en propuestas generadas
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            No hay datos disponibles
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// KPI Card Component
const KPICard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    subtitle?: string;
}> = ({ icon, label, value, color, subtitle }) => (
    <div style={{
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ color }}>{icon}</div>
            <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 500 }}>
                {label}
            </span>
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{value}</div>
        {subtitle && (
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{subtitle}</div>
        )}
    </div>
);

export default CXAnalyticsModal;
