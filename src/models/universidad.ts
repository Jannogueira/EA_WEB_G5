import type { Usuario } from './usuario';

export interface Universidad {
    _id: string;
    nombre: string;
    ubicacion: string;
    usuarios: Usuario[];
}
