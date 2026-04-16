import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Register.css';

const Register = () => {
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await register(formData);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Error al registrar el usuario";

      alert("Fallo el registro: " + msg);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Únete a Univy</h2>
        <p className="register-subtitle">
          Crea tu cuenta universitaria hoy mismo
        </p>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Académico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Siguiente"}
          </button>
        </form>

        <div className="login-link-section">
          <span>¿Ya eres parte de nuestra comunidad?</span>
          <Link to="/login" className="login-link">
            Acceder al campus
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;