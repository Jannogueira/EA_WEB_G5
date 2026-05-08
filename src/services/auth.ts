import apiClient from './api-client';

const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });

  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
  }

  return response.data;
};

const register = async (userData: any) => {
  const response = await apiClient.post('/auth/register', userData);

  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
  }

  return response.data;
};

const logout = async () => {
  try {
    // 1. Avisamos al backend para que destruya la cookie del refresh token
    await apiClient.post('/auth/logout');
  } catch (error) {
    //Error manejado en la página
  } finally {
    // 2. Pase lo que pase, limpiamos el Access Token, Refresh Token y el Usuario del frontend
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
  }
};

export default {
  login,
  register,
  logout
};