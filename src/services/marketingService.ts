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

const MOCK_IDEAS_GROWTH: ContentIdea[] = [
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
        title: 'Challenge de Plancha',
        description: 'Reto viral: ¿Cuánto aguantas en plancha? Etiqueta a un amigo.',
        type: 'reel',
        difficulty: 'easy',
        estimated_reach: 'High',
        reason: 'Viral Potential'
    }
];

const MOCK_IDEAS_COMMUNITY: ContentIdea[] = [
    {
        id: '1',
        title: 'Spotlight de Miembro',
        description: 'Entrevista corta a un miembro veterano sobre su transformación.',
        type: 'reel',
        difficulty: 'medium',
        estimated_reach: 'Medium',
        reason: 'Community Building'
    },
    {
        id: '2',
        title: 'Preguntas y Respuestas',
        description: 'Sticker de preguntas en Stories: "Dudas sobre nutrición".',
        type: 'story',
        difficulty: 'easy',
        estimated_reach: 'Medium',
        reason: 'Engagement'
    },
    {
        id: '3',
        title: 'Nuestro Equipo',
        description: 'Carrusel presentando a los entrenadores y sus especialidades.',
        type: 'carousel',
        difficulty: 'easy',
        estimated_reach: 'Medium',
        reason: 'Trust Building'
    }
];

const MOCK_IDEAS_SALES: ContentIdea[] = [
    {
        id: '1',
        title: 'Oferta Flash 24h',
        description: 'Story con cuenta atrás para matrícula gratis. Link en bio.',
        type: 'story',
        difficulty: 'easy',
        estimated_reach: 'Medium',
        reason: 'Urgency'
    },
    {
        id: '2',
        title: 'Antes y Después',
        description: 'Carrusel de casos de éxito reales con llamada a la acción clara.',
        type: 'carousel',
        difficulty: 'medium',
        estimated_reach: 'High',
        reason: 'Social Proof'
    },
    {
        id: '3',
        title: 'Tour del Gimnasio',
        description: 'Reel rápido mostrando las instalaciones y máquinas nuevas. "Ven a probar".',
        type: 'reel',
        difficulty: 'medium',
        estimated_reach: 'Medium',
        reason: 'Showcase'
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
            // Check for specific API Access Blocked error
            if (pagesData.error && pagesData.error.message === "API access blocked.") {
                throw new Error("Acceso a la API bloqueado. Es posible que tu usuario no tenga permisos de Tester/Admin en la App de Facebook (Modo Desarrollo) o que la sesión haya caducado. Por favor, intenta reconectar.");
            }

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
        let insights = { reach: 0, impressions: 0 };

        // 3a. Fetch Reach
        try {
            const reachRes = await fetch(
                `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=reach&period=days_28&access_token=${accessToken}`
            );
            const reachData = await reachRes.json();

            if (!reachRes.ok) {
                console.warn("Reach API Error (days_28):", JSON.stringify(reachData));
                // Fallback to day
                const reachDailyRes = await fetch(
                    `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=reach&period=day&access_token=${accessToken}`
                );
                const reachDailyData = await reachDailyRes.json();
                if (reachDailyData.data && reachDailyData.data[0]) {
                    const values = reachDailyData.data[0].values;
                    insights.reach = values[values.length - 1]?.value || 0;
                }
            } else if (reachData.data && reachData.data[0]) {
                const values = reachData.data[0].values;
                insights.reach = values[values.length - 1]?.value || 0;
            }
        } catch (e) {
            console.warn("Reach Fetch Exception:", e);
        }

        // 3b. Fetch Accounts Engaged (as proxy for impressions/activity)
        // Using period=day and summing is the most robust way to avoid "metric_type" errors with days_28
        try {
            // Added metric_type=total_value as explicitly requested by the API error 100
            const engagedRes = await fetch(
                `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=accounts_engaged&period=day&metric_type=total_value&access_token=${accessToken}`
            );
            const engagedData = await engagedRes.json();

            if (!engagedRes.ok) {
                console.warn("Engaged API Error:", JSON.stringify(engagedData));
            } else if (engagedData.data && engagedData.data[0] && Array.isArray(engagedData.data[0].values)) {
                const values = engagedData.data[0].values;
                // Sum up the last 28 days of engagement
                insights.impressions = values.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0);
            }
        } catch (e) {
            console.warn("Engaged Fetch Exception:", e);
        }

        const profileResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}?fields=biography,id,username,website,followers_count,follows_count,media_count,profile_picture_url&access_token=${accessToken}`
        );
        const profileData = await profileResponse.json();

        // Calculate Engagement Rate
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

        // Fetch expanded fields: media_product_type (for Reels) and children (for Carousels)
        const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{media_type}&access_token=${accessToken}`);
        const mediaData = await mediaRes.json();

        if (!mediaData.data) {
            console.warn('⚠️ No media data returned:', mediaData);
            return [];
        }

        return mediaData.data.map((post: any) => {
            // Determine precise type
            let type: 'video' | 'image' | 'carousel' | 'reel' = 'image';

            if (post.media_product_type === 'REELS') {
                type = 'reel';
            } else if (post.media_type === 'CAROUSEL_ALBUM') {
                type = 'carousel';
            } else if (post.media_type === 'VIDEO') {
                type = 'video';
            }

            return {
                id: post.id,
                type: type,
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
            };
        });
    },

    getAIContentIdeas: async (goal: string, profile?: InstagramProfile, posts?: PostMetric[]): Promise<ContentIdea[]> => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        // Check for missing or placeholder key
        if (!apiKey || apiKey.includes('tu_api_key')) {
            console.warn("Google API Key missing or placeholder, returning mocks for goal:", goal);
            // Simulate delay for realism
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (goal === 'community') return MOCK_IDEAS_COMMUNITY;
            if (goal === 'sales') return MOCK_IDEAS_SALES;
            return MOCK_IDEAS_GROWTH;
        }

        console.log("🤖 Generating AI ideas with goal:", goal);

        try {
            const context = profile ? `
                Profile Context:
                - Followers: ${profile.followers}
                - Engagement Rate: ${profile.engagement_rate}%
                - Recent Reach: ${profile.reach_last_30d}
            ` : '';

            const postsContext = posts && posts.length > 0 ? `
                Recent Top Posts:
                ${posts.slice(0, 5).map(p => `- Type: ${p.type}, Caption: "${p.caption.substring(0, 50)}...", Likes: ${p.likes}, Reach: ${p.reach}`).join('\n')}
            ` : '';

            const prompt = `
                Act as an expert social media strategist for a gym/fitness brand.
                Goal: ${goal} (e.g., growth, community, sales).
                
                ${context}
                ${postsContext}

                Based on this data (if available) and the goal, generate 3 specific, high-impact content ideas.
                Return ONLY a valid JSON array with this structure:
                [
                    {
                        "id": "1",
                        "title": "Short catchy title",
                        "description": "Detailed description of the content",
                        "type": "reel" | "carousel" | "story",
                        "difficulty": "easy" | "medium" | "hard",
                        "estimated_reach": "High" | "Medium" | "Low",
                        "reason": "Why this works based on the data/goal"
                    }
                ]
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No response from AI");

            // Clean markdown code blocks if present
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error("Error generating AI ideas:", error);
            // Fallback to mocks on error so the user always sees something
            if (goal === 'community') return MOCK_IDEAS_COMMUNITY;
            if (goal === 'sales') return MOCK_IDEAS_SALES;
            return MOCK_IDEAS_GROWTH;
        }
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
