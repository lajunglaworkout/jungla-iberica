import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  label: string;
  current: number;
  previous: number;
  unit?: string;
}

interface TrendsChartProps {
  data: TrendData[];
  title: string;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, title }) => {
  const getTrendIcon = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 2) return <Minus size={16} style={{ color: '#6b7280' }} />;
    return change > 0 ? 
      <TrendingUp size={16} style={{ color: '#10b981' }} /> : 
      <TrendingDown size={16} style={{ color: '#ef4444' }} />;
  };

  const getTrendColor = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 2) return '#6b7280';
    return change > 0 ? '#10b981' : '#ef4444';
  };

  const getTrendPercentage = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return Math.abs(change).toFixed(1);
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#059669' }}>{title}</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            padding: '16px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              {item.label}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                {item.unit === '%' ? Math.round(item.current) : item.current}{item.unit || ''}
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                color: getTrendColor(item.current, item.previous),
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {getTrendIcon(item.current, item.previous)}
                {getTrendPercentage(item.current, item.previous)}%
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              vs. período anterior: {item.previous}{item.unit || ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendsChart;
