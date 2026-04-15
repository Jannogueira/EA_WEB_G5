import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import "./Navbar.css";
import type { Usuario } from "../models/usuario";

interface NavbarProps {
  usuario?: Usuario;
}

const Navbar: React.FC<NavbarProps> = ({ usuario }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

const handleLogout = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation(); // Evita que se cierre el menú antes de tiempo

  console.log("Cerrando sesión en el servidor...");
  
  // Esperamos a que la petición de logout termine
  await authService.logout();
  
  // Cerramos el menú y redirigimos
  setMenuOpen(false);
  navigate("/login");
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
<<<<<<< HEAD
              <button className="dropdown-item" onClick={() => navigate("/profile")}>
                Perfil
=======
              <button className="dropdown-item" onClick={() => navigate("/home")}>
                Mi Perfil
>>>>>>> d30391c5a8c7bff1ff53149259ae91274d482f4f
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