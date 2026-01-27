import { supabase } from '../lib/supabase';
import { wodbusterService, CombinedMetrics, WodbusterMetrics } from './wodbusterService';

export interface DailyBriefing {
    greeting: string;
    summary: string;
    mood: 'positive' | 'neutral' | 'concern';
    highlights: string[];
    allCentersMetrics?: CombinedMetrics;
}

export const AIAnalysisService = {
    /**
     * Generates a personalized daily briefing based on system data
     */
    generateBriefing: async (employeeName: string): Promise<DailyBriefing> => {
        try {
            // 1. Fetch key stats from internal systems
            const { data: objectives } = await supabase.from('objetivos').select('*').neq('estado', 'completado');

            // Alertas - puede fallar si la tabla no existe
            let criticalAlerts = 0;
            try {
                const { count } = await supabase.from('alertas_automaticas')
                    .select('*', { count: 'exact', head: true })
                    .eq('nivel_urgencia', 'critical')
                    .eq('estado', 'activa');
                criticalAlerts = count || 0;
            } catch {
                // Tabla alertas_automaticas no existe, ignorar
            }

            // 🤖 LIVE GROWTH DATA FROM ALL 3 WODBUSTER CENTERS
            const allMetrics = await wodbusterService.getAllCentersMetrics();
            const { combined, sevilla, jerez, puerto } = allMetrics;

            // 2. Analyze objectives
            const overdue = objectives?.filter(o => new Date(o.fecha_limite) < new Date()).length || 0;
            const atRisk = objectives?.filter(o => o.riesgo_calculado === 'alto' || o.riesgo_calculado === 'critico').length || 0;

            let mood: 'positive' | 'neutral' | 'concern' = 'positive';
            let summary = "Todo parece estar en orden hoy.";
            const highlights: string[] = [];

            // 3. Build intelligent summary (simplified - details now in Wodbuster panel)
            if ((criticalAlerts || 0) > 0) {
                mood = 'concern';
                summary = `🚨 Atención: ${criticalAlerts} alertas críticas requieren acción.`;
            } else if (combined.atletasActivos > 0) {
                // Simple summary - detailed breakdown is in the Wodbuster panel
                summary = `🏋️ La Jungla: ${combined.atletasActivos} socios activos en los 3 centros.`;

                // Only show alerts for concerning metrics
                if (combined.atletasEnRiesgo > 10) {
                    mood = 'concern';
                }
            } else if (overdue > 2) {
                mood = 'concern';
                summary = `⏰ ${overdue} objetivos vencidos requieren reprogramación.`;
            }

            // Only show objective-based alerts in highlights
            if (overdue > 0) highlights.push(`${overdue} objetivos requieren reprogramación`);
            if (atRisk > 0) highlights.push(`${atRisk} objetivos con alto riesgo`);

            // 4. Time-based greeting
            const hour = new Date().getHours();
            let timeGreeting = "Hola";
            if (hour < 12) timeGreeting = "Buenos días";
            else if (hour < 20) timeGreeting = "Buenas tardes";
            else timeGreeting = "Buenas noches";

            const greeting = `${timeGreeting}, ${employeeName.split(' ')[0]}`;

            return {
                greeting,
                summary,
                mood,
                highlights,
                allCentersMetrics: allMetrics
            };
        } catch (error) {
            console.error('Error generating briefing:', error);
            return {
                greeting: `Hola, ${employeeName.split(' ')[0]}`,
                summary: "Error conectando con el sistema de datos.",
                mood: "neutral",
                highlights: ["No se pudo generar el resumen inteligente."]
            };
        }
    },

    /**
     * Run periodic analysis (objectives, alerts, etc.)
     */
    runFullAnalysis: async (): Promise<void> => {
        try {
            console.log('Running AI analysis cycle...');

            // Check for overdue objectives and create alerts
            const { data: objectives } = await supabase.from('objetivos')
                .select('*')
                .neq('estado', 'completado');

            if (objectives && objectives.length > 0) {
                const now = new Date();
                const overdueObjectives = objectives.filter(o => {
                    const deadline = new Date(o.fecha_limite);
                    return deadline < now;
                });

                // Only process valid UUIDs
                const validIds = overdueObjectives
                    .filter(o => o.id && typeof o.id === 'string' && o.id.length > 10)
                    .map(o => o.id);

                if (validIds.length === 0) return;

                // Alertas - puede fallar si la tabla no existe
                try {
                    const { data: existingAlerts } = await supabase
                        .from('alertas_automaticas')
                        .select('objetivo_relacionado')
                        .eq('tipo_alerta', 'objetivo_vencido')
                        .eq('estado', 'activa')
                        .in('objetivo_relacionado', validIds);

                    const existingIds = new Set(existingAlerts?.map(a => a.objetivo_relacionado) || []);

                    for (const obj of overdueObjectives) {
                        if (!existingIds.has(obj.id)) {
                            await supabase.from('alertas_automaticas').insert({
                                tipo_alerta: 'objetivo_vencido',
                                titulo: `Vencido: ${obj.titulo}`,
                                descripcion: `Venció el ${new Date(obj.fecha_limite).toLocaleDateString()}.`,
                                nivel_urgencia: 'urgent',
                                departamento_afectado: obj.departamento,
                                objetivo_relacionado: obj.id,
                                es_automatica: true,
                                accion_recomendada: 'Reprogramar o cerrar'
                            });
                        }
                    }
                } catch {
                    // Tabla alertas_automaticas no existe, ignorar silenciosamente
                }
            }
        } catch (err) {
            console.error('Error in AI Analysis:', err);
        }
    }
};
