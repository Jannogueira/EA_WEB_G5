import apiClient from './api-client';
import type { Evento } from '../models/evento';

class EventoService {
  endpoint = '/eventos';

  getAll(params?: { lat?: number; lng?: number; distancia?: number }) {
    const controller = new AbortController();
    const request = apiClient.get<Evento[]>(this.endpoint, {
      params,
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort() };
  }

  createEvento(data: {
    titulo: string;
    descripcion: string;
    fecha: string;
    ubicacionNombre: string;
    lat: number;
    lng: number;
    maxAsistentes?: number | null;
    fechaLimite?: string | null;
  }) {
    return apiClient.post<Evento>(this.endpoint, data);
  }

  getEventoById(eventoId: string) {
    return apiClient.get<Evento>(`${this.endpoint}/${eventoId}`);
  }

  asistirEvento(eventoId: string) {
    return apiClient.post<Evento>(`${this.endpoint}/${eventoId}/asistir`, {});
  }

  deleteEvento(eventoId: string) {
    return apiClient.delete<Evento>(`${this.endpoint}/${eventoId}`);
  }
}

export default new EventoService();
