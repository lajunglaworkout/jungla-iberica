import React, { useState, useEffect } from 'react';
import { Calendar, User, Eye, ChevronRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import maintenanceService from '../../services/maintenanceService';

interface InspectionHistoryProps {
    centerId: string;
    onViewInspection: (inspectionId: string) => void;
}

const InspectionHistory: React.FC<InspectionHistoryProps> = ({ centerId, onViewInspection }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [centerId]);

    const loadHistory = async () => {
        setLoading(true);
        const response = await maintenanceService.getCenterInspectionHistory(centerId);
        if (response.success && response.data) {
            setHistory(response.data);
        }
        setLoading(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando historial...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay inspecciones previas</h3>
                <p className="text-gray-500 mt-2">Este centro aún no ha realizado ninguna inspección de mantenimiento.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Historial de Inspecciones</h3>
                    <p className="text-sm text-gray-500">Registro completo de evaluaciones realizadas</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                    Total: {history.length} inspecciones
                </div>
            </div>

            <div className="grid gap-4">
                {history.map((inspection) => (
                    <div
                        key={inspection.id}
                        className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden"
                        onClick={() => onViewInspection(inspection.id)}
                    >
                        {/* Hover accent line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-200 ${inspection.overall_score >= 80 ? 'bg-green-500' :
                                inspection.overall_score >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                            }`}></div>

                        <div className="flex items-center justify-between pl-4">
                            <div className="flex items-center space-x-5">
                                {/* Score Badge */}
                                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${inspection.overall_score >= 80 ? 'border-green-100 bg-green-50 text-green-700' :
                                        inspection.overall_score >= 60 ? 'border-yellow-100 bg-yellow-50 text-yellow-700' :
                                            'border-red-100 bg-red-50 text-red-700'
                                    }`}>
                                    <span className="text-2xl font-bold leading-none">{inspection.overall_score}</span>
                                    <span className="text-[10px] font-semibold uppercase mt-1">Puntos</span>
                                </div>

                                <div>
                                    <div className="flex items-center text-gray-900 font-bold text-lg mb-1">
                                        {new Date(inspection.inspection_date).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }).replace(/^\w/, (c) => c.toUpperCase())}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1.5 text-gray-400" />
                                            {inspection.inspector_name || 'Inspector no registrado'}
                                        </div>
                                        <div className="flex items-center text-gray-400">
                                            <Clock className="w-4 h-4 mr-1.5" />
                                            {new Date(inspection.inspection_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8">
                                {/* Stats Pills */}
                                <div className="flex space-x-3">
                                    <div className="flex flex-col items-center px-3 py-1 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Bien</span>
                                        <div className="flex items-center text-green-600 font-bold">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {inspection.items_ok}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center px-3 py-1 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Regular</span>
                                        <div className="flex items-center text-yellow-600 font-bold">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            {inspection.items_regular}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center px-3 py-1 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Mal</span>
                                        <div className="flex items-center text-red-600 font-bold">
                                            <XCircle className="w-3 h-3 mr-1" />
                                            {inspection.items_bad}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InspectionHistory;
