import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, GraduationCap, BookOpen, MessageSquare } from "lucide-react";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <button 
          className={`sidebar-btn ${isActive("/home") ? "active" : ""}`} 
          onClick={() => navigate("/home")}
        >
          <Home size={20} className="btn-icon" />
          <span className="btn-text">Inicio</span>
        </button>
        <button 
          className={`sidebar-btn ${isActive("/explore") ? "active" : ""}`} 
          onClick={() => navigate("/home")}
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
    </aside>
  );
};

export default Sidebar;