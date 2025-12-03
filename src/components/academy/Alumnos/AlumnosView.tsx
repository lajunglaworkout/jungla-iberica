import React from 'react';
import { ArrowLeft, UserCheck, Database } from 'lucide-react';

interface AlumnosViewProps {
    onBack: () => void;
}

export const AlumnosView: React.FC<AlumnosViewProps> = ({ onBack }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section - CRM Style */}
            <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <UserCheck className="h-8 w-8" />
                            <h1 className="text-3xl font-bold">Alumnos</h1>
                        </div>
                    </div>
                    <p className="text-emerald-100 text-lg pl-16">Seguimiento de estudiantes</p>
                </div>
            </div>

            {/* Empty State - Pending Sync */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '80px 40px',
                textAlign: 'center',
                border: '2px dashed #d1d5db'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    opacity: 0.9
                }}>
                    <Database className="h-10 w-10 text-white" />
                </div>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '12px'
                }}>
                    Pendiente de Sincronización
                </h2>

                <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    marginBottom: '32px',
                    maxWidth: '500px',
                    margin: '0 auto 32px'
                }}>
                    Los datos de alumnos se importarán desde el CRM de Academy una vez esté desarrollado.
                    La gestión operativa se realizará en el software principal de Academy.
                </p>

                <button
                    disabled
                    style={{
                        padding: '14px 28px',
                        backgroundColor: '#d1d5db',
                        color: '#9ca3af',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                    Sincronizar con CRM Academy
                </button>

                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0'
                }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#166534',
                        margin: 0,
                        fontWeight: '500'
                    }}>
                        💡 <strong>Próximamente:</strong> Visualiza estudiantes activos, progreso, cohortes, modalidades y satisfacción general.
                    </p>
                </div>
            </div>
        </div>
    );
};
