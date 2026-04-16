import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password);
      return data;
    } catch (err) {
      setError("Error en login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    nombre: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      await authService.register(data);
      navigate("/select-university");
    } catch (err) {
      setError("Error en registro");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (err) {
      setError("Error al cerrar sesión");
    }
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
  };
}