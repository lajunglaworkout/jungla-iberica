import React, { useState } from 'react';
import { Video, Layout, Upload, Trash2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { blockService } from '../../../../services/academyService';
import { ui } from '../../../../utils/ui';

interface FileUploadProps {
    blockId: string;
    fileType: 'video' | 'ppt';
    onUploadComplete: (url: string) => void;
    existingUrl?: string;
    onDelete: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    blockId,
    fileType,
    onUploadComplete,
    existingUrl,
    onDelete,
}) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const maxSize = fileType === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
            if (file.size > maxSize) {
                ui.warning(`Archivo demasiado grande. Máximo ${maxSize / 1024 / 1024}MB`);
                return;
            }

            const bucket = fileType === 'video' ? 'academy-videos' : 'academy-presentations';
            const fileName = `${blockId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            const fieldName = fileType === 'video' ? 'video_url' : 'ppt_url';
            await blockService.update(blockId, { [fieldName]: urlData.publicUrl });

            onUploadComplete(urlData.publicUrl);
        } catch (error) {
            console.error('Error uploading file:', error);
            ui.error(`Error al subir el archivo: ${(error as Error).message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="group border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 bg-white">
            {existingUrl ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`p-3 rounded-lg ${fileType === 'video' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {fileType === 'video' ? <Video className="h-6 w-6" /> : <Layout className="h-6 w-6" />}
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-xs font-bold uppercase text-gray-600 tracking-wider mb-0.5">Archivo Subido</span>
                            <a href={existingUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-900 hover:text-emerald-700 hover:underline truncate max-w-[200px] transition-colors">
                                {existingUrl.split('/').pop()}
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                        title="Eliminar archivo"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                <>
                    {uploading ? (
                        <div className="space-y-3 py-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="text-sm font-bold text-emerald-900 animate-pulse">Subiendo archivo...</p>
                        </div>
                    ) : (
                        <div className="relative py-4 group-hover:scale-[1.02] transition-transform duration-300">
                            <input
                                type="file"
                                accept={fileType === 'video' ? '.mp4,.mov,.webm' : '.ppt,.pptx,.pdf'}
                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="pointer-events-none">
                                <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                                    <Upload className="h-8 w-8 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                                </div>
                                <p className="text-sm font-bold text-gray-800 mb-1">
                                    Click o arrastra tu {fileType === 'video' ? 'Video' : 'Presentación'}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {fileType === 'video' ? 'MP4, MOV (Máx 500MB)' : 'PDF, PPTX (Máx 50MB)'}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
