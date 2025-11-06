import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, Building2, Calculator, TrendingUp, ArrowLeft, Plus, Search,
  Filter, MapPin, Euro, Target, FileText, Phone, Mail, Calendar,
  Briefcase, PieChart, BarChart3, Edit, Trash2, Eye
} from 'lucide-react';
import ROICalculator from './ROICalculator';
import LeadManagementSystem from './LeadManagementSystem';

interface SalesLeadsModuleProps {
  onBack: () => void;
}

interface ContactoLead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
  tipoInteres: 'Participaciones Marca' | 'Participaciones Franquicia' | 'Inversor Potencial';
  estado: 'Prospecto' | 'Contactado' | 'Reunión' | 'Propuesta' | 'Contrato' | 'Señal';
  fechaContacto: string;
  notas: string;
  proyectoInteres?: string;
  participacionesInteres?: number;
  inversionDisponible?: number;
}

interface Proyecto {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: 'Análisis' | 'Vendiendo' | 'Casi Completo' | 'Finalizado';
  inversionTotal: number;
  participacionesVendidas: number;
  roi: number;
  fechaCreacion: string;
  metrosCuadrados: number;
  alquilerMensual: number;
}

const SalesLeadsModule: React.FC<SalesLeadsModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directorio' | 'proyectos' | 'calculadora' | 'pipeline' | 'gestion'>('dashboard');
  const [filtroTipo, setFiltroTipo] = useState<string>('Todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [proyectosActivos, setProyectosActivos] = useState(0);
  const [leadsActivos, setLeadsActivos] = useState(0);
  const [proyectosReales, setProyectosReales] = useState<any[]>([]);

  // Cargar datos reales de Supabase
  useEffect(() => {
    const cargarDatosReales = async () => {
      // Contar proyectos activos
      const { count: countProyectos } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // Contar leads activos
      const { count: countLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('status', ['prospecto', 'contactado', 'reunion', 'propuesta']);
      
      // Obtener proyectos reales
      const { data: proyectos } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .limit(5);
      
      setProyectosActivos(countProyectos || 0);
      setLeadsActivos(countLeads || 0);
      setProyectosReales(proyectos || []);
    };
    
    cargarDatosReales();
  }, []);

  // Datos de ejemplo
  const [contactos] = useState<ContactoLead[]>([
    {
      id: '1',
      nombre: 'Carlos Martínez',
      email: 'carlos.martinez@email.com',
      telefono: '+34 666 123 456',
      ubicacion: 'Valladolid',
      tipoInteres: 'Participaciones Marca',
      estado: 'Reunión',
      fechaContacto: '2024-01-15',
      notas: 'Interesado en 20% del proyecto Valladolid. Experiencia en sector fitness.',
      proyectoInteres: 'Proyecto Valladolid',
      participacionesInteres: 20,
      inversionDisponible: 50000
    },
    {
      id: '2',
      nombre: 'Ana García López',
      email: 'ana.garcia@inversiones.com',
      telefono: '+34 677 987 654',
      ubicacion: 'Madrid',
      tipoInteres: 'Participaciones Franquicia',
      estado: 'Propuesta',
      fechaContacto: '2024-01-20',
      notas: 'Busca franquicia completa en zona norte de Madrid. Capital disponible alto.',
      participacionesInteres: 100,
      inversionDisponible: 400000
    },
    {
      id: '3',
      nombre: 'Miguel Rodríguez',
      email: 'miguel.r@gmail.com',
      telefono: '+34 655 444 333',
      ubicacion: 'Valencia',
      tipoInteres: 'Inversor Potencial',
      estado: 'Contactado',
      fechaContacto: '2024-01-25',
      notas: 'Inversor experimentado. Interés en múltiples proyectos.',
      inversionDisponible: 150000
    },
    {
      id: '4',
      nombre: 'Laura Fernández',
      email: 'laura.fernandez@hotmail.com',
      telefono: '+34 688 555 777',
      ubicacion: 'Sevilla',
      tipoInteres: 'Participaciones Marca',
      estado: 'Contrato',
      fechaContacto: '2024-02-01',
      notas: 'Firmado contrato para 15% proyecto Valencia Centro.',
      proyectoInteres: 'Proyecto Valencia Centro',
      participacionesInteres: 15,
      inversionDisponible: 45000
    }
  ]);

  const [proyectos] = useState<Proyecto[]>([
    {
      id: '1',
      nombre: 'Proyecto Valladolid',
      ubicacion: 'Valladolid Centro',
      estado: 'Vendiendo',
      inversionTotal: 245000,
      participacionesVendidas: 40,
      roi: 19.2,
      fechaCreacion: '2024-01-10',
      metrosCuadrados: 480,
      alquilerMensual: 3200
    },
    {
      id: '2',
      nombre: 'Proyecto Madrid Norte',
      ubicacion: 'Madrid - Chamartín',
      estado: 'Casi Completo',
      inversionTotal: 380000,
      participacionesVendidas: 85,
      roi: 16.8,
      fechaCreacion: '2023-11-15',
      metrosCuadrados: 650,
      alquilerMensual: 5500
    },
    {
      id: '3',
      nombre: 'Proyecto Valencia Centro',
      ubicacion: 'Valencia - Ruzafa',
      estado: 'Vendiendo',
      inversionTotal: 290000,
      participacionesVendidas: 65,
      roi: 21.5,
      fechaCreacion: '2024-02-01',
      metrosCuadrados: 520,
      alquilerMensual: 3800
    }
  ]);

  // Filtros
  const contactosFiltrados = contactos.filter(contacto => {
    const coincideBusqueda = contacto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            contacto.email.toLowerCase().includes(busqueda.toLowerCase()) ||
                            contacto.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === 'Todos' || contacto.tipoInteres === filtroTipo;
    const coincideEstado = filtroEstado === 'Todos' || contacto.estado === filtroEstado;
    
    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', overflowX: 'auto' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderBottom: '1px solid #e5e7eb', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        minWidth: '1200px' 
      }}>
        <button 
          onClick={onBack} 
          style={{ 
            padding: '8px', 
            backgroundColor: '#f3f4f6', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer'
          }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>🎯 Ventas y Leads</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gestión de proyectos, inversores y análisis de mercado</p>
        </div>
      </div>

      <div style={{ padding: '32px', minWidth: '1200px', overflowX: 'auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: <BarChart3 style={{ width: '16px', height: '16px' }} /> },
            { id: 'gestion', label: '🎯 Gestión de Leads', icon: <Target style={{ width: '16px', height: '16px' }} /> },
            { id: 'directorio', label: '📋 Directorio', icon: <Users style={{ width: '16px', height: '16px' }} /> },
            { id: 'proyectos', label: '🏗️ Proyectos', icon: <Building2 style={{ width: '16px', height: '16px' }} /> },
            { id: 'calculadora', label: '💰 Calculadora ROI', icon: <Calculator style={{ width: '16px', height: '16px' }} /> },
            { id: 'pipeline', label: '📈 Pipeline', icon: <TrendingUp style={{ width: '16px', height: '16px' }} /> }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px', 
                backgroundColor: activeTab === tab.id ? '#059669' : '#f3f4f6', 
                color: activeTab === tab.id ? 'white' : '#6b7280', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPIs */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px', 
              marginBottom: '32px' 
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                borderLeft: '4px solid #3b82f6' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Proyectos Activos</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: '4px 0 0 0' }}>{proyectosActivos}</p>
                  </div>
                  <Building2 style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                borderLeft: '4px solid #10b981' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Leads Activos</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: '4px 0 0 0' }}>{leadsActivos}</p>
                  </div>
                  <Users style={{ width: '32px', height: '32px', color: '#10b981' }} />
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                borderLeft: '4px solid #f59e0b' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>ROI Promedio</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: '4px 0 0 0' }}>18.5%</p>
                  </div>
                  <TrendingUp style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                borderLeft: '4px solid #8b5cf6' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Participaciones Vendidas</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', margin: '4px 0 0 0' }}>65%</p>
                  </div>
                  <PieChart style={{ width: '32px', height: '32px', color: '#8b5cf6' }} />
                </div>
              </div>
            </div>

            {/* Proyectos Recientes */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                🏗️ Proyectos Activos
              </h3>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {proyectosReales.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <Building2 style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                    <p>No hay proyectos activos</p>
                    <p style={{ fontSize: '14px' }}>Los proyectos aparecerán aquí cuando se creen en Supabase</p>
                  </div>
                ) : proyectosReales.map((proyecto, index) => (
                  <div key={index} style={{ 
                    padding: '16px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{proyecto.name || 'Sin nombre'}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Inversión total: €{proyecto.investment_total?.toLocaleString() || '0'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>{proyecto.shares_sold || 0}%</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Vendido</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#f59e0b' }}>{proyecto.roi || 0}%</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>ROI</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        backgroundColor: proyecto.status === 'active' ? '#ecfdf5' : '#fef3c7',
                        color: proyecto.status === 'active' ? '#047857' : '#92400e',
                        borderRadius: '12px', 
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {proyecto.status || 'Sin estado'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#059669', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Overview */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                📈 Pipeline de Ventas
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                {[
                  { fase: 'Prospecto', cantidad: 0, color: '#6b7280' },
                  { fase: 'Contactado', cantidad: 0, color: '#3b82f6' },
                  { fase: 'Reunión', cantidad: 0, color: '#f59e0b' },
                  { fase: 'Propuesta', cantidad: 0, color: '#8b5cf6' },
                  { fase: 'Contrato', cantidad: 0, color: '#10b981' },
                  { fase: 'Señal', cantidad: 0, color: '#059669' }
                ].map((fase, index) => (
                  <div key={index} style={{ 
                    textAlign: 'center', 
                    padding: '16px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    border: `2px solid ${fase.color}20`
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: fase.color }}>{fase.cantidad}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{fase.fase}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Directorio de Contactos */}
        {activeTab === 'directorio' && (
          <div>
            {/* Controles y filtros */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  📋 Directorio de Contactos
                </h3>
                <button style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 16px', 
                  backgroundColor: '#059669', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Nuevo Contacto
                </button>
              </div>

              {/* Filtros */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6b7280' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o ubicación..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 8px 8px 40px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      fontSize: '14px' 
                    }}
                  />
                </div>
                
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '14px' 
                  }}
                >
                  <option value="Todos">Todos los tipos</option>
                  <option value="Participaciones Marca">Participaciones Marca</option>
                  <option value="Participaciones Franquicia">Participaciones Franquicia</option>
                  <option value="Inversor Potencial">Inversor Potencial</option>
                </select>
                
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    fontSize: '14px' 
                  }}
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Prospecto">Prospecto</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Reunión">Reunión</option>
                  <option value="Propuesta">Propuesta</option>
                  <option value="Contrato">Contrato</option>
                  <option value="Señal">Señal</option>
                </select>
              </div>
            </div>

            {/* Lista de contactos */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                Mostrando {contactosFiltrados.length} de {contactos.length} contactos
              </div>

              {/* Header de tabla */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 0.5fr', 
                gap: '16px', 
                padding: '12px 0', 
                borderBottom: '2px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151'
              }}>
                <div>CONTACTO</div>
                <div>TIPO DE INTERÉS</div>
                <div>ESTADO</div>
                <div>UBICACIÓN</div>
                <div>INVERSIÓN</div>
                <div>FECHA CONTACTO</div>
                <div>ACCIONES</div>
              </div>

              {/* Filas de contactos */}
              {contactosFiltrados.map((contacto) => (
                <div key={contacto.id} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 0.5fr', 
                  gap: '16px', 
                  padding: '16px 0', 
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{contacto.nombre}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{contacto.email}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{contacto.telefono}</div>
                  </div>
                  
                  <div>
                    <span style={{ 
                      padding: '4px 8px', 
                      backgroundColor: contacto.tipoInteres === 'Participaciones Marca' ? '#dbeafe' : 
                                      contacto.tipoInteres === 'Participaciones Franquicia' ? '#fef3c7' : '#f3e8ff',
                      color: contacto.tipoInteres === 'Participaciones Marca' ? '#1e40af' : 
                             contacto.tipoInteres === 'Participaciones Franquicia' ? '#92400e' : '#7c3aed',
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {contacto.tipoInteres}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{ 
                      padding: '4px 8px', 
                      backgroundColor: contacto.estado === 'Señal' ? '#ecfdf5' : 
                                      contacto.estado === 'Contrato' ? '#f0fdf4' :
                                      contacto.estado === 'Propuesta' ? '#eff6ff' :
                                      contacto.estado === 'Reunión' ? '#fef3c7' : '#f3f4f6',
                      color: contacto.estado === 'Señal' ? '#047857' : 
                             contacto.estado === 'Contrato' ? '#166534' :
                             contacto.estado === 'Propuesta' ? '#1d4ed8' :
                             contacto.estado === 'Reunión' ? '#92400e' : '#6b7280',
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {contacto.estado}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#374151' }}>
                    {contacto.ubicacion}
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    {contacto.inversionDisponible ? `€${contacto.inversionDisponible.toLocaleString()}` : '-'}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(contacto.fechaContacto).toLocaleDateString('es-ES')}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={{ 
                      padding: '4px', 
                      backgroundColor: '#f3f4f6', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}>
                      <Eye style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                    </button>
                    <button style={{ 
                      padding: '4px', 
                      backgroundColor: '#f3f4f6', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}>
                      <Edit style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculadora ROI */}
        {activeTab === 'calculadora' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
                💰 Calculadora ROI - Análisis de Inversión
              </h3>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Herramienta para analizar la rentabilidad de nuevos proyectos de apertura
              </p>
            </div>
            <ROICalculator />
          </div>
        )}

        {/* Gestión de Leads */}
        {activeTab === 'gestion' && (
          <LeadManagementSystem />
        )}

        {/* Placeholder para otras pestañas */}
        {(activeTab === 'proyectos' || activeTab === 'pipeline') && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '48px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
              {activeTab === 'proyectos' && 'Gestión de Proyectos'}
              {activeTab === 'pipeline' && 'Pipeline de Ventas'}
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Módulo en desarrollo. Próximamente disponible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesLeadsModule;
