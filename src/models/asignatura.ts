import type { Usuario } from './usuario';

export interface Asignatura {
  _id: string;
  nombre: string;
  usuarios: Usuario[];
}
