import React from 'react';
import { TrendingUp, TrendingDown, Minus, Brain, AlertTriangle } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string; // Optional text for the trend (e.g. "+12%")
    prediction?: string;
    alert?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
    trendValue,
    prediction,
    alert
}) => {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: alert ? '2px solid #ef4444' : '1px solid #e5e7eb',
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {alert && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px'
                }}>
                    <AlertTriangle style={{ height: '20px', width: '20px', color: '#ef4444' }} />
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: `${color}20`, // 20% opacity
                    color: color
                }}>
                    <Icon style={{ height: '24px', width: '24px' }} />
                </div>

                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {trend === 'up' && <TrendingUp style={{ height: '16px', width: '16px', color: '#10b981' }} />}
                        {trend === 'down' && <TrendingDown style={{ height: '16px', width: '16px', color: '#ef4444' }} />}
                        {trend === 'stable' && <Minus style={{ height: '16px', width: '16px', color: '#6b7280' }} />}
                        {trendValue && (
                            <span style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'
                            }}>
                                {trendValue}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                {title}
            </h3>

            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                {value}
            </p>

            {subtitle && (
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: prediction ? '8px' : '0' }}>
                    {subtitle}
                </p>
            )}

            {prediction && (
                <div style={{
                    marginTop: 'auto',
                    padding: '8px 12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #0ea5e9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Brain style={{ height: '14px', width: '14px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            {prediction}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
