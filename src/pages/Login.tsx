import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuth from '../hooks/useAuth';
import Alert from '../components/Alert';
import type { AlertState } from '../components/Alert';
import { useTheme } from '../context/ThemeContext';
import './Login.css';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const { login, loginWithGoogle, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate('/home');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al conectar con el servidor';

      setAlert({
        type: 'error',
        title: 'Fallo de inicio de sesión',
        message: errorMsg,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setAlert({
        type: 'error',
        title: 'Error de Google OAuth',
        message: 'No se recibieron credenciales de Google',
      });
      return;
    }

    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/home');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al iniciar sesión con Google';

      setAlert({
        type: 'error',
        title: 'Fallo de inicio de sesión',
        message: errorMsg,
      });
    }
  };

  return (
    <div className="login-page">
      <ThemeToggle className="theme-toggle-absolute" />
      <div className="login-container">
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>

        <div className="oauth-divider">o también</div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setAlert({
                type: 'error',
                title: 'Fallo de Google OAuth',
                message: 'No se pudo iniciar sesión con Google',
              });
            }}
            theme={theme === 'dark' ? 'filled_black' : 'outline'}
            size="large"
            shape="pill"
            width="350px"
          />
        </div>

        <div className="register-link-section">
          ¿No tienes cuenta?
          <Link to="/register" className="register-link">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
