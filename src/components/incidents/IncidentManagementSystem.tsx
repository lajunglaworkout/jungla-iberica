import React, { useState, useEffect } from 'react';
import { getIncidentCategories, getIncidentTypes, createIncident as createIncidentService, getIncidents, getEmployeeIdByEmail, updateIncident } from '../../services/incidentService';
import { useSession } from '../../contexts/SessionContext';
import { Clock, User, FileText, Plus } from 'lucide-react';
import { notifyIncident, notifyIncidentStatusChange } from '../../services/notificationService';
import { ui } from '../../utils/ui';
import { type Incident, type IncidentCategory, type IncidentType } from './incident/IncidentTypes';
import { IncidentFilters } from './incident/IncidentFilters';
import { IncidentCard } from './incident/IncidentCard';
import { IncidentCreateModal, type IncidentFormData } from './incident/IncidentCreateModal';

const INITIAL_FORM: IncidentFormData = {
  category_id: '', incident_type_id: '', title: '', description: '',
  start_date: '', end_date: '', priority: 'normal', clothing_type: '', clothing_size: '', quantity: 1
};

const IncidentManagementSystem: React.FC = () => {
  const { employee, userRole } = useSession();
  const [activeTab, setActiveTab] = useState('my-incidents');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentCategories, setIncidentCategories] = useState<IncidentCategory[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState<IncidentFormData>(INITIAL_FORM);

  const isHR = userRole === 'hr' || userRole === 'manager' || userRole === 'admin';
  const isLogistics = userRole === 'logistics' || userRole === 'manager' || userRole === 'admin';

  const loadIncidentCategories = async () => {
    const data = await getIncidentCategories();
    if (data.length > 0) setIncidentCategories(data);
  };

  const loadIncidentTypes = async () => {
    const data = await getIncidentTypes();
    if (data.length > 0) setIncidentTypes(data);
  };

  const loadIncidents = async () => {
    try {
      let filter: { employeeId?: number; statusFilter?: string } = {};
      if (activeTab === 'my-incidents' && !isHR && !isLogistics) {
        if (employee?.id) filter.employeeId = parseInt(String(employee.id).replace(/\D/g, ''));
      } else if (activeTab === 'pending-approval' && (isHR || isLogistics)) {
        filter.statusFilter = 'pending';
      }
      const data = await getIncidents(filter);
      setIncidents(data as Incident[]);
    } catch {
      setIncidents([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadIncidentCategories(), loadIncidentTypes()]);
      await loadIncidents();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadIncidents(); }, [activeTab]);

  const createIncident = async () => {
    try {
      if (!employee?.id) { ui.error('Error: No se pudo identificar el empleado'); return; }
      const incidentData = {
        employee_id: employee.id,
        incident_type_id: parseInt(formData.incident_type_id),
        title: formData.title, description: formData.description,
        start_date: formData.start_date || null, end_date: formData.end_date || null,
        priority: formData.priority,
        clothing_type: formData.clothing_type || null, clothing_size: formData.clothing_size || null,
        quantity: formData.quantity || null, status: 'pending'
      };
      const result = await createIncidentService(incidentData as Record<string, unknown>);
      if (!result.success) throw new Error(result.error);
      const data = result.data ?? [];
      if (data[0]) {
        const typeName = incidentTypes.find(t => t.id === incidentData.incident_type_id)?.name || 'Incidencia';
        await notifyIncident({ incidentId: data[0].id, centerId: employee.center_id, category: typeName, description: incidentData.description, priority: incidentData.priority, reporterName: `${employee.first_name} ${employee.last_name || ''}` });
      }
      ui.success('Incidencia creada correctamente');
      setShowCreateForm(false);
      setSelectedCategory('');
      setFormData(INITIAL_FORM);
      loadIncidents();
    } catch (error) {
      console.error('Error creating incident:', error);
      ui.error('Error al crear la incidencia');
    }
  };

  const updateIncidentStatus = async (incidentId: number, status: string, rejectionReason?: string) => {
    try {
      const currentEmployeeId = await getEmployeeIdByEmail(employee?.email || '');
      const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'approved') { updateData.approved_by = currentEmployeeId; updateData.approved_at = new Date().toISOString(); }
      else if (status === 'rejected' && rejectionReason) { updateData.rejection_reason = rejectionReason; }
      const result = await updateIncident(incidentId, updateData);
      if (!result.success) throw new Error(result.error);
      const incident = incidents.find(i => i.id === incidentId);
      if (incident) await notifyIncidentStatusChange({ incidentId, reporterId: incident.employee_id, newStatus: status, resolverName: employee?.first_name });
      await loadIncidents();
      ui.success(`Incidencia ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`);
    } catch (error) {
      console.error('Error updating incident:', error);
      ui.error('Error al actualizar la incidencia');
    }
  };

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) || i.incident_type_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || i.status === statusFilter) && (typeFilter === 'all' || i.incident_type_id.toString() === typeFilter);
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#059669]"></div></div>;
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: '12px 20px',
    backgroundColor: activeTab === tab ? '#059669' : 'white',
    color: activeTab === tab ? 'white' : '#6b7280',
    border: activeTab === tab ? 'none' : '2px solid #e5e7eb',
    borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
  });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '8px' }}>Incidencias y Peticiones</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Gestión de ausencias, vacaciones y solicitudes de vestuario</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
        >
          <Plus style={{ height: '18px', width: '18px' }} />
          Nueva Incidencia
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => setActiveTab('my-incidents')} style={tabStyle('my-incidents')}>
            <User style={{ width: '16px', height: '16px' }} /> Mis Incidencias
          </button>
          {(isHR || isLogistics) && (
            <button onClick={() => setActiveTab('pending-approval')} style={tabStyle('pending-approval')}>
              <Clock style={{ width: '16px', height: '16px' }} /> Pendientes de Aprobación
            </button>
          )}
          {(isHR || isLogistics) && (
            <button onClick={() => setActiveTab('all-incidents')} style={tabStyle('all-incidents')}>
              <FileText style={{ width: '16px', height: '16px' }} /> Todas las Incidencias
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <IncidentFilters
        searchTerm={searchTerm} statusFilter={statusFilter} typeFilter={typeFilter} incidentTypes={incidentTypes}
        onSearchChange={setSearchTerm} onStatusChange={setStatusFilter} onTypeChange={setTypeFilter}
      />

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredIncidents.map(incident => (
          <IncidentCard
            key={incident.id} incident={incident} isHR={isHR} isLogistics={isLogistics}
            onApprove={(id) => updateIncidentStatus(id, 'approved')}
            onReject={(id) => { const reason = prompt('Motivo del rechazo:'); if (reason) updateIncidentStatus(id, 'rejected', reason); }}
          />
        ))}
        {filteredIncidents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay incidencias</h3>
            <p className="text-gray-600">No se encontraron incidencias que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateForm && (
        <IncidentCreateModal
          formData={formData} selectedCategory={selectedCategory}
          incidentCategories={incidentCategories} incidentTypes={incidentTypes}
          onFormChange={setFormData}
          onCategoryChange={(catId) => { setSelectedCategory(catId); setFormData({ ...formData, category_id: catId, incident_type_id: '' }); }}
          onSubmit={createIncident}
          onClose={() => { setShowCreateForm(false); setSelectedCategory(''); setFormData(INITIAL_FORM); }}
        />
      )}
    </div>
  );
};

export default IncidentManagementSystem;
