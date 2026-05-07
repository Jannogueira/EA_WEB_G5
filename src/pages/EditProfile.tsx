import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./EditProfile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import useUser from "../hooks/useUser";
import { useTranslation } from "react-i18next";
import AsignaturasModal from "../components/AsignaturasModal";

const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario, updateProfile, loading, error } = useUser();

  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    avatarUrl: "",
    descripcion: ""
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        avatarUrl: usuario.avatarUrl || "",
        descripcion: usuario.descripcion || ""
      });
    }
  }, [usuario]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile(formData);
      navigate("/profile");
    } catch {
      // error manejado en hook
    }
  };

  const handleUserUpdated = (updatedUser: any) => {
    // sincroniza UI tras editar asignaturas
    localStorage.setItem("usuario", JSON.stringify(updatedUser));
  };

  return (
    <div className="edit-profile-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />

        <div className="content-area">
          <main className="edit-form-container">
            <h1 className="page-title-modern">{t('edit_profile.title')}</h1>

            <form onSubmit={handleSubmit} className="univy-glass-form">

              {/* AVATAR */}
              <div className="avatar-preview-section">
                <div className="avatar-edit-circle">
                  {formData.nombre?.charAt(0).toUpperCase() || "?"}
                </div>
              </div>

              {error && (
                <div className="form-error-banner">{error}</div>
              )}

              {/* NOMBRE */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_name')}</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_email')}</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* AVATAR */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_avatar')}</label>
                <input
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_bio')}</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder={t('edit_profile.placeholder_bio')}
                  style={{ resize: "vertical", minHeight: "80px" }}
                />
              </div>

              {/* 🔥 BOTÓN ASIGNATURAS */}
              <div className="form-group-modern">
                <label>Asignaturas</label>

                <button
                  type="button"
                  className="edit-profile-btn-premium"
                  onClick={() => setModalOpen(true)}
                >
                  Editar
                </button>
              </div>

              {/* BOTONES */}
              <div className="form-actions-modern">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/profile")}
                >
                  {t('edit_profile.cancel')}
                </button>

                <button
                  type="submit"
                  className="save-btn-premium"
                  disabled={loading}
                >
                  {loading ? t('edit_profile.saving') : t('edit_profile.save')}
                </button>
              </div>

            </form>

          </main>
        </div>
      </div>

      {/* 🔥 MODAL ASIGNATURAS */}
      {usuario && (
        <AsignaturasModal
          gradoId={usuario.grado || ""}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default EditProfile;