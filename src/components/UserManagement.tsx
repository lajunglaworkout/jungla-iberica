import React, { useState, useEffect } from 'react';
import { Users, Edit, Save } from 'lucide-react';
import { UserProfile, loadUsers, updateUser } from '../services/userService';

const MODULES = {
  logistics: '📦 Logística',
  maintenance: '🔧 Mantenimiento',
  accounting: '💰 Contabilidad',
  marketing: '📢 Marketing',
  hr: '👥 RRHH',
  online: '💻 Online',
  events: '🎉 Eventos'
};

const UserManagement: React.FC = () => {
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterCenter, setFilterCenter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadUsers().then(result => {
      if (result.success) setTeam(result.users);
      setLoading(false);
    });
  }, []);

  const toggleModule = async (userId: string, moduleId: string) => {
    const user = team.find(u => u.id === userId);
    if (!user) return;

    const modules = user.assigned_modules || [];
    const updated = modules.includes(moduleId)
      ? modules.filter(m => m !== moduleId)
      : [...modules, moduleId];

    const result = await updateUser(userId, { assigned_modules: updated });
    if (result.success) {
      setTeam(prev => prev.map(u => u.id === userId ? { ...u, assigned_modules: updated } : u));
    }
  };

  // Filtrar usuarios
  const filteredTeam = team.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.base_role === filterRole;
    const matchesCenter = filterCenter === 'all' || user.center_id === filterCenter;
    return matchesSearch && matchesRole && matchesCenter;
  });

  const getCenterName = (centerId?: string) => {
    const centers = {
      '9': 'Sevilla',
      '10': 'Jerez', 
      '11': 'Puerto'
    };
    return centers[centerId as keyof typeof centers] || 'Sin asignar';
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={32} />
          Gestión de Usuarios La Jungla ({team.length} usuarios)
        </h1>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
          />
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '0.875rem',
              minWidth: '150px'
            }}
          >
            <option value="all">Todos los roles</option>
            <option value="ceo">CEO</option>
            <option value="director">Directores</option>
            <option value="center_manager">Encargados</option>
            <option value="trainer">Entrenadores</option>
            <option value="employee">Empleados</option>
          </select>

          <select
            value={filterCenter}
            onChange={(e) => setFilterCenter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '0.875rem',
              minWidth: '150px'
            }}
          >
            <option value="all">Todos los centros</option>
            <option value="9">🏪 Sevilla</option>
            <option value="10">🏪 Jerez</option>
            <option value="11">🏪 Puerto</option>
          </select>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando usuarios...</p>}
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Usuario</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Rol</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Centro</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Módulos</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '1rem' }}>
                <div><strong>{user.name}</strong></div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  backgroundColor: user.base_role === 'ceo' ? '#7c3aed' : 
                                 user.base_role === 'director' ? '#059669' : 
                                 user.base_role === 'center_manager' ? '#dc2626' : '#6b7280',
                  color: 'white'
                }}>
                  {user.base_role === 'ceo' ? 'CEO' : 
                   user.base_role === 'director' ? 'Director' : 
                   user.base_role === 'center_manager' ? 'Encargado' :
                   user.base_role === 'trainer' ? 'Entrenador' : 'Empleado'}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  backgroundColor: user.center_id === '1' ? '#7c3aed' : '#059669',
                  color: 'white'
                }}>
                  {user.center_id === '1' ? '🏢' : '🏪'} {getCenterName(user.center_id)}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                {editingUser === user.id ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Object.entries(MODULES).map(([id, name]) => (
                      <button
                        key={id}
                        onClick={() => toggleModule(user.id, id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          backgroundColor: (user.assigned_modules || []).includes(id) ? '#059669' : 'white',
                          color: (user.assigned_modules || []).includes(id) ? 'white' : '#374151',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    {(user.assigned_modules || []).length === 0 ? (
                      <span style={{ color: '#6b7280' }}>Solo acceso básico</span>
                    ) : (
                      user.assigned_modules?.map(moduleId => (
                        <span key={moduleId} style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          marginRight: '0.25rem'
                        }}>
                          {MODULES[moduleId as keyof typeof MODULES]}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </td>
              <td style={{ padding: '1rem' }}>
                {editingUser === user.id ? (
                  <button
                    onClick={() => setEditingUser(null)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingUser(user.id)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                )}
              </td>
            </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
