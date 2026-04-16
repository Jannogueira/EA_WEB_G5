import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateSelf } from "../services/usuario.service";
import type { Usuario } from "../models/usuario";

export default function useUser() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("usuario");

    if (!userJson) {
      navigate("/login");
      return;
    }

    setUsuario(JSON.parse(userJson));
  }, [navigate]);

  const updateProfile = async (data: Partial<Usuario>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateSelf(data);

      localStorage.setItem("usuario", JSON.stringify(response.data));
      setUsuario(response.data);

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar el perfil");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    usuario,
    updateProfile,
    loading,
    error
  };
}