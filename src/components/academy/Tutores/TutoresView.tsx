import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, MoreVertical,
    Mail, Phone, MapPin, Star, Award, ArrowLeft,
    CheckCircle, XCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AcademyTutor } from '../../../types/academy';

interface TutoresViewProps {
    onBack: () => void;
}

export const TutoresView: React.FC<TutoresViewProps> = ({ onBack }) => {
    const [tutors, setTutors] = useState<AcademyTutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTutors();
    }, [filterStatus]);

    const loadTutors = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('academy_tutors')
                .select('*')
                .order('name', { ascending: true });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTutors(data || []);
        } catch (error) {
            console.error('Error loading tutors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTutor = async () => {
        const name = prompt('Nombre del nuevo tutor:');
        if (!name) return;

        const email = prompt('Email del tutor:');
        if (!email) return;

        try {
            const { data, error } = await supabase
                .from('academy_tutors')
                .insert([{
                    name,
                    email,
                    status: 'active',
                    specialization: 'Entrenador Personal',
                    rating: 5.0
                }])
                .select()
                .single();

            if (error) throw error;
            setTutors([...tutors, data]);
        } catch (error) {
            console.error('Error creating tutor:', error);
            alert('Error al crear el tutor');
        }
    };

    const filteredTutors = tutors.filter(tutor =>
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gestión de Tutores</h2>
                        <p className="text-gray-500">Equipo docente y colaboradores</p>
                    </div>
                </div>
                <button
                    onClick={handleAddTutor}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Tutor
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'active', 'inactive'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 md:flex-none text-center ${filterStatus === status
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {status === 'all' && 'Todos'}
                            {status === 'active' && 'Activos'}
                            {status === 'inactive' && 'Inactivos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tutors Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando tutores...</p>
                </div>
            ) : filteredTutors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay tutores encontrados</h3>
                    <p className="text-gray-500 mb-4">Prueba con otros filtros o añade un nuevo tutor</p>
                    <button
                        onClick={handleAddTutor}
                        className="text-blue-600 font-medium hover:text-blue-700"
                    >
                        Añadir Tutor
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTutors.map((tutor) => (
                        <div
                            key={tutor.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                        >
                            <div className="p-6 text-center border-b border-gray-100 relative">
                                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-5 w-5" />
                                </button>

                                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                                    {tutor.name.charAt(0)}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1">{tutor.name}</h3>
                                <p className="text-sm text-blue-600 font-medium mb-2">{tutor.specialization}</p>

                                <div className="flex items-center justify-center gap-1 text-yellow-500 text-sm">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="font-medium text-gray-700">{tutor.rating}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{tutor.email}</span>
                                </div>
                                {tutor.phone && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span>{tutor.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${tutor.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {tutor.status === 'active' ? (
                                            <><CheckCircle className="h-3 w-3" /> Activo</>
                                        ) : (
                                            <><XCircle className="h-3 w-3" /> Inactivo</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
