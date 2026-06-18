import type { Post } from './post';

export interface Message {
  _id: string;
  remitente: {
    _id: string;
    nombre: string;
    avatarUrl?: string;
  };
  destinatario?: {
    _id: string;
    nombre: string;
    avatarUrl?: string;
  };
  grupo?: string | {
    _id: string;
    nombre: string;
  };
  contenido: string;
  post?: Post;
  leido: boolean;
  eliminadoParaTodos?: boolean;
  createdAt: string;
  reactions?: Array<{
    usuario: string;
    emoji: string;
  }>;
  parentMessage?: {
    _id: string;
    contenido: string;
    remitente: {
      _id: string;
      nombre: string;
    };
  };
}

export interface ChatContact {
  _id: string;
  nombre: string;
  avatarUrl?: string;
  isGroup?: boolean;
  miembros?: any[];
  creador?: string;
  unreadCount?: number;
  lastMessage?: string | null;
}

