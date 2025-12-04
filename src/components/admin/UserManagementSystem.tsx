import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Shield,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Edit,
    Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CreateCenterModal } from '../CreateCenterModal';
import EmployeeForm from '../EmployeeForm';
import { Employee } from '../../types/employee';
import { CenterType, CenterStatus } from '../../types/center';

// Tipos para la vista
type ViewMode = 'users' | 'centers';

export const UserManagementSystem: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewMode>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // Data States
    const [users, setUsers] = useState<Employee[]>([]);
    const [centers, setCenters] = useState<any[]>([]);

    // Modals State
    const [showCenterModal, setShowCenterModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Employee | null>(null);

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, [currentView]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (currentView === 'users') {
                const { data, error } = await supabase
                    .from('employees')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setUsers(data || []);
            } else {
                const { data, error } = await supabase
                    .from('centers')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCenters(data || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleCreateUser = () => {
        setSelectedUser(null);
        setShowUserModal(true);
    };

    const handleEditUser = (user: Employee) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleSaveUser = async (userData: Partial<Employee>) => {
        try {
            // Mapeo de datos para Supabase (similar a HRManagementSystem)
            const supabaseData = {
                name: userData.nombre,
                apellidos: userData.apellidos,
                email: userData.email,
                phone: userData.telefono,
                dni: userData.dni,
                birth_date: userData.fecha_nacimiento,
                address: userData.direccion,
                center_id: userData.center_id ? parseInt(String(userData.center_id)) : null,
                role: userData.rol,
                department: userData.departamento, // Usar departamento como string si no hay ID
                position: userData.cargo,
                is_active: userData.activo !== false,
                // Añadir otros campos necesarios según EmployeeForm
                updated_at: new Date().toISOString()
            };

            if (selectedUser) {
                const { error } = await supabase
                    .from('employees')
                    .update(supabaseData)
                    .eq('id', selectedUser.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('employees')
                    .insert([{ ...supabaseData, created_at: new Date().toISOString() }]);
                if (error) throw error;
            }

            setShowUserModal(false);
            loadData();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error al guardar usuario');
        }
    };

    // Render Helpers
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'manager': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Accesos y Entidades</h1>
                <p className="text-gray-500 mt-2">Administración centralizada de usuarios, centros y permisos.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setCurrentView('users')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${currentView === 'users'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Usuarios y Accesos
                    </div>
                </button>
                <button
                    onClick={() => setCurrentView('centers')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${currentView === 'centers'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Centros y Franquicias
                    </div>
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Buscar ${currentView === 'users' ? 'usuarios' : 'centros'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {currentView === 'users' && (
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none bg-white"
                        >
                            <option value="all">Todos los roles</option>
                            <option value="superadmin">CEO / Superadmin</option>
                            <option value="admin">Director</option>
                            <option value="manager">Gerente / Franquiciado</option>
                            <option value="employee">Empleado / Colaborador</option>
                        </select>
                    )}

                    <button
                        onClick={() => currentView === 'users' ? handleCreateUser() : setShowCenterModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" />
                        {currentView === 'users' ? 'Nuevo Usuario' : 'Nuevo Centro'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Cargando datos...</div>
                ) : currentView === 'users' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol / Cargo</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Centro</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users
                                    .filter(u =>
                                        (filterRole === 'all' || u.rol === filterRole) &&
                                        (u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                                    )
                                    .map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                        {user.nombre?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.nombre} {user.apellidos}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.rol)}`}>
                                                        {user.rol.toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-gray-600">{user.cargo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    {user.centro_nombre || 'Sin asignar'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.activo ? (
                                                    <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-200">
                                                        <CheckCircle className="h-3.5 w-3.5" /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-red-200">
                                                        <XCircle className="h-3.5 w-3.5" /> Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {centers
                            .filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((center) => (
                                <div key={center.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-50 rounded-lg">
                                            <Building2 className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${center.status === 'Activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            {center.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{center.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{center.city}</p>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            <span>Responsable: {center.responsable || 'Sin asignar'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{center.phone || 'Sin teléfono'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateCenterModal
                isOpen={showCenterModal}
                onClose={() => setShowCenterModal(false)}
                onCenterCreated={() => {
                    loadData();
                    setShowCenterModal(false);
                }}
            />

            {showUserModal && (
                <EmployeeForm
                    employee={selectedUser}
                    onSave={handleSaveUser}
                    onCancel={() => setShowUserModal(false)}
                />
            )}
        </div>
    );
};
