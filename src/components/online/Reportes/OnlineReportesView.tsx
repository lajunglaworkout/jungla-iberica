import React from 'react';

interface OnlineReportesViewProps {
    onBack: () => void;
}

export const OnlineReportesView: React.FC<OnlineReportesViewProps> = ({ onBack }) => {
    return (
        <div className="p-8">
            <button onClick={onBack} className="mb-4 text-blue-500">Back</button>
            <h1>Reportes View (Coming Soon)</h1>
        </div>
    );
};
