// Shared types and constants for MarketingPublicationSystem

export interface Publication {
  id?: string;
  titulo: string;
  categoria: 'entrenamiento' | 'cliente_comunidad' | 'cliente_postureo' | 'branding' | 'online' | 'viral' | 'humor' | 'servicios_extra' | 'colaboraciones';
  perfil_ig: 'comun' | 'centro_especifico';
  centro_especifico?: string;
  fecha_limite: string;
  categoria_publicacion: 'feed' | 'historie';
  personas_contacto: string[];
  guion: string;
  enlace_drive: string;
  filmmaker_asignado: string;
  estado: 'pendiente' | 'en_grabacion' | 'grabado' | 'editado' | 'programado' | 'publicado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
  notas_adicionales?: string;
  fecha_publicacion_real?: string;
  metricas_objetivo?: {
    alcance_esperado: number;
    engagement_esperado: number;
  };
}

export interface Filmmaker {
  id: string;
  name: string;
  especialidad: string;
  email: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  centro: string;
  phone: string;
}

export const CATEGORIAS = [
  { value: 'entrenamiento', label: 'Entrenamiento', icon: '💪', color: '#10b981' },
  { value: 'cliente_comunidad', label: 'Cliente Comunidad', icon: '👥', color: '#3b82f6' },
  { value: 'cliente_postureo', label: 'Cliente Postureo', icon: '⭐', color: '#f59e0b' },
  { value: 'branding', label: 'Branding', icon: '🏢', color: '#8b5cf6' },
  { value: 'online', label: 'Online', icon: '🌐', color: '#06b6d4' },
  { value: 'viral', label: 'Viral', icon: '🔥', color: '#ef4444' },
  { value: 'humor', label: 'Humor', icon: '😄', color: '#f97316' },
  { value: 'servicios_extra', label: 'Servicios Extra', icon: '➕', color: '#84cc16' },
  { value: 'colaboraciones', label: 'Colaboraciones', icon: '🤝', color: '#ec4899' }
];

export const CENTROS_DISPONIBLES = ['Sevilla', 'Jerez', 'Puerto'];

export const FILMMAKERS: Filmmaker[] = [
  { id: 'filmmaker1', name: 'María García', especialidad: 'Content Creator', email: 'maria@jungla.com' },
  { id: 'filmmaker2', name: 'Luis Rodríguez', especialidad: 'Video Producer', email: 'luis@jungla.com' },
  { id: 'filmmaker3', name: 'Ana Martín', especialidad: 'Community Manager', email: 'ana@jungla.com' },
  { id: 'diego_montilla', name: 'Diego Montilla', especialidad: 'Marketing Manager', email: 'lajunglaworkoutmk@gmail.com' }
];

export const CONTACT_PERSONS: ContactPerson[] = [
  { id: 'contact1', name: 'Carlos Suárez', role: 'CEO', centro: 'Marca', phone: '+34 600 000 001' },
  { id: 'contact2', name: 'Benito Morales', role: 'Director', centro: 'Marca', phone: '+34 600 000 002' },
  { id: 'contact3', name: 'Vicente Benítez', role: 'Director', centro: 'Marca', phone: '+34 600 000 003' },
  { id: 'contact4', name: 'Manager Sevilla', role: 'Manager', centro: 'Sevilla', phone: '+34 600 000 004' },
  { id: 'contact5', name: 'Manager Jerez', role: 'Manager', centro: 'Jerez', phone: '+34 600 000 005' },
  { id: 'contact6', name: 'Manager Puerto', role: 'Manager', centro: 'Puerto', phone: '+34 600 000 006' }
];

export const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'pendiente': return '#6b7280';
    case 'en_grabacion': return '#f59e0b';
    case 'grabado': return '#3b82f6';
    case 'editado': return '#8b5cf6';
    case 'programado': return '#10b981';
    case 'publicado': return '#059669';
    default: return '#6b7280';
  }
};

export const getDaysUntilDeadline = (fecha: string) => {
  const deadline = new Date(fecha);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
