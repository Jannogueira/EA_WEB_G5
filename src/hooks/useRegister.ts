import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";

export default function useRegister() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (data: {
    nombre: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      await authService.register(data);
      navigate("/select-university");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Error al registrar el usuario";
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}