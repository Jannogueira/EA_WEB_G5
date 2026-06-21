import React, { useState, useEffect } from 'react';
import './SharePostModal.css';
import { X, Search, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getContacts } from '../services/chat';
import type { ChatContact } from '../models/message';
import { useSocket } from '../context/SocketContext';
import { useGlobalAlert } from '../context/AlertContext';

interface SharePostModalProps {
  postId: string;
  onClose: () => void;
}

const SharePostModal: React.FC<SharePostModalProps> = ({ postId, onClose }) => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { showAlert } = useGlobalAlert();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ChatContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await getContacts();
        setContacts(res.data);
      } catch (err: any) {
        showAlert(
          t('alerts.share.error_title'),
          err.response?.data?.message || t('alerts.share.load_error'),
          'error',
        );
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, [showAlert, t]);

  const filteredContacts = contacts.filter((contact) =>
    contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleContact = (contact: ChatContact) => {
    setSelectedContacts((prev) => {
      const exists = prev.some((c) => c._id === contact._id);
      if (exists) {
        return prev.filter((c) => c._id !== contact._id);
      }
      return [...prev, contact];
    });
  };

  const isSelected = (id: string) => selectedContacts.some((c) => c._id === id);

  const handleShare = () => {
    if (!socket) return;
    if (selectedContacts.length === 0) return;

    try {
      selectedContacts.forEach((contact) => {
        socket.emit('send_message', {
          destinatarioId: contact._id,
          contenido: '',
          postId,
          isGroup: contact.isGroup === true,
        });
      });

      setSent(true);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      showAlert(
        t('alerts.share.error_title'),
        err.message || t('alerts.share.send_error'),
        'error',
      );
    }
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
            <p>{t('alerts.share.success')}</p>
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
              ) : filteredContacts.length ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`share-contact-item ${isSelected(contact._id) ? 'selected' : ''}`}
                    onClick={() => toggleContact(contact)}
                  >
                    <div className="contact-avatar-small">
                      <img src={contact.avatarUrl} alt={contact.nombre} />
                    </div>

                    <div className="contact-name">
                      {contact.nombre}
                      {contact.isGroup && <small> • Group</small>}
                    </div>

                    <div className="checkbox-indicator">
                      {isSelected(contact._id) && <div className="check-dot" />}
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
