import apiClient from './api-client';

const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });

  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
  }

  return response.data;
};

const register = async (userData: any) => {
  const response = await apiClient.post('/auth/register', userData);

  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
  }

  return response.data;
};

const logout = async () => {
  try {
    // 1. Avisamos al backend para que destruya la cookie del refresh token
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Error al cerrar sesión en el servidor:', error);
  } finally {
    // 2. Pase lo que pase, limpiamos el Access Token y el Usuario del frontend
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
};

export default {
  login,
  register,
  logout
};