import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import type { Usuario } from "../models/usuario";
import useAuth from "../hooks/useAuth";

interface NavbarProps {
  usuario?: Usuario;
}

const Navbar: React.FC<NavbarProps> = ({ usuario }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que se cierre el menú antes de tiempo
  
  // Esperamos a que la petición de logout termine
  await logout();
  
  // Cerramos el menú y redirigimos
  setMenuOpen(false);
};

  // Obtener la inicial del nombre en mayúscula
  const userInitial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="brand-name" onClick={() => navigate("/home")}>Univy</span>
      </div>

      <div className="navbar-right">
        <div className="profile-container">
          <div className="user-info-brief">
            <span className="user-nav-name">{usuario?.nombre || "Cargando..."}</span>
            <span className="user-nav-email">{usuario?.email}</span>
          </div>
          
          <div 
            className="profile-initial-trigger" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {userInitial}
          </div>

          {menuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <p className="user-name">{usuario?.nombre}</p>
                <p className="user-email">{usuario?.email}</p>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => navigate("/profile")}>
                Perfil
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/*menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />*/}
    </nav>
  );
};

export default Navbar;