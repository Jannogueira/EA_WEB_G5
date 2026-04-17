import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, GraduationCap, BookOpen, MessageSquare, PlusSquare } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import "./Sidebar.css";
import type { Usuario } from "../models/usuario";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      setUsuario(JSON.parse(userJson));
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handlePostCreated = () => {
    // Si estamos en home o perfil, refrescamos la página para ver el nuevo post
    if (location.pathname === "/home" || location.pathname === "/profile") {
      window.location.reload();
    } else {
      navigate("/home");
    }
  };

  return (
    <>
      <div className="sidebar">
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-btn ${isActive("/home") ? "active" : ""}`} 
            onClick={() => navigate("/home")}
          >
            <Home size={20} className="btn-icon" />
            <span className="btn-text">Inicio</span>
          </button>
          
          <button 
            className="sidebar-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            <PlusSquare size={20} className="btn-icon" />
            <span className="btn-text">Crear</span>
          </button>

          <button 
            className={`sidebar-btn ${isActive("/explore") ? "active" : ""}`} 
            onClick={() => navigate("/explore")}
          >
            <Compass size={20} className="btn-icon" />
            <span className="btn-text">Explorar</span>
          </button>
          <button 
            className={`sidebar-btn ${isActive("/university") ? "active" : ""}`} 
            onClick={() => navigate("/home")}
          >
            <GraduationCap size={20} className="btn-icon" />
            <span className="btn-text">Universidad</span>
          </button>
          <button 
            className={`sidebar-btn ${isActive("/classes") ? "active" : ""}`} 
            onClick={() => navigate("/home")}
          >
            <BookOpen size={20} className="btn-icon" />
            <span className="btn-text">Clases</span>
          </button>
          <button 
            className={`sidebar-btn ${isActive("/chat") ? "active" : ""}`} 
            onClick={() => navigate("/home")}
          >
            <MessageSquare size={20} className="btn-icon" />
            <span className="btn-text">Mensajes</span>
          </button>
        </nav>
      </div>

      {isModalOpen && usuario && (
        <CreatePostModal 
          onClose={() => setIsModalOpen(false)} 
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default Sidebar;