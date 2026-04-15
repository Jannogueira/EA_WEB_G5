import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import './Register.css';


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.register(formData);
      console.log("Registro inicial exitoso.");
      navigate('/select-university'); // Redirigir a la selección de universidad
    } catch (error: any) {
      console.error('Error registering user:', error);
      const errorMsg = error.response?.data?.message || "Error al registrar el usuario";
      alert("Fallo el registro: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Únete a Univy</h2>
        <p className="register-subtitle">Crea tu cuenta universitaria hoy mismo</p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Ej. Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Académico</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="ejemplo@universidad.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
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
          <Link to="/login" className="login-link">Acceder al campus</Link>
        </div>
      </div>
    </div>
  );
};


export default Register;