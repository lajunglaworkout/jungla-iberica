// src/services/leadService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// Tipos para las operaciones de leads
type Lead = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];

type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row'];
type LeadInteractionInsert = Database['public']['Tables']['lead_interactions']['Insert'];
type LeadInteractionUpdate = Database['public']['Tables']['lead_interactions']['Update'];

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

type Tarea = Database['public']['Tables']['tareas']['Row'];
type TareaInsert = Database['public']['Tables']['tareas']['Insert'];

// ===== SERVICIO DE LEADS =====

export const leadService = {
  // Obtener leads con filtro opcional de estado
  async getLeads(filtroEstado?: string): Promise<Lead[]> {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroEstado && filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLeads:', error);
      throw error;
    }
  },

  // Contar leads activos
  async countActiveLeads(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['prospecto', 'contactado', 'reunion', 'propuesta']);

      if (error) {
        console.error('Error counting active leads:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in countActiveLeads:', error);
      throw error;
    }
  },

  // Obtener leads para reuniones (seleccion reducida de campos)
  async getLeadsForMeeting(): Promise<Pick<Lead, 'id' | 'nombre' | 'email' | 'telefono' | 'empresa' | 'proyecto_nombre'>[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, nombre, email, telefono, empresa, proyecto_nombre')
        .in('estado', ['prospecto', 'contactado', 'reunion', 'propuesta'])
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching leads for meeting:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLeadsForMeeting:', error);
      throw error;
    }
  },

  // Crear un nuevo lead
  async createLead(leadData: LeadInsert): Promise<Lead> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createLead:', error);
      throw error;
    }
  },

  // Actualizar fecha de ultimo contacto de un lead
  async updateLeadLastContact(leadId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ fecha_ultimo_contacto: new Date().toISOString() })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead last contact:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateLeadLastContact:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE INTERACCIONES =====

export const interactionService = {
  // Obtener interacciones de un lead
  async getByLeadId(leadId: string): Promise<LeadInteraction[]> {
    try {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error fetching interactions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getByLeadId:', error);
      throw error;
    }
  },

  // Crear una nueva interaccion
  async create(interactionData: LeadInteractionInsert): Promise<LeadInteraction> {
    try {
      const { data, error } = await supabase
        .from('lead_interactions')
        .insert([interactionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating interaction:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create interaction:', error);
      throw error;
    }
  },

  // Actualizar una interaccion (ej: vincular tarea)
  async update(interactionId: string, updateData: LeadInteractionUpdate): Promise<void> {
    try {
      const { error } = await supabase
        .from('lead_interactions')
        .update(updateData)
        .eq('id', interactionId);

      if (error) {
        console.error('Error updating interaction:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update interaction:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE PROYECTOS =====

export const projectService = {
  // Obtener proyectos con filtros opcionales de tipo y estado
  async getProjects(filtroTipo?: string, filtroEstado?: string): Promise<Project[]> {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroTipo && filtroTipo !== 'todos') {
        query = query.eq('tipo', filtroTipo);
      }

      if (filtroEstado && filtroEstado !== 'todos') {
        query = query.eq('status', filtroEstado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  },

  // Contar proyectos activos
  async countActiveProjects(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) {
        console.error('Error counting active projects:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in countActiveProjects:', error);
      throw error;
    }
  },

  // Obtener proyectos activos (limit 5, para dashboard)
  async getActiveProjects(limit: number = 5): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .limit(limit);

      if (error) {
        console.error('Error fetching active projects:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveProjects:', error);
      throw error;
    }
  },

  // Obtener proyectos disponibles para leads (campos reducidos)
  async getAvailableForLeads(): Promise<Pick<Project, 'id' | 'name' | 'ubicacion' | 'valor_proyecto' | 'status'>[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, ubicacion, valor_proyecto, status')
        .in('status', ['active', 'en_venta', 'planificacion']);

      if (error) {
        console.error('Error fetching available projects:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableForLeads:', error);
      throw error;
    }
  },

  // Crear un nuevo proyecto
  async create(projectData: ProjectInsert): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create project:', error);
      throw error;
    }
  },

  // Actualizar un proyecto
  async update(projectId: string, projectData: ProjectUpdate): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in update project:', error);
      throw error;
    }
  },

  // Eliminar un proyecto
  async delete(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete project:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE TAREAS (solo para seguimiento de leads) =====

export const leadTaskService = {
  // Crear tarea de seguimiento
  async createFollowUpTask(taskData: TareaInsert): Promise<Tarea> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error('Error creating follow-up task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createFollowUpTask:', error);
      throw error;
    }
  },
};

export const getActiveLeads = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, nombre, email, telefono, empresa, proyecto_nombre, estado')
      .in('estado', ['prospecto', 'contactado', 'reunion', 'propuesta', 'negociacion'])
      .order('nombre', { ascending: true });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};
