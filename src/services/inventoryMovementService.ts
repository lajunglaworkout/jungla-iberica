import { supabase } from '../lib/supabase';

export interface InventoryMovement {
    id?: number;
    inventory_item_id: number;
    user_id: string;
    user_name: string;
    center_id: number;
    type: 'adjustment' | 'purchase' | 'consumption' | 'return' | 'initial';
    quantity_change: number;
    previous_quantity: number;
    new_quantity: number;
    reason: string;
    created_at?: string;

    // Join fields
    item_name?: string;
    item_category?: string;
}

class InventoryMovementService {

    // Registrar un movimiento
    async recordMovement(movement: InventoryMovement) {
        try {
            console.log('📝 Registrando movimiento de inventario:', movement);

            const { data, error } = await supabase
                .from('inventory_movements')
                .insert(movement)
                .select()
                .single();

            if (error) {
                console.error('❌ Error registrando movimiento:', error);
                throw error;
            }

            return { success: true, movement: data };
        } catch (error) {
            console.error('❌ Error registrando movimiento:', error);
            return { success: false, error };
        }
    }

    // Obtener movimientos con filtros
    async getMovements(filters?: {
        center_id?: number;
        inventory_item_id?: number;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }) {
        try {
            let query = supabase
                .from('inventory_movements')
                .select(`
          *,
          inventory_items (
            nombre_item,
            name,
            categoria,
            category
          )
        `)
                .order('created_at', { ascending: false });

            if (filters?.center_id) {
                query = query.eq('center_id', filters.center_id);
            }

            if (filters?.inventory_item_id) {
                query = query.eq('inventory_item_id', filters.inventory_item_id);
            }

            if (filters?.startDate) {
                query = query.gte('created_at', filters.startDate);
            }

            if (filters?.endDate) {
                query = query.lte('created_at', filters.endDate);
            }

            if (filters?.limit) {
                query = query.limit(filters.limit);
            } else {
                query = query.limit(100); // Límite por defecto
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Error obteniendo movimientos:', error);
                throw error;
            }

            // Mapear datos para aplanar la estructura
            const mappedMovements = data.map((m: any) => ({
                ...m,
                item_name: m.inventory_items?.nombre_item || m.inventory_items?.name || 'Item eliminado',
                item_category: m.inventory_items?.categoria || m.inventory_items?.category || 'Sin categoría'
            }));

            return { success: true, movements: mappedMovements };
        } catch (error) {
            console.error('❌ Error obteniendo movimientos:', error);
            return { success: false, error };
        }
    }
}

export const inventoryMovementService = new InventoryMovementService();
export default inventoryMovementService;
