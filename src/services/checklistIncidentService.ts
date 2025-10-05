// src/services/checklistIncidentService.ts
import { supabase } from '../lib/supabase';

export interface ChecklistIncident {
  id?: number;
  center_id: string;
  center_name: string;
  reporter_id?: string;
  reporter_name: string;
  incident_type: 'maintenance' | 'logistics' | 'hr' | 'security';
  department: string;
  responsible: string;
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  status: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';
  inventory_item?: string;
  inventory_quantity?: number;
  has_images: boolean;
  image_urls?: string[];
  auto_notify: string[];
  notified_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IncidentStats {
  center_id: string;
  center_name: string;
  total_incidents: number;
  open_incidents: number;
  resolved_incidents: number;
  critical_incidents: number;
  avg_resolution_time?: string;
}

class ChecklistIncidentService {
  
  /**
   * Crear una nueva incidencia
   */
  async createIncident(incidentData: Omit<ChecklistIncident, 'id' | 'created_at' | 'updated_at'>): Promise<ChecklistIncident | null> {
    try {
      const { data, error } = await supabase
        .from('checklist_incidents')
        .insert([incidentData])
        .select()
        .single();

      if (error) {
        console.error('Error creando incidencia:', error);
        throw error;
      }

      console.log('✅ Incidencia creada:', data);
      return data;
    } catch (error) {
      console.error('Error en createIncident:', error);
      return null;
    }
  }

  /**
   * Obtener incidencias por centro
   */
  async getIncidentsByCenter(centerId: string, limit: number = 50): Promise<ChecklistIncident[]> {
    try {
      const { data, error } = await supabase
        .from('checklist_incidents')
        .select('*')
        .eq('center_id', centerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error obteniendo incidencias:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getIncidentsByCenter:', error);
      return [];
    }
  }

  /**
   * Obtener incidencias por departamento
   */
  async getIncidentsByDepartment(department: string, limit: number = 50): Promise<ChecklistIncident[]> {
    try {
      const { data, error } = await supabase
        .from('checklist_incidents')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error obteniendo incidencias por departamento:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getIncidentsByDepartment:', error);
      return [];
    }
  }

  /**
   * Obtener incidencias pendientes (abiertas o en proceso)
   */
  async getPendingIncidents(centerId?: string): Promise<ChecklistIncident[]> {
    try {
      let query = supabase
        .from('checklist_incidents')
        .select('*')
        .in('status', ['abierta', 'en_proceso'])
        .order('priority', { ascending: false }) // Críticas primero
        .order('created_at', { ascending: true }); // Más antiguas primero

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo incidencias pendientes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getPendingIncidents:', error);
      return [];
    }
  }

  /**
   * Actualizar estado de una incidencia
   */
  async updateIncidentStatus(
    incidentId: number, 
    status: ChecklistIncident['status'], 
    resolvedBy?: string,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resuelta' || status === 'cerrada') {
        updateData.resolved_by = resolvedBy;
        updateData.resolved_at = new Date().toISOString();
        if (resolutionNotes) {
          updateData.resolution_notes = resolutionNotes;
        }
      }

      const { error } = await supabase
        .from('checklist_incidents')
        .update(updateData)
        .eq('id', incidentId);

      if (error) {
        console.error('Error actualizando incidencia:', error);
        throw error;
      }

      console.log('✅ Incidencia actualizada:', incidentId);
      return true;
    } catch (error) {
      console.error('Error en updateIncidentStatus:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de incidencias
   */
  async getIncidentStats(centerId?: string): Promise<IncidentStats[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_incident_stats_by_center', { 
          center_filter: centerId || null 
        });

      if (error) {
        console.error('Error obteniendo estadísticas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getIncidentStats:', error);
      return [];
    }
  }

  /**
   * Obtener incidencias críticas
   */
  async getCriticalIncidents(centerId?: string): Promise<ChecklistIncident[]> {
    try {
      let query = supabase
        .from('checklist_incidents')
        .select('*')
        .eq('priority', 'critica')
        .in('status', ['abierta', 'en_proceso'])
        .order('created_at', { ascending: true });

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo incidencias críticas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getCriticalIncidents:', error);
      return [];
    }
  }

  /**
   * Buscar incidencias por texto
   */
  async searchIncidents(searchTerm: string, centerId?: string): Promise<ChecklistIncident[]> {
    try {
      let query = supabase
        .from('checklist_incidents')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,reporter_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error buscando incidencias:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en searchIncidents:', error);
      return [];
    }
  }

  /**
   * Obtener incidencias recientes (últimas 24 horas)
   */
  async getRecentIncidents(centerId?: string): Promise<ChecklistIncident[]> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let query = supabase
        .from('checklist_incidents')
        .select('*')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo incidencias recientes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getRecentIncidents:', error);
      return [];
    }
  }
}

export const checklistIncidentService = new ChecklistIncidentService();
export default checklistIncidentService;
