export interface Message {
  _id: string;
  remitente: {
    _id: string;
    nombre: string;
    avatarUrl?: string;
  };
  destinatario: {
    _id: string;
    nombre: string;
    avatarUrl?: string;
  };
  contenido: string;
  leido: boolean;
  createdAt: string;
}

export interface ChatContact {
  _id: string;
  nombre: string;
  avatarUrl?: string;
}
