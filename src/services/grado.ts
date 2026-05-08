import apiClient from './api-client';

class GradoService {
  endpoint = '/grados';

  getByUniversidad(universidadId: string) {
    return apiClient.get(`${this.endpoint}/universidad/${universidadId}`);
  }

  getAsignaturas(gradoId: string) {
    return apiClient.get(`${this.endpoint}/${gradoId}/asignaturas`);
  }

  getById(gradoId: string) {
    return apiClient.get(`${this.endpoint}/${gradoId}`);
  }

  getAll() {
    return apiClient.get(this.endpoint);
  }

  getAllAsignaturas() {
    return apiClient.get('/asignaturas');
  }
}

export default new GradoService();