import React from 'react';
import { ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface NavigationCardProps {
    title: string;
    icon: React.ElementType;
    metric: string | number;
    subtext: string;
    onClick: () => void;
    color: string;
    status?: 'active' | 'warning' | 'neutral' | 'locked';
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
    title,
    icon: Icon,
    metric,
    subtext,
    onClick,
    color,
    status = 'active'
}) => {
    return (
        <button
            onClick={onClick}
            className="group relative w-full text-left transition-all duration-300 hover:-translate-y-1"
            style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
            }}
        >
            {/* Status Indicator Strip */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: color,
                    opacity: status === 'locked' ? 0.3 : 1
                }}
            />

            <div className="flex justify-between items-start mb-4 w-full">
                <div
                    style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: `${color}15`, // 15% opacity
                        color: color
                    }}
                >
                    <Icon style={{ height: '24px', width: '24px' }} />
                </div>

                <div className="flex items-center gap-2">
                    {status === 'active' && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Activo</span>}
                    {status === 'warning' && <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Atención</span>}
                    {status === 'neutral' && <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-full">Info</span>}
                    {status === 'locked' && <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Bloqueado</span>}
                </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                {title}
            </h3>

            <div className="mt-auto">
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                    {metric}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {subtext}
                </p>
            </div>

            {/* Hover Arrow */}
            <div
                className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            >
                <ChevronRight style={{ height: '20px', width: '20px', color: '#9ca3af' }} />
            </div>
        </button>
    );
};
