import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import type { Usuario } from '../models/usuario';
import useAuth from '../hooks/useAuth';
import useUser from '../hooks/useUser';
import { useTranslation } from 'react-i18next';
import { useGlobalAlert } from '../context/AlertContext';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  usuario?: Usuario;
}

const Navbar: React.FC<NavbarProps> = ({ usuario: propUsuario }) => {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { logout } = useAuth();
  const { usuario: hookUsuario } = useUser();
  const { showAlert } = useGlobalAlert();

  const usuario = propUsuario || hookUsuario;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await logout();
      setMenuOpen(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || t('navbar.logout_error');
      showAlert(t('navbar.error_title'), errorMsg, 'error');
    }
  };

  const userInitial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : '?';

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/home')}>
        <span className="brand-name">Univy</span>
      </div>

      <div className="navbar-right">
        <div className="lang-segmented-control">
          <div
            className={`lang-indicator ${
              i18n.language.startsWith('es') ? 'es' : i18n.language.startsWith('ca') ? 'ca' : 'en'
            }`}
          />
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

        <ThemeToggle />

        <div className="profile-container">
          <div className="user-info-brief">
            {usuario ? (
              <>
                <span className="user-nav-name">{usuario.nombre}</span>
                <span className="user-nav-email">{usuario.email}</span>
              </>
            ) : (
              <>
                <div className="nav-skeleton nav-skeleton-name"></div>
                <div className="nav-skeleton nav-skeleton-email"></div>
              </>
            )}
          </div>

          <div className="profile-initial-trigger" onClick={() => setMenuOpen(!menuOpen)}>
            {usuario?.avatarUrl ? (
              <img src={usuario.avatarUrl} alt={usuario.nombre} className="nav-avatar-img" />
            ) : usuario ? (
              userInitial
            ) : (
              <div className="nav-skeleton-avatar"></div>
            )}
          </div>

          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <p className="user-name">{usuario?.nombre}</p>
                <p className="user-email">{usuario?.email}</p>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                {t('navbar.profile')}
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                {t('navbar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
