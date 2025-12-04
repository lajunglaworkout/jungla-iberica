import React from 'react';

interface OnlineFacturacionViewProps {
    onBack: () => void;
}

export const OnlineFacturacionView: React.FC<OnlineFacturacionViewProps> = ({ onBack }) => {
    return (
        <div className="p-8">
            <button onClick={onBack} className="mb-4 text-blue-500">Back</button>
            <h1>Facturación View (Coming Soon)</h1>
        </div>
    );
};
