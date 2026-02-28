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

// Mock Data (Eliminado a petición del usuario)

// Service
// Service
export const marketingService = {
    // Mock methods for fallback
    getProfile: async (): Promise<InstagramProfile> => {
        throw new Error("No real profile data available");
    },

    getTopPosts: async (): Promise<PostMetric[]> => {
        return [];
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
                insights.impressions = values.reduce((acc: number, curr: { value?: number }) => acc + (curr.value || 0), 0);
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
                const totalInteractions = mediaForCalc.data.reduce((acc: number, post: { like_count?: number; comments_count?: number }) => {
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

        return mediaData.data.map((post: { id: string; caption?: string; media_type?: string; media_product_type?: string; media_url?: string; thumbnail_url?: string; permalink?: string; timestamp?: string; like_count?: number; comments_count?: number; children?: { data?: Array<{ media_type?: string }> } }) => {
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
        // SEC-01: API Key removed from frontend. Calls now proxied through backend.
        try {
            const context = profile ? {
                followers: profile.followers,
                engagement_rate: profile.engagement_rate,
                reach_last_30d: profile.reach_last_30d
            } : null;

            const postsContext = posts && posts.length > 0 ? posts.slice(0, 5).map(p => ({
                type: p.type,
                caption: p.caption.substring(0, 50),
                likes: p.likes,
                reach: p.reach
            })) : null;

            const response = await fetch('/api/ai/content-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal, context, posts: postsContext })
            });

            if (!response.ok) {
                throw new Error(`Backend AI proxy error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.ideas || data;
        } catch (error) {
            console.error("Error generating AI ideas:", error);
            // Fallback to mocks on error so the user always sees something
            return [];
        }
    },

    getCompetitors: async (): Promise<Competitor[]> => {
        return [];
    },

    getEngagementHistory: async () => {
        return [];
    }
};
