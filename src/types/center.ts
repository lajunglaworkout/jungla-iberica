// En: src/types/center.ts

export type CenterType = 'Propio' | 'Franquicia';
export type CenterStatus = 'Activo' | 'En Construcción' | 'Suspendido' | 'Cerrado';

export interface Center {
  id: number;
  created_at: string;
  name: string;
  address: string | null;
  city: string | null;
  type: CenterType;
  status: CenterStatus;
  // ... puedes añadir cualquier otra columna de la tabla 'centers' que quieras usar
}