import React, { useState, useEffect } from 'react';
import { Users, Edit, Save, Plus, Trash2, Key, Mail, Eye, EyeOff, Shield, UserX, UserCheck } from 'lucide-react';
import { 
  UserProfile, 
  loadUsers, 
  updateUser, 
  createUserWithAuth, 
  changeUserPassword, 
  updateUserEmail,
  deactivateUser,
  reactivateUser
} from '../services/userService';
import { useSession } from '../contexts/SessionContext';
import { ui } from '../utils/ui';


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
  const { employee, userRole } = useSession();
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterCenter, setFilterCenter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Estados para modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  
  // Estados para formularios
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dni: '',
    base_role: 'employee' as 'ceo' | 'director' | 'center_manager' | 'trainer' | 'employee',
    center_id: '',
    assigned_modules: [] as string[]
  });
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Verificar si es superadmin
  const isSuperAdmin = userRole === 'superadmin';

  useEffect(() => {
    setLoading(true);
    loadUsers().then(result => {
      if (result.success) {
        setTeam(result.users);
      }
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

  // Crear nuevo usuario
  const handleCreateUser = async () => {
    if (!isSuperAdmin) {
      ui.error('❌ Solo el superadmin puede crear usuarios');
      return;
    }

    if (!newUser.name || !newUser.email || !newUser.password) {
      ui.error('❌ Nombre, email y contraseña son obligatorios');
      return;
    }

    setLoading(true);
    const result = await createUserWithAuth(newUser);
    
    if (result.success) {
      ui.success('✅ Usuario creado correctamente');
      setTeam(prev => [...prev, result.user!]);
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        dni: '',
        base_role: 'employee',
        center_id: '',
        assigned_modules: []
      });
    } else {
      ui.error(`❌ Error creando usuario: ${result.error}`);
    }
    setLoading(false);
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!isSuperAdmin || !selectedUserId) return;

    if (!newPassword || newPassword.length < 6) {
      ui.error('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await changeUserPassword(selectedUserId, newPassword);
    
    if (result.success) {
      ui.success(`✅ ${(result.message || 'Cambio de contraseña registrado')}`);
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUserId(null);
    } else {
      ui.error(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  // Cambiar email
  const handleChangeEmail = async () => {
    if (!isSuperAdmin || !selectedUserId) return;

    if (!newEmail || !newEmail.includes('@')) {
      ui.error('❌ Email inválido');
      return;
    }

    setLoading(true);
    const result = await updateUserEmail(selectedUserId, newEmail);
    
    if (result.success) {
      const message = result.message || 'Email actualizado en la base de datos.';
      ui.success(`✅ ${message}\n\n⚠️ IMPORTANTE: El usuario debe contactar al administrador si no puede acceder con el nuevo email.`);
      setTeam(prev => prev.map(u => 
        u.user_id === selectedUserId ? { ...u, email: newEmail } : u
      ));
      setShowEmailModal(false);
      setNewEmail('');
      setSelectedUserId(null);
    } else {
      ui.error(`❌ Error cambiando email: ${result.error}`);
    }
    setLoading(false);
  };

  // Desactivar/Reactivar usuario
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    if (!isSuperAdmin) {
      ui.error('❌ Solo el superadmin puede cambiar el estado de usuarios');
      return;
    }

    const action = isActive ? 'desactivar' : 'reactivar';
    if (!await ui.confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) return;

    setLoading(true);
    const result = isActive 
      ? await deactivateUser(userId)
      : await reactivateUser(userId);
    
    if (result.success) {
      ui.success(`✅ Usuario ${action}do correctamente`);
      setTeam(prev => prev.map(u => 
        u.user_id === userId ? { ...u, is_active: !isActive } : u
      ));
    } else {
      ui.error(`❌ Error ${action}ndo usuario: ${result.error}`);
    }
    setLoading(false);
  };

  // Filtrar usuarios
  const filteredTeam = team.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.base_role === filterRole;
    
    // Convertir center_id a string para comparación consistente
    const userCenterId = user.center_id ? String(user.center_id) : '';
    const matchesCenter = filterCenter === 'all' || 
                         (filterCenter === '' && userCenterId === '') ||
                         userCenterId === filterCenter;
    
    return matchesSearch && matchesRole && matchesCenter;
  });

  const getCenterName = (centerId?: string | number) => {
    const centers = {
      '9': 'Sevilla',
      '10': 'Jerez', 
      '11': 'Puerto'
    };
    const centerKey = centerId ? String(centerId) : '';
    return centers[centerKey as keyof typeof centers] || 'Marca/Central';
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: '2rem', 
      backgroundColor: '#f9fafb', 
      overflow: 'auto',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '2rem', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        minHeight: 'calc(100vh - 4rem)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={32} />
            Gestión de Usuarios La Jungla ({team.length} usuarios)
            {isSuperAdmin && <Shield size={24} style={{ color: '#10b981' }} />}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isSuperAdmin && (
              <button
                onClick={async () => setShowCreateModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={16} />
                Crear Usuario
              </button>
            )}
            <button
              onClick={async () => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={async (e) => setSearchTerm(e.target.value)}
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
            onChange={async (e) => setFilterRole(e.target.value)}
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
            onChange={async (e) => setFilterCenter(e.target.value)}
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
            <option value="">🏢 Marca/Central</option>
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
                                 user.base_role === 'center_manager' ? '#dc2626' : 
                                 user.base_role === 'trainer' ? '#f59e0b' : '#6b7280',
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
                  backgroundColor: (!user.center_id || user.center_id === '') ? '#7c3aed' : '#059669',
                  color: 'white'
                }}>
                  {(!user.center_id || user.center_id === '') ? '🏢' : '🏪'} {getCenterName(user.center_id)}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                {editingUser === user.id ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Object.entries(MODULES).map(([id, name]) => (
                      <button
                        key={id}
                        onClick={async () => toggleModule(user.id, id)}
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
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {editingUser === user.id ? (
                    <button
                      onClick={async () => setEditingUser(null)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Guardar cambios"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={async () => setEditingUser(user.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Editar módulos"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  
                  {isSuperAdmin && user.email !== employee?.email && (
                    <>
                      <button
                        onClick={async () => {
                          setSelectedUserId(user.user_id || user.id);
                          setSelectedUserName(user.name);
                          setNewEmail(user.email);
                          setShowEmailModal(true);
                        }}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Cambiar email"
                      >
                        <Mail size={16} />
                      </button>
                      
                      <button
                        onClick={async () => {
                          setSelectedUserId(user.user_id || user.id);
                          setSelectedUserName(user.name);
                          setShowPasswordModal(true);
                        }}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Cambiar contraseña"
                      >
                        <Key size={16} />
                      </button>
                      
                      <button
                        onClick={async () => handleToggleUserStatus(user.user_id || user.id, user.is_active)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: user.is_active ? '#ef4444' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title={user.is_active ? 'Desactivar usuario' : 'Reactivar usuario'}
                      >
                        {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Crear Usuario */}
        {showCreateModal && (
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
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={24} />
                Crear Nuevo Usuario
              </h2>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={newUser.name}
                  onChange={async (e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={async (e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={async (e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '100%', paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={async () => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={newUser.phone}
                  onChange={async (e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                
                <input
                  type="text"
                  placeholder="DNI (opcional)"
                  value={newUser.dni}
                  onChange={async (e) => setNewUser(prev => ({ ...prev, dni: e.target.value }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                
                <select
                  value={newUser.base_role}
                  onChange={async (e) => setNewUser(prev => ({ ...prev, base_role: e.target.value as 'ceo' | 'director' | 'center_manager' | 'trainer' | 'employee' }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                >
                  <option value="employee">Empleado</option>
                  <option value="trainer">Entrenador</option>
                  <option value="center_manager">Encargado</option>
                  <option value="director">Director</option>
                  <option value="ceo">CEO</option>
                </select>
                
                <select
                  value={newUser.center_id}
                  onChange={async (e) => setNewUser(prev => ({ ...prev, center_id: e.target.value }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                >
                  <option value="">🏢 Marca/Central</option>
                  <option value="9">🏪 Sevilla</option>
                  <option value="10">🏪 Jerez</option>
                  <option value="11">🏪 Puerto</option>
                </select>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Módulos asignados:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Object.entries(MODULES).map(([id, name]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={async () => {
                          const modules = newUser.assigned_modules;
                          const updated = modules.includes(id)
                            ? modules.filter(m => m !== id)
                            : [...modules, id];
                          setNewUser(prev => ({ ...prev, assigned_modules: updated }));
                        }}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          backgroundColor: newUser.assigned_modules.includes(id) ? '#059669' : 'white',
                          color: newUser.assigned_modules.includes(id) ? 'white' : '#374151',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={handleCreateUser}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
                <button
                  onClick={async () => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cambiar Contraseña */}
        {showPasswordModal && (
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
              padding: '2rem',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={24} />
                Cambiar Contraseña
              </h2>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Usuario: <strong>{selectedUserName}</strong>
              </p>
              <div style={{ 
                backgroundColor: '#fef3c7', 
                border: '1px solid #f59e0b', 
                borderRadius: '6px', 
                padding: '0.75rem', 
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                ⚠️ <strong>Nota:</strong> Por limitaciones de permisos, el cambio se registra en la BD. 
                El usuario deberá cambiar su contraseña en el próximo login.
              </div>
              
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  value={newPassword}
                  onChange={async (e) => setNewPassword(e.target.value)}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    width: '100%',
                    paddingRight: '3rem'
                  }}
                />
                <button
                  type="button"
                  onClick={async () => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                <button
                  onClick={async () => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setShowPassword(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cambiar Email */}
        {showEmailModal && (
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
              padding: '2rem',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={24} />
                Cambiar Email
              </h2>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Usuario: <strong>{selectedUserName}</strong>
              </p>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                border: '1px solid #3b82f6', 
                borderRadius: '6px', 
                padding: '0.75rem', 
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                ℹ️ <strong>Nota:</strong> El email se actualiza en la base de datos. 
                El usuario deberá usar el nuevo email para iniciar sesión.
              </div>
              
              <input
                type="email"
                placeholder="Nuevo email"
                value={newEmail}
                onChange={async (e) => setNewEmail(e.target.value)}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  width: '100%',
                  marginBottom: '1.5rem'
                }}
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleChangeEmail}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Cambiando...' : 'Cambiar Email'}
                </button>
                <button
                  onClick={async () => {
                    setShowEmailModal(false);
                    setNewEmail('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
