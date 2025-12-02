import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface NavigationCardProps {
    title: string;
    icon: LucideIcon;
    metric: string;
    subtext: string;
    onClick: () => void;
    color?: string;
    status?: 'active' | 'warning' | 'neutral';
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
    title,
    icon: Icon,
    metric,
    subtext,
    onClick,
    color = '#CDDC39',
    status = 'neutral'
}) => {
    return (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 transform hover:scale-[1.02] text-left w-full group relative overflow-hidden"
        >
            <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: color }}
            />

            <div className="flex justify-between items-start mb-4">
                <div
                    className="p-3 rounded-lg transition-colors group-hover:bg-opacity-20"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon className="w-8 h-8" style={{ color }} />
                </div>
                {status !== 'neutral' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {status === 'active' ? 'Activo' : 'Pendiente'}
                    </span>
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                {title}
            </h3>

            <div className="flex items-end justify-between mt-4">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{metric}</p>
                    <p className="text-sm text-gray-500">{subtext}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors transform group-hover:translate-x-1" />
            </div>
        </button>
    );
};
