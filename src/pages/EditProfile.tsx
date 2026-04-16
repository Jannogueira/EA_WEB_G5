import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, updateProfile, loading, error } = useUser();

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
      alert("¡Perfil actualizado con éxito!");
      navigate("/profile");
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />

        <div className="content-area">
          <main className="edit-form-container">
            <h1 className="page-title-modern">Editar Perfil</h1>

            <form onSubmit={handleSubmit} className="univy-glass-form">

              {/* Avatar */}
              <div className="avatar-preview-section">
                <div className="avatar-edit-circle">
                  {formData.nombre?.charAt(0).toUpperCase() || "?"}
                </div>
              </div>

              {error && (
                <div className="form-error-banner">{error}</div>
              )}

              {/* Nombre */}
              <div className="form-group-modern">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group-modern">
                <label>Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Avatar URL */}
              <div className="form-group-modern">
                <label>Avatar URL</label>
                <input
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                />
              </div>

              {/* Descripción */}
              <div className="form-group-modern">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Escribe una breve descripción sobre ti..."
                  style={{ resize: "vertical", minHeight: "80px" }}
                />
              </div>

              {/* Buttons */}
              <div className="form-actions-modern">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/profile")}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="save-btn-premium"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>

            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;