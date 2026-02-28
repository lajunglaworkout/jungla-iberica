// src/services/maintenance/maintenanceStatsService.ts
// Estadísticas generales, por director y globales

export async function getMaintenanceStats(centerId?: string): Promise<{
  totalInspections: number;
  averageScore: number;
  criticalIssues: number;
  pendingTasks: number;
}> {
  try {
    const { supabase } = await import('../../lib/supabase');
    let query = supabase.from('maintenance_inspections').select('*');
    if (centerId) query = query.eq('center_id', centerId);
    const { data: inspections, error } = await query;
    if (error) return { totalInspections: 0, averageScore: 0, criticalIssues: 0, pendingTasks: 0 };

    const totalInspections = inspections?.length || 0;
    const averageScore = totalInspections > 0
      ? Math.round(inspections.reduce((sum, i) => sum + i.overall_score, 0) / totalInspections)
      : 0;
    const criticalIssues = inspections?.reduce((sum, i) => sum + i.items_bad, 0) || 0;

    if (centerId) {
      const pendingTasks = inspections?.reduce((sum, i) => sum + i.items_regular + i.items_bad, 0) || 0;
      return { totalInspections, averageScore, criticalIssues, pendingTasks };
    }

    const { data: tasks } = await supabase.from('maintenance_inspection_items').select('*').neq('task_status', 'completada');
    return { totalInspections, averageScore, criticalIssues, pendingTasks: tasks?.length || 0 };
  } catch {
    return { totalInspections: 0, averageScore: 0, criticalIssues: 0, pendingTasks: 0 };
  }
}

export async function getDirectorStats(): Promise<{
  totalActiveTickets: number;
  avgResolutionTime: number;
  criticalIssuesCount: number;
  totalInspectionsThisMonth: number;
}> {
  try {
    const { supabase } = await import('../../lib/supabase');

    const { count: inspectionActiveTickets } = await supabase
      .from('maintenance_inspection_items').select('*', { count: 'exact', head: true })
      .neq('task_status', 'completada').neq('status', 'bien');

    const { count: checklistActiveTickets } = await supabase
      .from('checklist_incidents').select('*', { count: 'exact', head: true })
      .or('incident_type.eq.maintenance,department.eq.Mantenimiento').neq('status', 'resuelta');

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);

    const { data: completedTickets } = await supabase
      .from('maintenance_inspection_items').select('created_at, completed_date')
      .eq('task_status', 'completada').gte('completed_date', currentMonthStart.toISOString());

    let avgResolutionTime = 0;
    if (completedTickets && completedTickets.length > 0) {
      const totalDays = completedTickets.reduce((sum, ticket) => {
        const diffDays = Math.ceil(Math.abs(new Date(ticket.completed_date).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      avgResolutionTime = Math.round((totalDays / completedTickets.length) * 10) / 10;
    }

    const { count: criticalFromInspections } = await supabase
      .from('maintenance_inspection_items').select('*', { count: 'exact', head: true })
      .eq('status', 'mal').neq('task_status', 'completada');

    const { count: criticalFromChecklist } = await supabase
      .from('checklist_incidents').select('*', { count: 'exact', head: true })
      .or('incident_type.eq.maintenance,department.eq.Mantenimiento').in('priority', ['critica', 'alta']).neq('status', 'resuelta');

    const { count: inspectionsThisMonth } = await supabase
      .from('maintenance_inspections').select('*', { count: 'exact', head: true })
      .eq('inspection_month', new Date().toISOString().substring(0, 7));

    return {
      totalActiveTickets: (inspectionActiveTickets || 0) + (checklistActiveTickets || 0),
      avgResolutionTime,
      criticalIssuesCount: (criticalFromInspections || 0) + (criticalFromChecklist || 0),
      totalInspectionsThisMonth: inspectionsThisMonth || 0
    };
  } catch {
    return { totalActiveTickets: 0, avgResolutionTime: 0, criticalIssuesCount: 0, totalInspectionsThisMonth: 0 };
  }
}

export async function getGlobalMaintenanceStats(): Promise<{ success: boolean; data?: Array<{ month: string; averageScore: number; count: number }>; error?: string }> {
  try {
    const { supabase } = await import('../../lib/supabase');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: inspections, error } = await supabase
      .from('maintenance_inspections').select('inspection_date, overall_score, center_name')
      .gte('inspection_date', sixMonthsAgo.toISOString()).order('inspection_date', { ascending: true });

    if (error) throw error;

    const statsByMonth: Record<string, { count: number; totalScore: number; month: string }> = {};
    inspections?.forEach(insp => {
      const month = insp.inspection_date.substring(0, 7);
      if (!statsByMonth[month]) statsByMonth[month] = { count: 0, totalScore: 0, month };
      statsByMonth[month].count++;
      statsByMonth[month].totalScore += insp.overall_score;
    });

    const chartData = Object.values(statsByMonth).map(stat => ({
      month: stat.month,
      averageScore: Math.round(stat.totalScore / stat.count),
      count: stat.count
    }));

    return { success: true, data: chartData };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
