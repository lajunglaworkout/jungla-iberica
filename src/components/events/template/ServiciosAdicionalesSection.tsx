import React from 'react';
import { MapPin } from 'lucide-react';
import { CollapsibleSection, inputStyle } from './SharedComponents';

export const ServiciosAdicionalesSection: React.FC = () => {
    return (
        <CollapsibleSection title="SERVICIOS ADICIONALES" icon={MapPin} color="#059669" defaultOpen={false}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Tipo</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Empresa</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Localización</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: '120px' }}>Coste (€)</th>
                    </tr>
                </thead>
                <tbody>
                    {['Alojamiento', 'Restaurante', 'Transporte', 'Otro'].map((tipo, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 500, color: '#374151' }}>{tipo}</td>
                            <td style={{ padding: '8px' }}>
                                <input type="text" style={{ ...inputStyle, padding: '10px 12px' }} placeholder="Empresa..." />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input type="text" style={{ ...inputStyle, padding: '10px 12px' }} placeholder="Localización..." />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input type="number" style={{ ...inputStyle, padding: '10px 12px' }} placeholder="0" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </CollapsibleSection>
    );
};
