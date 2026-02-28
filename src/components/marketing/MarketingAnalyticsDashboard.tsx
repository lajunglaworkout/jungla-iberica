import React, { useEffect, useState } from 'react';
import {
    Users, Heart, Eye, TrendingUp, ArrowUpRight, ArrowDownRight,
    Instagram, BarChart3, Zap, Video as VideoIcon, Image as ImageIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useFacebookSdk } from '../../hooks/useFacebookSdk';
import { marketingService, InstagramProfile, PostMetric, MOCK_PROFILE, MOCK_POSTS } from '../../services/marketingService';
import { ui } from '../../utils/ui';


const MarketingAnalyticsDashboard: React.FC = () => {
    const { login, isSdkLoaded, sdkError } = useFacebookSdk();
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [profile, setProfile] = useState<InstagramProfile | null>(null);
    const [topPosts, setTopPosts] = useState<PostMetric[]>([]);
    const [engagementHistory, setEngagementHistory] = useState<Array<{ date: string; value: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const loadData = async (token: string) => {
        setLoading(true);
        try {
            const [realProfile, realPosts] = await Promise.all([
                marketingService.getRealProfile(token),
                marketingService.getRealPosts(token)
            ]);

            setProfile(realProfile);
            setTopPosts(realPosts);
            setIsConnected(true);
            setIsDemoMode(false);

            const historyData = await marketingService.getEngagementHistory();
            setEngagementHistory(historyData);
        } catch (error) {
            console.error("Error restoring session:", error);
            // SEC-02: Token no longer stored in localStorage
            setIsConnected(false);
            setAccessToken(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoMode = async () => {
        setLoading(true);
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        setProfile(MOCK_PROFILE);
        setTopPosts(MOCK_POSTS);
        setIsConnected(true);
        setIsDemoMode(true);

        const historyData = await marketingService.getEngagementHistory();
        setEngagementHistory(historyData);
        setLoading(false);
    };

    useEffect(() => {
        // SEC-02: Token is no longer persisted to localStorage
        // The user must reconnect each session for security
        if (isSdkLoaded) {
            setLoading(false);
        }
    }, [isSdkLoaded]);

    const handleConnect = async () => {
        if (!isSdkLoaded) return;

        setLoading(true);
        try {
            const authResponse = await login() as { status: string; authResponse?: { accessToken: string } };
            console.log('Logged in:', authResponse);

            if (authResponse.status === 'connected') {
                const newAccessToken = authResponse.authResponse.accessToken;
                setAccessToken(newAccessToken);
                // SEC-02: Token kept in memory only, not persisted to localStorage

                await loadData(newAccessToken);
            } else {
                ui.error("No se pudo conectar con Facebook");
                setIsConnected(false);
            }
        } catch (error: unknown) {
            console.error("Login error:", error);
            // Show the specific error message if it's our custom one
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            ui.error(`Error de conexión: ${errorMessage}`);

            // Force logout state
            // SEC-02: Token no longer stored in localStorage
            setAccessToken(null);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    // ... inside render
    // This button is likely a remnant or placeholder, as the main connect button is in the !isConnected block.
    // Keeping it as per the original document structure.
    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-green-100 rounded-full mb-4">
                        <Instagram className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Conecta tu cuenta de Instagram</h3>
                    <p className="text-gray-500 mb-6 max-w-md text-center">
                        Desbloquea el poder de la IA. Analizamos tu perfil para darte ideas de contenido que realmente funcionan.
                    </p>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button
                            onClick={handleConnect}
                            disabled={!isSdkLoaded || !!sdkError}
                            className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 ${(!isSdkLoaded || !!sdkError) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {sdkError ? (
                                <>
                                    <Zap className="w-6 h-6 text-red-200" />
                                    {sdkError}
                                </>
                            ) : isSdkLoaded ? (
                                <>
                                    <Instagram className="w-6 h-6" />
                                    Conectar Cuenta Business
                                </>
                            ) : (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Cargando SDK...
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDemoMode}
                            className="bg-white text-gray-600 px-8 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Eye className="w-5 h-5" />
                            Ver Demo (Sin Conexión)
                        </button>
                    </div>

                    <p className="mt-6 text-sm text-gray-400">
                        *Requiere cuenta de Instagram Business vinculada a una página de Facebook.
                    </p>
                </div>
            </div>
        );
    }

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Demo Mode Banner */}
            {isDemoMode && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <Eye className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-yellow-800">Modo Demo Activo</h3>
                            <p className="text-xs text-yellow-700">Estás viendo datos de ejemplo. Conecta tu cuenta para ver tus métricas reales.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsConnected(false);
                            setIsDemoMode(false);
                            setProfile(null);
                        }}
                        className="text-xs font-medium text-yellow-700 hover:text-yellow-900 underline"
                    >
                        Salir de Demo
                    </button>
                </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Followers */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            +12.5%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Seguidores</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {profile.followers.toLocaleString()}
                    </p>
                </div>

                {/* Engagement Rate */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <Heart className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            +2.1%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Engagement Rate</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {profile.engagement_rate}%
                    </p>
                </div>

                {/* Reach */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="flex items-center text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-lg">
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                            -5.4%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Alcance (30d)</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {(profile.reach_last_30d / 1000).toFixed(1)}k
                    </p>
                </div>

                {/* Total Posts */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <Instagram className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            Active
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Publicaciones Totales</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {profile.posts.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Content Mix Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-pink-50 rounded-lg">
                        <VideoIcon className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Reels</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {topPosts.filter(p => p.type === 'reel').length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Carruseles</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {topPosts.filter(p => p.type === 'carousel').length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Imágenes</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {topPosts.filter(p => p.type === 'image').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Engagement Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Evolución del Engagement</h3>
                        <select className="bg-gray-50 border-none text-sm text-gray-500 rounded-lg px-3 py-1">
                            <option>Últimos 30 días</option>
                            <option>Últimos 7 días</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementHistory}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    domain={[0, 6]}
                                    unit="%"
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#16a34a"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRate)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div >

                {/* Top Performing Posts */}
                < div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100" >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Contenido 🔥</h3>
                    <div className="space-y-6">
                        {topPosts.map((post) => (
                            <div key={post.id} className="flex gap-4 group cursor-pointer">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={post.thumbnail_url}
                                        alt="Post thumbnail"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm rounded-md p-1">
                                        {post.type === 'video' || post.type === 'reel' ? (
                                            <VideoIcon className="w-3 h-3 text-white" />
                                        ) : (
                                            <ImageIcon className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-2">
                                        {post.caption}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3 h-3" /> {post.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {(post.reach / 1000).toFixed(1)}k
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div >
            </div >
        </div >
    );
};

export default MarketingAnalyticsDashboard;
