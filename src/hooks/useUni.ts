import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import universidadService from '../services/universidad';
import type { Universidad } from '../models/universidad';

export default function useUnis() {
  const { t } = useTranslation();
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversidades = async () => {
      try {
        setLoading(true);
        // getAll ahora devuelve { request, cancel }
        // Para universidades, solemos querer todas, así que pedimos un límite alto (o manejamos páginas)
        const { request } = universidadService.getAll({ limit: 100 });
        const response = await request;

        // Extraemos docs de la respuesta paginada
        setUniversidades(response.data.docs || []);
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          setError(err.message || t('alerts.academic_modal.error_uni'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUniversidades();
  }, []);

  return { universidades, loading, error };
}
