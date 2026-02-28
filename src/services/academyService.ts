// src/services/academyService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// Tipos para las operaciones de Academy
type AcademyModule = Database['public']['Tables']['academy_modules']['Row'];
type AcademyLesson = Database['public']['Tables']['academy_lessons']['Row'];
type AcademyLessonInsert = Database['public']['Tables']['academy_lessons']['Insert'];
type AcademyLessonUpdate = Database['public']['Tables']['academy_lessons']['Update'];
type AcademyLessonBlock = Database['public']['Tables']['academy_lesson_blocks']['Row'];
type AcademyLessonBlockInsert = Database['public']['Tables']['academy_lesson_blocks']['Insert'];
type AcademyLessonBlockUpdate = Database['public']['Tables']['academy_lesson_blocks']['Update'];
type AcademyBlockDownloadable = Database['public']['Tables']['academy_block_downloadables']['Row'];
type AcademyBlockDownloadableInsert = Database['public']['Tables']['academy_block_downloadables']['Insert'];
type AcademyBlockDownloadableUpdate = Database['public']['Tables']['academy_block_downloadables']['Update'];
type AcademyTask = Database['public']['Tables']['academy_tasks']['Row'];
type AcademyTaskInsert = Database['public']['Tables']['academy_tasks']['Insert'];
type AcademyTaskUpdate = Database['public']['Tables']['academy_tasks']['Update'];

// ===== SERVICIOS DE MÓDULOS =====

