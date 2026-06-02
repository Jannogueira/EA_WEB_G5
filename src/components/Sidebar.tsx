import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, GraduationCap, BookOpen, MessageSquare, PlusSquare, Bell, Heart, Search, Map } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import { useSocket } from "../context/SocketContext";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";
import type { Usuario } from "../models/usuario";

const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCounts, notificationCount } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      setUsuario(JSON.parse(userJson));
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handlePostCreated = () => {
    if (location.pathname === "/home" || location.pathname === "/profile") {
      window.location.reload();
    } else {
      navigate("/home");
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'ca' : 'es';
    i18n.changeLanguage(nextLang);
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
            <span className="btn-text">{t('sidebar.home')}</span>
          </button>
          
          <button 
            className="sidebar-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            <PlusSquare size={20} className="btn-icon" />
            <span className="btn-text">{t('sidebar.create')}</span>
          </button>

          <button 
            className={`sidebar-btn ${isActive("/explore") ? "active" : ""}`} 
            onClick={() => navigate("/explore")}
          >
            <Search size={20} className="btn-icon" />
            <span className="btn-text">{t('sidebar.explore')}</span>
          </button>

          <button 
            className={`sidebar-btn ${isActive("/map") ? "active" : ""}`} 
            onClick={() => navigate("/map")}
          >
            <Map size={20} className="btn-icon" />
            <span className="btn-text">{t('sidebar.map')}</span>
          </button>

          <button 
            className={`sidebar-btn ${isActive("/unimatch") ? "active" : ""}`} 
            onClick={() => navigate("/unimatch")}
          >
            <Heart size={20} className="btn-icon" />
            <span className="btn-text">UniMatch</span>
          </button>
          <button 
            className={`sidebar-btn ${isActive("/university") ? "active" : ""}`} 
            onClick={() => navigate("/university")}
          >
            <GraduationCap size={20} className="btn-icon" />
            <span className="btn-text">{t('sidebar.university')}</span>
          </button>
          <button 
            className={`sidebar-btn ${isActive("/messages") ? "active" : ""}`} 
            onClick={() => navigate("/messages")}
            style={{ position: 'relative' }}
          >
            <MessageSquare size={20} className="btn-icon" />
            <span className="btn-text">{t('sidebar.messages')}</span>
            {totalUnread > 0 && <div className="sidebar-notification-badge">{totalUnread > 99 ? '99+' : totalUnread}</div>}
          </button>

          <button 
            className={`sidebar-btn ${isActive("/notifications") ? "active" : ""}`} 
            onClick={() => navigate("/notifications")}
            style={{ position: 'relative' }}
          >
            <Bell size={20} className="btn-icon" />
            <span className="btn-text">{t('sidebar.notifications')}</span>
            {notificationCount > 0 && (
              <div className="sidebar-notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</div>
            )}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="lang-segmented-control">
            <button 
              className={`lang-option ${i18n.language.startsWith('es') ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('es')}
            >
              ES
            </button>
            <button 
              className={`lang-option ${i18n.language.startsWith('ca') ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('ca')}
            >
              CA
            </button>
          </div>
        </div>
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