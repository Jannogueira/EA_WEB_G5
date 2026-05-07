import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import { useTranslation } from "react-i18next";
import AsignaturasModal from "../components/AsignaturasModal";
import { uploadImage } from "../services/upload";
import { Loader2, Camera } from "lucide-react";
const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { usuario, updateProfile, loading, error } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    avatarUrl: "",
    descripcion: "",
    privado: false
  });
  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        avatarUrl: usuario.avatarUrl || "",
        descripcion: usuario.descripcion || "",
        privado: usuario.privado || false
      });
    }
  }, [usuario]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setUploadError(null);
      const res = await uploadImage(file);
      setFormData(prev => ({ ...prev, avatarUrl: res.url }));
    } catch (err) {
      console.error("Error al subir avatar:", err);
      setUploadError("Error al subir el avatar. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  };
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
                <div 
                  className="avatar-edit-circle clickable"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="avatar-img-full" />
                  ) : (
                    formData.nombre?.charAt(0).toUpperCase() || "?"
                  )}
                  <div className="avatar-overlay-icon">
                    <Camera size={20} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                />
              </div>
              {error && (
                <div className="form-error-banner">{error}</div>
              )}
              {uploadError && (
                <div className="form-error-banner">{uploadError}</div>
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
              {/* AVATAR URL */}
              <div className="form-group-modern">
                <label>{t('edit_profile.label_avatar')}</label>
                <input
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="O sube una imagen haciendo clic en el círculo"
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
              {/* BOTÓN ASIGNATURAS */}
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
              {/* Privacidad */}
              <div className="form-group-modern checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="privado"
                    checked={formData.privado}
                    onChange={(e) => setFormData(prev => ({ ...prev, privado: e.target.checked }))}
                  />
                  <span>Cuenta Privada</span>
                </label>
                <p className="field-help">Si tu cuenta es privada, solo tus seguidores podrán ver tus publicaciones.</p>
              </div>
              {/* Buttons */}
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
                  disabled={loading || uploading}
                >
                  {loading || uploading ? t('edit_profile.saving') : t('edit_profile.save')}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
      {/* MODAL ASIGNATURAS */}
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