export const moduleService = {
  // Obtener todos los módulos ordenados
  async getAll(): Promise<AcademyModule[]> {
    try {
      const { data, error } = await supabase
        .from('academy_modules')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching modules:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll modules:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE LECCIONES =====

export const lessonService = {
  // Obtener lecciones por módulo
  async getByModule(moduleId: string): Promise<AcademyLesson[]> {
    try {
      const { data, error } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching lessons:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getByModule lessons:', error);
      throw error;
    }
  },

  // Crear nueva lección
  async create(lesson: AcademyLessonInsert): Promise<AcademyLesson> {
    try {
      const { data, error } = await supabase
        .from('academy_lessons')
        .insert([lesson])
        .select()
        .single();

      if (error) {
        console.error('Error creating lesson:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create lesson:', error);
      throw error;
    }
  },

  // Actualizar lección
  async update(id: string, updates: AcademyLessonUpdate): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_lessons')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating lesson:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update lesson:', error);
      throw error;
    }
  },

  // Eliminar lección
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_lessons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lesson:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete lesson:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE BLOQUES =====

export const blockService = {
  // Obtener bloques por lección
  async getByLesson(lessonId: string): Promise<AcademyLessonBlock[]> {
    try {
      const { data, error } = await supabase
        .from('academy_lesson_blocks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('block_number', { ascending: true });

      if (error) {
        console.error('Error fetching blocks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getByLesson blocks:', error);
      throw error;
    }
  },

  // Crear bloques (batch insert)
  async createMany(blocks: AcademyLessonBlockInsert[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_lesson_blocks')
        .insert(blocks);

      if (error) {
        console.error('Error creating blocks:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in createMany blocks:', error);
      throw error;
    }
  },

  // Actualizar bloque
  async update(id: string, updates: AcademyLessonBlockUpdate): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_lesson_blocks')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating block:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update block:', error);
      throw error;
    }
  },

  // Eliminar bloques por lección
  async deleteByLesson(lessonId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_lesson_blocks')
        .delete()
        .eq('lesson_id', lessonId);

      if (error) {
        console.error('Error deleting blocks by lesson:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteByLesson blocks:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE DESCARGABLES =====

export const downloadableService = {
  // Obtener descargables por bloque
  async getByBlock(blockId: string): Promise<AcademyBlockDownloadable[]> {
    try {
      const { data, error } = await supabase
        .from('academy_block_downloadables')
        .select('*')
        .eq('block_id', blockId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching downloadables:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getByBlock downloadables:', error);
      throw error;
    }
  },

  // Crear descargable
  async create(downloadable: AcademyBlockDownloadableInsert): Promise<AcademyBlockDownloadable[]> {
    try {
      const { data, error } = await supabase
        .from('academy_block_downloadables')
        .insert(downloadable)
        .select();

      if (error) {
        console.error('Error creating downloadable:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in create downloadable:', error);
      throw error;
    }
  },

  // Actualizar descargable
  async update(id: string, updates: AcademyBlockDownloadableUpdate): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_block_downloadables')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating downloadable:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update downloadable:', error);
      throw error;
    }
  },

  // Eliminar descargable
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_block_downloadables')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting downloadable:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete downloadable:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE TAREAS =====

export const academyTaskService = {
  // Obtener tareas con filtros opcionales
  async getAll(filters?: {
    status?: string;
    assignedTo?: string;
  }): Promise<AcademyTask[]> {
    try {
      let query = supabase
        .from('academy_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching academy tasks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll academy tasks:', error);
      throw error;
    }
  },

  // Crear tarea
  async create(task: AcademyTaskInsert): Promise<AcademyTask> {
    try {
      const { data, error } = await supabase
        .from('academy_tasks')
        .insert([task])
        .select()
        .single();

      if (error) {
        console.error('Error creating academy task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create academy task:', error);
      throw error;
    }
  },

  // Actualizar tarea
  async update(id: string, updates: AcademyTaskUpdate): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_tasks')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating academy task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update academy task:', error);
      throw error;
    }
  },

  // Eliminar tarea
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting academy task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete academy task:', error);
      throw error;
    }
  },

  // Buscar tareas existentes por título y created_by (para sync deduplication)
  async findByTitleAndCreator(title: string, createdBy: string): Promise<AcademyTask[]> {
    try {
      const { data, error } = await supabase
        .from('academy_tasks')
        .select('id')
        .eq('title', title)
        .eq('created_by', createdBy);

      if (error) {
        console.error('Error finding tasks by title and creator:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in findByTitleAndCreator:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE CONTENIDO COMPARTIDO =====

export const sharedContentService = {
  // Obtener todos los recursos compartidos
  async getAll(): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from('academy_shared_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shared content:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll shared content:', error);
      throw error;
    }
  },

  // Crear recurso compartido
  async create(resource: {
    title: string;
    content: string;
    type: string;
    category?: string;
    tags?: string[];
    created_by?: string;
    is_public?: boolean;
    updated_at?: string;
  }): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase
        .from('academy_shared_content')
        .insert([resource])
        .select()
        .single();

      if (error) {
        console.error('Error creating shared content:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create shared content:', error);
      throw error;
    }
  },

  // Actualizar recurso compartido
  async update(id: string, updates: {
    title?: string;
    content?: string;
    type?: string;
    category?: string;
    tags?: string[];
    updated_at?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_shared_content')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating shared content:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update shared content:', error);
      throw error;
    }
  },

  // Eliminar recurso compartido
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('academy_shared_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shared content:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete shared content:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE USUARIOS (helpers para Academy) =====

export const academyUserService = {
  // Buscar usuario por email
  async findByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error) {
        // .single() throws when no rows found - this is expected
        if (error.code === 'PGRST116') return null;
        console.error('Error finding user by email:', error);
        throw error;
      }

      return data;
    } catch (error) {
      // Re-throw only if not a "no rows" error
      if ((error as { code?: string })?.code === 'PGRST116') return null;
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE REUNIONES (helpers para sync de tareas) =====

export const academyMeetingService = {
  // Obtener reuniones de Academy con tareas
  async getAcademyMeetings(): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id, title, tasks, date, department')
        .ilike('department', '%academy%');

      if (error) {
        console.error('Error fetching academy meetings:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAcademyMeetings:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE DASHBOARD (métricas) =====

export const academyDashboardService = {
  // Conteo seguro de registros de una tabla (no falla si la tabla no existe)
  async safeCount(table: string, filter?: { field: string; value: string; op?: string }): Promise<number> {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filter) {
        if (filter.op === 'gt') {
          query = query.gt(filter.field, filter.value);
        } else {
          query = query.eq(filter.field, filter.value);
        }
      }
      const { count } = await query;
      return count || 0;
    } catch {
      console.warn(`Table ${table} not found or query failed`);
      return 0;
    }
  },

  // Obtener todas las métricas del dashboard
  async getMetrics(): Promise<{
    totalModules: number;
    totalLessons: number;
    pendingTasks: number;
    activeTutors: number;
    activeCenters: number;
    activeStudents: number;
    activeCompanies: number;
    upcomingCohorts: number;
  }> {
    try {
      const [modulesCount, lessonsCount, tasksCount, tutorsCount, centersCount, studentsCount, companiesCount, cohortsCount] = await Promise.all([
        this.safeCount('academy_modules'),
        this.safeCount('academy_lessons'),
        this.safeCount('academy_tasks', { field: 'status', value: 'pending' }),
        this.safeCount('academy_tutors', { field: 'status', value: 'active' }),
        this.safeCount('academy_partner_centers', { field: 'status', value: 'active' }),
        this.safeCount('academy_students_cache', { field: 'status', value: 'active' }),
        this.safeCount('academy_companies_cache', { field: 'status', value: 'active' }),
        this.safeCount('academy_cohortes', { field: 'start_date', value: new Date().toISOString(), op: 'gt' }),
      ]);

      return {
        totalModules: modulesCount,
        totalLessons: lessonsCount,
        pendingTasks: tasksCount,
        activeTutors: tutorsCount,
        activeCenters: centersCount,
        activeStudents: studentsCount,
        activeCompanies: companiesCount,
        upcomingCohorts: cohortsCount
      };
    } catch (error) {
      console.error('Error loading academy metrics:', error);
      throw error;
    }
  }
};

// ===== SERVICIOS DE ONLINE =====

export const onlineDashboardService = {
  // Obtener métricas del dashboard online
  async getMetrics(): Promise<{
    pendingTasks: number;
    contentPieces: number;
    scheduledPosts: number;
    newIdeas: number;
    activeClients: number;
  }> {
    try {
      const [
        { count: tasksCount },
        { count: contentCount },
        { count: scheduledCount },
        { count: ideasCount },
        { count: clientsCount }
      ] = await Promise.all([
        supabase.from('online_tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('online_content').select('*', { count: 'exact', head: true }),
        supabase.from('online_calendar').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('online_ideas').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('online_clients').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      return {
        pendingTasks: tasksCount || 0,
        contentPieces: contentCount || 0,
        scheduledPosts: scheduledCount || 0,
        newIdeas: ideasCount || 0,
        activeClients: clientsCount || 0
      };
    } catch (error) {
      console.error('Error loading online metrics:', error);
      throw error;
    }
  }
};

export const onlineContentService = {
  // Obtener contenido con filtros opcionales
  async getAll(filters?: {
    level?: string;
    category?: string;
    status?: string;
  }): Promise<Record<string, unknown>[]> {
    try {
      let query = supabase
        .from('online_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.level) query = query.eq('level', filters.level);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching online content:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll online content:', error);
      throw error;
    }
  },

  // Crear contenido
  async create(content: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_content')
        .insert([content]);

      if (error) {
        console.error('Error creating online content:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in create online content:', error);
      throw error;
    }
  },

  // Actualizar contenido
  async update(id: string, updates: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_content')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating online content:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update online content:', error);
      throw error;
    }
  },

  // Eliminar contenido
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting online content:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete online content:', error);
      throw error;
    }
  }
};

export const onlineTaskService = {
  // Obtener tareas con filtros opcionales
  async getAll(filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
  }): Promise<Record<string, unknown>[]> {
    try {
      let query = supabase
        .from('online_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.priority) query = query.eq('priority', filters.priority);
      if (filters?.assignee) query = query.contains('assigned_to', [filters.assignee]);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching online tasks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll online tasks:', error);
      throw error;
    }
  },

  // Crear tarea
  async create(task: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase
        .from('online_tasks')
        .insert([task])
        .select()
        .single();

      if (error) {
        console.error('Error creating online task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in create online task:', error);
      throw error;
    }
  },

  // Actualizar tarea
  async update(id: string, updates: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_tasks')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating online task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update online task:', error);
      throw error;
    }
  },

  // Eliminar tarea
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting online task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete online task:', error);
      throw error;
    }
  }
};

export const onlineCalendarService = {
  // Obtener eventos del calendario por rango de fechas
  async getByDateRange(startDate: Date, endDate: Date): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from('online_calendar')
        .select('*, content: online_content(*)')
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString());

      if (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getByDateRange calendar:', error);
      throw error;
    }
  },

  // Crear evento
  async create(event: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_calendar')
        .insert([event]);

      if (error) {
        console.error('Error creating calendar event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in create calendar event:', error);
      throw error;
    }
  },

  // Actualizar evento
  async update(id: string, updates: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_calendar')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating calendar event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update calendar event:', error);
      throw error;
    }
  },

  // Eliminar evento
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('online_calendar')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete calendar event:', error);
      throw error;
    }
  }
};

// Exportar todos los servicios
export default {
  modules: moduleService,
  lessons: lessonService,
  blocks: blockService,
  downloadables: downloadableService,
  tasks: academyTaskService,
  sharedContent: sharedContentService,
  users: academyUserService,
  meetings: academyMeetingService,
  dashboard: academyDashboardService,
  onlineDashboard: onlineDashboardService,
  onlineContent: onlineContentService,
  onlineTasks: onlineTaskService,
  onlineCalendar: onlineCalendarService
};
