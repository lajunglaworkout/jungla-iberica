// Tipos para el sistema de revisión trimestral
export interface QuarterlyReviewItem {
  id: number;
  inventory_item_id: number;
  product_name: string;
  category: string;
  current_system_quantity: number; // Lo que dice el sistema
  counted_quantity: number; // Lo que cuenta el encargado
  regular_state_quantity: number; // En buen estado
  deteriorated_quantity: number; // Deteriorados
  to_remove_quantity: number; // Para retirar
  observations: string;
  status: 'pending' | 'counted' | 'reviewed' | 'approved';
}

export interface QuarterlyReview {
  id: number;
  center_id: number;
  center_name: string;
  quarter: string; // "Q1-2025", "Q2-2025", etc.
  year: number;
  created_date: string;
  review_date?: string;
  approved_date?: string;
  created_by: string; // Email del creador
  reviewed_by?: string; // Email del encargado
  approved_by?: string; // Email de Beni
  status: 'draft' | 'in_review' | 'completed' | 'approved';
  items: QuarterlyReviewItem[];
  total_items: number;
  total_discrepancies: number;
  notes: string;
}

export interface ReviewSummary {
  center_id: number;
  center_name: string;
  total_products: number;
  counted_products: number;
  pending_products: number;
  discrepancies: number;
  total_to_remove: number;
  total_deteriorated: number;
  completion_percentage: number;
}

export type ReviewStatus = 'draft' | 'in_review' | 'completed' | 'approved';
export type ItemStatus = 'pending' | 'counted' | 'reviewed' | 'approved';
