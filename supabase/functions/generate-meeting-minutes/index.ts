import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const {
            transcription,
            departmentName,
            date,
            participants,
            pendingTasks,
            openIncidents,
            centerData,
            objectives,
        } = await req.json();

        if (!transcription) {
            return new Response(
                JSON.stringify({ error: "No transcription provided", success: false }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const apiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY not configured in Supabase Secrets");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Eres un asistente ejecutivo experto de una empresa que gestiona centros deportivos (La Jungla Workout).
Genera un acta de reunión profesional y completa en español.

## DATOS DE LA REUNIÓN
- **Departamento:** ${departmentName || "No especificado"}
- **Fecha:** ${date || new Date().toLocaleDateString("es-ES")}
- **Participantes:** ${participants?.join(", ") || "No especificados"}

## TAREAS PENDIENTES DE REUNIONES ANTERIORES
${pendingTasks || "No hay tareas pendientes"}

## INCIDENCIAS ABIERTAS
${openIncidents || "No hay incidencias abiertas"}

## DATOS OPERATIVOS POR CENTRO
${centerData || "No disponibles"}

## OBJETIVOS DE ESTA REUNIÓN
${objectives || "No definidos"}

## TRANSCRIPCIÓN DE LA REUNIÓN
${transcription.substring(0, 30000)}

---

GENERA LA RESPUESTA EN ESTE FORMATO JSON EXACTO (sin markdown code blocks, solo el JSON puro):
{
  "minutes": "# Acta de Reunión\\n\\n**Departamento:** ...\\n**Fecha:** ...\\n**Participantes:** ...\\n\\n## Resumen Ejecutivo\\n...\\n\\n## Puntos Tratados\\n...\\n\\n## Decisiones Tomadas\\n...\\n\\n## Valoración\\n...",
  "tasks": [
    {
      "title": "Descripción clara de la tarea",
      "assignedTo": "email o nombre del responsable",
      "deadline": "YYYY-MM-DD",
      "priority": "alta|media|baja"
    }
  ]
}

INSTRUCCIONES:
- El campo "minutes" debe ser markdown válido y profesional.
- Extrae TODAS las tareas mencionadas o implícitas en la conversación.
- Si no se asigna responsable explícito, pon "Por asignar".
- Las fechas límite deben ser realistas basándose en la urgencia discutida.
- Sé fiel a lo discutido, no inventes información.
- La valoración debe ser honesta y constructiva.`;

        console.log(
            `📋 Generating minutes for "${departmentName}" (${transcription.length} chars transcription)`
        );

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Robust JSON parsing
        let parsed;
        try {
            const cleanJson = responseText
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            parsed = JSON.parse(cleanJson);
        } catch (_parseError) {
            // If Gemini doesn't return valid JSON, try to extract it
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch {
                    parsed = {
                        minutes: responseText,
                        tasks: [],
                        parseWarning:
                            "La IA no devolvió JSON estructurado. Acta disponible como texto.",
                    };
                }
            } else {
                parsed = {
                    minutes: responseText,
                    tasks: [],
                    parseWarning:
                        "La IA no devolvió JSON estructurado. Acta disponible como texto.",
                };
            }
        }

        console.log(
            `✅ Minutes generated: ${parsed.minutes?.length || 0} chars, ${parsed.tasks?.length || 0} tasks`
        );

        return new Response(
            JSON.stringify({ ...parsed, success: true }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("❌ Minutes generation error:", error);
        return new Response(
            JSON.stringify({
                error: error.message || "Error al generar el acta",
                success: false,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
