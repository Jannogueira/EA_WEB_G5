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

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export default {
  login,
  register,
  logout
};