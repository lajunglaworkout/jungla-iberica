import { createClient } from '@supabase/supabase-js';

// Load envs manually for local testing
const CENTER = 'sevilla';
const SUBDOMAIN = 'jungla';
const USER = process.env.WODBUSTER_USER || 'lajunglaworkout';
const PASS = process.env.WODBUSTER_PASS;

if (!PASS) {
    console.error("❌ Need WODBUSTER_PASS env var");
    process.exit(1);
}

const AUTH = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

async function testEndpoint(endpoint: string) {
    const url = `https://${SUBDOMAIN}.wodbuster.com/api/${endpoint}`;
    console.log(`📡 Testing GET ${url}...`);
    try {
        const res = await fetch(url, {
            headers: { 'Authorization': AUTH }
        });
        console.log(`   👉 Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const text = await res.text();
            console.log(`   ✅ SUCCESS! Preview: ${text.substring(0, 100)}...`);
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }
}

(async () => {
    console.log("🕵️‍♀️ Starting API Fuzzing for Messages...");

    const candidates = [
        'messages',
        'mensajes',
        'communications',
        'comunicaciones',
        'inbox',
        'buzon',
        'emails',
        'notifications',
        'notificaciones',
        'users/1/messages' // Try nesting
    ];

    for (const ep of candidates) {
        await testEndpoint(ep);
    }
})();
