import { useEffect, useState } from "react";
import universidadService from "../services/universidad.service";
import type { Universidad } from "../models/universidad";

export default function useUnis() {
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversidades = async () => {
      try {
        setLoading(true);
        const data = await universidadService.getAll();
        setUniversidades(data);
      } catch (err: any) {
        setError(err.message || "Error cargando universidades");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversidades();
  }, []);

  return { universidades, loading, error };
}