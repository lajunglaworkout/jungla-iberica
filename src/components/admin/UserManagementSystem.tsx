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
    Trash2,
    Lock,
    Key,
    ChevronRight
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
    const [departments, setDepartments] = useState<any[]>([]);

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
            // Cargar departamentos para el mapeo
            const { data: depsData } = await supabase.from('departments').select('*');
            if (depsData) setDepartments(depsData);

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

    const handlePasswordReset = async (email: string) => {
        if (!confirm(`¿Estás seguro de enviar un correo de restablecimiento de contraseña a ${email}?`)) {
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });

            if (error) throw error;
            alert(`✅ Correo de recuperación enviado a ${email}`);
        } catch (error: any) {
            console.error('Error sending reset email:', error);
            alert(`❌ Error al enviar correo: ${error.message}`);
        }
    };

    const handleSaveUser = async (userData: Partial<Employee>) => {
        try {
            console.log('💾 Guardando usuario:', userData);

            // Buscar ID del departamento
            let departmentId = null;
            if (userData.departamento) {
                // Intentar buscar por nombre exacto o aproximado
                const dep = departments.find(d =>
                    d.name.toLowerCase() === userData.departamento?.toLowerCase() ||
                    d.name.toLowerCase().includes(userData.departamento?.toLowerCase())
                );

                if (dep) {
                    departmentId = dep.id;
                } else {
                    // Si no existe, crearlo (para soportar 'Academy' u otros nuevos)
                    console.log(`⚠️ Departamento '${userData.departamento}' no encontrado. Creándolo...`);
                    const { data: newDep, error: depError } = await supabase
                        .from('departments')
                        .insert([{ name: userData.departamento }])
                        .select()
                        .single();

                    if (depError) {
                        console.error('Error creando departamento:', depError);
                        // Fallback: intentar seguir sin ID o mostrar error
                    } else if (newDep) {
                        departmentId = newDep.id;
                        // Actualizar lista local
                        setDepartments(prev => [...prev, newDep]);
                    }
                }
            }

            // Mapeo COMPLETO de datos para Supabase (igual que HRManagementSystem)
            // Mapeo COMPLETO de datos para Supabase (igual que HRManagementSystem)
            const supabaseData = {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone,
                dni: userData.dni,
                birth_date: userData.birth_date,
                address: userData.address,
                city: userData.city,
                postal_code: userData.postal_code,
                // CONSTRAINT REMOVED: We now allow both Center and Department (e.g. for Antonio)
                center_id: userData.center_id ? parseInt(String(userData.center_id)) : null,
                role: userData.role === 'admin' ? 'Admin' :
                    userData.role === 'director' ? 'Director' :
                        userData.role === 'encargado' ? 'Encargado' :
                            userData.role === 'empleado' ? 'Empleado' :
                                userData.role,
                department_id: departmentId,
                position: userData.position,

                // Datos laborales
                hire_date: userData.hire_date,
                contract_type: userData.contract_type,
                work_schedule: userData.work_schedule,
                gross_annual_salary: userData.gross_annual_salary,

                // Datos bancarios
                bank_account_number: userData.bank_account_number,
                iban: userData.iban,
                banco: userData.banco,

                // Formación
                education_level: userData.education_level,
                degree: userData.degree,
                specialization: userData.specialization,

                // Tallas
                shirt_size: userData.shirt_size,
                pant_size: userData.pant_size,
                jacket_size: userData.jacket_size,

                is_active: userData.is_active !== false,
                updated_at: new Date().toISOString()
            };

            // Filtrar campos undefined
            const cleanData = Object.fromEntries(
                Object.entries(supabaseData).filter(([_, value]) => value !== undefined)
            );

            console.log('📤 Enviando a Supabase:', cleanData);

            let savedUserId = selectedUser?.id;

            if (selectedUser) {
                const { error } = await supabase
                    .from('employees')
                    .update(cleanData)
                    .eq('id', selectedUser.id);
                if (error) throw error;
            } else {
                const { data: newUser, error } = await supabase
                    .from('employees')
                    .insert([{ ...cleanData, created_at: new Date().toISOString() }])
                    .select()
                    .single();
                if (error) throw error;
                savedUserId = newUser.id;
            }

            // 💾 Guardar departamentos (Multi-departamento)
            if (savedUserId && userData.departments) {
                console.log('🏢 Guardando departamentos para usuario:', savedUserId, userData.departments);

                // 1. Eliminar asignaciones anteriores
                const { error: deleteError } = await supabase
                    .from('employee_departments')
                    .delete()
                    .eq('employee_id', savedUserId);

                if (deleteError) {
                    console.error('Error eliminando departamentos anteriores:', deleteError);
                    throw deleteError;
                }

                // 2. Insertar nuevas asignaciones
                if (userData.departments.length > 0) {
                    const deptInserts = userData.departments.map(d => ({
                        employee_id: savedUserId,
                        department_id: d.id
                    }));

                    const { error: insertError } = await supabase
                        .from('employee_departments')
                        .insert(deptInserts);

                    if (insertError) {
                        console.error('Error insertando nuevos departamentos:', insertError);
                        throw insertError;
                    }
                }
            }

            setShowUserModal(false);
            loadData();
            alert('✅ Usuario guardado correctamente');
        } catch (error: any) {
            console.error('Error saving user FULL OBJECT:', error);
            console.error('Error details:', error.details);
            console.error('Error message:', error.message);
            console.error('Error hint:', error.hint);
            alert(`Error al guardar usuario: ${error.message} - ${error.details || ''}`);
        }
    };

    // Render Helpers
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Director': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Encargado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-gray-50/50 p-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="mb-10 bg-emerald-600 p-8 rounded-2xl shadow-lg border border-emerald-500 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Users size={28} className="text-white" />
                                </div>
                                Gestión de Accesos y Entidades
                                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full border border-emerald-400 shadow-sm">v2.1</span>
                            </h1>
                            <p className="text-emerald-50 mt-2 ml-14 text-lg opacity-90">Administración centralizada de usuarios, centros y permisos del sistema.</p>
                        </div>

                        <div className="flex gap-3 bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/10">
                            <button
                                onClick={() => setCurrentView('users')}
                                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${currentView === 'users'
                                    ? 'bg-white text-emerald-700 shadow-md'
                                    : 'text-emerald-50 hover:bg-white/10'
                                    }`}
                            >
                                <Users size={18} />
                                Usuarios
                            </button>
                            <button
                                onClick={() => setCurrentView('centers')}
                                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${currentView === 'centers'
                                    ? 'bg-white text-emerald-700 shadow-md'
                                    : 'text-emerald-50 hover:bg-white/10'
                                    }`}
                            >
                                <Building2 size={18} />
                                Centros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder={`Buscar ${currentView === 'users' ? 'usuarios por nombre o email' : 'centros'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {currentView === 'users' && (
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm hover:border-emerald-300 transition-colors"
                            >
                                <option value="all">Todos los roles</option>
                                <option value="Admin">👑 CEO / Superadmin</option>
                                <option value="Director">👔 Director</option>
                                <option value="Encargado">🏪 Gerente / Franquiciado</option>
                                <option value="Empleado">👤 Empleado / Colaborador</option>
                            </select>
                        )}

                        <button
                            onClick={() => currentView === 'users' ? handleCreateUser() : setShowCenterModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 font-medium shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5"
                        >
                            <Plus size={20} />
                            {currentView === 'users' ? 'Nuevo Usuario' : 'Nuevo Centro'}
                        </button>
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Cargando datos...</p>
                        </div>
                    ) : currentView === 'users' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol y Cargo</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users
                                        .filter(u =>
                                            (filterRole === 'all' || u.role === filterRole) &&
                                            (u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                                        )
                                        .map((user) => (
                                            <tr key={user.id} className="hover:bg-emerald-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg shadow-sm border-2 border-white ring-2 ring-emerald-50">
                                                            {user.first_name?.charAt(0).toUpperCase()}{user.last_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 text-base">{user.first_name} {user.last_name}</div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getRoleBadgeColor(user.role || 'Empleado')}`}>
                                                            {(user.role || 'Empleado').toUpperCase()}
                                                        </span>
                                                        <span className="text-sm text-gray-600 font-medium">{user.position || 'Sin cargo'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                                                        <MapPin size={14} className="text-gray-400" />
                                                        <span className="text-sm font-medium">{user.centro_nombre || 'Sin asignar'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100 shadow-sm">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-medium border border-red-100 shadow-sm">
                                                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handlePasswordReset(user.email)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-100"
                                                            title="Enviar correo de recuperación de contraseña"
                                                        >
                                                            <Key size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 border border-transparent hover:border-emerald-100"
                                                            title="Editar usuario"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {centers.map((center) => (
                                <div key={center.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                            <Building2 size={24} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${center.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                            }`}>
                                            {center.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{center.name}</h3>

                                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            {center.city}, {center.province}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-gray-400" />
                                            {center.manager_name || 'Sin gerente asignado'}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button className="text-emerald-600 font-medium hover:text-emerald-700 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Ver detalles <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                {showCenterModal && (
                    <CreateCenterModal
                        isOpen={showCenterModal}
                        onClose={() => setShowCenterModal(false)}
                        onSuccess={() => {
                            setShowCenterModal(false);
                            loadData();
                        }}
                    />
                )}

                {showUserModal && (
                    <EmployeeForm
                        employee={selectedUser}
                        onSave={handleSaveUser}
                        onCancel={() => setShowUserModal(false)}
                        availableDepartments={departments}
                    />
                )}
            </div>
        </div>
    );
};
