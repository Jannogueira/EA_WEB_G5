import React, { useState, useEffect } from 'react';
import './SharePostModal.css';
import { X, Search, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getContacts } from '../services/chat';
import type { ChatContact } from '../models/message';
import { useSocket } from '../context/SocketContext';

interface SharePostModalProps {
  postId: string;
  onClose: () => void;
}

const SharePostModal: React.FC<SharePostModalProps> = ({ postId, onClose }) => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getContacts().then((res) => {
      setContacts(res.data);
      setLoading(false);
    });
  }, []);

  const filteredContacts = contacts.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleShare = () => {
    if (!socket || selectedContacts.length === 0) return;

    selectedContacts.forEach((destinatarioId) => {
      socket.emit('send_message', {
        destinatarioId,
        postId,
        contenido: '', // Opcional: podrías añadir un mensaje personalizado
      });
    });

    setSent(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="share-modal-header">
          <h2>{t('share.title')}</h2>
          <button className="close-x-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {sent ? (
          <div className="share-sent-success">
            <CheckCircle2 size={60} color="#10b981" />
            <p>{t('share.success')}</p>
          </div>
        ) : (
          <>
            <div className="share-search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={t('messages.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="share-contacts-list">
              {loading ? (
                <div className="share-loading">{t('messages.loading')}</div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`share-contact-item ${
                      selectedContacts.includes(contact._id) ? 'selected' : ''
                    }`}
                    onClick={() => toggleContact(contact._id)}
                  >
                    <div className="contact-avatar-small">
                      <img
                        src={contact.avatarUrl}
                        alt={t('unimatch_modal.alt_them', { name: contact.nombre })}
                      />
                    </div>
                    <span className="contact-name">{contact.nombre}</span>
                    <div className="checkbox-indicator">
                      {selectedContacts.includes(contact._id) && <div className="check-dot" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="share-empty">{t('share.empty')}</div>
              )}
            </div>

            <footer className="share-modal-footer">
              <button
                className="share-submit-btn"
                disabled={selectedContacts.length === 0}
                onClick={handleShare}
              >
                <span>{t('share.send')}</span>
                <Send size={18} />
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default SharePostModal;
