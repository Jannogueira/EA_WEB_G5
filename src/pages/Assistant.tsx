import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import useUser from '../hooks/useUser';
import { askAssistant } from '../services/assistant';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Assistant.css';

interface Message {
  id: string;
  sender: 'user' | 'toni';
  text: string;
  timestamp: Date;
}

const Assistant: React.FC = () => {
  const { usuario } = useUser();
  const { t } = useTranslation();
  const [pregunta, setPregunta] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Cargar mensaje de bienvenida inicial traducido
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'toni',
        text: t('assistant.welcome_msg'),
        timestamp: new Date(),
      },
    ]);
  }, [t]);

  // Auto-scroll al final cuando llegan mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregunta.trim() || loading) return;

    const userText = pregunta.trim();
    setPregunta('');

    // Añadir mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const respuesta = await askAssistant(userText);
      const toniMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'toni',
        text: respuesta,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, toniMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'toni',
        text: t('assistant.error_msg'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Helper para formatear texto markdown simple (negritas, encabezados y viñetas) que devuelve el LLM
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let processedLine = line;

      // Reemplazar negritas **texto**
      const boldRegex = /\*\*(.*?)\*\*/g;
      processedLine = processedLine.replace(boldRegex, '<strong>$1</strong>');

      // Detectar encabezados (###, ##, #)
      const headerMatch = processedLine.trim().match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const cleanHeader = headerMatch[2];
        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{ __html: `<strong>${cleanHeader}</strong>` }}
            style={{ margin: '12px 0 6px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}
          />
        );
      }

      // Detectar si es una viñeta (acepta -, *, •)
      const listMatch = processedLine.trim().match(/^([-*•])\s+(.*)$/);
      if (listMatch) {
        const cleanText = listMatch[2];
        return (
          <li
            key={idx}
            dangerouslySetInnerHTML={{ __html: cleanText }}
            style={{ marginLeft: '20px', listStyleType: 'disc' }}
          />
        );
      }

      return (
        <p
          key={idx}
          dangerouslySetInnerHTML={{ __html: processedLine }}
          style={{ margin: '4px 0' }}
        />
      );
    });
  };

  return (
    <div className="assistant-page-wrapper">
      <Navbar usuario={usuario || undefined} />

      <div className="main-layout">
        <Sidebar />

        <div className="content-area">
          <main className="assistant-container">
            <header className="assistant-header">
              <div className="header-info">
                <div className="bot-avatar-large">
                  <Bot size={28} className="bot-icon" />
                </div>
                <div>
                  <h1>{t('assistant.title')}</h1>
                  <p>{t('assistant.subtitle')}</p>
                </div>
              </div>
            </header>

            <div className="chat-box">
              <div className="messages-list">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-bubble-container ${msg.sender}`}>
                    <div className="avatar-wrapper">
                      {msg.sender === 'toni' ? (
                        <div className="bot-avatar-small">
                          <Bot size={16} />
                        </div>
                      ) : (
                        <div className="user-avatar-small">
                          {usuario?.avatarUrl ? (
                            <img src={usuario.avatarUrl} alt="Avatar" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{formatMessageText(msg.text)}</div>
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="message-bubble-container toni">
                    <div className="avatar-wrapper">
                      <div className="bot-avatar-small">
                        <Bot size={16} />
                      </div>
                    </div>
                    <div className="message-content loading">
                      <Loader2 className="spinner" size={20} />
                      <span>{t('assistant.thinking')}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder={t('assistant.placeholder')}
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={!pregunta.trim() || loading}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
