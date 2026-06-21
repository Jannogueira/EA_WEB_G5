import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Alert from '../components/Alert';
import type { AlertState } from '../components/Alert';
import { useTranslation } from 'react-i18next';
import './Register.css';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const { register, loading } = useAuth();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setAlert({
        type: 'error',
        title: t('register.validation_error'),
        message: t('register.password_mismatch'),
      });
      return;
    }

    try {
      const { confirmPassword, ...dataToSubmit } = formData;
      await register(dataToSubmit);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Error al contactar con el servidor';

      setAlert({
        type: 'error',
        title: t('register.failed_title'),
        message: msg,
      });
    }
  };

  return (
    <div className="register-page">
      {/* Controles de accesibilidad actualizados con soporte para 3 idiomas */}
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

      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="register-container">
        <h2 className="register-title">{t('register.title')}</h2>
        <p className="register-subtitle">{t('register.subtitle')}</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>{t('register.full_name')}</label>
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
            <label>{t('register.academic_email')}</label>
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
            <label>{t('login.password')}</label>
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

          <div className="form-group">
            <label>{t('register.repeat_password')}</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? t('register.processing') : t('register.next')}
          </button>
        </form>

        <div className="login-link-section">
          <span>{t('register.has_account')}</span>
          <Link to="/login" className="login-link">
            {t('register.access_campus')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
