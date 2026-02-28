import React from 'react';
import { Euro, Plus, Trash2, Upload, ExternalLink } from 'lucide-react';
import { CollapsibleSection, inputStyle } from './SharedComponents';
import { Gasto } from './EventTemplateTypes';

interface ContabilidadSectionProps {
    gastos: Gasto[];
    setGastos: (gastos: Gasto[]) => void;
    totalGastos: number;
    saving: boolean;
    uploadingFactura: number | null;
    fileInputRefs: React.MutableRefObject<{ [key: number]: HTMLInputElement | null }>;
    addGasto: () => void;
    removeGasto: (index: number) => void;
    handleUploadFactura: (index: number, file: File) => void;
    saveGastos: () => void;
}

export const ContabilidadSection: React.FC<ContabilidadSectionProps> = ({
    gastos,
    setGastos,
    totalGastos,
    saving,
    uploadingFactura,
    fileInputRefs,
    addGasto,
    removeGasto,
    handleUploadFactura,
    saveGastos,
}) => {
    return (
        <CollapsibleSection title="CONTABILIDAD EVENTO" icon={Euro} color="#10b981" defaultOpen={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: '#047857', fontWeight: 600, fontSize: '15px' }}>GASTOS</h4>
                <button
                    onClick={addGasto}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: '#d1fae5',
                        color: '#047857',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '13px'
                    }}
                >
                    <Plus size={16} /> Añadir Gasto
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#ecfdf5' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#047857' }}>PARTIDA</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#047857', width: '140px' }}>FECHA</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#047857', width: '120px' }}>COSTE (€)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#047857', width: '160px' }}>FACTURA</th>
                        <th style={{ padding: '12px', width: '50px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {gastos.map((gasto, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '8px' }}>
                                <input
                                    type="text"
                                    value={gasto.partida}
                                    onChange={(e) => {
                                        const newGastos = [...gastos];
                                        newGastos[idx].partida = e.target.value;
                                        setGastos(newGastos);
                                    }}
                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                    placeholder="Descripción del gasto..."
                                />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input
                                    type="date"
                                    value={gasto.fecha || ''}
                                    onChange={(e) => {
                                        const newGastos = [...gastos];
                                        newGastos[idx].fecha = e.target.value;
                                        setGastos(newGastos);
                                    }}
                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input
                                    type="number"
                                    value={gasto.coste}
                                    onChange={(e) => {
                                        const newGastos = [...gastos];
                                        newGastos[idx].coste = Number(e.target.value);
                                        setGastos(newGastos);
                                    }}
                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                />
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                <input
                                    type="file"
                                    ref={el => fileInputRefs.current[idx] = el}
                                    style={{ display: 'none' }}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadFactura(idx, file);
                                    }}
                                />
                                {gasto.enlace_factura ? (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <a
                                            href={gasto.enlace_factura}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#dbeafe',
                                                color: '#2563eb',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <ExternalLink size={14} /> Ver
                                        </a>
                                        <button
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                            style={{
                                                padding: '8px',
                                                backgroundColor: '#f3f4f6',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Upload size={14} color="#6b7280" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRefs.current[idx]?.click()}
                                        disabled={uploadingFactura === idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151',
                                            border: '1px dashed #d1d5db',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <Upload size={14} />
                                        {uploadingFactura === idx ? 'Subiendo...' : 'Subir'}
                                    </button>
                                )}
                            </td>
                            <td style={{ padding: '8px' }}>
                                <button
                                    onClick={() => removeGasto(idx)}
                                    style={{ padding: '8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} color="#dc2626" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {gastos.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                                No hay gastos registrados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>TOTAL GASTOS:</span>
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>{totalGastos.toFixed(2)} €</span>
            </div>

            <button
                onClick={saveGastos}
                style={{
                    marginTop: '16px',
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                }}
            >
                Guardar Gastos
            </button>
        </CollapsibleSection>
    );
};
