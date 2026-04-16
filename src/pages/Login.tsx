import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Login.css';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate('/home');
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Error al conectar con el servidor";

      alert("Fallo el inicio de sesión: " + errorMsg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleLogin}>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="correo@ejemplo.com"
          />

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          <button disabled={loading}>
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>

        <Link to="/register">Regístrate aquí</Link>
      </div>
    </div>
  );
};

export default Login;