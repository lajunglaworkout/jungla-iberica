import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

// Collapsible Section Component
export const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ElementType;
    color: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, icon: Icon, color, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            marginBottom: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: color,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={20} />
                    <span style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.3px' }}>{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <div style={{
                maxHeight: isOpen ? '3000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out'
            }}>
                <div style={{ padding: '24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Form Field Component for consistent styling
export const FormField: React.FC<{
    label: string;
    required?: boolean;
    children: React.ReactNode;
    span?: number;
}> = ({ label, required, children, span = 1 }) => (
    <div style={{ gridColumn: `span ${span}` }}>
        <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {children}
    </div>
);

// Star Rating Component
export const StarRating: React.FC<{
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
    size?: number;
}> = ({ value, onChange, readOnly = false, size = 24 }) => {
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => !readOnly && onChange?.(star)}
                    disabled={readOnly}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: readOnly ? 'default' : 'pointer',
                        padding: 0
                    }}
                >
                    <Star
                        size={size}
                        fill={star <= value ? '#f59e0b' : 'transparent'}
                        color={star <= value ? '#f59e0b' : '#d1d5db'}
                    />
                </button>
            ))}
        </div>
    );
};

// Shared input styles
export const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s',
    outline: 'none'
};

export const selectStyle: React.CSSProperties = {
    ...inputStyle,
    backgroundColor: 'white',
    cursor: 'pointer'
};
