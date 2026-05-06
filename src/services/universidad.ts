import apiClient from './api-client';
import type { Universidad } from '../models/universidad';
import type { PaginatedResponse } from '../models/pagination';

class UniversidadService {
  endpoint = '/universidades';

  getAll(params?: any) {
    const controller = new AbortController();
    const request = apiClient.get<PaginatedResponse<Universidad>>(this.endpoint, {
      params,
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort() };
  }

  async getById(id: string): Promise<Universidad> {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }
}

export default new UniversidadService();
