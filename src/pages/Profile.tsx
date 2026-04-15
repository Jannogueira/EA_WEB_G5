import React from "react";
import "./Profile.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import type { Usuario } from "../models/usuario";

const Profile: React.FC = () => {
  return (
    <div className="profile-page-wrapper">
      {/* Navbar fixa a dalt */}
      <Navbar usuario={mockUser} />

      <div className="main-layout">
        {/* Sidebar fixa a l'esquerra */}
        <Sidebar aria-label="Navegació principal" />

        {/* Àrea de contingut */}
        <div className="content-area">
          <main className="profile-container">
            <header className="profile-header">
              <div className="profile-cover"></div>
              <div className="profile-info-overlay">
                <div className="profile-avatar-container">
                  <img src={mockUser.avatarUrl} alt={mockUser.nombre} className="profile-avatar-large" />
                </div>
                <div className="profile-text-details">
                  <h1 className="profile-name">{mockUser.nombre}</h1>
                  <p className="profile-email">{mockUser.email}</p>
                  <span className="profile-badge">{mockUser.rol === 'admin' ? 'Administrador' : 'Estudiant'}</span>
                </div>
                <div className="profile-actions">
                  <button className="edit-profile-btn">Editar Perfil</button>
                </div>
              </div>
            </header>

            <section className="profile-content-grid">
              <div className="profile-stats-card">
                <h3>Estadístiques</h3>
                <div className="stats-row">
                  <div className="stat-item">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Posts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">450</span>
                    <span className="stat-label">Seguidors</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">180</span>
                    <span className="stat-label">Seguint</span>
                  </div>
                </div>
              </div>

              <div className="profile-details-card">
                <h3>Informació Personal</h3>
                <div className="detail-item">
                  <label>Universitat</label>
                  <p>Universidad Politécnica de Cataluña (UPC)</p>
                </div>
                <div className="detail-item">
                  <label>Bio</label>
                  <p>Passionat per la tecnologia i el desenvolupament de programari. Estudiant d'Enginyeria Informàtica.</p>
                </div>
                <div className="detail-item">
                  <label>Membre des de</label>
                  <p>Març 2024</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;

// --- Mock User (Match with Home.tsx for now) ---
const mockUser: Usuario = {
  _id: "u123",
  nombre: "Marc Estudiant",
  email: "marc@universitat.edu",
  password: "",
  rol: "user",
  activo: true,
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc",
};
