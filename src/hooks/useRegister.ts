import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/auth';

export default function useRegister() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const register = async (data: { nombre: string; email: string; password: string }) => {
    setLoading(true);

    try {
      await authService.register(data);
      navigate('/select-university');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('alerts.register.general_error');
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
