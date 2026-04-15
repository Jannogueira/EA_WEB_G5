import apiClient from './api-client';
import type { Universidad } from '../models/universidad';

class UniversidadService {
  async getAll(): Promise<Universidad[]> {
    const response = await apiClient.get('/universidades');
    return response.data;
  }

  async getById(id: string): Promise<Universidad> {
    const response = await apiClient.get(`/universidades/${id}`);
    return response.data;
  }
}

export default new UniversidadService();
