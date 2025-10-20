// src/services/holidayService.ts - Servicio de gestión de festivos
import { supabase } from '../lib/supabase';

export interface Holiday {
  id?: number;
  name: string;
  date: string; // YYYY-MM-DD
  type: 'national' | 'regional' | 'local';
  center_id?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

class HolidayService {
  /**
   * Obtener todos los festivos activos
   */
  async getAllHolidays(): Promise<Holiday[]> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando festivos:', error);
      return [];
    }
  }

  /**
   * Obtener festivos por centro (incluye nacionales + regionales + locales del centro)
   */
  async getHolidaysByCenter(centerId: string): Promise<Holiday[]> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('is_active', true)
        .or(`center_id.is.null,center_id.eq.${centerId}`)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando festivos del centro:', error);
      return [];
    }
  }

  /**
   * Obtener festivos por rango de fechas
   */
  async getHolidaysByDateRange(startDate: string, endDate: string, centerId?: string): Promise<Holiday[]> {
    try {
      let query = supabase
        .from('holidays')
        .select('*')
        .eq('is_active', true)
        .gte('date', startDate)
        .lte('date', endDate);

      if (centerId) {
        query = query.or(`center_id.is.null,center_id.eq.${centerId}`);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando festivos por rango:', error);
      return [];
    }
  }

  /**
   * Verificar si una fecha es festivo
   */
  async isHoliday(date: string, centerId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('holidays')
        .select('id')
        .eq('date', date)
        .eq('is_active', true);

      if (centerId) {
        query = query.or(`center_id.is.null,center_id.eq.${centerId}`);
      }

      const { data, error } = await query.limit(1);

      if (error) throw error;
      return (data && data.length > 0) || false;
    } catch (error) {
      console.error('Error verificando festivo:', error);
      return false;
    }
  }

  /**
   * Crear nuevo festivo
   */
  async createHoliday(holiday: Omit<Holiday, 'id' | 'created_at' | 'updated_at'>): Promise<Holiday | null> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .insert([{
          ...holiday,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando festivo:', error);
      return null;
    }
  }

  /**
   * Actualizar festivo
   */
  async updateHoliday(id: number, updates: Partial<Holiday>): Promise<Holiday | null> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error actualizando festivo:', error);
      return null;
    }
  }

  /**
   * Eliminar festivo (soft delete)
   */
  async deleteHoliday(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('holidays')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error eliminando festivo:', error);
      return false;
    }
  }

  /**
   * Obtener festivos nacionales predefinidos para un año
   */
  getNationalHolidays2025(): Omit<Holiday, 'id' | 'created_at' | 'updated_at'>[] {
    return [
      { name: 'Año Nuevo', date: '2025-01-01', type: 'national', center_id: null, is_active: true },
      { name: 'Reyes Magos', date: '2025-01-06', type: 'national', center_id: null, is_active: true },
      { name: 'Viernes Santo', date: '2025-04-18', type: 'national', center_id: null, is_active: true },
      { name: 'Día del Trabajo', date: '2025-05-01', type: 'national', center_id: null, is_active: true },
      { name: 'Asunción de la Virgen', date: '2025-08-15', type: 'national', center_id: null, is_active: true },
      { name: 'Fiesta Nacional', date: '2025-10-12', type: 'national', center_id: null, is_active: true },
      { name: 'Todos los Santos', date: '2025-11-01', type: 'national', center_id: null, is_active: true },
      { name: 'Constitución', date: '2025-12-06', type: 'national', center_id: null, is_active: true },
      { name: 'Inmaculada', date: '2025-12-08', type: 'national', center_id: null, is_active: true },
      { name: 'Navidad', date: '2025-12-25', type: 'national', center_id: null, is_active: true }
    ];
  }

  /**
   * Obtener festivos regionales de Andalucía
   */
  getAndalusiaHolidays2025(): Omit<Holiday, 'id' | 'created_at' | 'updated_at'>[] {
    return [
      { name: 'Día de Andalucía', date: '2025-02-28', type: 'regional', center_id: null, is_active: true },
      { name: 'Jueves Santo', date: '2025-04-17', type: 'regional', center_id: null, is_active: true }
    ];
  }
}

export const holidayService = new HolidayService();
