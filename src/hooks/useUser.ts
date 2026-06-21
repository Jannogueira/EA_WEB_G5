import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usuarioService from '../services/usuario';
import type { Usuario } from '../models/usuario';
import apiClient from '../services/api-client';

export default function useUser() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = async () => {
    try {
      const res = await apiClient.get<Usuario>('/auth/me');
      localStorage.setItem('usuario', JSON.stringify(res.data));
      setUsuario(res.data);
      return res.data;
    } catch (err) {
      setError(t('alerts.profile.server_error'));
      return null;
    }
  };

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');

    if (!userJson && location.pathname !== '/register' && location.pathname !== '/login') {
      navigate('/login');
      return;
    }

    if (userJson) {
      setUsuario(JSON.parse(userJson));
    }

    // Opcionalmente refrescar al cargar si estamos autenticados
    if (userJson) {
      fetchMe();
    }
  }, [navigate]);

  const updateProfile = async (data: Partial<Usuario>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await usuarioService.updateSelf(data);

      localStorage.setItem('usuario', JSON.stringify(response.data));
      setUsuario(response.data);

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || t('alerts.edit_profile.update_error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    usuario,
    updateProfile,
    refreshUser: fetchMe,
    loading,
    error,
  };
}
