import type { Universidad } from './universidad';
import type { Grado } from './grado';

export interface Usuario {
  _id: string;
  nombre: string;
  avatarUrl?: string; // URL de la imagen de avatar del usuario
  descripcion?: string; // Descripción del perfil del usuario
  email: string;
  password: string;
  rol: 'admin' | 'user';
  universidad?: Universidad;
  activo: boolean;
  seguidores?: string[];
  seguidos?: string[];
  grado?: string | Grado;
  asignaturas?: string[];
  privado: boolean;
  hasAcceptedUnimatchTerms?: boolean;
  followStatus?: 'PENDING' | 'ACCEPTED' | null;
}
