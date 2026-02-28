// src/services/maintenanceService.ts
// Facade that composes domain sub-services into a single backward-compatible API.

import * as inspectionOps from './maintenance/maintenanceInspectionService';
import * as statsOps from './maintenance/maintenanceStatsService';
import * as centerOps from './maintenance/maintenanceCenterService';
import * as ticketOps from './maintenance/maintenanceTicketService';

export type { CreateInspectionData, InspectionResponse, InspectionListResponse } from './maintenance/maintenanceInspectionService';

class MaintenanceService {
  // Inspection CRUD
  startInspection             = inspectionOps.startInspection;
  updateInspectionItemProgress = inspectionOps.updateInspectionItemProgress;
  completeInspection          = inspectionOps.completeInspection;
  createInspection            = inspectionOps.createInspection;
  getInspectionsByCenter      = inspectionOps.getInspectionsByCenter;
  getInspectionItems          = inspectionOps.getInspectionItems;
  needsInspection             = inspectionOps.needsInspection;
  getAllInspections            = inspectionOps.getAllInspections;
  getCenterInspectionHistory  = inspectionOps.getCenterInspectionHistory;
  uploadMaintenancePhoto      = inspectionOps.uploadMaintenancePhoto;
  updateTaskStatus            = inspectionOps.updateTaskStatus;
  clearAllData                = inspectionOps.clearAllData;

  // Stats
  getMaintenanceStats         = statsOps.getMaintenanceStats;
  getDirectorStats            = statsOps.getDirectorStats;
  getGlobalMaintenanceStats   = statsOps.getGlobalMaintenanceStats;

  // Centers & schedule
  getCenters                  = centerOps.getCenters;
  getCenterComparison         = centerOps.getCenterComparison;
  getInspectionSchedule       = centerOps.getInspectionSchedule;
  setQuarterlyDeadline        = centerOps.setQuarterlyDeadline;
  getFrequentRepairs          = centerOps.getFrequentRepairs;
  getUnmanagedRepairs         = centerOps.getUnmanagedRepairs;
  getZonesAndConcepts         = centerOps.getZonesAndConcepts;

  // Tickets
  createTicketsFromInspection = ticketOps.createTicketsFromInspection;
  getTickets                  = ticketOps.getTickets;
  updateTicketStatus          = ticketOps.updateTicketStatus;
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;

import { supabase } from '../lib/supabase';

export const updateMaintenanceInspectionItem = async (id: string | number, data: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('maintenance_inspection_items').update(data).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};
