import apiClient from './api-client';

export const askAssistant = async (pregunta: string): Promise<string> => {
    const response = await apiClient.post<{ respuesta: string }>('/assistant/chat', { pregunta });
    return response.data.respuesta;
};
