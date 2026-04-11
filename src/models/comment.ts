import type { Usuario } from "./usuario";

export interface Comment {
    _id: number;
    usuario: Usuario;
    texto: string;
  };