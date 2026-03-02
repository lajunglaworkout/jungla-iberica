/**
 * Wodbuster Daily Sync — Netlify Scheduled Function
 *
 * Sincroniza los 3 centros cada día a las 04:00 (cron: "0 4 * * *")
 * Para cada centro: Atletas → wodbuster_snapshots, Pagos → wodbuster_pagos_sync
 *
 * Env vars requeridas (Netlify Dashboard → Site configuration → Env vars):
 *   WODBUSTER_USERNAME          — usuario Basic Auth (ej: lajunglaworkout)
 *   WODBUSTER_PASSWORD_SEVILLA  — contraseña centro Workout (Sevilla)
 *   WODBUSTER_PASSWORD_JEREZ    — contraseña centro Jerez
 *   WODBUSTER_PASSWORD_PUERTO   — contraseña centro El Puerto
 *   VITE_SUPABASE_URL           — URL proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY   — Service role key (bypasa RLS)
 */

import { createClient } from "@supabase/supabase-js";

type CenterKey = "sevilla" | "jerez" | "puerto";

const CENTERS: Record<CenterKey, { subdomain: string; passwordEnvKey: string; apikeyEnvKey: string }> = {
    sevilla: { subdomain: "jungla",             passwordEnvKey: "WODBUSTER_PASSWORD_SEVILLA", apikeyEnvKey: "WODBUSTER_APIKEY_SEVILLA" },
    jerez:   { subdomain: "lajunglajerez",      passwordEnvKey: "WODBUSTER_PASSWORD_JEREZ",   apikeyEnvKey: "WODBUSTER_APIKEY_JEREZ"   },
    puerto:  { subdomain: "lajunglaelpuerto",   passwordEnvKey: "WODBUSTER_PASSWORD_PUERTO",  apikeyEnvKey: "WODBUSTER_APIKEY_PUERTO"  },
};

// ── Supabase client con service role (sin RLS) ───────────────────────────────
function getSupabase() {
    const url  = process.env.VITE_SUPABASE_URL;
    const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// ── Auth headers ─────────────────────────────────────────────────────────────
function basicAuth(username: string, password: string) {
    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

// Intenta fetch con Basic Auth primero; si recibe 403 (Cloudflare), reintenta con Bearer API key
async function fetchWodbuster(url: string, body: string, center: CenterKey): Promise<Response> {
    const config   = CENTERS[center];
    const username = process.env.WODBUSTER_USERNAME || "lajunglaworkout";
    const password = process.env[config.passwordEnvKey];
    const apikey   = process.env[config.apikeyEnvKey];

    if (!password) throw new Error(`Env var no configurada: ${config.passwordEnvKey}`);

    const commonHeaders = {
        "Content-Type":   "application/x-www-form-urlencoded",
        "User-Agent":     "Mozilla/5.0 (compatible; LaJunglaCRM/1.0)",
        "Accept":         "application/json, */*",
        "Accept-Language":"es-ES,es;q=0.9",
    };

    // Intento 1: Basic Auth
    const res1 = await fetch(url, {
        method: "POST",
        headers: { ...commonHeaders, Authorization: basicAuth(username, password) },
        body,
    });

    if (res1.status !== 403) return res1;

    // Intento 2: Bearer con API key (por si Wodbuster lo acepta)
    if (apikey) {
        console.log(`[sync] Basic Auth bloqueado por Cloudflare [${center}], intentando Bearer API key...`);
        const res2 = await fetch(url, {
            method: "POST",
            headers: { ...commonHeaders, Authorization: `Bearer ${apikey}` },
            body,
        });
        if (res2.status !== 403) return res2;
    }

    // Ambos fallaron — devolver el 403 original
    return res1;
}

// ── Sync Atletas para un centro ──────────────────────────────────────────────
async function syncAtletas(center: CenterKey): Promise<number> {
    const config = CENTERS[center];
    const url    = `https://${config.subdomain}.wodbuster.com/api/box/Atletas`;
    const res    = await fetchWodbuster(url, "SoloActivos=false", center);

    if (!res.ok) {
        throw new Error(`Atletas [${center}] HTTP ${res.status}: ${await res.text()}`);
    }

    const data    = await res.json();
    const atletas = Array.isArray(data) ? data : [];

    const supabase    = getSupabase();
    const activeCount = atletas.filter((a: any) => !a.Borrado).length;

    const { error } = await supabase.from("wodbuster_snapshots").insert({
        center,
        data:          atletas,
        athlete_count: atletas.length,
        active_count:  activeCount,
    });

    if (error) throw new Error(`Supabase insert atletas [${center}]: ${error.message}`);
    return atletas.length;
}

// ── Sync Pagos del mes actual para un centro ─────────────────────────────────
async function syncPagos(center: CenterKey): Promise<number> {
    const config   = CENTERS[center];
    const now      = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const mesSync  = fromDate.toISOString().split("T")[0];

    const url  = `https://${config.subdomain}.wodbuster.com/api/box/Pagos`;
    const body = new URLSearchParams({
        Desde: String(Math.floor(fromDate.getTime() / 1000)),
        Hasta: String(Math.floor(toDate.getTime()   / 1000)),
    }).toString();
    const res = await fetchWodbuster(url, body, center);

    if (!res.ok) {
        throw new Error(`Pagos [${center}] HTTP ${res.status}: ${await res.text()}`);
    }

    const data  = await res.json();
    const pagos = Array.isArray(data) ? data : [];

    // Suma del importe — intentamos los nombres de campo más comunes
    const importeTotal = pagos.reduce((sum: number, p: any) => {
        const raw = p.Importe ?? p.importe ?? p.Cantidad ?? p.cantidad ?? 0;
        return sum + (typeof raw === "number" ? raw : parseFloat(raw) || 0);
    }, 0);

    const supabase = getSupabase();
    const { error } = await supabase.from("wodbuster_pagos_sync").upsert(
        {
            center_id:     center,
            mes_sync:      mesSync,
            data:          pagos,
            total_pagos:   pagos.length,
            importe_total: Math.round(importeTotal * 100) / 100,
            synced_at:     new Date().toISOString(),
        },
        { onConflict: "center_id,mes_sync" }
    );

    if (error) throw new Error(`Supabase upsert pagos [${center}]: ${error.message}`);
    return pagos.length;
}

// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler() {
    console.log(`[wodbuster-daily-sync] Iniciando sync — ${new Date().toISOString()}`);

    const results: Record<string, any> = {};
    const centers: CenterKey[] = ["sevilla", "jerez", "puerto"];

    for (const center of centers) {
        try {
            const atletasCount = await syncAtletas(center);
            const pagosCount   = await syncPagos(center);
            results[center] = { ok: true, atletas: atletasCount, pagos: pagosCount };
            console.log(`✅ [${center}] atletas: ${atletasCount}, pagos: ${pagosCount}`);
        } catch (err: any) {
            results[center] = { ok: false, error: err.message };
            console.error(`❌ [${center}] ${err.message}`);
        }
    }

    const allOk = Object.values(results).every((r: any) => r.ok);
    console.log(`[wodbuster-daily-sync] Finalizado — éxito: ${allOk}`);

    return new Response(
        JSON.stringify({ success: allOk, timestamp: new Date().toISOString(), results }),
        { headers: { "Content-Type": "application/json" } }
    );
}

// Ejecutar diariamente a las 04:00 UTC
export const config = { schedule: "0 4 * * *" };
