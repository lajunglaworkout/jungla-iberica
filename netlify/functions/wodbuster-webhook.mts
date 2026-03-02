/**
 * Wodbuster Webhook Receiver — Netlify Function
 *
 * Recibe eventos en tiempo real del RestHook de Wodbuster.
 * URL a configurar en Wodbuster → "Url destino" del RestHook:
 *   https://[tu-sitio].netlify.app/.netlify/functions/wodbuster-webhook
 *
 * Env vars requeridas:
 *   WODBUSTER_WEBHOOK_SECRET  — secreto para validar la fuente (añadirlo en Wodbuster si soporta headers)
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing Supabase env vars");
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Detecta el tipo de evento a partir del payload o headers
function detectEventType(body: any, headers: Headers): string {
    // Wodbuster puede enviar el tipo en distintos campos
    return (
        body?.event     ||
        body?.tipo      ||
        body?.Event     ||
        body?.type      ||
        headers.get("x-wodbuster-event") ||
        "unknown"
    );
}

// Detecta el centro a partir del payload
function detectCenter(body: any): string {
    return (
        body?.center   ||
        body?.centro   ||
        body?.gym      ||
        body?.gimnasio ||
        "sevilla"  // fallback al principal
    );
}

export default async function handler(req: Request) {
    // Solo POST
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    // Validar secreto (si está configurado)
    const expectedSecret = process.env.WODBUSTER_WEBHOOK_SECRET;
    if (expectedSecret) {
        const incomingSecret =
            req.headers.get("x-wodbuster-secret") ||
            req.headers.get("x-webhook-secret")   ||
            req.headers.get("authorization")?.replace("Bearer ", "");

        if (incomingSecret !== expectedSecret) {
            console.warn("[wodbuster-webhook] Secreto inválido — rechazado");
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    // Parsear body
    let body: any;
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const eventType = detectEventType(body, req.headers);
    const center    = detectCenter(body);
    const data      = body?.data ?? body?.datos ?? body;

    console.log(`[wodbuster-webhook] Evento: ${eventType} | Centro: ${center}`);

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
                const raw = p.Importe ?? p.importe ?? p.Cantidad ?? 0;
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
        }
        // Otros eventos (CuantoEnseñan, etc.) — quedan en el log, se procesan manualmente

        // Marcar log como procesado
        await supabase
            .from("wodbuster_webhook_log")
            .update({ processed: true })
            .eq("center_id", center)
            .eq("event_type", eventType)
            .order("received_at", { ascending: false })
            .limit(1);

        return new Response(JSON.stringify({ received: true, event: eventType }), {
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
