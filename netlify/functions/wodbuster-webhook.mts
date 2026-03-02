/**
 * Wodbuster Webhook Receiver — Netlify Function
 *
 * Recibe eventos en tiempo real del RestHook de Wodbuster.
 * URL configurada en Wodbuster → "Url destino":
 *   https://lajungla-crm.netlify.app/.netlify/functions/wodbuster-webhook
 *
 * Env vars requeridas:
 *   WODBUSTER_APIKEY_SEVILLA   — API key del RestHook de Sevilla
 *   WODBUSTER_APIKEY_JEREZ     — API key del RestHook de Jerez
 *   WODBUSTER_APIKEY_PUERTO    — API key del RestHook de El Puerto
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

// Mapa apikey → centro (se construye al arrancar)
function buildApiKeyMap(): Map<string, string> {
    const map = new Map<string, string>();
    const entries: [string, string | undefined][] = [
        ["sevilla", process.env.WODBUSTER_APIKEY_SEVILLA],
        ["jerez",   process.env.WODBUSTER_APIKEY_JEREZ],
        ["puerto",  process.env.WODBUSTER_APIKEY_PUERTO],
    ];
    for (const [center, key] of entries) {
        if (key) map.set(key, center);
    }
    return map;
}

function getSupabase() {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase env vars");
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Detecta el tipo de evento a partir del payload o headers
function detectEventType(body: any, headers: Headers): string {
    return (
        body?.event     ||
        body?.tipo      ||
        body?.Event     ||
        body?.type      ||
        headers.get("x-wodbuster-event") ||
        "unknown"
    );
}

// Detecta el centro a partir del payload (fallback si no viene en el API key)
function detectCenterFromBody(body: any): string {
    return (
        body?.center   ||
        body?.centro   ||
        body?.gym      ||
        body?.gimnasio ||
        "sevilla"
    );
}

// Extrae el API key de la petición (prueba múltiples ubicaciones)
function extractApiKey(req: Request): string | null {
    // Headers comunes que Wodbuster puede usar
    return (
        req.headers.get("x-api-key")         ||
        req.headers.get("x-apikey")           ||
        req.headers.get("x-wodbuster-key")    ||
        req.headers.get("x-wodbuster-secret") ||
        req.headers.get("x-webhook-secret")   ||
        req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
        new URL(req.url).searchParams.get("apikey") ||
        null
    );
}

export default async function handler(req: Request) {
    // Solo POST
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const APIKEY_MAP = buildApiKeyMap();

    // ── Validar API key ──────────────────────────────────────────────────────
    const incomingKey = extractApiKey(req);
    let centerFromKey: string | undefined;

    if (APIKEY_MAP.size > 0) {
        if (!incomingKey || !APIKEY_MAP.has(incomingKey)) {
            console.warn(`[wodbuster-webhook] API key inválida: "${incomingKey}" — rechazado`);
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        centerFromKey = APIKEY_MAP.get(incomingKey);
    }

    // ── Parsear body ─────────────────────────────────────────────────────────
    let body: any;
    try {
        body = await req.json();
    } catch {
        // Puede ser form-urlencoded
        try {
            const text = await req.text();
            const params = new URLSearchParams(text);
            body = Object.fromEntries(params.entries());
        } catch {
            return new Response(JSON.stringify({ error: "Invalid body" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    const eventType = detectEventType(body, req.headers);
    // Centro: preferimos el que sale del API key (100% fiable), luego el body
    const center    = centerFromKey || detectCenterFromBody(body);
    const data      = body?.data ?? body?.datos ?? body;

    console.log(`[wodbuster-webhook] Evento: ${eventType} | Centro: ${center} | Key válida: ${!!centerFromKey}`);

    const supabase = getSupabase();

    try {
        // 1. Siempre loguear el evento raw
        await supabase.from("wodbuster_webhook_log").insert({
            event_type: eventType,
            center_id:  center,
            payload:    body,
            processed:  false,
        });

        // 2. Procesar según tipo
        const eventLower = eventType.toLowerCase();

        if (eventLower.includes("pago") || eventLower.includes("payment")) {
            // Evento de pago → actualizar wodbuster_pagos_sync del mes en curso
            const pagos = Array.isArray(data) ? data : [data];
            const now   = new Date();
            const mesSync = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString().split("T")[0];

            const importeTotal = pagos.reduce((sum: number, p: any) => {
                const raw = p.Importe ?? p.importe ?? p.Cantidad ?? p.cantidad ?? 0;
                return sum + (typeof raw === "number" ? raw : parseFloat(raw) || 0);
            }, 0);

            await supabase.from("wodbuster_pagos_sync").upsert(
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

            console.log(`[wodbuster-webhook] Pagos procesados [${center}]: ${pagos.length} pagos, ${importeTotal}€`);

        } else if (
            eventLower.includes("atleta") ||
            eventLower.includes("athlete") ||
            eventLower.includes("member")
        ) {
            // Evento de alta/baja atleta → guardar snapshot
            const atletas = Array.isArray(data) ? data : [data];
            await supabase.from("wodbuster_snapshots").insert({
                center,
                data:          atletas,
                athlete_count: atletas.length,
                active_count:  atletas.filter((a: any) => !a.Borrado).length,
            });

            console.log(`[wodbuster-webhook] Snapshot guardado [${center}]: ${atletas.length} atletas`);
        } else {
            // Evento desconocido (CuantoEnseñan, etc.) — queda en el log
            console.log(`[wodbuster-webhook] Evento sin handler específico: ${eventType} [${center}]`);
        }

        // 3. Marcar log como procesado
        await supabase
            .from("wodbuster_webhook_log")
            .update({ processed: true })
            .eq("center_id", center)
            .eq("event_type", eventType)
            .order("received_at", { ascending: false })
            .limit(1);

        return new Response(JSON.stringify({ received: true, event: eventType, center }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err: any) {
        console.error("[wodbuster-webhook] Error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
