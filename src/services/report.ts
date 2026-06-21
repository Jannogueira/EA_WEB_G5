import apiClient from './api-client';

class ReportService {
  endpoint = '/reports';

  reportContent(tipo: 'post' | 'comment' | 'user' | 'chat', objetivoId: string, descripcion: string) {
    return apiClient.post(this.endpoint, {
      tipo,
      objetivoId,
      descripcion,
    });
  }
}

export default new ReportService();
