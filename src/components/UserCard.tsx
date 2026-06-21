import React from 'react';
import './UserCard.css';
import type { Usuario } from '../models/usuario';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, NotebookPen, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalAlert } from '../context/AlertContext';

const UserCard: React.FC<{ user: Usuario }> = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showAlert } = useGlobalAlert();

  const handleClick = () => {
    try {
      navigate(`/profile/${user._id}`);
    } catch (err: any) {
      showAlert(
        t('user_card.error_title', 'Error'),
        t('user_card.navigation_error', 'No se pudo acceder al perfil del usuario'),
        'error',
      );
    }
  };

  return (
    <div className="user-card" onClick={handleClick}>
      <div className="user-header">
        <img
          src={user.avatarUrl || '/default-avatar.png'}
          alt={t('unimatch_modal.alt_them', { name: user.nombre })}
          className="user-avatar"
        />

        <div className="user-info">
          <h3 className="user-name">{user.nombre}</h3>

          <p className="user-uni">
            <GraduationCap size={18} className="btn-icon" />
            {typeof user.universidad === 'object'
              ? user.universidad?.nombre
              : t('edit_profile.no_university')}
          </p>

          {user.grado && (
            <div className="user-grado-badge">
              <NotebookPen size={18} className="btn-icon" />
              {typeof user.grado === 'object' ? user.grado.nombre : t('edit_profile.label_degree')}
            </div>
          )}
        </div>
        {user.privado && (
          <span title={t('edit_profile.label_privacy')}>
            <Lock size={16} className="private-badge" />
          </span>
        )}
      </div>

      <div className="user-body">
        {user.descripcion && <p className="user-desc">{user.descripcion}</p>}
      </div>
    </div>
  );
};

export default UserCard;
