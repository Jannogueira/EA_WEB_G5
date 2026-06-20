import React, { useEffect, useState, useRef, useMemo } from "react";
import "./Messages.css";
import "./Universidad.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import useChat from "../hooks/useChat";
import universidadService from "../services/universidad";
import { GraduationCap, Send, MessageCircle, Search } from "lucide-react";
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
    <div className="messages-page-wrapper">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Navbar usuario={usuario || undefined} />

      <div className="chat-layout">
        {/* LEFT PANEL: Directory of Universities */}
        <aside className="contacts-sidebar">
          <header className="contacts-header-search">
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 15px 0", color: "var(--text-main)" }}>
              Universidades
            </h2>
            <div className="search-container-premium">
              <Search size={18} className="search-icon-dim" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Buscar universidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <div className="contacts-list">
            {loadingUnis ? (
              <div className="no-chat-selected" style={{ height: "auto", padding: "20px 0" }}>
                <p>Cargando universidades...</p>
              </div>
            ) : filteredUniversidades.length === 0 ? (
              <div className="no-chat-selected" style={{ height: "auto", padding: "20px 0" }}>
                <p>No se encontraron universidades</p>
              </div>
            ) : (
              filteredUniversidades.map((uni) => (
                <div
                  key={uni._id}
                  className={`contact-item ${selectedUniId === uni._id ? "active" : ""}`}
                  onClick={() => handleSelectUniversity(uni._id)}
                >
                  <div className="contact-avatar group-avatar-icon">
                    <GraduationCap size={22} />
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{uni.nombre}</span>
                    <span className="group-subtitle-sidebar">{uni.ubicacion}</span>
                  </div>
                  <div
                    className="unread-badge"
                    style={{
                      background: "rgba(167, 139, 250, 0.12)",
                      color: "var(--accent-purple)",
                      boxShadow: "none",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "8px",
                      height: "auto",
                      minWidth: "unset",
                    }}
                    title="Miembros registrados"
                  >
                    {uni.numIntegrantes || 0}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* RIGHT PANEL: University Chat Workspace */}
        <main className="chat-window">
          {loadingChat ? (
            <div className="no-chat-selected">
              <div className="uni-spinner" />
              <p style={{ marginTop: "15px" }}>Conectando con el chat general...</p>
            </div>
          ) : activeContact ? (
            <>
              <header className="chat-header">
                <div className="active-contact-info">
                  <div className="contact-avatar-small group-avatar-icon">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3>{activeContact.nombre}</h3>
                    <span className="group-badge">Chat General</span>
                  </div>
                </div>
              </header>

              <div className="messages-list">
                {loadingHistory ? (
                  <div className="no-chat-selected">
                    <p>Cargando historial de mensajes...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="no-chat-selected">
                    <MessageCircle size={60} color="rgba(167, 139, 250, 0.1)" />
                    <p>¡El chat está vacío! Sé el primero en escribir.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = getSenderId(msg) === usuario?._id;
                    return (
                      <div className="message-row" key={msg._id} id={msg._id}>
                        <div className={`message-wrapper ${isOwn ? "own" : "received"}`}>
                          {!isOwn && (
                            <div className="msg-sender-avatar">
                              <img
                                src={getSenderAvatar(msg) || "https://api.dicebear.com/7.x/adventurer/svg"}
                                alt=""
                              />
                            </div>
                          )}
                          <div className={`message-bubble ${isOwn ? "own" : "received"}`}>
                            {!isOwn && <span className="group-member-name-chat">{getSenderName(msg)}</span>}
                            <div>{msg.contenido}</div>
                          </div>
                          <span className="message-time">
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
                <div className="typing-indicator-chat">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>{typingUserName || "Alguien"} está escribiendo...</span>
                </div>
              )}

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <div className="input-wrapper-premium">
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
                  <button type="submit" className="send-btn-premium" disabled={!inputMessage.trim()}>
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <MessageCircle size={100} color="rgba(167, 139, 250, 0.1)" />
              <h2>Chat General de la Universidad</h2>
              <p>
                Selecciona una universidad de la lista de la izquierda para unirte a su comunidad y chatear en tiempo
                real con otros estudiantes.
              </p>
            </div>
          )}
        </main>
      </div>

      <Sidebar />
    </div>
  );
};

export default Universidad;