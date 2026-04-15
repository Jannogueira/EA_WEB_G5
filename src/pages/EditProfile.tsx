import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { updateSelf } from "../services/usuario.service";
import type { Usuario } from "../models/usuario";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    avatarUrl: ""
  });

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user: Usuario = JSON.parse(userJson);
      setUsuario(user);
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || ""
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await updateSelf(formData);
      // Actualizamos el usuario en localStorage con los nuevos datos
      localStorage.setItem('usuario', JSON.stringify(response.data));
      alert("¡Perfil actualizado con éxito!");
      navigate('/profile');
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Ocurrió un error al actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <Navbar usuario={usuario} />

      <div className="main-layout">
        <Sidebar aria-label="Navegación principal" />

        <div className="content-area">
          <main className="edit-form-container">
            <header className="edit-header">
              <h1 className="page-title-modern">Editar Perfil</h1>
              <p className="page-subtitle-modern">Actualiza tu información personal en Univy</p>
            </header>

            <form className="univy-glass-form" onSubmit={handleSubmit}>
              <div className="avatar-preview-section">
                <div className="avatar-edit-circle">
                   {formData.nombre ? formData.nombre.charAt(0).toUpperCase() : "?"}
                </div>
                <p className="avatar-hint">Tu avatar se verá reflejado en toda la plataforma.</p>
              </div>

              {error && <div className="form-error-banner">{error}</div>}

              <div className="form-group-modern">
                <label htmlFor="nombre">Nombre Completo</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange}
                  placeholder="Tu nombre real"
                  required
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="ejemplo@univy.app"
                  required
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="avatarUrl">URL del Avatar (Opcional)</label>
                <input 
                  type="text" 
                  id="avatarUrl" 
                  name="avatarUrl" 
                  value={formData.avatarUrl} 
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/mi-foto.png"
                />
              </div>

              <div className="form-actions-modern">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate('/profile')}
                  disabled={loading}
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
