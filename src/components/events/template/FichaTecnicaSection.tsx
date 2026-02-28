import React from 'react';
import { ClipboardList } from 'lucide-react';
import { CollapsibleSection, FormField, inputStyle, selectStyle } from './SharedComponents';
import { Evento } from './EventTemplateTypes';

interface FichaTecnicaSectionProps {
    evento: Evento;
    setEvento: (e: Evento) => void;
}

export const FichaTecnicaSection: React.FC<FichaTecnicaSectionProps> = ({ evento, setEvento }) => {
    return (
        <CollapsibleSection title="FICHA TÉCNICA EVENTO" icon={ClipboardList} color="#047857" defaultOpen={true}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <FormField label="Nombre" required>
                    <input
                        type="text"
                        value={evento.nombre}
                        onChange={(e) => setEvento({ ...evento, nombre: e.target.value })}
                        style={inputStyle}
                    />
                </FormField>
                <FormField label="Fecha">
                    <input
                        type="date"
                        value={evento.fecha_evento}
                        onChange={(e) => setEvento({ ...evento, fecha_evento: e.target.value })}
                        style={inputStyle}
                    />
                </FormField>
                <FormField label="Empresa Colaboradora">
                    <input
                        type="text"
                        value={evento.empresa_colaboradora || ''}
                        onChange={(e) => setEvento({ ...evento, empresa_colaboradora: e.target.value })}
                        style={inputStyle}
                        placeholder="Empresa..."
                    />
                </FormField>
                <FormField label="Tipo">
                    <select
                        value={evento.tipo}
                        onChange={(e) => setEvento({ ...evento, tipo: e.target.value })}
                        style={selectStyle}
                    >
                        <option value="individual">Individual</option>
                        <option value="colectivo_centros">Todos los Centros</option>
                        <option value="colectivo">Colectivo</option>
                    </select>
                </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
                <FormField label="Modelo Económico">
                    <select
                        value={evento.modelo_economico}
                        onChange={(e) => setEvento({ ...evento, modelo_economico: e.target.value })}
                        style={selectStyle}
                    >
                        <option value="gratuito">Gratuito</option>
                        <option value="pago">De Pago</option>
                    </select>
                </FormField>
                {evento.modelo_economico === 'pago' && (
                    <FormField label="Precio (€)">
                        <input
                            type="number"
                            value={evento.precio || 0}
                            onChange={(e) => setEvento({ ...evento, precio: Number(e.target.value) })}
                            style={inputStyle}
                        />
                    </FormField>
                )}
                <FormField label="Periodicidad">
                    <select
                        value={evento.periodicidad}
                        onChange={(e) => setEvento({ ...evento, periodicidad: e.target.value })}
                        style={selectStyle}
                    >
                        <option value="unico">Único</option>
                        <option value="anual">Anual</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="mensual">Mensual</option>
                    </select>
                </FormField>
                <FormField label="Asistencia No Socios">
                    <select
                        value={evento.asistencia_no_socios ? 'si' : 'no'}
                        onChange={(e) => setEvento({ ...evento, asistencia_no_socios: e.target.value === 'si' })}
                        style={selectStyle}
                    >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                    </select>
                </FormField>
            </div>

            {/* Plazas Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginTop: '24px',
                padding: '20px',
                backgroundColor: '#ecfdf5',
                borderRadius: '10px',
                border: '1px solid #a7f3d0'
            }}>
                <FormField label="Nº Plazas Máximas">
                    <input
                        type="number"
                        value={evento.plazas_max || ''}
                        onChange={(e) => setEvento({ ...evento, plazas_max: Number(e.target.value) })}
                        style={{ ...inputStyle, backgroundColor: 'white' }}
                    />
                </FormField>
                <FormField label="Nº Plazas Esperadas">
                    <input
                        type="number"
                        value={evento.plazas_esperadas || ''}
                        onChange={(e) => setEvento({ ...evento, plazas_esperadas: Number(e.target.value) })}
                        style={{ ...inputStyle, backgroundColor: 'white' }}
                    />
                </FormField>
                <FormField label="Nº Plazas Reales">
                    <input
                        type="number"
                        value={evento.plazas_reales || ''}
                        onChange={(e) => setEvento({ ...evento, plazas_reales: Number(e.target.value) })}
                        style={{ ...inputStyle, backgroundColor: 'white' }}
                    />
                </FormField>
            </div>

            {/* Descripción y Localización */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
                <FormField label="Descripción del Evento" span={1}>
                    <textarea
                        value={evento.descripcion || ''}
                        onChange={(e) => setEvento({ ...evento, descripcion: e.target.value })}
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                        placeholder="Descripción detallada del evento..."
                    />
                </FormField>
                <div>
                    <FormField label="Localización">
                        <input
                            type="text"
                            value={evento.localizacion || ''}
                            onChange={(e) => setEvento({ ...evento, localizacion: e.target.value })}
                            style={inputStyle}
                            placeholder="Centro, ciudad..."
                        />
                    </FormField>
                    <div style={{ marginTop: '20px' }}>
                        <FormField label="Fecha Límite Inscripción">
                            <input
                                type="date"
                                value={evento.fecha_limite_inscripcion || ''}
                                onChange={(e) => setEvento({ ...evento, fecha_limite_inscripcion: e.target.value })}
                                style={inputStyle}
                            />
                        </FormField>
                    </div>
                </div>
            </div>

            {/* Enlaces y Observaciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                <FormField label="Enlace a Contenido Multimedia">
                    <input
                        type="url"
                        value={evento.enlace_multimedia || ''}
                        onChange={(e) => setEvento({ ...evento, enlace_multimedia: e.target.value })}
                        style={inputStyle}
                        placeholder="https://..."
                    />
                </FormField>
                <FormField label="Observaciones">
                    <input
                        type="text"
                        value={evento.observaciones || ''}
                        onChange={(e) => setEvento({ ...evento, observaciones: e.target.value })}
                        style={inputStyle}
                        placeholder="Notas adicionales..."
                    />
                </FormField>
            </div>
        </CollapsibleSection>
    );
};
