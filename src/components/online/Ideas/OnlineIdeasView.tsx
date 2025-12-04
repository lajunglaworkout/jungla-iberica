import React from 'react';

interface OnlineIdeasViewProps {
    onBack: () => void;
}

export const OnlineIdeasView: React.FC<OnlineIdeasViewProps> = ({ onBack }) => {
    return (
        <div className="p-8">
            <button onClick={onBack} className="mb-4 text-blue-500">Back</button>
            <h1>Ideas View (Coming Soon)</h1>
        </div>
    );
};
