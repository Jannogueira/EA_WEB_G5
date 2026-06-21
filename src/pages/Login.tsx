import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuth from '../hooks/useAuth';
import Alert from '../components/Alert';
import type { AlertState } from '../components/Alert';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import './Login.css';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const { login, loginWithGoogle, loading } = useAuth();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
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
        title: t('login.error_title'),
        message: errorMsg,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setAlert({
        type: 'error',
        title: t('login.google_error_title'),
        message: t('login.google_error_msg'),
      });
      return;
    }

    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/home');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error';
      setAlert({
        type: 'error',
        title: t('login.error_title'),
        message: errorMsg,
      });
    }
  };

  return (
    <div className="login-page">
      {/* Controles superiores con soporte para 3 idiomas */}
      <div className="login-controls-absolute">
        <div className="lang-segmented-control mini">
          <button
            className={`lang-option ${i18n.language.startsWith('es') ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('es')}
          >
            ES
          </button>
          <button
            className={`lang-option ${i18n.language.startsWith('ca') ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('ca')}
          >
            CA
          </button>
          <button
            className={`lang-option ${i18n.language.startsWith('en') ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('en')}
          >
            EN
          </button>
        </div>
        <ThemeToggle className="theme-toggle-inline" />
      </div>

      <div className="login-container">
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <h2>{t('login.title')}</h2>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>{t('edit_profile.label_email')}</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder={t('login.email_placeholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('login.password')}</label>
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
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        <div className="oauth-divider">{t('login.divider')}</div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setAlert({
                type: 'error',
                title: t('login.google_error_title'),
                message: t('login.error_title'),
              });
            }}
            theme={theme === 'dark' ? 'filled_black' : 'outline'}
            size="large"
            shape="pill"
            width="350px"
          />
        </div>

        <div className="register-link-section">
          {t('login.no_account')}
          <Link to="/register" className="register-link">
            {t('login.register_here')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
