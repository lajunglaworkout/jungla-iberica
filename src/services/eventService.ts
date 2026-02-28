// src/services/eventService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// ===== TIPOS =====

type EventoRow = Database['public']['Tables']['eventos']['Row'];
type EventoInsert = Database['public']['Tables']['eventos']['Insert'];
type EventoUpdate = Database['public']['Tables']['eventos']['Update'];

type EventoGastoRow = Database['public']['Tables']['evento_gastos']['Row'];
type EventoGastoInsert = Database['public']['Tables']['evento_gastos']['Insert'];

type EventoParticipanteRow = Database['public']['Tables']['evento_participantes']['Row'];
type EventoParticipanteInsert = Database['public']['Tables']['evento_participantes']['Insert'];

type EventoEncuestaRow = Database['public']['Tables']['evento_encuestas']['Row'];
type EventoEncuestaInsert = Database['public']['Tables']['evento_encuestas']['Insert'];

type EventoChecklistRow = Database['public']['Tables']['evento_checklist']['Row'];

type EventoTareaRow = Database['public']['Tables']['evento_tareas']['Row'];
type EventoTareaInsert = Database['public']['Tables']['evento_tareas']['Insert'];
type EventoTareaUpdate = Database['public']['Tables']['evento_tareas']['Update'];

type EventoInformeRow = Database['public']['Tables']['evento_informes']['Row'];
type EventoInformeInsert = Database['public']['Tables']['evento_informes']['Insert'];

type EventoMaterialRow = Database['public']['Tables']['evento_materiales']['Row'];
type EventoMaterialInsert = Database['public']['Tables']['evento_materiales']['Insert'];

type EventoIngresoRow = Database['public']['Tables']['evento_ingresos']['Row'];
type EventoIngresoInsert = Database['public']['Tables']['evento_ingresos']['Insert'];

type ProveedorRow = Database['public']['Tables']['proveedores']['Row'];
type ProveedorInsert = Database['public']['Tables']['proveedores']['Insert'];

// ===== SERVICIO DE EVENTOS =====

