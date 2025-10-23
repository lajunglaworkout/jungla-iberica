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
      { id: 'ap1', titulo: 'Avisar apertura vía WhatsApp', descripcion: 'Enviar mensaje de apertura del centro para que quede constancia', completado: false, estado: 'pendiente' },
      { id: 'ap2', titulo: 'Encender pantallas y equipo de música', descripcion: 'Activar todas las pantallas necesarias para el entrenamiento y el sistema de audio', completado: false, estado: 'pendiente' },
      { id: 'ap3', titulo: 'Vuelta de reconocimiento de instalaciones', descripcion: 'Revisar rápidamente todas las instalaciones del centro', completado: false, estado: 'pendiente' },
      { id: 'ap4', titulo: 'Revisar preparación de sala y pizarras', descripcion: 'Comprobar que la sala está preparada para el entrenamiento del día y las pizarras están actualizadas', completado: false, estado: 'pendiente' },
      { id: 'ap5', titulo: 'Apertura de puertas y portón principal', descripcion: 'Abrir las puertas para la llegada de clientes (lluvia o frío solo puerta pequeña)', completado: false, estado: 'pendiente' },
      { id: 'ap6', titulo: 'Actualizar listado de pagos', descripcion: 'Actualizar el listado de pagos realizados durante la jornada', completado: false, estado: 'pendiente' },
      { id: 'ap7', titulo: 'Comprobar máquina de agua', descripcion: 'Verificar capacidad de la máquina de agua y recargar si es necesario', completado: false, estado: 'pendiente' },
      { id: 'ap8', titulo: 'Revisión de baños', descripcion: 'Retirar bolsas de basura, comprobar grifos cerrados, dejar puertas abiertas para ventilación', completado: false, estado: 'pendiente' },
      { id: 'ap9', titulo: 'Encender aire central', descripcion: 'Activar el aire central si es necesario o si los clientes lo solicitan', completado: false, estado: 'pendiente' },
      { id: 'ap10', titulo: 'Activar música', descripcion: 'Poner música ambiental para el centro', completado: false, estado: 'pendiente' },
      { id: 'ap11', titulo: 'Preparar zona funcional y calistenia', descripcion: 'A la llegada del segundo entrenador, preparar la zona para funcional y calistenia', completado: false, estado: 'pendiente' }
    ];
  }

  private getDefaultLimpiezaTasks() {
    return [
      { id: 'lz1', titulo: 'Zona 1 - Caucho t.inf', completado: false, estado: 'pendiente', responsable: '' },
      { id: 'lz2', titulo: 'Zona 2 - Cubo lima', completado: false, estado: 'pendiente', responsable: '' },
      { id: 'lz3', titulo: 'Zona 3 - Interior barras', completado: false, estado: 'pendiente', responsable: '' },
      { id: 'lz4', titulo: 'Zona 4 - Cubo negro', completado: false, estado: 'pendiente', responsable: '' },
      { id: 'lz5', titulo: 'Zona 5 - Recepción / Entrada', completado: false, estado: 'pendiente', responsable: '' }
    ];
  }

  private getDefaultCierreTasks() {
    return [
      { id: 'ci1', titulo: 'Redactar entrenamiento del día siguiente', descripcion: 'Escribir en las pizarras el entrenamiento para el día siguiente', completado: false, estado: 'pendiente' },
      { id: 'ci2', titulo: 'Montaje de zonas de entrenamiento', descripcion: 'Montar las zonas según los bloques dispuestos en la pizarra', completado: false, estado: 'pendiente' },
      { id: 'ci3', titulo: 'Recogida de material', descripcion: 'Recoger material tanto en zona interior como exterior', completado: false, estado: 'pendiente' },
      { id: 'ci4', titulo: 'Actualizar listado de pagos', descripcion: 'Actualizar pagos realizados durante la jornada', completado: false, estado: 'pendiente' },
      { id: 'ci5', titulo: 'Comprobar máquina de agua', descripcion: 'Verificar capacidad y recargar si es necesario', completado: false, estado: 'pendiente' },
      { id: 'ci6', titulo: 'Revisión de baños', descripcion: 'Retirar basura, comprobar grifos, dejar puertas abiertas', completado: false, estado: 'pendiente' },
      { id: 'ci7', titulo: 'Revisión de duchas', descripcion: 'Comprobar anomalías, que no quede nadie, secar exceso de agua', completado: false, estado: 'pendiente' },
      { id: 'ci8', titulo: 'Vuelta de reconocimiento final', descripcion: 'No dejar desechos (agua, papeles, prendas). Recepción y sala despejados', completado: false, estado: 'pendiente' },
      { id: 'ci9', titulo: 'Apagar material electrónico', descripcion: 'Apagar todo excepto luces exteriores y cuadro de luz', completado: false, estado: 'pendiente' },
      { id: 'ci10', titulo: 'Cerrar centro y tirar basura', descripcion: 'Asegurar correcto cierre del centro y tirar la basura', completado: false, estado: 'pendiente' }
    ];
  }
}

export const checklistHistoryService = new ChecklistHistoryService();
export default checklistHistoryService;
