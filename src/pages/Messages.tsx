import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Messages.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useUser from "../hooks/useUser";
import useChat from "../hooks/useChat";
import { useSocket } from "../context/SocketContext";
import { Send, User, MessageCircle, Search, X } from "lucide-react";
import type { ChatContact } from "../models/message";

const Messages: React.FC = () => {
  const { usuario } = useUser();
  const { unreadCounts, markAsRead } = useSocket();
  const {
    contacts,
    activeContact,
    messages,
    loadingHistory,
    typingUserId,
    openConversation,
    sendMessage,
    emitTyping,
  } = useChat(usuario?._id || "");

  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Al abrir una conversación, marcar como leído
  useEffect(() => {
    if (activeContact) {
      markAsRead(activeContact._id);
    }
  }, [activeContact, markAsRead]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage("");
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  return (
    <div className="messages-page-wrapper">
      <Navbar usuario={usuario || undefined} />
      
      <div className="chat-layout">
          <aside className="contacts-sidebar">
            <header className="contacts-header-search">
              <div className="search-container-premium">
                <Search size={18} className="search-icon-dim" />
                <input 
                  type="text" 
                  placeholder="Buscar chat..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </header>
            
            <div className="contacts-list">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`contact-item ${activeContact?._id === contact._id ? "active" : ""}`}
                  onClick={() => openConversation(contact)}
                >
                  <div className="contact-avatar">
                    <img src={contact.avatarUrl} alt={contact.nombre} />
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{contact.nombre}</span>
                    <span className="last-msg-preview">Chat disponible</span>
                  </div>
                  {unreadCounts[contact._id] > 0 && (
                    <div className="unread-badge">{unreadCounts[contact._id]}</div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          <main className="chat-window">
            {activeContact ? (
              <>
                <header className="chat-header">
                  <div className="active-contact-info">
                    <div className="contact-avatar-small">
                      <img src={activeContact.avatarUrl} alt={activeContact.nombre} />
                    </div>
                    <h3>{activeContact.nombre}</h3>
                  </div>
                </header>

                <div className="messages-list">
                  {loadingHistory ? (
                    <div className="modal-empty">Cargando...</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`message-wrapper ${msg.remitente._id === usuario?._id ? "own" : "received"}`}
                      >
                        <div className={`message-bubble ${msg.remitente._id === usuario?._id ? "own" : "received"}`}>
                          {msg.contenido}
                        </div>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Indicador de escribiendo flotante */}
                {typingUserId === activeContact._id && (
                  <div className="typing-indicator-chat">
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span>{activeContact.nombre} está escribiendo...</span>
                  </div>
                )}

                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <div className="input-wrapper-premium">
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
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
                <h2>Tus Mensajes</h2>
                <p>Selecciona una conversación para empezar.</p>
              </div>
            )}
          </main>
        </div>
        
        {/* Sidebar al final para asegurar que sus eventos de clic siempre tengan prioridad */}
        <Sidebar />
    </div>
  );
};

export default Messages;
