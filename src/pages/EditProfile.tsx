import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useProfile from "../hooks/useProfile";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, updateProfile, loading, error } = useProfile();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    avatarUrl: ""
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        avatarUrl: usuario.avatarUrl || ""
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
      // error already handled in hook
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />

        <div className="content-area">
          <main className="edit-form-container">
            <h1>Editar Perfil</h1>

            <form onSubmit={handleSubmit}>
              <div className="avatar-preview-section">
                <div className="avatar-edit-circle">
                  {formData.nombre?.charAt(0).toUpperCase() || "?"}
                </div>
              </div>

              {error && <div className="form-error-banner">{error}</div>}

              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
              />

              <button disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;