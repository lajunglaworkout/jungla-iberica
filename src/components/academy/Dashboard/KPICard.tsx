import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    color = '#CDDC39' // Academy Primary
}) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {trend && (
                    <p className={`text-xs font-medium mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trend}
                    </p>
                )}
            </div>
            <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${color}20` }}
            >
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
        </div>
    );
};