export const eventosService = {
  /** Fetch a single evento by ID */
  async getById(eventId: number) {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching evento by id:', error);
      throw error;
    }
  },

  /** Fetch all eventos ordered by fecha_evento descending */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_evento', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all eventos:', error);
      throw error;
    }
  },

  /** Fetch eventos with selected fields and custom filters */
  async getWithFields(fields: string, filters?: { notEstadoIn?: string; orderBy?: string; ascending?: boolean }) {
    try {
      let query = supabase.from('eventos').select(fields);
      if (filters?.notEstadoIn) {
        query = query.not('estado', 'in', filters.notEstadoIn);
      }
      if (filters?.orderBy) {
        query = query.order(filters.orderBy, { ascending: filters?.ascending ?? false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching eventos with fields:', error);
      throw error;
    }
  },

  /** Fetch eventos for a given date range (calendar) */
  async getByDateRange(firstDay: string, lastDay: string) {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('id, nombre, fecha_evento, localizacion, estado')
        .gte('fecha_evento', firstDay)
        .lte('fecha_evento', lastDay)
        .order('fecha_evento');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching eventos by date range:', error);
      throw error;
    }
  },

  /** Fetch finished eventos before a given date */
  async getFinishedBefore(dateStr: string) {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('id, nombre, fecha_evento')
        .eq('estado', 'finalizado')
        .lt('fecha_evento', dateStr);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching finished eventos:', error);
      throw error;
    }
  },

  /** Count eventos in a date range */
  async countByDateRange(firstDay: string, lastDay: string) {
    try {
      const { count, error } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_evento', firstDay)
        .lte('fecha_evento', lastDay);
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting eventos by date range:', error);
      throw error;
    }
  },

  /** Count active eventos (not finalizado/cancelado) */
  async countActive() {
    try {
      const { count, error } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .not('estado', 'in', '("finalizado","cancelado")');
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting active eventos:', error);
      throw error;
    }
  },

  /** Create a new evento */
  async create(evento: EventoInsert) {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating evento:', error);
      throw error;
    }
  },

  /** Update an existing evento */
  async update(eventId: number, updates: EventoUpdate) {
    try {
      const { error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('id', eventId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating evento:', error);
      throw error;
    }
  },

  /** Delete an evento */
  async delete(eventId: number) {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting evento:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE CHECKLIST =====

export const checklistService = {
  /** Fetch overdue checklist items (incomplete, past due date) */
  async getOverdue(todayStr: string) {
    try {
      const { data, error } = await supabase
        .from('evento_checklist')
        .select('*, eventos:evento_id(id, nombre, center_id)')
        .eq('completado', false)
        .lt('fecha_limite', todayStr);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching overdue checklist:', error);
      throw error;
    }
  },

  /** Fetch upcoming checklist items (incomplete, within date range) */
  async getUpcoming(fromDate: string, toDate: string) {
    try {
      const { data, error } = await supabase
        .from('evento_checklist')
        .select('*, eventos:evento_id(id, nombre, center_id)')
        .eq('completado', false)
        .gte('fecha_limite', fromDate)
        .lte('fecha_limite', toDate);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming checklist:', error);
      throw error;
    }
  },

  /** Fetch checklist items for a specific event */
  async getByEventId(eventId: number) {
    try {
      const { data, error } = await supabase
        .from('evento_checklist')
        .select('*')
        .eq('evento_id', eventId)
        .order('fecha_limite');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching checklist by event:', error);
      throw error;
    }
  },

  /** Toggle a checklist item's completed status */
  async toggleCompleted(itemId: number, completed: boolean) {
    try {
      const { error } = await supabase
        .from('evento_checklist')
        .update({
          completado: completed,
          completado_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', itemId);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE GASTOS =====

export const gastosService = {
  /** Fetch all gastos for an event */
  async getByEventId(eventId: number) {
    try {
      const { data, error } = await supabase
        .from('evento_gastos')
        .select('*')
        .eq('evento_id', eventId)
        .order('fecha');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching gastos by event:', error);
      throw error;
    }
  },

  /** Fetch all gastos (for reports) with selected fields */
  async getAll(fields: string = 'evento_id, coste') {
    try {
      const { data, error } = await supabase
        .from('evento_gastos')
        .select(fields);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all gastos:', error);
      throw error;
    }
  },

  /** Upsert gastos for an event (insert new, update existing) */
  async upsert(gastos: Record<string, unknown>[]) {
    try {
      const { data, error } = await supabase
        .from('evento_gastos')
        .upsert(gastos)
        .select();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error upserting gastos:', error);
      throw error;
    }
  },

  /** Delete a gasto by ID */
  async delete(gastoId: number) {
    try {
      const { error } = await supabase
        .from('evento_gastos')
        .delete()
        .eq('id', gastoId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting gasto:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE PARTICIPANTES =====

export const participantesService = {
  /** Fetch all participantes for an event */
  async getByEventId(eventId: number) {
    try {
      const { data, error } = await supabase
        .from('evento_participantes')
        .select('*')
        .eq('evento_id', eventId)
        .order('created_at');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching participantes by event:', error);
      throw error;
    }
  },

  /** Fetch all participantes (for reports/dashboard) with selected fields */
  async getAll(fields: string = '*') {
    try {
      const { data, error } = await supabase
        .from('evento_participantes')
        .select(fields);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all participantes:', error);
      throw error;
    }
  },

  /** Fetch all participantes ordered by fecha_inscripcion descending */
  async getAllOrdered() {
    try {
      const { data, error } = await supabase
        .from('evento_participantes')
        .select('*')
        .order('fecha_inscripcion', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ordered participantes:', error);
      throw error;
    }
  },

  /** Count all participantes */
  async countAll() {
    try {
      const { count, error } = await supabase
        .from('evento_participantes')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting participantes:', error);
      throw error;
    }
  },

  /** Count participantes for a specific event */
  async countByEventId(eventId: number) {
    try {
      const { count, error } = await supabase
        .from('evento_participantes')
        .select('id', { count: 'exact', head: true })
        .eq('evento_id', eventId);
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting participantes by event:', error);
      throw error;
    }
  },

  /** Insert a new participante */
  async create(participante: EventoParticipanteInsert) {
    try {
      const { data, error } = await supabase
        .from('evento_participantes')
        .insert([participante])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating participante:', error);
      throw error;
    }
  },

  /** Insert a participante (raw data, for ParticipantsList modal) */
  async insertRaw(participante: Partial<EventoParticipanteInsert>) {
    try {
      const { error } = await supabase
        .from('evento_participantes')
        .insert([participante]);
      if (error) throw error;
    } catch (error) {
      console.error('Error inserting participante:', error);
      throw error;
    }
  },

  /** Upsert participantes for an event */
  async upsert(participantes: Record<string, unknown>[]) {
    try {
      const { data, error } = await supabase
        .from('evento_participantes')
        .upsert(participantes)
        .select();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error upserting participantes:', error);
      throw error;
    }
  },

  /** Update a participante field */
  async update(participanteId: number, updates: Record<string, any>) {
    try {
      const { error } = await supabase
        .from('evento_participantes')
        .update(updates)
        .eq('id', participanteId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating participante:', error);
      throw error;
    }
  },

  /** Delete a participante */
  async delete(participanteId: number) {
    try {
      const { error } = await supabase
        .from('evento_participantes')
        .delete()
        .eq('id', participanteId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting participante:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE ENCUESTAS =====

export const encuestasService = {
  /** Fetch all encuestas for an event */
  async getByEventId(eventId: number) {
    try {
      const { data, error } = await supabase
        .from('evento_encuestas')
        .select('*')
        .eq('evento_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching encuestas by event:', error);
      throw error;
    }
  },

  /** Fetch all encuestas (for reports/dashboard) with selected fields */
  async getAll(fields: string = '*') {
    try {
      let query = supabase.from('evento_encuestas').select(fields);
      if (fields === '*') {
        query = query.order('created_at', { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all encuestas:', error);
      throw error;
    }
  },

  /** Count encuestas for a specific event */
  async countByEventId(eventId: number) {
    try {
      const { count, error } = await supabase
        .from('evento_encuestas')
        .select('id', { count: 'exact', head: true })
        .eq('evento_id', eventId);
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting encuestas by event:', error);
      throw error;
    }
  },

  /** Insert a new encuesta */
  async create(encuesta: EventoEncuestaInsert) {
    try {
      const { error } = await supabase
        .from('evento_encuestas')
        .insert([encuesta]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating encuesta:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE TAREAS =====

export const tareasService = {
  /** Fetch all tareas with evento and employee info */
  async getAllWithRelations() {
    try {
      const { data, error } = await supabase
        .from('evento_tareas')
        .select(`
          *,
          eventos!inner(id, nombre),
          employees(name)
        `)
        .order('fecha_limite', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tareas with relations:', error);
      throw error;
    }
  },

  /** Count pending tareas */
  async countPending() {
    try {
      const { count, error } = await supabase
        .from('evento_tareas')
        .select('*', { count: 'exact', head: true })
        .eq('realizado', false);
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting pending tareas:', error);
      throw error;
    }
  },

  /** Toggle a tarea's realizado status */
  async toggleRealizado(tareaId: number, realizado: boolean) {
    try {
      const { error } = await supabase
        .from('evento_tareas')
        .update({
          realizado: !realizado,
          completado_at: !realizado ? new Date().toISOString() : null,
        })
        .eq('id', tareaId);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling tarea realizado:', error);
      throw error;
    }
  },

  /** Update a specific field on a tarea */
  async updateField(tareaId: number, field: string, value: unknown) {
    try {
      const { error } = await supabase
        .from('evento_tareas')
        .update({ [field]: value })
        .eq('id', tareaId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating tarea field:', error);
      throw error;
    }
  },

  /** Create a new tarea */
  async create(tarea: EventoTareaInsert) {
    try {
      const { data, error } = await supabase
        .from('evento_tareas')
        .insert([tarea])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tarea:', error);
      throw error;
    }
  },

  /** Delete a tarea */
  async delete(tareaId: number) {
    try {
      const { error } = await supabase
        .from('evento_tareas')
        .delete()
        .eq('id', tareaId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tarea:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE INFORMES =====

export const informesService = {
  /** Fetch an informe for a specific event */
  async getByEventId(eventId: number) {
    try {
      const { data, error } = await supabase
        .from('evento_informes')
        .select('*')
        .eq('evento_id', eventId)
        .single();
      // single() throws if not found; we want to return null in that case
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching informe by event:', error);
      throw error;
    }
  },

  /** Check if an informe exists for an event */
  async exists(eventId: number) {
    try {
      const { data, error } = await supabase
        .from('evento_informes')
        .select('id')
        .eq('evento_id', eventId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error checking informe existence:', error);
      throw error;
    }
  },

  /** Update an existing informe for an event */
  async update(eventId: number, informe: Record<string, any>) {
    try {
      const { error } = await supabase
        .from('evento_informes')
        .update(informe)
        .eq('evento_id', eventId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating informe:', error);
      throw error;
    }
  },

  /** Create a new informe */
  async create(informe: EventoInformeInsert) {
    try {
      const { error } = await supabase
        .from('evento_informes')
        .insert([informe]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating informe:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE INGRESOS =====

export const ingresosService = {
  /** Fetch all ingresos (for dashboard/reports) */
  async getAll(fields: string = 'importe') {
    try {
      const { data, error } = await supabase
        .from('evento_ingresos')
        .select(fields);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all ingresos:', error);
      throw error;
    }
  },

  /** Create a new ingreso */
  async create(ingreso: EventoIngresoInsert) {
    try {
      const { error } = await supabase
        .from('evento_ingresos')
        .insert([ingreso]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating ingreso:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE MATERIALES =====

export const materialesService = {
  /** Fetch all materiales */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('evento_materiales')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all materiales:', error);
      throw error;
    }
  },

  /** Create a new material */
  async create(material: EventoMaterialInsert) {
    try {
      const { error } = await supabase
        .from('evento_materiales')
        .insert([material]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },

  /** Delete a material */
  async delete(materialId: number) {
    try {
      const { error } = await supabase
        .from('evento_materiales')
        .delete()
        .eq('id', materialId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE PROVEEDORES =====

export const proveedoresService = {
  /** Fetch all proveedores */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all proveedores:', error);
      throw error;
    }
  },

  /** Create a new proveedor */
  async create(proveedor: ProveedorInsert) {
    try {
      const { error } = await supabase
        .from('proveedores')
        .insert([proveedor]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating proveedor:', error);
      throw error;
    }
  },

  /** Update an existing proveedor */
  async update(proveedorId: number, updates: Record<string, any>) {
    try {
      const { error } = await supabase
        .from('proveedores')
        .update(updates)
        .eq('id', proveedorId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating proveedor:', error);
      throw error;
    }
  },

  /** Delete a proveedor */
  async delete(proveedorId: number) {
    try {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', proveedorId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting proveedor:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE EMPLOYEES (eventos-related) =====

export const eventEmployeesService = {
  /** Fetch all employees (id, name) for assignment */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
};

// ===== SERVICIO DE CENTERS (eventos-related) =====

export const eventCentersService = {
  /** Fetch all centers (id, name) */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching centers:', error);
      throw error;
    }
  },
};

// ===== COMBINED SERVICE EXPORT =====

export const eventService = {
  eventos: eventosService,
  checklist: checklistService,
  gastos: gastosService,
  participantes: participantesService,
  encuestas: encuestasService,
  tareas: tareasService,
  informes: informesService,
  ingresos: ingresosService,
  materiales: materialesService,
  proveedores: proveedoresService,
  employees: eventEmployeesService,
  centers: eventCentersService,
};

export default eventService;
