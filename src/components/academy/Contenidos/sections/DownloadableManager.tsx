import React, { useState } from 'react';
import { CheckCircle, Clock, Trash2, Plus, FileText, Maximize2, Upload, Download } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { downloadableService } from '../../../../services/academyService';
import { ui } from '../../../../utils/ui';

interface DownloadableManagerProps {
    blockId: string;
    downloadables: Record<string, unknown>[];
    onUpdate: () => void;
    onOpenContentModal: (downloadable: { id: string; name: string; prompt_generation: string }) => void;
}

export const DownloadableManager: React.FC<DownloadableManagerProps> = ({
    blockId,
    downloadables,
    onUpdate,
    onOpenContentModal,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('pdf');
    const [error, setError] = useState(false);

    const addDownloadable = async () => {
        if (!newName.trim()) {
            setError(true);
            return;
        }

        try {
            console.log('Enviando petición a Supabase...');
            const nextOrder = (downloadables.length > 0)
                ? Math.max(...downloadables.map(d => d.order || 0)) + 1
                : 1;

            await downloadableService.create({
                block_id: blockId,
                name: newName,
                type: newType,
                status: 'pending',
                order: nextOrder
            });

            onUpdate();
            setIsAdding(false);
            setNewName('');
            setError(false);
        } catch (err) {
            console.error('Error:', err);
            ui.error('Error al crear descargable (ver consola)');
        }
    };

    return (
        <div className="space-y-4">
            {downloadables.map(d => (
                <div key={d.id} className="border border-emerald-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-extrabold uppercase p-1.5 bg-slate-100 rounded text-slate-700 tracking-wider">
                                {d.type}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1.5
                                ${d.status === 'uploaded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {d.status === 'uploaded' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {d.status === 'uploaded' ? 'Listo' : 'Pendiente'}
                            </span>
                            <button
                                onClick={async () => {
                                    if (await ui.confirm('¿Borrar descargable?')) {
                                        await downloadableService.delete(d.id);
                                        onUpdate();
                                    }
                                }}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content Button - Opens Modal */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2 block">
                            Contenido Texto Plano
                        </label>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onOpenContentModal({
                                    id: d.id,
                                    name: d.name,
                                    prompt_generation: d.prompt_generation || ''
                                });
                            }}
                            className="w-full text-left p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition-all group/btn cursor-pointer pointer-events-auto relative z-10"
                        >
                            {d.prompt_generation ? (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                                            {d.prompt_generation.substring(0, 120)}
                                            {d.prompt_generation.length > 120 ? '...' : ''}
                                        </p>
                                        <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1 group-hover/btn:underline">
                                            <Maximize2 className="h-3 w-3" /> Editar contenido
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">Añadir contenido de texto plano...</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* File Upload Section - Mini version */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {d.file_url ? (
                            <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-2">
                                <Download className="h-4 w-4" /> Ver Archivo Final
                            </a>
                        ) : (
                            <label className="cursor-pointer text-xs font-bold bg-white border border-gray-300 hover:border-emerald-400 hover:text-emerald-800 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm w-full justify-center">
                                <Upload className="h-3 w-3" /> Subir Archivo Final
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                const sanitizedName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.-]/g, "_");
                                                const fileName = `${d.id}_${Date.now()}_${sanitizedName}`;

                                                const { data, error } = await supabase.storage.from('academy-downloadables').upload(fileName, file);

                                                if (error) throw error;

                                                if (data) {
                                                    const { data: url } = supabase.storage.from('academy-downloadables').getPublicUrl(fileName);
                                                    await downloadableService.update(d.id, { file_url: url.publicUrl, status: 'uploaded' });
                                                    onUpdate();
                                                    ui.success('Archivo subido y vinculado correctamente');
                                                }
                                            } catch (err) {
                                                console.error('Error uploading file:', err);
                                                ui.error('Error al subir el archivo. Intenta con un nombre más simple.');
                                            }
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>
                </div>
            ))}

            {isAdding ? (
                <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 animate-in fade-in">
                    <input
                        type="text"
                        placeholder="Nombre del recurso (ej: Plantilla Excel) *"
                        className={`w-full p-2 border rounded mb-1 ${error ? 'border-red-500 bg-red-50 focus:ring-red-500 placeholder-red-400' : 'border-emerald-300'}`}
                        value={newName}
                        onChange={e => {
                            setNewName(e.target.value);
                            if (e.target.value) setError(false);
                        }}
                    />
                    {error && <p className="text-xs text-red-500 font-bold mb-2">El nombre es obligatorio</p>}
                    <div className="flex gap-2">
                        <select
                            value={newType}
                            onChange={e => setNewType(e.target.value)}
                            className="p-2 border border-emerald-300 rounded"
                        >
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="word">Word</option>
                            <option value="image">Imagen</option>
                        </select>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addDownloadable();
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 font-bold shadow-sm active:transform active:scale-95 transition-all"
                        >
                            Añadir
                        </button>
                        <button onClick={() => setIsAdding(false)} className="text-gray-500 px-4 py-2">Cancelar</button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="h-4 w-4" /> Añadir Material Descargable
                </button>
            )}
        </div>
    );
};
