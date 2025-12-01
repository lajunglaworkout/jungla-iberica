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

    // Crear tabla si no existe
    async createTableIfNotExists() {
        try {
            console.log('🔧 Verificando/creando tabla inventory_movements...');

            const createTableSQL = `
        CREATE TABLE IF NOT EXISTS inventory_movements (
          id BIGSERIAL PRIMARY KEY,
          inventory_item_id BIGINT REFERENCES inventory_items(id),
          user_id TEXT,
          user_name TEXT,
          center_id BIGINT,
          type TEXT,
          quantity_change INTEGER,
          previous_quantity INTEGER,
          new_quantity INTEGER,
          reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

            const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

            if (error) {
                console.error('❌ Error creando tabla inventory_movements:', error);
                // Fallback: intentar crearla via insert si falla el RPC (a veces pasa en desarrollo)
                return { success: false, error };
            }

            // Crear índices
            const indexSQL = `
        CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_movements_center_id ON inventory_movements(center_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);
      `;

            await supabase.rpc('exec_sql', { sql: indexSQL });

            console.log('✅ Tabla inventory_movements verificada');

            // Asegurar que existe la columna max_stock en inventory_items
            await this.ensureMaxStockColumn();

            return { success: true };
        } catch (error) {
            console.error('❌ Error en createTableIfNotExists:', error);
            return { success: false, error };
        }
    }

    // Asegurar columna max_stock
    async ensureMaxStockColumn() {
        try {
            console.log('🔧 Verificando columna max_stock en inventory_items...');
            const sql = `
        ALTER TABLE inventory_items 
        ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 20;
      `;
            const { error } = await supabase.rpc('exec_sql', { sql });
            if (error) throw error;
            console.log('✅ Columna max_stock verificada');
        } catch (error) {
            console.error('❌ Error creando columna max_stock:', error);
        }
    }


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
                // Si el error es que la tabla no existe, intentamos crearla y reintentamos
                if (error.message?.includes('relation "inventory_movements" does not exist')) {
                    console.log('⚠️ La tabla no existe, intentando crearla...');
                    await this.createTableIfNotExists();

                    // Reintento
                    const { data: retryData, error: retryError } = await supabase
                        .from('inventory_movements')
                        .insert(movement)
                        .select()
                        .single();

                    if (retryError) throw retryError;
                    return { success: true, movement: retryData };
                }
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
                // Si la tabla no existe, crearla y devolver lista vacía
                if (error.message?.includes('relation "inventory_movements" does not exist')) {
                    console.log('⚠️ La tabla inventory_movements no existe, creándola...');
                    await this.createTableIfNotExists();
                    return { success: true, movements: [] };
                }
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
