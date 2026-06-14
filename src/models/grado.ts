import type { Universidad } from './universidad';

export interface Grado {
  _id: string;
  nombre: string;
  universidad: Universidad;
  asignaturas: string[];
}
