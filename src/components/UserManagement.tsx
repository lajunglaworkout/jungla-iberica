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

  useEffect(() => {
    loadUsers().then(result => {
      if (result.success) setTeam(result.users);
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

  return (
    <div style={{ padding: '2rem' }}>
      <h1><Users size={32} /> Gestión de Usuarios</h1>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Usuario</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Rol</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Módulos</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {team.map(user => (
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
                  backgroundColor: user.base_role === 'ceo' ? '#7c3aed' : '#059669',
                  color: 'white'
                }}>
                  {user.base_role === 'ceo' ? 'CEO' : user.base_role === 'director' ? 'Director' : 'Empleado'}
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
  );
};

export default UserManagement;
