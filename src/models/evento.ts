import type { Usuario } from "./usuario";

export interface Evento {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO string date
  ubicacionNombre: string; // Ej: "Campus Nord UPC"
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitud, latitud]
  };
  creador: Usuario | string;
  asistentes: (Usuario | string)[];
  maxAsistentes?: number | null;
  activo: boolean;
  fechaLimite?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
