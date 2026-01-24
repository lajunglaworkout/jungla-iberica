import { supabase } from '../lib/supabase';

export interface DailyBriefing {
    greeting: string;
    summary: string;
    mood: 'positive' | 'neutral' | 'concern';
    highlights: string[];
}

export const AIAnalysisService = {
    /**
     * Generates a personalized daily briefing based on system data
     */
    generateBriefing: async (employeeName: string): Promise<DailyBriefing> => {
        try {
            // 1. Fetch key stats
            const today = new Date().toISOString();
            const { data: objectives } = await supabase.from('objetivos').select('*').neq('estado', 'completado');
            const { count: criticalAlerts } = await supabase.from('alertas_automaticas')
                .select('*', { count: 'exact', head: true })
                .eq('nivel_urgencia', 'critical')
                .eq('estado', 'activa');

            // 2. Analyze logic (Simple "Expert System" rules for now, LLM later)
            const overdue = objectives?.filter(o => new Date(o.fecha_limite) < new Date()).length || 0;
            const atRisk = objectives?.filter(o => o.riesgo_calculado === 'alto' || o.riesgo_calculado === 'critico').length || 0;

            let mood: 'positive' | 'neutral' | 'concern' = 'positive';
            let summary = "Todo parece estar en orden hoy.";
            const highlights: string[] = [];

            if ((criticalAlerts || 0) > 0 || overdue > 2) {
                mood = 'concern';
                summary = `Atención requerida: Tienes ${criticalAlerts} alertas críticas y ${overdue} objetivos vencidos.`;
            } else if (atRisk > 2) {
                mood = 'neutral';
                summary = "El sistema es estable, pero hay riesgos latentes que vigilar.";
            } else {
                mood = 'positive';
                summary = "Excelente progreso. El rendimiento general es óptimo.";
            }

            // 3. Generate Highlights
            if (overdue > 0) highlights.push(`${overdue} objetivos requieren reprogramación inmediata.`);
            if (atRisk > 0) highlights.push(`${atRisk} objetivos están marcados con alto riesgo.`);
            if (!objectives || objectives.length === 0) highlights.push("No hay objetivos estratégicos activos. ¿Es buen momento para planificar?");

            // 4. Time-based greeting
            const hour = new Date().getHours();
            let timeGreeting = "Hola";
            if (hour < 12) timeGreeting = "Buenos días";
            else if (hour < 20) timeGreeting = "Buenas tardes";
            else timeGreeting = "Buenas noches";

            return {
                greeting: `${timeGreeting}, ${employeeName.split(' ')[0]}`,
                summary,
                mood,
                highlights
            };
        } catch (error) {
            console.error('Error generating briefing:', error);
            return {
                greeting: `Hola, ${employeeName.split(' ')[0]}`,
                summary: "No pude conectar con el motor de análisis.",
                mood: 'neutral',
                highlights: []
            };
        }
    },

    /**
     * Runs a full analysis scan and generates persistence alerts if needed
     */
    runFullAnalysis: async () => {
        // 1. Check for overdue objectives and create alerts
        const { data: objectives } = await supabase
            .from('objetivos')
            .select('*')
            .neq('estado', 'completado')
            .lt('fecha_limite', new Date().toISOString());

        if (objectives) {
            for (const obj of objectives) {
                // Check if alert already exists to avoid spam
                const { data: existing } = await supabase
                    .from('alertas_automaticas')
                    .select('id')
                    .eq('objetivo_relacionado_id', obj.id)
                    .eq('tipo_alerta', 'objetivo_vencido')
                    .eq('estado', 'activa') // Only check active alerts
                    .single();

                if (!existing) {
                    await supabase.from('alertas_automaticas').insert({
                        tipo_alerta: 'objetivo_vencido',
                        titulo: `Vencido: ${obj.titulo}`,
                        descripcion: `Este objetivo venció el ${new Date(obj.fecha_limite).toLocaleDateString()}. Se requiere acción inmediata.`,
                        nivel_urgencia: 'urgent',
                        departamento_afectado: obj.departamento,
                        objetivo_relacionado_id: obj.id,
                        es_automatica: true,
                        accion_recomendada: 'Reprogramar fecha o marcar como no completado'
                    });
                }
            }
        }

        // 2. Check for "Stagnant" objectives (No updates in 30 days) - Placeholder logic
        // ...
    }
};
