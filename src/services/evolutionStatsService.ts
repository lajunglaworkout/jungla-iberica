import { supabase } from '../lib/supabase';

export interface DailyBreakage {
    date: string;
    center_id: string;
    center_name: string;
    total_incidents: number;
    items_affected: number;
}

export interface QuarterlyLoss {
    quarter: string;
    year: number;
    center_id: number;
    center_name: string;
    total_items_removed: number;
    total_value_lost: number; // Estimado si no tenemos precio exacto
}

export interface CenterEvolutionStats {
    dailyBreakages: DailyBreakage[];
    quarterlyLosses: QuarterlyLoss[];
}

class EvolutionStatsService {

    // Obtener roturas diarias (últimos X días)
    async getDailyBreakages(days: number = 30): Promise<DailyBreakage[]> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString();

            // Consultar incidencias de checklist que impliquen roturas
            // Asumimos que incident_type 'logistics' o 'maintenance' pueden implicar roturas
            // y que tienen un campo inventory_item relleno
            const { data, error } = await supabase
                .from('checklist_incidents')
                .select('created_at, center_id, center_name, inventory_item, inventory_quantity')
                .gte('created_at', startDateStr)
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (!data) return [];

            // Agrupar por día y centro
            const groupedData: Record<string, DailyBreakage> = {};

            data.forEach(incident => {
                const date = new Date(incident.created_at).toISOString().split('T')[0];
                const key = `${date}-${incident.center_id}`;

                if (!groupedData[key]) {
                    groupedData[key] = {
                        date,
                        center_id: incident.center_id,
                        center_name: incident.center_name,
                        total_incidents: 0,
                        items_affected: 0
                    };
                }

                groupedData[key].total_incidents += 1;
                // Si inventory_quantity es null, asumimos 1 si hay inventory_item
                const quantity = incident.inventory_quantity || (incident.inventory_item ? 1 : 0);
                groupedData[key].items_affected += quantity;
            });

            return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));

        } catch (error) {
            console.error('❌ Error obteniendo roturas diarias:', error);
            return [];
        }
    }

    // Obtener pérdidas trimestrales (año actual)
    async getQuarterlyLosses(year: number = new Date().getFullYear()): Promise<QuarterlyLoss[]> {
        try {
            // 1. Obtener revisiones del año
            const { data: reviews, error: reviewsError } = await supabase
                .from('quarterly_reviews')
                .select('id, quarter, year, center_id, center_name')
                .eq('year', year)
                .eq('status', 'completed');

            if (reviewsError) throw reviewsError;
            if (!reviews || reviews.length === 0) return [];

            const reviewIds = reviews.map(r => r.id);

            // 2. Obtener asignaciones asociadas a esas revisiones
            const { data: assignments, error: assignmentsError } = await supabase
                .from('quarterly_inventory_assignments')
                .select('id, review_id')
                .in('review_id', reviewIds);

            if (assignmentsError) throw assignmentsError;
            if (!assignments || assignments.length === 0) return [];

            const assignmentIds = assignments.map(a => a.id);
            const assignmentMap = new Map(assignments.map(a => [a.id, a.review_id]));
            const reviewMap = new Map(reviews.map(r => [r.id, r]));

            // 3. Obtener items eliminados (to_remove_quantity > 0)
            const { data: items, error: itemsError } = await supabase
                .from('quarterly_review_items')
                .select('assignment_id, to_remove_quantity')
                .gt('to_remove_quantity', 0)
                .in('assignment_id', assignmentIds);

            if (itemsError) throw itemsError;

            // 4. Agrupar por trimestre y centro
            const groupedLosses: Record<string, QuarterlyLoss> = {};

            items?.forEach(item => {
                const reviewId = assignmentMap.get(item.assignment_id);
                if (!reviewId) return;

                const review = reviewMap.get(reviewId);
                if (!review) return;

                const key = `${review.quarter}-${review.center_id}`;

                if (!groupedLosses[key]) {
                    groupedLosses[key] = {
                        quarter: review.quarter,
                        year: review.year,
                        center_id: review.center_id,
                        center_name: review.center_name,
                        total_items_removed: 0,
                        total_value_lost: 0
                    };
                }

                groupedLosses[key].total_items_removed += item.to_remove_quantity;
                // Aquí podríamos sumar valor si tuviéramos el precio del item en esta tabla
                // Por ahora estimamos un valor medio o lo dejamos en 0
            });

            return Object.values(groupedLosses);

        } catch (error) {
            console.error('❌ Error obteniendo pérdidas trimestrales:', error);
            return [];
        }
    }

    // Obtener estadísticas completas
    async getEvolutionStats(): Promise<CenterEvolutionStats> {
        const [dailyBreakages, quarterlyLosses] = await Promise.all([
            this.getDailyBreakages(),
            this.getQuarterlyLosses()
        ]);

        return {
            dailyBreakages,
            quarterlyLosses
        };
    }
}

export const evolutionStatsService = new EvolutionStatsService();
export default evolutionStatsService;
