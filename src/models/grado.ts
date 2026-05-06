import type { Universidad } from './universidad';
import type { Asignatura } from './asignatura';

export interface Grado {
    _id: string;
    nombre: string;
    universidad: Universidad;
    asignaturas: Asignatura[];
}
