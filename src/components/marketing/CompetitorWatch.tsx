import React, { useEffect, useState } from 'react';
import {
    TrendingUp, Users, ArrowUpRight, ArrowDownRight,
    Search, Shield, AlertCircle
} from 'lucide-react';
import { marketingService, Competitor } from '../../services/marketingService';

const CompetitorWatch: React.FC = () => {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCompetitors();
    }, []);

    const loadCompetitors = async () => {
        try {
            const data = await marketingService.getCompetitors();
            setCompetitors(data);
        } catch (error) {
            console.error('Error loading competitors:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield className="w-32 h-32" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">Radar de Competencia</h2>
                    <p className="text-slate-300 text-lg mb-8">
                        Monitorea a tus rivales directos. Analiza sus estrategias ganadoras y detecta oportunidades de mercado antes que nadie.
                    </p>

                    <div className="flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Añadir competidor (ej: @mcfit_es)"
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                            Rastrear
                        </button>
                    </div>
                </div>
            </div>

            {/* Competitors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competitors.map((comp) => (
                    <div key={comp.username} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                                    {comp.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">@{comp.username}</h3>
                                    <span className="text-xs text-gray-500">Competidor Directo</span>
                                </div>
                            </div>
                            <div className={`flex items-center px-2 py-1 rounded-lg text-sm font-medium ${comp.growth_rate > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {comp.growth_rate > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                                {Math.abs(comp.growth_rate)}%
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-medium">Seguidores</span>
                                </div>
                                <span className="font-bold text-gray-900">
                                    {(comp.followers / 1000).toFixed(1)}k
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm font-medium">Engagement</span>
                                </div>
                                <span className="font-bold text-gray-900">
                                    {comp.engagement_rate}%
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">
                                    Estrategia Detectada
                                </p>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                                    <p className="text-sm text-gray-700">
                                        Está priorizando <span className="font-bold text-blue-600">{comp.top_content_type}</span> con alta frecuencia de publicación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompetitorWatch;
