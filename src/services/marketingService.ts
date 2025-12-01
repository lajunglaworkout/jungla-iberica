import {
    Users, Heart, Eye, TrendingUp,
    Video, Image, Play, Zap
} from 'lucide-react';

// Interfaces
export interface InstagramProfile {
    username: string;
    followers: number;
    following: number;
    posts: number;
    profile_pic_url: string;
    biography: string;
    engagement_rate: number;
    reach_last_30d: number;
    impressions_last_30d: number;
}

export interface PostMetric {
    id: string;
    type: 'video' | 'image' | 'carousel' | 'reel';
    thumbnail_url: string;
    caption: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    date: string;
    performance_score: number; // 0-100
    tags: string[]; // "High Retention", "Viral Audio", etc.
}

export interface ContentIdea {
    id: string;
    title: string;
    description: string;
    type: 'reel' | 'carousel' | 'story';
    difficulty: 'easy' | 'medium' | 'hard';
    estimated_reach: string;
    reason: string; // "Trending Audio", "Competitor Success", etc.
}

export interface Competitor {
    username: string;
    followers: number;
    growth_rate: number; // %
    top_content_type: string;
    engagement_rate: number;
}

// Mock Data
const MOCK_PROFILE: InstagramProfile = {
    username: 'lajungla_iberica',
    followers: 12543,
    following: 450,
    posts: 342,
    profile_pic_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
    biography: '🌴 Tu gimnasio salvaje en Andalucía\n💪 Entrena diferente\n📍 Sevilla | Jerez | Puerto',
    engagement_rate: 4.8,
    reach_last_30d: 45200,
    impressions_last_30d: 120500
};

const MOCK_POSTS: PostMetric[] = [
    {
        id: '1',
        type: 'reel',
        thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
        caption: '¡No te rindas! El proceso es lento pero vale la pena 💪 #gymmotivation',
        likes: 1240,
        comments: 45,
        shares: 230,
        saves: 560,
        reach: 15400,
        date: '2023-11-28',
        performance_score: 95,
        tags: ['Viral Audio', 'High Retention']
    },
    {
        id: '2',
        type: 'carousel',
        thumbnail_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
        caption: '5 Errores comunes en Press Banca ❌ vs ✅',
        likes: 890,
        comments: 120,
        shares: 450,
        saves: 890,
        reach: 12300,
        date: '2023-11-25',
        performance_score: 92,
        tags: ['Educational', 'Saveable']
    },
    {
        id: '3',
        type: 'video',
        thumbnail_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
        caption: 'Clase de Zumba de ayer! 🔥 Qué energía equipo!',
        likes: 450,
        comments: 23,
        shares: 15,
        saves: 5,
        reach: 3400,
        date: '2023-11-22',
        performance_score: 65,
        tags: ['Community']
    }
];

const MOCK_IDEAS: ContentIdea[] = [
    {
        id: '1',
        title: 'ASMR de Gimnasio',
        description: 'Graba sonidos satisfactorios del gym: discos chocando, magnesio, cierre de taquilla.',
        type: 'reel',
        difficulty: 'easy',
        estimated_reach: 'High',
        reason: 'Trending Format'
    },
    {
        id: '2',
        title: 'POV: Tu primer día',
        description: 'Video humorístico sobre cómo te sientes el primer día vs el mes 6.',
        type: 'reel',
        difficulty: 'medium',
        estimated_reach: 'Very High',
        reason: 'High Relatability'
    },
    {
        id: '3',
        title: 'Rutina de Espalda en 15 min',
        description: 'Carrusel explicando 3 ejercicios claves para espalda ancha.',
        type: 'carousel',
        difficulty: 'medium',
        estimated_reach: 'Medium',
        reason: 'Educational Value'
    }
];

const MOCK_COMPETITORS: Competitor[] = [
    {
        username: 'mcfit_es',
        followers: 45000,
        growth_rate: 1.2,
        top_content_type: 'Reels Humor',
        engagement_rate: 3.5
    },
    {
        username: 'basicfit_es',
        followers: 89000,
        growth_rate: 0.8,
        top_content_type: 'Challenges',
        engagement_rate: 2.1
    },
    {
        username: 'crossfit_sevilla',
        followers: 15000,
        growth_rate: 5.4,
        top_content_type: 'WOD Demos',
        engagement_rate: 6.8
    }
];

