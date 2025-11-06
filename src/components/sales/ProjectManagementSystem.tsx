import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Building2, Plus, Search, Edit, Trash2, Eye, TrendingUp, DollarSign,
  MapPin, Calendar, BarChart3, Target, ArrowLeft
} from 'lucide-react';
import NewProjectModal from './NewProjectModal';

interface Project {
  id: string;
  name: string;
  tipo: string;
  ubicacion?: string;
  status: string;
  capital_esperado?: number;
  ticket_disponible?: number;
  ticket_minimo?: number;
  valor_proyecto?: number;
  ebitda_actual?: number;
  ebitda_proyectado?: number;
  roi_proyectado?: number;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at: string;
}

const ProjectManagementSystem: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  const tipos = [
    { id: 'vertical', nombre: 'Vertical', color: '#3b82f6', icon: Building2 },
    { id: 'franquicia', nombre: 'Franquicia', color: '#8b5cf6', icon: Target },
    { id: 'tech', nombre: 'Tech', color: '#10b981', icon: BarChart3 },
    { id: 'financiacion', nombre: 'Financiación', color: '#f59e0b', icon: DollarSign },
    { id: 'otros', nombre: 'Otros', color: '#6b7280', icon: Building2 }
  ];

  const estados = [
    { id: 'planificacion', nombre: 'Planificación', color: '#94a3b8' },
    { id: 'active', nombre: 'Activo', color: '#10b981' },
    { id: 'en_venta', nombre: 'En Venta', color: '#3b82f6' },
    { id: 'completed', nombre: 'Completado', color: '#059669' },
    { id: 'cancelled', nombre: 'Cancelado', color: '#ef4444' }
  ];

  useEffect(() => {
    cargarProyectos();
  }, [filtroTipo, filtroEstado]);

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroTipo !== 'todos') {
        query = query.eq('tipo', filtroTipo);
      }

      if (filtroEstado !== 'todos') {
        query = query.eq('status', filtroEstado);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const proyectosFiltrados = projects.filter(project =>
    project.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    project.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const contarPorTipo = (tipo: string) => {
    return projects.filter(p => p.tipo === tipo).length;
  };

  const contarPorEstado = (estado: string) => {
    return projects.filter(p => p.status === estado).length;
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return `€${value.toLocaleString()}`;
  };

  const formatPercentage = (value?: number) => {
    if (!value) return '-';
    return `${value}%`;
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          🏗️ Gestión de Proyectos
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Administra proyectos de inversión, verticales, franquicias y más
        </p>
      </div>

      {/* Tipos de Proyecto */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '12px',
        marginBottom: '32px'
      }}>
        {tipos.map(tipo => {
          const Icon = tipo.icon;
          const count = contarPorTipo(tipo.id);
          return (
            <div
              key={tipo.id}
              onClick={() => setFiltroTipo(tipo.id)}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                borderLeft: `4px solid ${tipo.color}`,
                transition: 'transform 0.2s',
                opacity: filtroTipo === 'todos' || filtroTipo === tipo.id ? 1 : 0.5
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Icon style={{ width: '20px', height: '20px', color: tipo.color }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: tipo.color }}>
                  {count}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{tipo.nombre}</p>
            </div>
          );
        })}
      </div>

      {/* Estados */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px',
        marginBottom: '32px'
      }}>
        {estados.map(estado => {
          const count = contarPorEstado(estado.id);
          return (
            <div
              key={estado.id}
              onClick={() => setFiltroEstado(estado.id)}
              style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                textAlign: 'center',
                border: `2px solid ${filtroEstado === estado.id ? estado.color : 'transparent'}`,
                opacity: filtroEstado === 'todos' || filtroEstado === estado.id ? 1 : 0.5
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: estado.color }}>
                {count}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                {estado.nombre}
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de acciones */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px'
            }}
          />
        </div>
        
        <button
          onClick={() => setShowNewProjectModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Nuevo Proyecto
        </button>

        {(filtroTipo !== 'todos' || filtroEstado !== 'todos') && (
          <button
            onClick={() => {
              setFiltroTipo('todos');
              setFiltroEstado('todos');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Ver Todos
          </button>
        )}
      </div>

      {/* Lista de Proyectos */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
          Proyectos ({proyectosFiltrados.length})
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Cargando...</p>
        ) : proyectosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <Building2 style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No hay proyectos</p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {proyectosFiltrados.map(project => {
              const tipo = tipos.find(t => t.id === project.tipo);
              const estado = estados.find(e => e.id === project.status);
              
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                          {project.name}
                        </h3>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: tipo?.color + '20',
                          color: tipo?.color,
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {tipo?.nombre}
                        </span>
                      </div>
                      {project.ubicacion && (
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin style={{ width: '14px', height: '14px' }} />
                          {project.ubicacion}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: estado?.color + '20',
                      color: estado?.color,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {estado?.nombre}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '12px',
                    marginTop: '16px'
                  }}>
                    {project.valor_proyecto && (
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Valor Proyecto</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '4px 0 0 0' }}>
                          {formatCurrency(project.valor_proyecto)}
                        </p>
                      </div>
                    )}
                    {project.capital_esperado && (
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Capital Esperado</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6', margin: '4px 0 0 0' }}>
                          {formatCurrency(project.capital_esperado)}
                        </p>
                      </div>
                    )}
                    {project.roi_proyectado && (
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>ROI Proyectado</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', margin: '4px 0 0 0' }}>
                          {formatPercentage(project.roi_proyectado)}
                        </p>
                      </div>
                    )}
                    {project.ticket_minimo && (
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Ticket Mínimo</p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b', margin: '4px 0 0 0' }}>
                          {formatCurrency(project.ticket_minimo)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nuevo Proyecto */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSuccess={() => {
            cargarProyectos();
            setShowNewProjectModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectManagementSystem;
