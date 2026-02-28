export interface Evento {
    id: number;
    nombre: string;
    fecha_evento: string;
    empresa_colaboradora?: string;
    tipo: string;
    periodicidad: string;
    modelo_economico: string;
    precio?: number;
    asistencia_no_socios: boolean;
    plazas_max?: number;
    plazas_esperadas?: number;
    plazas_reales?: number;
    descripcion?: string;
    localizacion?: string;
    fecha_limite_inscripcion?: string;
    enlace_multimedia?: string;
    observaciones?: string;
    estado: string;
}

export interface Gasto {
    id?: number;
    partida: string;
    fecha?: string;
    coste: number;
    enlace_factura?: string;
}

export interface Informe {
    objetivo_comunidad?: string;
    objetivo_ventas?: string;
    objetivo_organizacion?: string;
    objetivo_participacion?: string;
    conclusiones?: string;
    pros?: string;
    contras?: string;
    aprendizajes?: string;
    valoracion_encargado?: number;
}

export interface EncuestaResumen {
    total: number;
    media_general: number;
    media_organizacion: number;
    media_contenido: number;
    recomendaria_pct: number;
}

export interface Participante {
    id?: number;
    evento_id: number;
    nombre: string;
    email?: string;
    telefono?: string;
    modalidad: 'individual' | 'grupal' | 'equipo';
    nombre_equipo?: string;
    asistio: boolean;
    created_at?: string;
}

export interface Encuesta {
    id?: number;
    evento_id: number;
    participante_id?: number;
    participante_nombre: string;
    origen: string;
    puntuacion_general?: number;
    puntuacion_organizacion?: number;
    puntuacion_contenido?: number;
    recomendaria?: boolean;
    comentarios?: string;
}

export interface ChecklistItem {
    id?: number;
    evento_id: number;
    plantilla_id?: number;
    nombre: string;
    descripcion?: string;
    fecha_limite: string;
    completado: boolean;
    completado_por?: number;
    completado_at?: string;
    notas?: string;
}

export interface EventTemplateProps {
    eventId: number;
    onBack: () => void;
}