// Service
// Service
export const marketingService = {
    // Mock methods for fallback
    getProfile: async (): Promise<InstagramProfile> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_PROFILE;
    },

    getTopPosts: async (): Promise<PostMetric[]> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_POSTS;
    },

    // Real API methods
    getRealProfile: async (accessToken: string): Promise<InstagramProfile> => {
        // Debug: Check Permissions
        const permRes = await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`);
        const permData = await permRes.json();
        console.log('🔑 Granted Permissions:', JSON.stringify(permData, null, 2));

        // 1. Get User's Pages
        console.log('📡 Fetching pages...');
        const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
        const pagesData = await pagesRes.json();
        console.log('📄 Pages API Response:', JSON.stringify(pagesData, null, 2));

        if (!pagesData.data || pagesData.data.length === 0) {
            // Construct a detailed error object
            const errorDetails = {
                message: 'No se encontraron páginas de Facebook vinculadas.',
                apiResponse: pagesData,
                permissions: permData,
                hint: 'Si la App está en "Modo Desarrollo", asegúrate de que tu usuario es Admin/Tester.'
            };
            throw new Error(JSON.stringify(errorDetails, null, 2));
        }

        // 2. Get Instagram Business Account ID from the first page (simplification for MVP)
        // In a real app, we'd let the user choose the page.
        const pageId = pagesData.data[0].id;
        const igRes = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
        const igData = await igRes.json();

        if (!igData.instagram_business_account) {
            throw new Error('No Instagram Business Account linked to this Page.');
        }

        const igAccountId = igData.instagram_business_account.id;

        // 3. Get Profile Info & Insights
        // Note: 'reach' and 'impressions' might fail depending on account type/age. We wrap in try/catch or handle gracefully.
        let insights = { reach: 0, impressions: 0 };
        try {
            // Using days_28 for a monthly view which is more standard and less prone to "data not available for today" errors
            const insightsResponse = await fetch(
                `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=reach,impressions&period=days_28&access_token=${accessToken}`
            );

            if (!insightsResponse.ok) {
                const err = await insightsResponse.json();
                console.warn("Insights API Error:", err);
            } else {
                const insightsData = await insightsResponse.json();
                if (insightsData.data) {
                    insightsData.data.forEach((item: any) => {
                        // For days_28, values[0] is the value for the 28-day period ending yesterday/today
                        const value = item.values[item.values.length - 1]?.value || 0;
                        if (item.name === 'reach') insights.reach = value;
                        if (item.name === 'impressions') insights.impressions = value;
                    });
                }
            }
        } catch (e) {
            console.warn("Could not fetch insights:", e);
        }

        const profileResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}?fields=biography,id,username,website,followers_count,follows_count,media_count,profile_picture_url&access_token=${accessToken}`
        );
        const profileData = await profileResponse.json();

        // Calculate Engagement Rate
        // Formula: Average (Likes + Comments) per post / Followers * 100
        let engagementRate = 0;
        try {
            const mediaForCalcRes = await fetch(
                `https://graph.facebook.com/v18.0/${igAccountId}/media?fields=like_count,comments_count&limit=10&access_token=${accessToken}`
            );
            const mediaForCalc = await mediaForCalcRes.json();

            if (mediaForCalc.data && mediaForCalc.data.length > 0 && profileData.followers_count > 0) {
                const totalInteractions = mediaForCalc.data.reduce((acc: number, post: any) => {
                    return acc + (post.like_count || 0) + (post.comments_count || 0);
                }, 0);

                const avgInteractions = totalInteractions / mediaForCalc.data.length;
                engagementRate = (avgInteractions / profileData.followers_count) * 100;
            }
        } catch (e) {
            console.warn("Could not calculate engagement rate:", e);
        }

        return {
            username: profileData.username,
            followers: profileData.followers_count,
            following: profileData.follows_count || 0,
            posts: profileData.media_count,
            profile_pic_url: profileData.profile_picture_url,
            biography: profileData.biography,
            engagement_rate: parseFloat(engagementRate.toFixed(2)),
            reach_last_30d: insights.reach,
            impressions_last_30d: insights.impressions
        };
    },

    getRealPosts: async (accessToken: string): Promise<PostMetric[]> => {
        // We need the IG Account ID again. ideally we should cache it.
        // For now, re-fetching flow (optimized in next iteration)
        const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
        const pagesData = await pagesRes.json();

        if (!pagesData.data || pagesData.data.length === 0) {
            return []; // Should be handled by getRealProfile check
        }

        const pageId = pagesData.data[0].id;
        const igRes = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
        const igData = await igRes.json();

        console.log('📸 IG Account Data for Posts:', igData);

        if (!igData.instagram_business_account) {
            console.error('❌ No Instagram Business Account found for this page in getRealPosts.');
            return []; // Return empty posts instead of crashing
        }

        const igAccountId = igData.instagram_business_account.id;

        const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}`);
        const mediaData = await mediaRes.json();

        if (!mediaData.data) {
            console.warn('⚠️ No media data returned:', mediaData);
            return [];
        }

        return mediaData.data.map((post: any) => ({
            id: post.id,
            type: post.media_type.toLowerCase() === 'video' ? 'video' : 'image', // Simplified mapping
            thumbnail_url: post.thumbnail_url || post.media_url,
            caption: post.caption || '',
            likes: post.like_count || 0,
            comments: post.comments_count || 0,
            shares: 0, // Not available in basic public fields
            saves: 0, // Not available in basic public fields
            reach: 0, // Requires Insights
            date: post.timestamp.split('T')[0],
            performance_score: 80, // Placeholder
            tags: []
        }));
    },

    getAIContentIdeas: async (goal: string): Promise<ContentIdea[]> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return MOCK_IDEAS;
    },

    getCompetitors: async (): Promise<Competitor[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return MOCK_COMPETITORS;
    },

    getEngagementHistory: async () => {
        return [
            { date: '1 Nov', rate: 3.2 },
            { date: '5 Nov', rate: 3.5 },
            { date: '10 Nov', rate: 4.1 },
            { date: '15 Nov', rate: 3.8 },
            { date: '20 Nov', rate: 4.5 },
            { date: '25 Nov', rate: 4.8 },
            { date: '30 Nov', rate: 4.9 },
        ];
    }
};
