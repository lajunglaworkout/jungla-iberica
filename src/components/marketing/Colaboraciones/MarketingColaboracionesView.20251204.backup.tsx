import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface MarketingColaboracionesViewProps {
    onBack: () => void;
}

export const MarketingColaboracionesView: React.FC<MarketingColaboracionesViewProps> = ({ onBack }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">Colaboraciones y Patrocinios</h2>
            </div>
            <p className="text-gray-500 text-center py-12">Próximamente: Registro de atletas y acuerdos comerciales.</p>
        </div>
    );
};

