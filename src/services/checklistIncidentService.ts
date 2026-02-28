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
  status: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada' | 'pendiente_verificacion' | 'verificada';
  inventory_item?: string;
  inventory_quantity?: number;
  has_images: boolean;
  image_urls?: string[];
  auto_notify: string[];
  notified_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  
  // Nuevos campos para el sistema de verificación
  requires_verification?: boolean;
  verification_status?: 'pendiente' | 'aprobada' | 'rechazada';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  
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
      console.log('🔍 Buscando incidencias para departamento:', department);
      
      const { data, error } = await supabase
        .from('checklist_incidents')
        .select('*')
        .eq('department', department)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo incidencias por departamento:', error);
        throw error;
      }

      console.log('📋 Resultado de la consulta:', data);
      console.log('📊 Incidencias encontradas:', data?.length || 0);
      
      return data || [];
    } catch (error) {
      console.error('❌ Error en getIncidentsByDepartment:', error);
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
   * Actualizar una incidencia
   */
  async updateIncident(
    incidentId: string, 
    updateData: Partial<ChecklistIncident>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('checklist_incidents')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) {
        console.error('Error actualizando incidencia:', error);
        throw error;
      }

      console.log('✅ Incidencia actualizada:', incidentId);
      return true;
    } catch (error) {
      console.error('Error en updateIncident:', error);
      return false;
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
      const updateData: Record<string, unknown> = {
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

  /**
   * Borrar todas las incidencias (para testing)
   */
  async clearAllIncidents(): Promise<void> {
    try {
      const { error } = await supabase
        .from('checklist_incidents')
        .delete()
        .neq('id', 0); // Borra todas las filas

      if (error) {
        console.error('Error borrando incidencias:', error);
        throw error;
      }

      console.log('✅ Todas las incidencias han sido borradas');
    } catch (error) {
      console.error('Error en clearAllIncidents:', error);
      throw error;
    }
  }

  /**
   * Crear incidencia de prueba
   */
  async createTestIncident(): Promise<ChecklistIncident> {
    try {
      const testIncident = {
        center_id: '1',
        center_name: 'Centro Sevilla',
        reporter_name: 'Francisco Giráldez',
        reporter_email: 'francisco@lajungla.com',
        incident_type: 'maintenance' as const,
        department: 'Mantenimiento',
        responsible: 'Equipo de Mantenimiento',
        title: 'Problema con equipamiento de gimnasio',
        description: 'Las mancuernas de 15kg están rotas y necesitan reparación urgente. Los usuarios no pueden completar sus rutinas de entrenamiento.',
        priority: 'alta' as const,
        status: 'abierta' as const,
        has_images: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('checklist_incidents')
        .insert([testIncident])
        .select()
        .single();

      if (error) {
        console.error('Error creando incidencia de prueba:', error);
        throw error;
      }

      console.log('✅ Incidencia de prueba creada:', data);
      return data;
    } catch (error) {
      console.error('Error en createTestIncident:', error);
      throw error;
    }
  }

  /**
   * Cerrar incidencia con verificación requerida
   */
  async closeIncidentWithVerification(
    incidentId: number, 
    resolutionNotes: string, 
    resolvedBy: string
  ): Promise<ChecklistIncident | null> {
    try {
      const { data, error } = await supabase
        .from('checklist_incidents')
        .update({
          status: 'pendiente_verificacion',
          resolution_notes: resolutionNotes,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          requires_verification: true,
          verification_status: 'pendiente',
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId)
        .select()
        .single();

      if (error) {
        console.error('Error cerrando incidencia con verificación:', error);
        throw error;
      }

      console.log('✅ Incidencia cerrada, pendiente de verificación:', data);
      return data;
    } catch (error) {
      console.error('Error en closeIncidentWithVerification:', error);
      throw error;
    }
  }

  /**
   * Verificar resolución de incidencia (por parte del reportador)
   */
  async verifyIncidentResolution(
    incidentId: number,
    isApproved: boolean,
    verificationNotes: string,
    verifiedBy: string,
    rejectionReason?: string
  ): Promise<ChecklistIncident | null> {
    try {
      const updateData: Record<string, unknown> = {
        verification_status: isApproved ? 'aprobada' : 'rechazada',
        verification_notes: verificationNotes,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isApproved) {
        updateData.status = 'verificada';
      } else {
        updateData.status = 'abierta'; // Reabrir la incidencia si es rechazada
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('checklist_incidents')
        .update(updateData)
        .eq('id', incidentId)
        .select()
        .single();

      if (error) {
        console.error('Error verificando incidencia:', error);
        throw error;
      }

      console.log('✅ Incidencia verificada:', data);
      return data;
    } catch (error) {
      console.error('Error en verifyIncidentResolution:', error);
      throw error;
    }
  }

  /**
   * Obtener incidencias pendientes de verificación para un empleado
   */
  async getIncidentsPendingVerification(reporterName: string): Promise<ChecklistIncident[]> {
    try {
      const { data, error } = await supabase
        .from('checklist_incidents')
        .select('*')
        .eq('reporter_name', reporterName)
        .eq('status', 'pendiente_verificacion')
        .order('resolved_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo incidencias pendientes de verificación:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getIncidentsPendingVerification:', error);
      return [];
    }
  }

  /**
   * Calcular tiempo máximo de respuesta según prioridad (en horas)
   */
  getMaxResponseTime(priority: ChecklistIncident['priority']): number {
    const timeMap = {
      'critica': 2,
      'alta': 6,
      'media': 24,
      'baja': 48
    };
    return timeMap[priority];
  }

  /**
   * Verificar si una incidencia está vencida
   */
  isIncidentOverdue(incident: ChecklistIncident): boolean {
    if (!incident.created_at || incident.status === 'verificada' || incident.status === 'cerrada') {
      return false;
    }

    const createdAt = new Date(incident.created_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const maxHours = this.getMaxResponseTime(incident.priority);

    return hoursElapsed > maxHours;
  }

  /**
   * Calcular tiempo restante para resolver una incidencia (en horas)
   */
  getTimeRemaining(incident: ChecklistIncident): number {
    if (!incident.created_at) return 0;

    const createdAt = new Date(incident.created_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const maxHours = this.getMaxResponseTime(incident.priority);

    return Math.max(0, maxHours - hoursElapsed);
  }

  /**
   * Obtener incidencias vencidas (para alertar al CEO)
   */
  async getOverdueIncidents(): Promise<ChecklistIncident[]> {
    try {
      const { data, error } = await supabase
        .from('checklist_incidents')
        .select('*')
        .in('status', ['abierta', 'en_proceso'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error obteniendo incidencias:', error);
        throw error;
      }

      // Filtrar las que están vencidas
      const overdueIncidents = (data || []).filter(incident => 
        this.isIncidentOverdue(incident)
      );

      console.log(`⏰ Incidencias vencidas encontradas: ${overdueIncidents.length}`);
      return overdueIncidents;
    } catch (error) {
      console.error('Error en getOverdueIncidents:', error);
      return [];
    }
  }

  /**
   * Obtener incidencias próximas a vencer (últimas 2 horas antes del límite)
   */
  async getIncidentsNearDeadline(): Promise<ChecklistIncident[]> {
    try {
      const { data, error } = await supabase
        .from('checklist_incidents')
        .select('*')
        .in('status', ['abierta', 'en_proceso'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error obteniendo incidencias:', error);
        throw error;
      }

      // Filtrar las que están cerca de vencer (menos de 2 horas restantes)
      const nearDeadline = (data || []).filter(incident => {
        const timeRemaining = this.getTimeRemaining(incident);
        return timeRemaining > 0 && timeRemaining <= 2;
      });

      console.log(`⚠️ Incidencias próximas a vencer: ${nearDeadline.length}`);
      return nearDeadline;
    } catch (error) {
      console.error('Error en getIncidentsNearDeadline:', error);
      return [];
    }
  }
}

export const checklistIncidentService = new ChecklistIncidentService();
export default checklistIncidentService;
