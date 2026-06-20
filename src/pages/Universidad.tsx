import React, { useEffect, useState, useRef, useMemo } from "react";
import "./Universidad.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import useChat from "../hooks/useChat";
import universidadService from "../services/universidad";
import { GraduationCap, MapPin, Users, Send, MessageSquare, Search, X } from "lucide-react";
import Alert from "../components/Alert";
import type { AlertState } from "../components/Alert";

const Universidad: React.FC = () => {
  const { usuario } = useUser();
  const [universidades, setUniversidades] = useState<any[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniId, setSelectedUniId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    activeContact,
    messages,
    loadingHistory,
    typingUserId,
    typingUserName,
    openConversation,
    sendMessage,
    emitTyping,
  } = useChat(usuario?._id || "");

  const [inputMessage, setInputMessage] = useState("");

  // Helpers safe for remitente checks
  const getSenderId = (msg: any) => {
    if (!msg || !msg.remitente) return "";
    return typeof msg.remitente === "string" ? msg.remitente : msg.remitente._id || "";
  };

  const getSenderName = (msg: any) => {
    if (!msg || !msg.remitente) return "";
    return typeof msg.remitente === "string" ? "" : msg.remitente.nombre || "";
  };

  const getSenderAvatar = (msg: any) => {
    if (!msg || !msg.remitente) return "";
    return typeof msg.remitente === "string" ? "" : msg.remitente.avatarUrl || "";
  };

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all universities on mount
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        setLoadingUnis(true);
        const res = await universidadService.getAll({ limit: 100 }).request;
        setUniversidades(res.data.docs || []);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Error al cargar las universidades";
        setAlert({
          type: "error",
          title: "Error",
          message: msg,
        });
      } finally {
        setLoadingUnis(false);
      }
    };
    fetchUnis();
  }, []);

  // Filter universities based on search term
  const filteredUniversidades = useMemo(() => {
    return universidades.filter((uni) =>
      uni.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [universidades, searchTerm]);

  // Handle selecting a university and loading its general chat
  const handleSelectUniversity = async (uniId: string) => {
    if (selectedUniId === uniId) return;
    setSelectedUniId(uniId);
    setLoadingChat(true);
    try {
      const chatContact = await universidadService.getOrCreateChat(uniId);
      openConversation(chatContact);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al abrir el chat de la universidad";
      setAlert({
        type: "error",
        title: "Error",
        message: msg,
      });
      setSelectedUniId(null);
      openConversation(null);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="universidad-page-wrapper">
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
          <div className="uni-workspace">
            {/* LEFT PANEL: Directory of Universities */}
            <aside className="uni-directory-panel">
              <header className="uni-directory-header">
                <h2>Universidades</h2>
                <div className="uni-search-container">
                  <Search size={16} className="uni-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar universidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </header>

              <div className="uni-list">
                {loadingUnis ? (
                  <div className="uni-loading">Cargando universidades...</div>
                ) : filteredUniversidades.length === 0 ? (
                  <div className="uni-empty">No se encontraron universidades</div>
                ) : (
                  filteredUniversidades.map((uni) => (
                    <div
                      key={uni._id}
                      className={`uni-item-card ${selectedUniId === uni._id ? "active" : ""}`}
                      onClick={() => handleSelectUniversity(uni._id)}
                    >
                      <div className="uni-card-icon">
                        <GraduationCap size={22} />
                      </div>
                      <div className="uni-card-info">
                        <h3>{uni.nombre}</h3>
                        <p>
                          <MapPin size={12} />
                          {uni.ubicacion}
                        </p>
                      </div>
                      <div className="uni-card-badge">
                        <Users size={12} />
                        <span>{uni.numIntegrantes || 0}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* RIGHT PANEL: University Chat Workspace */}
            <main className="uni-chat-workspace">
              {loadingChat ? (
                <div className="uni-chat-state-container">
                  <div className="uni-spinner" />
                  <p>Conectando con el chat general...</p>
                </div>
              ) : activeContact ? (
                <>
                  <header className="uni-chat-header">
                    <div className="uni-chat-header-info">
                      <GraduationCap size={24} />
                      <div>
                        <h3>{activeContact.nombre}</h3>
                        <span>Chat General Universitario</span>
                      </div>
                    </div>
                  </header>

                  <div className="uni-messages-list">
                    {loadingHistory ? (
                      <div className="uni-chat-state-container">
                        <p>Cargando historial de mensajes...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="uni-chat-empty-state">
                        <MessageSquare size={48} />
                        <p>¡El chat está vacío! Sé el primero en escribir.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = getSenderId(msg) === usuario?._id;
                        return (
                          <div
                            key={msg._id}
                            className={`uni-message-row ${isOwn ? "own" : "received"}`}
                          >
                            {!isOwn && (
                              <img
                                src={getSenderAvatar(msg) || "https://api.dicebear.com/7.x/adventurer/svg"}
                                alt={getSenderName(msg)}
                                className="uni-msg-avatar"
                              />
                            )}
                            <div className="uni-message-bubble-wrapper">
                              {!isOwn && (
                                <span className="uni-msg-author">{getSenderName(msg)}</span>
                              )}
                              <div className={`uni-message-bubble ${isOwn ? "own" : "received"}`}>
                                <p>{msg.contenido}</p>
                              </div>
                              <span className="uni-message-time">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Typing Indicator */}
                  {typingUserId && typingUserId !== usuario?._id && (
                    <div className="uni-typing-indicator">
                      <div className="uni-typing-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span>{typingUserName || "Alguien"} está escribiendo...</span>
                    </div>
                  )}

                  <form className="uni-chat-input-area" onSubmit={handleSendMessage}>
                    <div className="uni-input-wrapper">
                      <input
                        type="text"
                        placeholder="Escribe algo en el chat general..."
                        value={inputMessage}
                        onChange={(e) => {
                          setInputMessage(e.target.value);
                          emitTyping();
                        }}
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        className="uni-send-btn"
                        disabled={!inputMessage.trim()}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="uni-chat-empty-state select-prompt">
                  <MessageSquare size={64} />
                  <h2>Chat General de la Universidad</h2>
                  <p>Selecciona una universidad de la lista de la izquierda para unirte a su comunidad y chatear en tiempo real con otros estudiantes.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Universidad;