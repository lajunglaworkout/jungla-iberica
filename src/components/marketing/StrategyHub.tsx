import React, { useState } from 'react';
import {
    Target, Sparkles, Calendar, ArrowRight, Lightbulb,
    CheckCircle2, TrendingUp, Zap
} from 'lucide-react';
import { marketingService, ContentIdea } from '../../services/marketingService';

const StrategyHub: React.FC = () => {
    const [goal, setGoal] = useState('growth');
    const [ideas, setIdeas] = useState<ContentIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const generateIdeas = async () => {
        console.log("🚀 Generating ideas started...");
        setLoading(true);
        setError(null);
        try {
            // 1. Try to get real data context
            const token = localStorage.getItem('ig_access_token');
            console.log("🔑 Token found:", !!token);

            let profileData = undefined;
            let postsData = undefined;

            if (token) {
                try {
                    console.log("📡 Fetching context data...");
                    // Parallel fetch for speed
                    const [p, posts] = await Promise.all([
                        marketingService.getRealProfile(token),
                        marketingService.getRealPosts(token)
                    ]);
                    profileData = p;
                    postsData = posts;
                    console.log("✅ Context data fetched:", { profile: !!profileData, posts: postsData?.length });
                } catch (e) {
                    console.warn("⚠️ Could not fetch context for AI:", e);
                }
            }

            // 2. Generate ideas with context
            console.log("🤖 Calling AI service with goal:", goal);
            const newIdeas = await marketingService.getAIContentIdeas(goal, profileData, postsData);
            console.log("✨ AI Response:", newIdeas);

            if (!newIdeas || newIdeas.length === 0) {
                throw new Error("La IA no devolvió ninguna idea.");
            }

            setIdeas(newIdeas);
            setGenerated(true);
        } catch (error: any) {
            console.error('❌ Error generating ideas:', error);
            setError(error.message || "Error al generar ideas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Goal Setting Section */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">Objetivo Mensual</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-colors border border-transparent hover:border-white/30">
                            <input
                                type="radio"
                                name="goal"
                                value="growth"
                                checked={goal === 'growth'}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-4 h-4 text-green-500 focus:ring-green-500"
                            />
                            <div>
                                <span className="block font-medium">Crecimiento Agresivo</span>
                                <span className="text-xs text-green-200">Priorizar Reels y Viralidad</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-colors border border-transparent hover:border-white/30">
                            <input
                                type="radio"
                                name="goal"
                                value="community"
                                checked={goal === 'community'}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-4 h-4 text-green-500 focus:ring-green-500"
                            />
                            <div>
                                <span className="block font-medium">Fidelización</span>
                                <span className="text-xs text-green-200">Priorizar Stories y Carruseles</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-colors border border-transparent hover:border-white/30">
                            <input
                                type="radio"
                                name="goal"
                                value="sales"
                                checked={goal === 'sales'}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-4 h-4 text-green-500 focus:ring-green-500"
                            />
                            <div>
                                <span className="block font-medium">Conversión / Ventas</span>
                                <span className="text-xs text-green-200">Priorizar Llamadas a la Acción</span>
                            </div>
                        </label>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-sm text-white">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        onClick={generateIdeas}
                        disabled={loading}
                        className="w-full mt-6 bg-white text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generar Estrategia IA
                            </>
                        )}
                    </button>
                </div>

                {/* Best Time to Post */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 text-gray-900">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <h3 className="font-bold">Mejores Horas</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Lunes</span>
                            <span className="font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded">18:00 - 21:00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Miércoles</span>
                            <span className="font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded">07:00 - 09:00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Domingo</span>
                            <span className="font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded">20:00 - 22:00</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Suggestions Section */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] p-6">
                    {!generated ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="bg-green-50 p-6 rounded-full mb-6">
                                <Lightbulb className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Tu Asistente Creativo
                            </h3>
                            <p className="text-gray-500 max-w-md">
                                Selecciona un objetivo y deja que nuestra IA analice las tendencias actuales para sugerirte contenido de alto impacto.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                Ideas Sugeridas para Ti
                            </h3>

                            <div className="space-y-4">
                                {ideas.map((idea) => (
                                    <div key={idea.id} className="group border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all bg-white">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                          ${idea.type === 'reel' ? 'bg-pink-50 text-pink-600' :
                                                        idea.type === 'carousel' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                    {idea.type}
                                                </span>
                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium
                          ${idea.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
                                                        idea.difficulty === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                                    {idea.difficulty}
                                                </span>
                                            </div>
                                            <button className="text-gray-400 hover:text-green-600 transition-colors">
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                                            {idea.title}
                                        </h4>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {idea.description}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg inline-flex">
                                            <Zap className="w-3 h-3" />
                                            Por qué funciona: {idea.reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StrategyHub;
