import { useEffect, useState } from "react";
import gradoService from "../services/grado";
import type { Asignatura } from "../models/asignatura";
import type { Usuario } from "../models/usuario";

export default function useAsignatura(gradoId: string, usuario: Usuario | null) {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // cargar asignaturas
  useEffect(() => {
    if (!gradoId) return;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await gradoService.getAsignaturas(gradoId);
        setAsignaturas(res.data);
      } catch (err: any) {
        setError(err.message || "Error cargando asignaturas");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [gradoId]);

  // inicializar selección
  useEffect(() => {
    if (!usuario) return;
    setSelected(usuario.asignaturas?.map(String) || []);
  }, [usuario, gradoId]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  return {
    asignaturas,
    selected,
    toggle,
    loading,
    error
  };
}