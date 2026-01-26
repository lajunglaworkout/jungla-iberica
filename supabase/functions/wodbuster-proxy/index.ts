import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Multi-center configuration
const CENTERS = {
    sevilla: {
        subdomain: 'jungla',
        username: 'lajunglaworkout',
        secretKey: 'WODBUSTER_PASSWORD_SEVILLA'
    },
    jerez: {
        subdomain: 'lajunglajerez',
        username: 'lajunglaworkout',
        secretKey: 'WODBUSTER_PASSWORD_JEREZ'
    },
    puerto: {
        subdomain: 'lajunglaelpuerto',
        username: 'lajunglaworkout',
        secretKey: 'WODBUSTER_PASSWORD_PUERTO'
    }
} as const;

type CenterKey = keyof typeof CENTERS;

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Verify Authentication & RBAC (Role-Based Access Control)
        const supabaseAuthHeader = req.headers.get('Authorization')
        if (!supabaseAuthHeader) {
            throw new Error('No authorization header')
        }

        // Initialize Supabase Client to verify user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: supabaseAuthHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // CHECK STRICT ACCESS: Only SuperAdmin/CEO or specific email
        const userEmail = user.email;
        const isCEO = userEmail === 'carlossuarezparra@gmail.com';
        const isSuperAdmin = user.app_metadata?.role === 'superadmin' || user.user_metadata?.role === 'superadmin';

        if (!isCEO && !isSuperAdmin) {
            console.error(`🚨 Unauthorized access attempt by: ${userEmail}`);
            return new Response(JSON.stringify({ error: 'Forbidden: CEO Access Only' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Parse request - now with center parameter
        const { endpoint, method = 'POST', body, center = 'sevilla' } = await req.json()

        // Validate center
        if (!CENTERS[center as CenterKey]) {
            return new Response(JSON.stringify({ error: `Invalid center: ${center}. Valid: sevilla, jerez, puerto` }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const centerConfig = CENTERS[center as CenterKey];
        const password = Deno.env.get(centerConfig.secretKey);

        if (!password) {
            throw new Error(`Server Config Error: ${centerConfig.secretKey} not set`)
        }

        // Build URL for the specific center
        const BASE_URL = `https://${centerConfig.subdomain}.wodbuster.com/api`
        const targetUrl = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

        console.log(`🚀 [${center.toUpperCase()}] Proxying ${method} request to: ${targetUrl}`)

        // 3. Forward Request to Wodbuster
        const wodbusterAuth = `Basic ${btoa(`${centerConfig.username}:${password}`)}`

        // Build form body for x-www-form-urlencoded
        const formBody = body ? new URLSearchParams(body).toString() : ''

        const wbResponse = await fetch(targetUrl, {
            method,
            headers: {
                'Authorization': wodbusterAuth,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody || 'SoloActivos=false', // Get ALL members for churn analysis
        })

        if (!wbResponse.ok) {
            const errText = await wbResponse.text()
            console.error(`[${center}] Wodbuster API Error (${wbResponse.status}):`, errText)
            return new Response(JSON.stringify({ error: errText, center }), {
                status: wbResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const data = await wbResponse.json()
        console.log(`✅ [${center.toUpperCase()}] Received ${Array.isArray(data) ? data.length : 0} records`)

        // 4. Return Data with center metadata
        return new Response(JSON.stringify({
            center,
            timestamp: new Date().toISOString(),
            count: Array.isArray(data) ? data.length : 0,
            data
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Proxy Error:', errorMessage)
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
