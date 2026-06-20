import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Universidad.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import universidadService from "../services/universidad";
import { getContacts } from "../services/chat";
import { GraduationCap, MapPin, Users, Search, MessageSquare, Plus, Check, ChevronDown, LogOut, ArrowRight } from "lucide-react";
import Alert from "../components/Alert";
import type { AlertState } from "../components/Alert";

const Universidad: React.FC = () => {
  const { usuario } = useUser();
  const navigate = useNavigate();
  const [universidades, setUniversidades] = useState<any[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdownUniId, setActiveDropdownUniId] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Fetch universities and user's joined chats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [uniRes, contactsRes] = await Promise.all([
        universidadService.getAll({ limit: 100 }).request,
        getContacts(),
      ]);
      setUniversidades(uniRes.data.docs || []);

      // Extract IDs of all group chats the user is currently in
      const groupIds = (contactsRes.data || [])
        .filter((c: any) => c.isGroup)
        .map((c: any) => c._id);
      setJoinedGroupIds(groupIds);
    } catch (err: any) {
      console.error(err);
      setAlert({
        type: "error",
        title: "Error",
        message: err.message || "Error al cargar los datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter universities based on search term
  const filteredUnis = useMemo(() => {
    return universidades.filter(
      (uni) =>
        uni.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [universidades, searchTerm]);

  // Join University General Chat
  const handleJoinChat = async (uniId: string) => {
    try {
      await universidadService.joinChat(uniId);
      setAlert({
        type: "success",
        title: "¡Te has unido!",
        message: "Te has unido al chat general. Ya puedes encontrarlo en tu sección de Mensajes.",
      });
      setActiveDropdownUniId(null);
      fetchData(); // reload
    } catch (err: any) {
      setAlert({
        type: "error",
        title: "Error",
        message: err.response?.data?.message || err.message || "No se pudo unir al chat.",
      });
    }
  };

  // Leave University General Chat
  const handleLeaveChat = async (uniId: string) => {
    try {
      await universidadService.leaveChat(uniId);
      setAlert({
        type: "success",
        title: "Has abandonado el chat",
        message: "Has salido del chat general de esta universidad.",
      });
      setActiveDropdownUniId(null);
      fetchData();
    } catch (err: any) {
      setAlert({
        type: "error",
        title: "Error",
        message: err.response?.data?.message || err.message || "No se pudo abandonar el chat.",
      });
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownUniId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, uniId: string) => {
    e.stopPropagation();
    setActiveDropdownUniId(activeDropdownUniId === uniId ? null : uniId);
  };

  return (
    <div className="uni-page-wrapper">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Navbar usuario={usuario || undefined} />

      <div className="uni-main-layout">
        <Sidebar />

        <div className="uni-content-area">
          <div className="uni-feed-container">
            <header className="uni-page-header">
              <h1>Universidades</h1>
              <p>Explora el directorio de campus y únete a sus chats generales para conectar con la comunidad.</p>
            </header>

            <div className="uni-search-section">
              <div className="uni-search-box">
                <Search size={20} className="uni-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="uni-loading-state">
                <div className="uni-spinner" />
                <p>Cargando directorio de universidades...</p>
              </div>
            ) : filteredUnis.length === 0 ? (
              <div className="uni-empty-state">
                <GraduationCap size={64} className="uni-empty-icon" />
                <p>No se encontraron universidades registradas.</p>
              </div>
            ) : (
              <div className="uni-grid">
                {filteredUnis.map((uni) => {
                  const isJoined = uni.chatGeneral && joinedGroupIds.includes(uni.chatGeneral);
                  const isDropdownOpen = activeDropdownUniId === uni._id;

                  return (
                    <div key={uni._id} className="uni-card">
                      <div className="uni-card-icon-container">
                        <GraduationCap size={28} />
                      </div>

                      <div className="uni-card-body">
                        <h2>{uni.nombre}</h2>
                        <div className="uni-card-meta">
                          <span className="uni-meta-item">
                            <MapPin size={14} />
                            {uni.ubicacion}
                          </span>
                          <span className="uni-meta-item">
                            <Users size={14} />
                            {uni.numIntegrantes || 0} miembros
                          </span>
                        </div>
                      </div>

                      <div className="uni-card-actions">
                        <button
                          className={`uni-action-trigger-btn ${isJoined ? "joined" : ""}`}
                          onClick={(e) => toggleDropdown(e, uni._id)}
                        >
                          {isJoined ? (
                            <>
                              <Check size={16} />
                              <span>Miembro</span>
                            </>
                          ) : (
                            <>
                              <Plus size={16} />
                              <span>Opciones</span>
                            </>
                          )}
                          <ChevronDown size={14} className={`arrow-icon ${isDropdownOpen ? "open" : ""}`} />
                        </button>

                        {isDropdownOpen && (
                          <div className="uni-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                            {isJoined ? (
                              <>
                                <button
                                  className="uni-dropdown-item primary"
                                  onClick={() => navigate("/messages")}
                                >
                                  <MessageSquare size={15} />
                                  <span>Ir al chat</span>
                                  <ArrowRight size={13} className="arrow-right-icon" />
                                </button>
                                <button
                                  className="uni-dropdown-item danger"
                                  onClick={() => handleLeaveChat(uni._id)}
                                >
                                  <LogOut size={15} />
                                  <span>Abandonar chat</span>
                                </button>
                              </>
                            ) : (
                              <button
                                className="uni-dropdown-item success"
                                onClick={() => handleJoinChat(uni._id)}
                              >
                                <Plus size={15} />
                                <span>Unirse al chat</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Universidad;