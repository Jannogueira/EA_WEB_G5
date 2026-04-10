import apiClient from './api-client';

const login = async (email: string, password: string) => {
  // Como el api-client ya tiene el localhost:1337, solo ponemos la ruta final
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });

  // Si va bien, guardamos los datos
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
  }

  return response.data;
};

export default {
  login
};