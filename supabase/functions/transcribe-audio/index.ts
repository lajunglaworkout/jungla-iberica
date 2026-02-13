import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { audio, mimeType } = await req.json();

        if (!audio) {
            return new Response(
                JSON.stringify({ error: "No audio data provided", success: false }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // API key from Supabase Secrets — NEVER exposed to frontend
        const apiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY not configured in Supabase Secrets");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log(
            `📝 Transcribing audio: ${(audio.length * 0.75 / 1024).toFixed(1)} KB, mimeType: ${mimeType || "audio/webm"}`
        );

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType || "audio/webm",
                    data: audio, // base64 encoded
                },
            },
            {
                text: `Transcribe este audio de una reunión de trabajo en español.
Devuelve SOLO el texto transcrito fielmente, sin comentarios ni explicaciones.
Si identificas varios interlocutores, márcalos como [Participante 1], [Participante 2], etc.
Mantén el lenguaje original, incluyendo muletillas y expresiones coloquiales.
Si alguna parte es inaudible, indica [inaudible].`,
            },
        ]);

        const transcription = result.response.text();
        console.log(
            `✅ Transcription complete: ${transcription.length} characters`
        );

        return new Response(
            JSON.stringify({ transcription, success: true }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("❌ Transcription error:", error);
        return new Response(
            JSON.stringify({
                error: error.message || "Error al transcribir el audio",
                success: false,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
