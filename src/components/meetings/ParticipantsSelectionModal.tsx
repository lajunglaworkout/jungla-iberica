import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ParticipantsSelectionModalProps {
  isOpen: boolean;
  departmentId: string;
  onConfirm: (participants: string[]) => void;
  onClose: () => void;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface Lead {
  id: string;
  nombre: string;
  email: string;
  empresa?: string;
  proyecto_nombre?: string;
}

export const ParticipantsSelectionModal: React.FC<ParticipantsSelectionModalProps> = ({
  isOpen,
  departmentId,
  onConfirm,
  onClose
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [otherParticipant, setOtherParticipant] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const isVentasDepartment = departmentId === 'ventas' || departmentId === 'sales';

  useEffect(() => {
    if (isOpen) {
      if (isVentasDepartment) {
        loadLeads();
      } else {
        loadEmployees();
      }
    }
  }, [isOpen, departmentId]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, nombre, email, telefono, empresa, proyecto_nombre, estado')
        .in('estado', ['prospecto', 'contactado', 'reunion', 'propuesta', 'negociacion'])
        .order('nombre', { ascending: true });

      if (error) {
        console.error('❌ Error cargando leads:', error);
        setLeads([]);
        return;
      }

      console.log('✅ Leads cargados para participantes:', data);
      setLeads(data || []);
      setFilteredLeads(data || []);
    } catch (error) {
      console.error('Error:', error);
      setLeads([]);
      setFilteredLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, departamento')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error cargando empleados:', error);
        setEmployees([]);
        return;
      }

      const mappedEmployees = (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.departamento
      }));
      setEmployees(mappedEmployees);
      setFilteredEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error:', error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    if (isVentasDepartment) {
      // Filtrar leads
      if (value.trim() === '') {
        setFilteredLeads(leads);
      } else {
        const filtered = leads.filter(lead =>
          lead.nombre.toLowerCase().includes(value.toLowerCase()) ||
          lead.email.toLowerCase().includes(value.toLowerCase()) ||
          (lead.empresa && lead.empresa.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredLeads(filtered);
      }
    } else {
      // Filtrar empleados
      if (value.trim() === '') {
        setFilteredEmployees(employees);
      } else {
        const filtered = employees.filter(emp =>
          emp.name.toLowerCase().includes(value.toLowerCase()) ||
          emp.email.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredEmployees(filtered);
      }
    }
  };

  const handleToggleParticipant = (email: string) => {
    setSelectedParticipants(prev =>
      prev.includes(email)
        ? prev.filter(p => p !== email)
        : [...prev, email]
    );
  };

  const handleAddOtherParticipant = () => {
    if (otherParticipant.trim()) {
      setSelectedParticipants([...selectedParticipants, otherParticipant.trim()]);
      setOtherParticipant('');
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setSelectedParticipants(prev => prev.filter(p => p !== email));
  };

  const handleConfirm = () => {
    if (selectedParticipants.length === 0) {
      alert('Debes seleccionar al menos un participante');
      return;
    }
    onConfirm(selectedParticipants);
    setSelectedParticipants([]);
    setOtherParticipant('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '95%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            👥 Seleccionar Participantes
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Empleados del Sistema o Leads */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              {isVentasDepartment ? '🎯 Leads del Sistema' : '👥 Empleados del Sistema'}
            </h3>

            {/* Campo de Búsqueda */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '12px'
            }}>
              <Search style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <input
                type="text"
                placeholder={isVentasDepartment ? "Buscar lead..." : "Buscar empleado..."}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#374151'
                }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                {isVentasDepartment ? 'Cargando leads...' : 'Cargando empleados...'}
              </div>
            ) : isVentasDepartment ? (
              // Mostrar LEADS para ventas
              leads.length === 0 ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  No hay leads disponibles
                </div>
              ) : filteredLeads.length === 0 ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  No se encontraron leads con "{searchTerm}"
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '8px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {filteredLeads.map(lead => (
                    <label
                      key={lead.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: selectedParticipants.includes(lead.email) ? '#dbeafe' : '#f9fafb',
                        border: `1px solid ${selectedParticipants.includes(lead.email) ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(lead.email)}
                        onChange={() => handleToggleParticipant(lead.email)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                          {lead.nombre}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {lead.email}
                        </div>
                        {lead.empresa && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                            🏢 {lead.empresa}
                          </div>
                        )}
                        {lead.proyecto_nombre && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                            📊 {lead.proyecto_nombre}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )
            ) : (
              // Mostrar EMPLEADOS para otros departamentos
              employees.length === 0 ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  No hay empleados disponibles
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  No se encontraron empleados con "{searchTerm}"
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '8px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {filteredEmployees.map(emp => (
                  <label
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: selectedParticipants.includes(emp.email) ? '#dbeafe' : '#f9fafb',
                      border: `1px solid ${selectedParticipants.includes(emp.email) ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(emp.email)}
                      onChange={() => handleToggleParticipant(emp.email)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#1f2937'
                      }}>
                        {emp.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {emp.email} • {emp.department}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              )
            )}
          </div>

          {/* Otros Participantes */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              ➕ Otros Participantes (No en el sistema)
            </h3>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <input
                type="email"
                placeholder="Email o nombre"
                value={otherParticipant}
                onChange={(e) => setOtherParticipant(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddOtherParticipant();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleAddOtherParticipant}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Participantes Seleccionados */}
          {selectedParticipants.length > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#166534',
                marginBottom: '12px'
              }}>
                ✅ Participantes Seleccionados ({selectedParticipants.length})
              </h3>

              <div style={{ display: 'grid', gap: '8px' }}>
                {selectedParticipants.map((participant, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#166534'
                    }}>
                      <User size={14} />
                      {participant}
                    </div>
                    <button
                      onClick={() => handleRemoveParticipant(participant)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc2626'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={selectedParticipants.length === 0}
            style={{
              backgroundColor: selectedParticipants.length === 0 ? '#d1d5db' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: selectedParticipants.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Confirmar ({selectedParticipants.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsSelectionModal;
