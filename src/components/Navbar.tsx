import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import type { Usuario } from "../models/usuario";

interface NavbarProps {
  usuario?: Usuario;
}

const Navbar: React.FC<NavbarProps> = ({ usuario }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Esquerra: Nom de l'App ara està aquí */}
      <div className="navbar-left">
        <span className="brand-name" onClick={() => navigate("/home")}>Univy</span>
      </div>

      {/* Dreta: Només el Perfil */}
      <div className="navbar-right">
        <div className="profile-container">
        <span className="user-nav-name">{usuario?.nombre}</span>
          <img 
            src={usuario?.avatarUrl} 
            alt="Profile" 
            className="profile-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
          />

          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <p className="user-name">{usuario?.nombre || "Estudiant"}</p>
                <p className="user-email">{usuario?.email}</p>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => navigate("/home")}>
                Perfil
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
      
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
};

export default Navbar;