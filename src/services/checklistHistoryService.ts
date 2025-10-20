// src/services/checklistHistoryService.ts
import { supabase } from '../lib/supabase';

export interface ChecklistHistory {
  id?: number;
  center_id: string;
  center_name: string;
  date: string;
  apertura_tasks: any[];
  limpieza_tasks: any[];
  cierre_tasks: any[];
  incidencias: any[];
  firma_apertura?: any;
  firma_cierre?: any;
  status: 'pendiente' | 'en_progreso' | 'completado';
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

class ChecklistHistoryService {
  /**
   * Obtener checklist de una fecha específica
   */
  async getChecklistByDate(centerId: string, date: string): Promise<ChecklistHistory | null> {
    try {
      const { data, error } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('center_id', centerId)
        .eq('date', date)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error obteniendo checklist por fecha:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en getChecklistByDate:', error);
      return null;
    }
  }

  /**
   * Obtener checklist del día actual (o crear uno nuevo si no existe)
   */
  async getTodayChecklist(centerId: string, centerName: string): Promise<ChecklistHistory> {
    const today = new Date().toISOString().split('T')[0];
    
    // Intentar obtener el checklist de hoy
    let checklist = await this.getChecklistByDate(centerId, today);
    
    // Si no existe, crear uno nuevo
    if (!checklist) {
      console.log('📋 No existe checklist para hoy, creando uno nuevo...');
      checklist = await this.createDailyChecklist(centerId, centerName);
    }
    
    return checklist!;
  }

  /**
   * Crear un nuevo checklist diario con tareas por defecto
   */
  async createDailyChecklist(centerId: string, centerName: string): Promise<ChecklistHistory> {
    const today = new Date().toISOString().split('T')[0];
    
    const defaultChecklist = {
      center_id: centerId,
      center_name: centerName,
      date: today,
      apertura_tasks: this.getDefaultAperturaTasks(),
      limpieza_tasks: this.getDefaultLimpiezaTasks(),
      cierre_tasks: this.getDefaultCierreTasks(),
      incidencias: [],
      status: 'pendiente' as const,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('daily_checklists')
        .insert([defaultChecklist])
        .select()
        .single();

      if (error) {
        console.error('Error creando checklist diario:', error);
        throw error;
      }

      console.log('✅ Checklist diario creado:', data);
      return data;
    } catch (error) {
      console.error('Error en createDailyChecklist:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de checklists (últimos 30 días)
   */
  async getChecklistHistory(centerId: string, days: number = 30): Promise<ChecklistHistory[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('center_id', centerId)
        .gte('date', startDateStr)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error obteniendo historial:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getChecklistHistory:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de cumplimiento
   */
  async getCompletionStats(centerId: string, days: number = 7): Promise<{
    totalDays: number;
    completedDays: number;
    completionRate: number;
    averageTasks: number;
  }> {
    try {
      const history = await this.getChecklistHistory(centerId, days);
      
      const totalDays = history.length;
      const completedDays = history.filter(h => h.status === 'completado').length;
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      
      const totalTasks = history.reduce((sum, h) => {
        const apertura = h.apertura_tasks?.filter((t: any) => t.completada).length || 0;
        const limpieza = h.limpieza_tasks?.filter((t: any) => t.completada).length || 0;
        const cierre = h.cierre_tasks?.filter((t: any) => t.completada).length || 0;
        return sum + apertura + limpieza + cierre;
      }, 0);
      
      const averageTasks = totalDays > 0 ? totalTasks / totalDays : 0;

      return {
        totalDays,
        completedDays,
        completionRate,
        averageTasks
      };
    } catch (error) {
      console.error('Error en getCompletionStats:', error);
      return {
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        averageTasks: 0
      };
    }
  }

  /**
   * Verificar si hay checklist de ayer sin completar
   */
  async checkIncompleteYesterday(centerId: string): Promise<ChecklistHistory | null> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const checklist = await this.getChecklistByDate(centerId, yesterdayStr);
    
    if (checklist && checklist.status !== 'completado') {
      return checklist;
    }
    
    return null;
  }

  // ============================================
  // TAREAS POR DEFECTO
  // ============================================

  private getDefaultAperturaTasks() {
    return [
      { id: 1, texto: 'Encender luces y climatización', completada: false, responsable: '', hora: '' },
      { id: 2, texto: 'Revisar limpieza general del centro', completada: false, responsable: '', hora: '' },
      { id: 3, texto: 'Verificar funcionamiento de equipos', completada: false, responsable: '', hora: '' },
      { id: 4, texto: 'Comprobar stock de productos de limpieza', completada: false, responsable: '', hora: '' },
      { id: 5, texto: 'Revisar vestuarios y duchas', completada: false, responsable: '', hora: '' },
      { id: 6, texto: 'Verificar sistema de música y pantallas', completada: false, responsable: '', hora: '' },
      { id: 7, texto: 'Comprobar temperatura del agua', completada: false, responsable: '', hora: '' },
      { id: 8, texto: 'Revisar recepción y zona de espera', completada: false, responsable: '', hora: '' },
      { id: 9, texto: 'Verificar accesos y control de entrada', completada: false, responsable: '', hora: '' },
      { id: 10, texto: 'Comprobar botiquín y equipos de emergencia', completada: false, responsable: '', hora: '' },
      { id: 11, texto: 'Abrir puertas y portón principal', completada: false, responsable: '', hora: '' }
    ];
  }

  private getDefaultLimpiezaTasks() {
    return [
      { id: 1, texto: 'Limpieza de vestuarios', completada: false, responsable: '', hora: '' },
      { id: 2, texto: 'Limpieza de duchas', completada: false, responsable: '', hora: '' },
      { id: 3, texto: 'Reposición de papel y jabón', completada: false, responsable: '', hora: '' },
      { id: 4, texto: 'Limpieza de zona de entrenamiento', completada: false, responsable: '', hora: '' },
      { id: 5, texto: 'Desinfección de equipos', completada: false, responsable: '', hora: '' }
    ];
  }

  private getDefaultCierreTasks() {
    return [
      { id: 1, texto: 'Verificar que todos los clientes han salido', completada: false, responsable: '', hora: '' },
      { id: 2, texto: 'Apagar equipos y máquinas', completada: false, responsable: '', hora: '' },
      { id: 3, texto: 'Revisar vestuarios y recoger objetos olvidados', completada: false, responsable: '', hora: '' },
      { id: 4, texto: 'Cerrar ventanas y puertas interiores', completada: false, responsable: '', hora: '' },
      { id: 5, texto: 'Apagar luces y climatización', completada: false, responsable: '', hora: '' },
      { id: 6, texto: 'Verificar sistema de alarma', completada: false, responsable: '', hora: '' },
      { id: 7, texto: 'Comprobar que no hay incidencias pendientes', completada: false, responsable: '', hora: '' },
      { id: 8, texto: 'Cerrar caja y cuadrar efectivo', completada: false, responsable: '', hora: '' },
      { id: 9, texto: 'Activar alarma de seguridad', completada: false, responsable: '', hora: '' },
      { id: 10, texto: 'Cerrar portón principal', completada: false, responsable: '', hora: '' }
    ];
  }
}

export const checklistHistoryService = new ChecklistHistoryService();
export default checklistHistoryService;
