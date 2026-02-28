import React, { useState } from 'react';
import { createObjective } from '../../services/meetingService';
import { Target, X, Calendar, AlertTriangle, Save, Brain } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import { ui } from '../../utils/ui';


interface Props {
    onClose: () => void;
    onSave: () => void;
}

export const ObjectiveModal: React.FC<Props> = ({ onClose, onSave }) => {
    const { employee } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        departamento: 'Direccion',
        tipo_asignacion: 'departamento',
        asignado_a: employee?.id,
        mes_objetivo: new Date().toISOString().slice(0, 7) + '-01', // Primer día del mes actual
        fecha_limite: '',
        impacto_negocio: 5,
        dificultad: 5
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calcular riesgo inicial simple (luego la IA lo ajustará)
            const riesgo = formData.impacto_negocio > 8 && formData.dificultad > 8 ? 'alto' : 'bajo';
            const probabilidad = 100 - (formData.dificultad * 5); // Algoritmo simple inicial

            const { success, error } = await createObjective({
                ...formData,
                estado: 'pendiente',
                porcentaje_completitud: 0,
                riesgo_calculado: riesgo,
                probabilidad_cumplimiento: probabilidad,
                creado_por: employee?.id
            });

            if (!success) throw new Error(error);
            onSave();
            onClose();
        } catch (err) {
            console.error('Error creating objective:', err);
            ui.error('Error al crear objetivo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="text-emerald-600" />
                        Nuevo Objetivo Estratégico
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título del Objetivo</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej: Aumentar retención de clientes un 15%"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                value={formData.titulo}
                                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / KPI</label>
                            <textarea
                                rows={3}
                                placeholder="Detalles específicos y métricas de éxito..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                                value={formData.departamento}
                                onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                            >
                                <option value="Direccion">Dirección</option>
                                <option value="Marketing">Marketing</option>
                                <option value="RRHH">Recursos Humanos</option>
                                <option value="Operaciones">Operaciones</option>
                                <option value="Finanzas">Finanzas</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2"
                                    value={formData.fecha_limite}
                                    onChange={e => setFormData({ ...formData, fecha_limite: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* AI Factors */}
                        <div className="bg-slate-50 p-4 rounded-lg col-span-2 border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="text-purple-600 h-5 w-5" />
                                <h3 className="font-semibold text-gray-800 text-sm">Factores de Predicción IA</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Impacto en Negocio (1-10)
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        className="w-full accent-purple-600 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                                        value={formData.impacto_negocio}
                                        onChange={e => setFormData({ ...formData, impacto_negocio: parseInt(e.target.value) })}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>Bajo</span>
                                        <span className="font-bold text-purple-700">{formData.impacto_negocio}</span>
                                        <span>Crítico</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Dificultad Estimada (1-10)
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        className="w-full accent-amber-500 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                                        value={formData.dificultad}
                                        onChange={e => setFormData({ ...formData, dificultad: parseInt(e.target.value) })}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>Routine</span>
                                        <span className="font-bold text-amber-700">{formData.dificultad}</span>
                                        <span>Extrema</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 transition-transform active:scale-95"
                        >
                            {loading ? 'Guardando...' : (
                                <>
                                    <Save size={18} />
                                    Guardar Objetivo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
