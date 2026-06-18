import apiClient from './api-client';
import type { Message, ChatContact } from '../models/message';

export const getContacts = () =>
  apiClient.get<ChatContact[]>('/chat/contacts');

export const getConversation = (userId: string, page = 1) =>
  apiClient.get<Message[]>(`/chat/conversation/${userId}`, { params: { page } });

export const createGroupChat = (nombre: string, miembros: string[]) =>
  apiClient.post<ChatContact>('/chat/groups', { nombre, miembros });

