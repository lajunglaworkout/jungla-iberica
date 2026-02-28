// src/components/incidents/incident/IncidentTypes.tsx
import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, Package, Heart, Briefcase } from 'lucide-react';

export interface IncidentCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface IncidentType {
  id: number;
  category_id: number;
  name: string;
  description: string;
  approver_role: string;
  requires_dates: boolean;
  requires_clothing_details: boolean;
}

export interface Incident {
  id: number;
  employee_id: number;
  incident_type_id: number;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  days_requested: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  clothing_type: string | null;
  clothing_size: string | null;
  quantity: number;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_email: string;
  employee_position: string;
  incident_type_name: string;
  incident_type_description: string;
  approver_role: string;
  approved_by_name: string | null;
  center_name: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  center_id: number;
}

export const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
    default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'normal': return 'bg-blue-100 text-blue-800';
    case 'low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getIncidentIcon = (typeName: string): React.ReactNode => {
  if (typeName.toLowerCase().includes('vacaciones')) return <Calendar className="w-5 h-5" />;
  if (typeName.toLowerCase().includes('vestuario')) return <Package className="w-5 h-5" />;
  if (typeName.toLowerCase().includes('médica')) return <Heart className="w-5 h-5" />;
  return <Briefcase className="w-5 h-5" />;
};
